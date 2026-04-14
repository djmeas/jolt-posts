# Video posts

Adds support for **video uploads** alongside existing multi-photo posts: new storage, API rules, admin UI, and feed/grid playback (including carousel support for mixed media where applicable).

## Summary

- **Database:** New `post_videos` table (migration `0005`) linked to `posts` with cascade delete.
- **Posts API:** Create accepts either `photoPaths` (multi-photo) **or** `videoPath` (single video), not both. List responses include `videoPath` when present.
- **Admin:** Upload flow accepts images and videos; publish uses `videoPaths[0]` for video posts. Grid thumbnails show muted video previews and a play-style badge; copy updated for “photos or videos.”
- **Public feed:** Carousel (`PostPhotoCarousel`) renders **photo** or **video** slides; swipe/drag ignores drags that start on `<video>` controls.
- **Ops / DX:** Dockerfile / `docker-entrypoint.sh` and `scripts/init-admin.mjs` updates; `AGENTS.md` expanded for agents working on this stack.

## Testing suggestions

- Create a post with **only photos** (existing behavior).
- Create a post with **only video**; confirm grid, detail/carousel, and upload response.
- Confirm **400** when both `photoPaths` and `videoPath` are sent, or when neither is sent.
- Run migrations on a fresh DB and verify admin init in Docker if you use that path.

## Notes

- Branch: `feature/VideoPosts` (vs `main`).
