# Contributing to Metro Command Center

## Branches

Start from the explicitly approved base branch and use a focused name:

- `feature/<short-description>` for product work
- `fix/<short-description>` for defects
- `docs/<short-description>` for documentation-only work
- `release/<version>` for approved release preparation

Do not develop directly on `stable-working-v0.1.2`. Never rewrite, force-push, delete, or merge into the stable branch without an explicit release decision from the owner.

## Required validation

Use Node.js 22 LTS and run:

```text
npm install
npm run typecheck
npm test
npm run build
```

All commands must pass before committing a change that affects application behavior or dependencies. Also launch the application on Windows for Electron, persistence, launcher, or packaging changes. Document any environment-only warning separately from code failures.

## Commits

- Keep commits logical, reviewable, and narrowly scoped.
- Use an imperative subject that describes the outcome, such as `Add inventory migration coverage`.
- Do not mix generated output, formatting churn, or unrelated cleanup into a feature commit.
- Never commit secrets, credentials, production databases, user data, dependency folders, or temporary capture files.
- Include migrations and their tests in the same logical change.

## Pull request checklist

- [ ] The branch is based on the requested branch and does not modify the preserved stable branch.
- [ ] The change and user impact are clearly described.
- [ ] Architecture and security implications were reviewed.
- [ ] No native Node dependency was introduced without approval.
- [ ] Schema changes are backward compatible, migrated, and tested.
- [ ] Type contracts and IPC/preload surfaces remain aligned.
- [ ] `npm install`, `npm run typecheck`, `npm test`, and `npm run build` pass on Node.js 22 LTS.
- [ ] Windows launch testing was completed when applicable.
- [ ] Screenshots are attached or committed for visible UI changes.
- [ ] `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md`, README content, or operational docs were updated where affected.
- [ ] The PR contains no secrets, private data, local databases, or unrelated files.

## Stable branch protection

`stable-working-v0.1.2` is a recovery asset representing the version verified to open on the user's Windows computer. Feature branches must not target it for casual development. Any approved update requires passing validation, a Windows launch test, a backup/recovery plan, a clear release record, and owner authorization. Force pushes and history rewrites are prohibited.

## Screenshots and documentation

User-visible changes require representative screenshots using realistic non-sensitive sample data. Save maintained images under an appropriate `docs/screenshots/<release-or-feature>/` directory with descriptive names. Capture important states such as populated views, editing, filtering, calculations, empty states, and errors when relevant.

Update documentation in the same branch whenever a change affects product behavior, domain fields, architecture boundaries, migrations, setup, workflows, tests, release steps, or known limitations. Changelog entries must describe only implemented behavior and remain under `Unreleased` until a release is explicitly created.
