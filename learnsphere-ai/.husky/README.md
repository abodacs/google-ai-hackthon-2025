# Git Hooks Configuration

This directory contains git hooks configured with Husky to ensure code quality, security, and consistency.

## Installed Hooks

### Pre-commit Hook
Runs before each commit to ensure code quality:
- **Lint-staged**: Automatically formats and lints only staged files
- **ESLint**: Fixes linting issues in TypeScript/JavaScript files
- **Prettier**: Formats code according to project style
- **Secretlint**: Scans for secrets, API keys, and sensitive data

### Commit Message Hook
Validates commit messages using Commitlint:
- Enforces conventional commit format: `type(scope): description`
- Supported types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`
- Maximum header length: 100 characters
- Proper case formatting and punctuation rules

### Pre-push Hook
Runs comprehensive checks before pushing to remote:
- **TypeScript**: Type checking with `pnpm type-check`
- **ESLint**: Full project linting with `pnpm lint`
- **Build**: Production build verification with `pnpm build`

## Commit Message Examples

✅ Good commit messages:
```
feat: add Chrome AI integration for text summarization
fix: resolve TypeScript errors in authentication service
docs: update API documentation for user preferences
refactor: extract common utility functions to separate module
test: add unit tests for content processor service
```

❌ Bad commit messages:
```
updated files
fix bug
WIP
Added new feature
```

## Bypassing Hooks (Emergency Use Only)

If you absolutely need to bypass hooks (not recommended):
```bash
git commit --no-verify -m "emergency commit message"
git push --no-verify
```

## Configuration Files

- `.commitlintrc.js` - Commit message linting rules
- `.secretlintrc.json` - Secret detection configuration
- `package.json` - Lint-staged configuration

## Troubleshooting

### Hook Execution Issues
```bash
# Reinstall husky hooks
pnpm prepare

# Make hooks executable
chmod +x .husky/*
```

### Secretlint False Positives
Add patterns to `.secretlintrc.json` allowMessageIds or update filterFilenames.

### Performance Issues
Lint-staged only processes staged files to minimize execution time. For full project linting, use:
```bash
pnpm lint
pnpm format
```