# GitHub Repository Configuration

## Repository Topics (for discoverability)

```
fastapi
nextjs
typescript
python
healthcare
revenue-cycle-management
prior-authorization
pydantic
sqlalchemy
tailwindcss
async-await
postgresql
health-tech
rcm
medical-billing
claims-processing
react
shadcn-ui
```

## Mandatory GitHub Security Features

The following security features MUST be enabled for this public health-tech repository:

### 1. Dependabot Alerts
- **Status**: ✅ REQUIRED
- **Purpose**: Automatically detect vulnerable dependencies
- **Configuration**: Enable for both Python (pip) and JavaScript (npm)
- **Action**: Navigate to Settings → Security → Dependabot alerts → Enable

### 2. Dependabot Security Updates
- **Status**: ✅ REQUIRED
- **Purpose**: Automatically create PRs to update vulnerable dependencies
- **Configuration**: Enable automatic security updates
- **Action**: Settings → Security → Dependabot security updates → Enable

### 3. Secret Scanning
- **Status**: ✅ REQUIRED (Free for public repos)
- **Purpose**: Detect accidentally committed secrets (API keys, tokens, passwords)
- **Configuration**: Automatically enabled for public repositories
- **Action**: Verify at Settings → Security → Secret scanning

### 4. Push Protection
- **Status**: ✅ REQUIRED
- **Purpose**: Block pushes that contain detected secrets
- **Configuration**: Enable push protection to prevent secret commits
- **Action**: Settings → Security → Push protection → Enable

### 5. Code Scanning (GitHub Advanced Security)
- **Status**: ✅ RECOMMENDED (Free for public repos)
- **Purpose**: Automatically detect security vulnerabilities and coding errors
- **Configuration**: Set up CodeQL analysis via GitHub Actions
- **Action**: Security → Code scanning → Set up CodeQL

### 6. Branch Protection Rules
- **Status**: ✅ REQUIRED
- **Purpose**: Enforce code review and CI checks before merging
- **Configuration**:
  - Require pull request reviews before merging
  - Require status checks to pass (CI workflow)
  - Require branches to be up to date before merging
  - Include administrators in restrictions
- **Action**: Settings → Branches → Add branch protection rule for `main`

## Security Best Practices Checklist

- [ ] Never commit `.env` files (enforced by `.gitignore`)
- [ ] Use environment variables for all secrets
- [ ] Rotate credentials regularly
- [ ] Enable all security features listed above
- [ ] Review Dependabot alerts weekly
- [ ] Conduct security audits before major releases
- [ ] Use signed commits (GPG)
- [ ] Enable two-factor authentication for all contributors
- [ ] Document security policies in SECURITY.md
- [ ] Set up security contact email
