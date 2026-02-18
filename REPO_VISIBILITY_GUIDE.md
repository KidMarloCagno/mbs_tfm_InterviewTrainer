# GitHub Repository Visibility Change Guide

This document outlines the manual steps required to change this repository from **Private** to **Public** on GitHub.

## ⚠️ Important: Complete Before Making Repository Public

Before changing the repository visibility, ensure you have:

- [x] Reviewed all code for hardcoded secrets or credentials
- [x] Verified `.gitignore` properly excludes sensitive files
- [x] Added LICENSE file
- [x] Added CONTRIBUTING.md
- [x] Added CODE_OF_CONDUCT.md
- [x] Added SECURITY.md
- [x] Updated README.md with public repository information
- [x] Updated package.json (removed "private": true, added repository URLs)
- [x] Updated CHANGELOG.md
- [ ] Reviewed all commits in git history for accidentally committed secrets
- [ ] Informed all collaborators about the visibility change

## Steps to Change Repository Visibility on GitHub

### Option 1: Via GitHub Web Interface

1. **Navigate to Repository Settings:**
   - Go to https://github.com/KidMarloCagno/mbs_tfm_InterviewTrainer
   - Click on **Settings** tab (you need admin access)

2. **Scroll to Danger Zone:**
   - Scroll down to the bottom of the Settings page
   - Find the **"Danger Zone"** section

3. **Change Visibility:**
   - Click on **"Change repository visibility"**
   - Click **"Change visibility"** button
   - Select **"Make public"**

4. **Confirm the Change:**
   - You'll be asked to confirm by typing the repository name
   - Type: `KidMarloCagno/mbs_tfm_InterviewTrainer`
   - Click **"I understand, change repository visibility"**

### Option 2: Via GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
gh repo edit KidMarloCagno/mbs_tfm_InterviewTrainer --visibility public
```

## Post-Publication Checklist

After making the repository public:

- [ ] Verify the repository is accessible at https://github.com/KidMarloCagno/mbs_tfm_InterviewTrainer
- [ ] Check that all documentation files are visible
- [ ] Test cloning the repository without authentication
- [ ] Set up GitHub Pages (if desired)
- [ ] Configure repository topics/tags for discoverability
- [ ] Add repository description on GitHub
- [ ] Enable GitHub Discussions (optional)
- [ ] Enable GitHub Sponsors (optional)
- [ ] Update any external links pointing to the repository

## Recommended GitHub Repository Settings

After making the repository public, consider configuring:

### General Settings
- **Description**: "Gamified IT interview practice platform with spaced repetition"
- **Topics**: `interview-preparation`, `spaced-repetition`, `nextjs`, `typescript`, `learning`, `quiz`, `education`
- **Include in the home page**: ✅ Checked

### Features
- **Issues**: ✅ Enable
- **Projects**: ✅ Enable (if you want project boards)
- **Wiki**: ❌ Disable (use docs in repo instead)
- **Discussions**: ✅ Enable (for community Q&A)

### Pull Requests
- **Allow merge commits**: ✅
- **Allow squash merging**: ✅
- **Allow rebase merging**: ✅
- **Automatically delete head branches**: ✅

### Branch Protection Rules (for main branch)
Consider adding protection for the `main` branch:
- Require pull request reviews before merging
- Require status checks to pass (CI tests)
- Require conversation resolution before merging

## Important Security Reminders

### Demo Credentials Notice
The repository contains hardcoded demo credentials in `auth.ts`:
```typescript
const isValid = await bcrypt.compare(password, user.passwordHash);
if (!isValid) return null;
```

**Current security posture:**
- ✅ Password verification uses bcrypt hash comparison
- ✅ Security notice is included in SECURITY.md
- ✅ Deployment instructions require secure environment variables

### Environment Variables
Ensure your deployed instances use proper environment variables:
- `NEXTAUTH_SECRET`: Strong random string (32+ characters)
- `POSTGRES_PRISMA_URL`: Secure pooled database connection
- `POSTGRES_URL_NON_POOLING`: Secure direct connection for migrations
- Never commit `.env` files to the repository

## Rollback Plan

If you need to revert the repository back to private:

1. Go to Repository Settings
2. Scroll to Danger Zone
3. Click "Change repository visibility"
4. Select "Make private"
5. Confirm the change

## Support

If you encounter any issues during the visibility change process:
- GitHub Documentation: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility
- GitHub Support: https://support.github.com/

---

**Last Updated**: 2026-02-17
**Repository**: KidMarloCagno/mbs_tfm_InterviewTrainer
**Current Visibility**: Private → To be changed to Public
