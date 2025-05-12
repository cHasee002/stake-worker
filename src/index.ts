import { Context, Hono } from 'hono';
import * as jose from 'jose';
import { Redis } from '@upstash/redis/cloudflare';

import { Bindings, Variables } from './types';
import verifyJwt from './middleware/verifyJwt';
import { getDb } from './db';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/stake', verifyJwt);

app.post('/api/auth', async (c) => {
	const body = await c.req.json();

	if (body.username === 'admin' && body.password === 'admin') {
		const secret = new TextEncoder().encode(c.env.JWT_SECRET);

		const token = await new jose.SignJWT({ userId: 1 })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setIssuer('@stake-worker')
			.setExpirationTime('2h')
			.sign(secret);

		return c.json({
			token,
		});
	}

	return c.text('Unauthorized', 401);
});

app.post('/api/stake', async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
	if (c.req.header('Content-Type') !== 'application/json') {
		return c.json(
			{
				success: false,
			},
			422
		);
	}

	const body = await c.req.json<{
		amount: number;
		period: number;
	}>();

	if (!body.amount || typeof body.amount !== 'number') {
		return c.text('Invalid amount. Please give a number.', 400);
	}

	if (!body.period || typeof body.period !== 'number') {
		return c.text('Invalid period. Please give a number', 400);
	}

	const userId = c.get('userId');
	const redis = Redis.fromEnv(c.env);

	await redis.incr(userId.toString());

	const sql = getDb(c.env);

	try {
		await sql`INSERT INTO stakes (user_id, amount, period) values (${userId}, ${body.amount}, ${body.period})`;

		return c.json({ success: true });
	} catch (err) {
		console.error(`DB error - ${err}`);

		return c.json({ success: false }, 500);
	}
});

app.get('/api/stake', async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
	const userId = c.get('userId');

	const sql = getDb(c.env);

	try {
		const result = await sql`SELECT id, amount, period FROM stakes WHERE user_id = ${userId}`;

		return c.json({
			items: result,
		});
	} catch (err) {
		console.error(err);
		return c.json({ success: false }, 500);
	}
});

export default app;
