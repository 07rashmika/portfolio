# Working on this project

Read `AGENTS.md` first (Next 16: check the bundled docs in `node_modules/next/dist/docs/` before writing code).

- **Plan and docs:** `README.md` is the build plan and design doc (phases, theme, how each part works). The Three.js work has its own plan and open items in `docs/3d-plan.md`.
- **Commits:** the owner commits and pushes. Don't run `git commit`/`git push` unless asked in that conversation; finish a change by posting a suggested branch name and commit message in chat, in the same style as the existing history (`feat: …` subject, bullet list body).
- **Checks before finishing:** `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. For UI changes, check in a real browser too (headless Chrome via the DevTools protocol works; see `docs/3d-plan.md` for the 3D shelf).
- **Disk:** the SSD (`/`, which holds `/tmp`) is nearly full. Keep temporary files small and delete headless-Chrome profiles after use.
- **Content** is placeholder (marked `TODO`) in `content/site.ts` and `content/books/*.ts` until the owner sends their details.
