# AI Agent Prompting Instructions for Tangibly Development

> **Complete guide for developers to work efficiently and consistently with AI agents on the Tangibly project**

## 🎯 **Purpose**

This document provides standardized prompting instructions to ensure:

- **Consistency** across all AI-assisted development
- **Efficiency** in communication with AI agents
- **Quality** maintenance of code and architecture standards
- **Speed** in development workflow

## 📋 **Quick Reference Commands**

### **Project Context Commands**

```
"Analyze the current Tangibly project structure and architecture"
"What's the current implementation status of [feature]?"
"Show me the Frontend/Backend separation in this project"
"Review the testing setup and coverage for [component/feature]"
```

### **Development Commands**

```
"Implement [feature] following Tangibly architecture patterns"
"Add [component] with proper TypeScript, testing, and documentation"
"Fix [issue] while maintaining SOLID principles and project standards"
"Update [file] to follow the established Frontend/Backend patterns"
```

### **Code Review Commands**

```
"Review this code against Tangibly architecture guidelines"
"Check if this implementation follows our SOLID principles"
"Validate testing coverage and suggest improvements"
"Ensure this code meets our security and performance standards"
```

## 🏗️ **Project Context for AI Agents**

### **Essential Project Information**

When working with AI agents, always provide this context:

```
TANGIBLY PROJECT CONTEXT:
- Full-stack Next.js 15 asset management SAAS platform
- Frontend: React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query
- Backend: Next.js API routes, PostgreSQL, Prisma ORM, JWT auth
- Testing: Jest, React Testing Library, Playwright E2E, MSW mocking
- Architecture: SOLID principles, clear FE/BE separation
- Standards: 70% test coverage, TypeScript strict mode, ESLint/Prettier
```

### **Project Structure Reference**

```
KEY DIRECTORIES:
Frontend (FE):
- src/app/ → Next.js pages and layouts
- src/components/ → React components (ui/, forms/, common/)
- src/hooks/ → Custom React hooks and React Query
- src/store/ → Zustand global state
- src/contexts/ → React contexts

Backend (BE):
- src/app/api/ → API routes and endpoints
- src/middleware/ → Auth, security, validation middleware
- src/lib/database/ → Prisma client and DB utilities
- prisma/ → Database schema and migrations

Shared:
- src/schemas/ → Zod validation schemas
- src/types/ → TypeScript type definitions
- src/lib/ → Utility functions
```

## 📝 **Effective Prompting Templates**

### **1. Feature Implementation Prompt**

```
TASK: Implement [FEATURE_NAME] for Tangibly

REQUIREMENTS:
- Follow Tangibly architecture patterns from ARCHITECTURE.md
- Implement both Frontend (React components) and Backend (API routes)
- Use TypeScript with strict typing
- Add React Hook Form, Zod validation schemas
- Include comprehensive tests (unit, component, API)
- Follow SOLID principles
- Add proper error handling and loading states

CONTEXT:
- This is for admin functionality in the asset management system
- Integrate with existing auth system and role-based access
- Follow established patterns in similar features

DELIVERABLES:
1. Frontend components with proper state management
2. Backend API routes with middleware
3. Database schema updates if needed
4. Test files with good coverage
5. Documentation updates

Please start by analyzing existing similar features and then implement following our established patterns.
```

### **2. Bug Fix Prompt**

```
TASK: Fix [BUG_DESCRIPTION] in Tangibly

CURRENT ISSUE:
[Detailed description of the problem]

REQUIREMENTS:
- Analyze root cause following our debugging checklist
- Fix without breaking existing functionality
- Maintain TypeScript type safety
- Update tests to prevent regression
- Follow our error handling patterns
- Update documentation if needed

CONTEXT:
- Check ARCHITECTURE.md for relevant patterns
- Consider impact on both Frontend and Backend
- Ensure fix aligns with our security standards

Please first analyze the issue, then propose a solution that maintains our code quality standards.
```

### **3. Code Review Prompt**

```
TASK: Review this code for Tangibly project

CODE: [Paste code here]

REVIEW CRITERIA:
- Follows ARCHITECTURE.md patterns and SOLID principles
- Proper TypeScript usage and type safety
- Adheres to Frontend/Backend separation
- Includes appropriate error handling
- Has proper testing strategy
- Meets security and performance standards
- Follows established naming conventions

Please provide:
1. Overall assessment
2. Specific issues and suggestions
3. Compliance with our standards
4. Recommendations for improvement
```

### **4. Testing Enhancement Prompt**

```
TASK: Enhance testing for [COMPONENT/FEATURE] in Tangibly

CURRENT STATE: [Description of existing tests]

REQUIREMENTS:
- Follow our testing pyramid (70% unit, 20% component, 10% integration)
- Use Jest, React Testing Library, Playwright as appropriate
- Include MSW mocking for API tests
- Aim for 70%+ coverage
- Test error scenarios and edge cases
- Follow testing patterns in TESTING_SETUP.md

FOCUS AREAS:
- User interactions and workflows
- API endpoint validation
- Error handling and recovery
- Authentication and authorization

Please analyze current coverage and provide comprehensive test improvements.
```

## 🔧 **AI Agent Configuration**

### **Recommended AI Agent Settings**

