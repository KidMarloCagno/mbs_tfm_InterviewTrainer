# Security Policy

## Reporting a Vulnerability

We take the security of InterviewTrainer seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** open a public issue for security vulnerabilities
2. Send a report via GitHub Security Advisories:
   - Go to the Security tab
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

Alternatively, you can open a private issue and tag it as "security".

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Impact**: What could an attacker do with this vulnerability?
- **Reproduction Steps**: Step-by-step instructions to reproduce the issue
- **Version**: The version or commit hash where you found the vulnerability
- **Suggested Fix**: If you have ideas on how to fix it (optional)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity, typically within 30 days

## Security Considerations

### Demo Credentials

**⚠️ IMPORTANT SECURITY NOTE**: The application seeds a demo user for development/local testing.
Credentials are validated against the database using bcrypt hash comparison.

```typescript
const isValid = await bcrypt.compare(password, user.passwordHash);
if (!isValid) return null;
```

**The seeded demo password is for demonstration only and should NOT be used in production.**

### Before Production Deployment

If you plan to deploy this application to production, you **MUST**:

1. **Use production-grade authentication policy**:
   - Use OAuth providers (GitHub, Google, etc.)
   - Keep database-backed user management
   - Keep bcrypt (or stronger) password hashing
2. **Rotate or remove demo seeded credentials** from production data
3. **Set up environment variables** properly:
   - Generate a strong `NEXTAUTH_SECRET` (minimum 32 characters)
   - Never commit `.env` files to the repository
   - Use secure environment variable management in production
4. **Enable HTTPS** for all production deployments
5. **Rate limiting is implemented** (OWASP A07):
   - Login: 10 attempts per 15 minutes per IP (`lib/loginRateLimit.ts`, wired into NextAuth `authorize`)
   - Registration: 5 attempts per 15 minutes per IP (`lib/registerRateLimit.ts`)
   - **Note**: Uses an in-process in-memory store. On serverless deployments (Vercel) with multiple concurrent instances, replace with a shared store (e.g. Upstash Redis + `@upstash/ratelimit`) for a hard global cap.
6. **Input validation is implemented** (OWASP A03):
   - All registration and login fields validated with Zod on both client and server
   - Availability check endpoint validates input before any DB query
7. **Keep dependencies updated** to patch known vulnerabilities

### Environment Variables

The following environment variables should be kept secure:

- `NEXTAUTH_SECRET`: Used for JWT signing and encryption
- `POSTGRES_PRISMA_URL`: Pooled Prisma database connection string (may contain credentials)
- `POSTGRES_URL_NON_POOLING`: Direct database connection string for migrations (may contain credentials)

**Never commit these to version control.**

### Prisma Security

When using Prisma with PostgreSQL in production:

- Use SSL connections to the database
- Follow the principle of least privilege for database users
- Regularly update Prisma to the latest version
- Use parameterized queries (Prisma handles this automatically)

## Known Vulnerabilities

| ID                                                                           | Package        | Severity | Description                                                | Status                                                                                                                                    |
| ---------------------------------------------------------------------------- | -------------- | -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [SNYK-JS-NEXT-15104645](https://security.snyk.io/vuln/SNYK-JS-NEXT-15104645) | `next@14.2.35` | **High** | Allocation of Resources Without Limits or Throttling (DoS) | Accepted risk — fix requires upgrading to Next.js 15 (breaking change). Mitigated in practice by rate limiting on all mutating endpoints. |

> **Note:** `14.2.35` is the latest Next.js 14.x release; no backport patch exists. Upgrading to Next.js 15 would require rewriting `cookies()`, `headers()`, and dynamic route `params` as async throughout the app. This trade-off is accepted for the current academic project scope.

## Supported Versions

| Version       | Supported            |
| ------------- | -------------------- |
| 1.3.x         | ✅ Yes (current)     |
| 1.0.x – 1.2.x | ⚠️ No longer patched |
| 0.x.x         | ❌ No                |

Only the latest minor version receives security updates.

## Best Practices for Contributors

When contributing code:

1. **Never commit secrets**: Check for API keys, passwords, tokens before committing
2. **Validate inputs**: Always validate and sanitize user inputs
3. **Follow secure coding practices**: Review OWASP guidelines
4. **Update dependencies**: Keep dependencies up to date
5. **Run security checks**: Use tools like `npm audit` or `pnpm audit`

## Security Tools

We recommend using these tools to check for vulnerabilities:

```bash
# Check for dependency vulnerabilities
pnpm audit

# Check for outdated packages
pnpm outdated

# Snyk Open Source scan (dependency CVEs)
snyk test --all-projects

# Snyk Code scan (SAST — requires Snyk Code enabled in your org)
snyk code test

# Push a snapshot to Snyk dashboard for ongoing monitoring
snyk monitor
```

## Acknowledgments

We appreciate security researchers and users who report vulnerabilities responsibly. Contributors who report valid security issues will be acknowledged (with their permission) in the project's security advisories.

Thank you for helping keep InterviewTrainer secure! 🔒
