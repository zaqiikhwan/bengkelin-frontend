---
inclusion: always
---

# Development Guidelines

## File Management
- **Avoid File Proliferation**: Do not create new markdown files with suffixes like `_fixed`, `_clean`, `_new`, `_final`, `_summary`, `_report`, etc.
- **Documentation Output**: Do not automatically generate requirements.md, design.md, tasks.md, or status.md files unless explicitly instructed to enter "spec-driven development" mode or create a new formal specification.
- **Context Management**: Refer to existing documentation within the codebase instead of creating new documentation files for every change.
- **Chat Output**: Provide task summaries and explanations directly in the chat interface output, not as separate files.

## Code Architecture
- **API Service Pattern**: Use the centralized `apiService` instance from `src/services/api.ts` for all API calls. Do not create duplicate API methods.
- **Type Safety**: Import types from `src/types/api.ts` and `src/types/index.ts`. Always use proper TypeScript interfaces.
- **Authentication**: Respect the dual authentication system (users/mitras) and use appropriate endpoints based on user type.
- **Error Handling**: Follow the established pattern of try/catch blocks with proper error logging and user feedback.

## React Patterns
- **Component Structure**: Follow the established pattern with pages in `src/pages/` and reusable components in `src/components/`.
- **Routing**: Use React Router with the established protected/public route pattern. Wrap authenticated routes with `ProtectedRoute`.
- **State Management**: Use the `useAuth` hook for authentication state. Avoid prop drilling for global state.
- **Layout**: Use the `Layout` component for authenticated pages that need navigation.

## Styling & UI
- **Tailwind CSS**: Use Tailwind utility classes consistently. Follow the existing color scheme and spacing patterns.
- **Icons**: Use Heroicons (`@heroicons/react`) and Lucide React (`lucide-react`) as established in the project.
- **Responsive Design**: Ensure mobile-first responsive design using Tailwind breakpoints.

## API Integration
- **Dual API Versions**: Respect the v1/v2 API structure. Use v2 endpoints when available for new features.
- **Token Management**: The API service handles token refresh automatically. Do not implement custom token logic.
- **User Type Handling**: Always check user type (users/mitras) before making role-specific API calls.
- **Error Boundaries**: Handle 401 errors gracefully as the interceptor manages automatic logout.
