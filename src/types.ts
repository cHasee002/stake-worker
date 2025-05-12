type Bindings = {
	JWT_SECRET: string;
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
	COCKROACH_DB_URL: string;
	HYPERDRIVE: Hyperdrive;
};

type Variables = {
	userId: number;
};

export { type Bindings, type Variables };
