import { auth } from "@picpok/auth";
import { db } from "@picpok/db";
import { like } from "@picpok/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const feedDb = {
	async listLikedImageIds(userId: string, imageIds: string[]) {
		if (imageIds.length === 0) {
			return [];
		}

		return db
			.select({ imageId: like.imageId })
			.from(like)
			.where(and(eq(like.userId, userId), eq(like.liked, true), inArray(like.imageId, imageIds)));
	},
	async setLike(input: { userId: string; imageId: string; liked: boolean }) {
		const [row] = await db
			.insert(like)
			.values(input)
			.onConflictDoUpdate({
				target: [like.userId, like.imageId],
				set: {
					liked: input.liked,
					updatedAt: new Date(),
				},
			})
			.returning({ imageId: like.imageId, liked: like.liked });

		return row;
	},
};

export async function createContext({ req }: { req: Request }) {
	const session = await auth.api.getSession({
    headers: req.headers,
	});
	return {
		feedDb,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
