# Contributing to Ratlist.gg

Thank you for your interest in contributing to Ratlist.gg! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- No harassment, doxxing, or targeted abuse
- Focus on constructive feedback
- Follow the community guidelines

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ratlist.gg.git
   cd ratlist.gg
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment** following README.md instructions
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Make Your Changes

- Write clear, concise code
- Follow existing code style and conventions
- Add comments for complex logic
- Keep commits focused and atomic

### 2. Testing

Before submitting, ensure all tests pass:

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Build the project
npm run build

# Run E2E tests (optional but recommended)
npm run test:e2e
```

### 3. Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(dashboard): add player linking feature
fix(api): resolve rate limit bypass issue
docs(readme): update installation instructions
```

### 4. Submit a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference any related issues (#123)
   - Screenshots for UI changes

3. **Wait for review** - maintainers will review and provide feedback

## Project Structure

```
ratlist.gg/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   └── features/    # Feature-specific components
├── lib/             # Shared utilities
├── supabase/        # Database migrations and seeds
├── tests/           # Test files
└── specs/           # Feature specifications
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use Zod for runtime validation

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript prop types

### Styling

- Use Tailwind CSS utility classes
- Follow existing color scheme and spacing
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

### Database

- Write migrations for schema changes
- Never modify existing migrations
- Use RLS policies for security
- Document database functions

## Common Contribution Areas

### 🐛 Bug Fixes

1. Search existing issues to avoid duplicates
2. Create an issue describing the bug
3. Reference the issue in your PR

### ✨ New Features

1. Discuss major features in an issue first
2. Follow the spec format in `specs/` directory
3. Include tests for new functionality
4. Update documentation

### 📚 Documentation

- Fix typos and unclear sections
- Add examples and screenshots
- Improve setup instructions
- Document new features

### 🧪 Tests

- Add missing test coverage
- Improve existing tests
- Add E2E tests for critical flows

## Need Help?

- Check existing documentation in `docs/`
- Review feature specs in `specs/`
- Ask questions in GitHub Issues
- Review existing code for patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ratlist.gg! 🎮
