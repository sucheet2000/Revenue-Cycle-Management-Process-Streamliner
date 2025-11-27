# Contributing to RCM Prior Authorization Streamliner

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Python/Node version)

### Suggesting Features

1. **Check existing feature requests** first
2. **Use the feature request template**
3. **Explain**:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - Why this would benefit the project

### Pull Requests

#### Before You Start

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Check for existing work**: Look for related PRs or issues

#### Development Workflow

1. **Set up your environment**:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Make your changes**:
   - Follow the code style guidelines (below)
   - Write tests for new features
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   # Backend tests
   pytest backend/tests/ -v
   
   # Frontend tests
   cd frontend && npm test
   
   # Linting
   ruff check backend/
   npm run lint
   ```

4. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add patient search functionality
     fix: resolve NPI validation bug
     docs: update API documentation
     test: add unit tests for claim submission
     ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Use the PR template
   - Link related issues
   - Provide a clear description of changes
   - Include screenshots for UI changes

#### PR Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** on staging environment (if applicable)
4. **Approval** and merge by maintainer

## Code Style Guidelines

### Python (Backend)

- **Formatter**: Black
- **Linter**: Ruff
- **Type hints**: Required for all functions
- **Docstrings**: Google style for all public functions
- **Line length**: 100 characters

Example:
```python
async def create_claim(
    claim_data: ClaimSubmission,
    session: AsyncSession
) -> ClaimResponse:
    """
    Create a new prior authorization claim.
    
    Args:
        claim_data: Validated claim submission data
        session: Database session
        
    Returns:
        ClaimResponse with claim reference ID
        
    Raises:
        HTTPException: If validation fails
    """
    # Implementation
```

### TypeScript/React (Frontend)

- **Formatter**: Prettier
- **Linter**: ESLint
- **Style**: Functional components with hooks
- **Props**: TypeScript interfaces
- **File naming**: PascalCase for components, camelCase for utilities

Example:
```typescript
interface PriorAuthFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export default function PriorAuthForm({ 
  onSubmit, 
  isLoading = false 
}: PriorAuthFormProps) {
  // Implementation
}
```

### Database

- **Migrations**: Use Alembic for schema changes
- **Naming**: snake_case for tables and columns
- **Indexes**: Explicit naming convention
- **Foreign keys**: Always use ON DELETE CASCADE or SET NULL

## Testing Requirements

### Backend

- **Unit tests**: For all business logic
- **Integration tests**: For API endpoints
- **Coverage**: Minimum 80%
- **Framework**: pytest with pytest-asyncio

### Frontend

- **Component tests**: For all React components
- **Integration tests**: For user flows
- **Coverage**: Minimum 70%
- **Framework**: Jest + React Testing Library

## Documentation

- Update README.md for new features
- Add docstrings to all functions
- Update API documentation (OpenAPI/Swagger)
- Include inline comments for complex logic

## Security

- **Never commit secrets**: Use environment variables
- **Validate all inputs**: Use Pydantic schemas
- **Sanitize data**: Prevent injection attacks
- **Review dependencies**: Check for vulnerabilities
- **Follow OWASP**: Top 10 security practices

## Questions?

- Open a GitHub Discussion
- Check existing documentation
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
