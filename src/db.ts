import postgres from 'postgres';

import { Bindings } from './types';

export function getDb(env: Bindings) {
	return postgres(env.HYPERDRIVE.connectionString, {
		max: 5,
		fetch_types: false,
	});
}
