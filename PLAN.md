# Picpok Plan

## Product Shape

Picpok is a full-screen vertical image feed: TikTok/Reels interaction, but for photos.

- Anyone can open `/` and browse the feed without logging in.
- Images fill the dynamic viewport and snap one item at a time.
- The feed loads more Pexels photos before the user reaches the end.
- Liking requires authentication because likes are persisted per user.
- Auth is intentionally lightweight: username and password only.
- The global scaffold header is removed so the feed owns the full viewport.

## Stack Decisions

- Framework: TanStack Start, not Next.js.
- API transport: existing tRPC package.
- Image provider: Pexels API, proxied server-side so the API key is never exposed.
- Database: existing Drizzle/PostgreSQL setup.
- Styling: Tailwind and existing shared UI primitives where they help.

## Core Data Model

### Users

- `id`
- `username`
- `passwordHash`
- `createdAt`

### Sessions

- `token`
- `userId`
- `expiresAt`
- `createdAt`

### Likes

- `userId`
- `imageId`
- `liked`
- `createdAt`
- `updatedAt`
- unique on `userId + imageId`

## API Shape

### Feed

`feed.list({ page, perPage })`

- Fetches `GET https://api.pexels.com/v1/curated?page=&per_page=`.
- Uses `PEXELS_API_KEY` only on the server.
- Normalizes provider data for the frontend.
- If a user is logged in, merges that user's like state.
- If anonymous, returns `liked: false` for every image.

Normalized image shape:

```ts
type FeedImage = {
  id: string;
  photographer: string;
  width: number;
  height: number;
  imageUrl: string;
  alt: string;
  sourceUrl: string;
  liked: boolean;
};
```

### Likes

`likes.set({ imageId, liked })`

- Requires a logged-in user.
- Upserts the user's like state.
- Returns the updated state.

### Auth

- `auth.signup({ username, password })`
- `auth.login({ username, password })`
- `auth.logout()`
- `auth.me()`

Auth exists only to support per-user likes. No email, email confirmation, password reset, or OAuth.

## Frontend Shape

### `/`

- Public full-screen feed route.
- Uses infinite query/pagination.
- Uses scroll snap with one image per `100dvh` page.
- Shows loading, error, and empty states inside the same full-screen visual language.
- Like button behavior:
  - Logged out: redirect to login or open auth UI.
  - Logged in: optimistic like/unlike mutation.

### `/login` and `/signup`

- Minimal auth forms.
- Username/password only.
- Redirect back to `/` after success.

## Implementation Order

1. Add env docs for Pexels and existing app secrets.
2. Add or adjust DB schema for username auth, sessions, and likes.
3. Add auth procedures and session context.
4. Add Pexels feed procedure with normalized image data.
5. Add likes procedure scoped to the logged-in user.
6. Remove the root header/layout chrome.
7. Replace scaffold home with the full-screen vertical feed.
8. Add login/signup screens and like-gated auth flow.
9. Polish mobile viewport behavior, loading, error, empty, and image fallback states.
10. Run `pnpm check` and `pnpm check-types`.
11. Finalize `README.md` and `AI_WORKFLOW.md`.

## Stretch Only If Core Is Solid

- Preload the next one or two images.
- Double-tap to like with a small animation.
- Basic virtualization/windowing for long sessions.
- A liked-images view.

## Known Tradeoffs To Document

- Browsing is anonymous, but liking requires login.
- Auth is username/password only to keep scope focused on the feed.
- Pexels data is normalized server-side to isolate provider quirks.
- The app intentionally avoids extra social features, comments, profiles, and uploads.
