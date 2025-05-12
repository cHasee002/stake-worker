import { Context, Next } from 'hono';
import * as jose from 'jose';

import { Bindings, Variables } from '../types';

const verifyJwt = async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer')) {
		return c.text('Unauthorized', 401);
	}

	const token = authHeader.split(' ')[1];
	const secret = encodeSecret(c.env.JWT_SECRET);

	try {
		const { payload } = await jose.jwtVerify<Variables>(token, secret, {
			issuer: '@stake-worker',
		});

		if (!payload.userId) {
			throw new Error('Invalid payload');
		}

		c.set('userId', payload.userId);

		await next();
	} catch (err) {
		let message = err;

		if (err instanceof Error) {
			message = err.message;
		}

		return c.text(`Invalid token - ${message}`, 401);
	}
};

function encodeSecret(secret: string): Uint8Array {
	return new TextEncoder().encode(secret);
}

export default verifyJwt;
