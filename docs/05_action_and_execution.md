# Action and Execution

## Development Workflow
1. **Repository Management:** 
   - All code will be pushed to GitHub.
   - Branching strategy: `main` (production), feature branches for specific phases.
2. **Coding Standards:**
   - Use modular functional components.
   - Tailwind utility classes for styling.
   - Prop validation via TypeScript (if used) or strict PropTypes.
3. **Deployment Pipeline:**
   - Vercel connected to GitHub `main` branch for automatic CI/CD.
   - Preview deployments for every pull request/feature update.
4. **Execution Steps (Immediate):**
   - Scaffold Next.js app in a new directory or replace existing files (after backup).
   - Configure Tailwind with Creamy Green color palette.
   - Build out dummy pages to establish routing.
