# Development Guidelines: Dome With Love

## Coding Standards

### Python (Backend)
- **Style Guide**: Follow PEP8.
- **Naming Conventions**:
  - Functions, variables, test cases, and test files: `snake_case`.
  - Enums: `ALL_CAPS_SNAKE_CASE` (doesn't need to be wrapped in a class).
  - Classes and class file names: `PascalCase`.
  - File names: All file names must be `PascalCase` unless they are `__init__.py` files or `test_*` files.
- **Variable Names**: Use descriptive names that convey the purpose of the variable, but as short as possible.

### React/TypeScript (Frontend)
- **Formatting**: Use Prettier. 
- **Style Guide**: Standard functional components and hooks for state.

### Code Comments & Emojis
- **Comments**: No deductions, monologues, or thought chains in comments. Only explain the algorithm itself.
- **Emojis**: NEVER use emojis in the codebase (code or comments). Remove on sight. (Emojis are only allowed in markdown files).

## Architectural Structure
- **Backend / Python Code**: Resides in the `app` directory. Separated into standard API patterns (routers, models).
- **Frontend / React Code**: Resides in the `frontend` directory. 

## Version Control & Commits
- **Commits**: Use **Conventional Commits** (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- **Pushing/Committing**: Do not automatically commit changes or push to git remotes unless explicitly requested.

## Testing & Automation
- **Testing**: Currently skipped (no test suite setup yet). Do not run tests you have written unless explicitly told to do so.

## Tooling Rules
- **Diagrams**: Always use PlantUML for writing structural or architectural diagrams.
- **Knowledge / Docs**: Use Context7 MCP whenever documentation is needed for a specific tech stack, framework, or language.
- **Complex Tasks**: Utilize `sequential_thinking` for long-winded tasks.