```yaml
AI_AGENT_CONFIG:
  project_type: "full-stack-nextjs"
  language: "typescript"
  framework: "nextjs-15"
  testing_framework: "jest-playwright"
  database: "postgresql-prisma"
  auth_system: "jwt-rbac"
  code_style: "eslint-prettier"
  architecture: "solid-principles"
  coverage_target: "70%"
```

### **Essential Knowledge Base**

Ensure your AI agent has access to:

- `README.md` - Project overview and setup
- `ARCHITECTURE.md` - Code patterns and principles
- `API_DOCS.md` - Backend API reference
- `TESTING_SETUP.md` - Testing guidelines
- `package.json` - Dependencies and scripts

## 🎯 **Development Workflow Prompts**

### **Starting New Feature**

```
"I need to implement [FEATURE]. Please:
1. Analyze existing similar features in the codebase
2. Review the architecture patterns for this type of feature
3. Propose a implementation plan following our SOLID principles
4. Create the necessary components, API routes, and tests
5. Ensure proper TypeScript typing and error handling"
```

### **Debugging Issues**

```
"I'm experiencing [ISSUE] in the Tangibly app. Please:
1. Analyze the error and potential root causes
2. Check related Frontend and Backend code
3. Review our error handling patterns
4. Propose a fix that maintains code quality
5. Suggest tests to prevent regression"
```

### **Code Optimization**

```
"Please optimize [COMPONENT/FEATURE] for:
1. Performance - following our performance guidelines
2. Security - adhering to our security standards
3. Maintainability - improving code organization
4. Testing - enhancing test coverage and quality
5. Documentation - updating relevant docs"
```

### **Refactoring Tasks**

```
"Refactor [CODE_SECTION] to:
1. Better follow SOLID principles
2. Improve TypeScript type safety
3. Enhance Frontend/Backend separation
4. Add missing tests and documentation
5. Maintain backward compatibility"
```

## 📚 **Reference Commands**

### **Architecture & Patterns**

```
"Show me the established pattern for [authentication/forms/API routes/state management]"
"How should I implement [feature] following our architecture guidelines?"
"What's the correct way to handle [errors/loading states/validation] in this project?"
```

### **Testing & Quality**

```
"Generate comprehensive tests for [component/feature]"
"Check test coverage and suggest improvements"
"Review this code for security vulnerabilities"
"Validate this implementation against our coding standards"
```

### **Documentation**

```
"Update documentation for [new feature/changes]"
"Generate API documentation for [endpoints]"
"Create usage examples for [component/utility]"
"Update README with [new information]"
```

## ⚡ **Efficiency Tips**

### **1. Always Provide Context**

```
// Good:
"In the Tangibly asset management system, I need to add a new asset creation form that integrates with our existing auth system and follows our React Hook Form + Zod validation patterns."

// Bad:
"Add a form for creating assets."
```

### **2. Reference Existing Patterns**

```
// Good:
"Follow the same pattern as the user registration form in src/app/auth/register/page.tsx"

// Bad:
"Create a form with validation."
```

### **3. Specify Both FE and BE Requirements**

```
// Good:
"Implement user profile editing with:
- Frontend: React component with form validation
- Backend: API route with auth middleware and database updates
- Both: Proper error handling and TypeScript types"

// Bad:
"Add user profile editing."
```

### **4. Include Testing Requirements**

```
// Good:
"Add comprehensive tests including unit tests for utilities, component tests for React components, and API tests for endpoints."

// Bad:
"Add some tests."
```

## 🚨 **Common Pitfalls to Avoid**

### **❌ Don't Say:**

- "Add a simple component" (specify requirements)
- "Fix this bug" (provide context and constraints)
- "Make it work" (define success criteria)
- "Add some validation" (specify validation rules)

### **✅ Instead Say:**

- "Add a TypeScript component following our shadcn/ui patterns with proper props interface"
- "Fix this authentication bug while maintaining our JWT security standards"
- "Implement this feature to meet our 70% test coverage and accessibility requirements"
- "Add Zod validation following our established schema patterns"

## 📊 **Quality Checklist for AI Outputs**

When reviewing AI-generated code, ensure:

- [ ] **Architecture Compliance**: Follows SOLID principles and project patterns
- [ ] **TypeScript**: Proper typing, no `any` types, strict mode compliance
- [ ] **Testing**: Includes unit, component, and integration tests as appropriate
- [ ] **Error Handling**: Proper error boundaries and API error responses
- [ ] **Security**: Follows authentication, authorization, and validation patterns
- [ ] **Performance**: Optimized for loading speed and user experience
- [ ] **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- [ ] **Documentation**: Updated relevant documentation and added code comments

## 🔄 **Continuous Improvement**

### **Feedback Loop**

1. **Use AI agent** with these prompts
2. **Review output** against our standards
3. **Refine prompts** based on results
4. **Update this guide** with improvements
5. **Share learnings** with team

### **Regular Updates**

- Update prompts when architecture evolves
- Add new patterns as they're established
- Incorporate lessons learned from AI interactions
- Keep reference commands current with project state

---

**Remember**: The goal is to make AI agents an efficient extension of our development team while maintaining the high standards and consistency that make Tangibly a quality codebase. 🚀
