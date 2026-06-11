import { createDb } from "@picpok/db";
import * as schema from "@picpok/db/schema/auth";
import { env } from "@picpok/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [env.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [
			username({
				minUsernameLength: 3,
				maxUsernameLength: 24,
				usernameValidator: (value) => /^[a-z0-9_]+$/.test(value),
			}),
			tanstackStartCookies(),
		],
	});
}

export const auth = createAuth();
