# Merge Conflict Resolution Guide

This repository now separates the Firebase Functions backend and the LIFF frontend
into modules under the `functions/src` and `public/scripts` directories. When you
merge this branch with an older codebase you will usually see conflicts because
files such as `functions/index.js`, `public/main.js`, and the legacy `public/*.js`
entry points were replaced by the new modular layout.

Follow the steps below on the command line to resolve those conflicts safely.

## 1. Update your local base branch

```bash
git checkout main
git pull
```

If your main branch has a different name, substitute it in the commands above.

## 2. Rebase or merge the feature branch

Bring the latest main branch into your working branch. Rebasing keeps the
history linear and makes conflict resolution easier:

```bash
git checkout work
git rebase main
```

If you prefer to merge instead of rebase, run `git merge main` while staying on
your feature branch.

## 3. Resolve file conflicts

Use `git status` to list all files with conflicts. Open each file and decide
whether to keep the old implementation or the new modular version. For most
files you should keep **ours** (the modularized code) because the legacy files
were deleted intentionally.

```bash
git status
```

For conflicts in deleted entry points (`public/main.js`, `public/login.js`,
`public/profile.js`, etc.), accept the branch version that deletes those files.
The new logic now lives under `public/scripts/pages/`.

For conflicts inside `functions/index.js`, make sure the final file exports the
modular Express app:

```js
const functions = require("firebase-functions");
const { createContainer } = require("./src/container");
const { createHttpApp } = require("./src/http/app");

const container = createContainer();
const app = createHttpApp(container);

exports.app = functions.region("asia-northeast1").https.onRequest(app);
```

## 4. Mark files as resolved and continue

After editing a file remove the conflict markers and stage it:

```bash
git add path/to/file
```

When rebasing, continue with:

```bash
git rebase --continue
```

When merging, create a commit after staging all files:

```bash
git commit
```

## 5. Run a quick smoke check

Install dependencies and ensure the lint/build steps succeed:

```bash
npm install
npm run lint
npm run build
```

## 6. Push the updated branch

```bash
git push --force-with-lease
```

This updates the feature branch with the resolved history. Share the resulting
request ID or commit hash with your reviewers.
