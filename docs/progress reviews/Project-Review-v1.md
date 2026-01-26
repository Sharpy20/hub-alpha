# Project Review v1: Web Developer Perspective

> **Document Version:** 1.0
> **Last Updated:** 25 January 2026
> **Project:** Inpatient Hub
> **Reviewer Role:** Senior Web Developer / Technical Lead

---

## Executive Summary

This review assesses the Inpatient Hub project from a technical web development perspective, evaluating code quality, architecture decisions, scalability, and areas for improvement. The project demonstrates solid fundamentals with room for enhancement in several areas.

---

## Technical Stack Assessment

### Framework Choice: Next.js 16 (App Router)

**Strengths:**
- Modern React framework with excellent TypeScript support
- Server-side rendering capabilities for future SEO requirements
- Built-in routing with app directory structure
- Strong developer experience with hot reload
- Large ecosystem and community support

**Considerations:**
- App Router is relatively new; some patterns still evolving
- SSR may be overkill for an internal tool
- Bundle size considerations for NHS networks (often slow)

**Recommendation:** Good choice. Consider static export for Light version to reduce hosting complexity.

### Styling: Tailwind CSS

**Strengths:**
- Rapid prototyping with utility classes
- Consistent design system enforcement
- Small production CSS bundles
- Good NHS colour token integration

**Weaknesses:**
- HTML can become verbose with many classes
- Some components have repeated class strings (DRY violation)
- Limited use of @apply for common patterns

**Recommendations:**
1. Extract common patterns to component variants or @apply rules
2. Consider creating a design token system beyond colours
3. Document spacing/sizing conventions

### State Management

**Current Approach:** React Context (useApp hook)

**Strengths:**
- Simple, fits project scale
- No additional dependencies
- Easy to understand

**Weaknesses:**
- All state in single context risks re-render issues
- No persistence layer abstraction
- localStorage used directly in multiple places

**Recommendations:**
1. Split context into smaller providers (user, ward, tasks)
2. Create storage abstraction layer for localStorage/Supabase swap
3. Consider React Query or SWR for data fetching when scaling

---

## Architecture Review

### Folder Structure

**Current Structure:**
```
src/
├── app/           # Pages (Next.js convention)
├── components/    # UI components
│   ├── layout/
│   ├── modals/
│   └── ui/
├── lib/
│   ├── data/      # Static data + generators
│   └── types/     # TypeScript types
```

**Assessment:** Clean and intuitive. Follows Next.js conventions well.

**Suggestions:**
1. Add `src/hooks/` for custom hooks (currently inline)
2. Add `src/utils/` for helper functions
3. Consider `src/features/` for feature-based organization at scale

### Component Design

**Strengths:**
- Components are reasonably sized
- Good separation of concerns
- Modal pattern is consistent

**Weaknesses:**
- Some pages are large (tasks/page.tsx) - could extract more
- Limited component prop documentation
- No Storybook or component documentation

**Recommendations:**
1. Extract TaskCard, DayColumn, etc. into separate files
2. Add JSDoc comments for complex component props
3. Consider Storybook for component library documentation

### Type Safety

**Strengths:**
- Comprehensive TypeScript types in `lib/types/`
- Union types for task variants (WardTask | PatientTask | Appointment)
- Good use of Record types for configs

**Weaknesses:**
- Some `any` types likely present (not audited)
- No runtime validation (Zod/Yup)
- API payloads not validated

**Recommendations:**
1. Add Zod schemas for data validation
2. Enable strict TypeScript checks in tsconfig
3. Add type guards for union type narrowing

---

## Code Quality

### Consistency

| Aspect | Rating | Notes |
|--------|--------|-------|
| Naming conventions | Good | camelCase components, consistent |
| File naming | Good | PascalCase for components |
| Code formatting | Good | Likely Prettier configured |
| Import ordering | Fair | Not consistent across files |

### DRY Violations

**Observed patterns:**
1. Filter button styling repeated in multiple pages
2. Modal header patterns duplicated
3. Card styling patterns repeated

**Recommendations:**
1. Create shared ButtonGroup, ModalHeader components
2. Extract common card variants
3. Consider compound component patterns

### Performance Considerations

**Current:**
- All data loaded at page level
- No pagination for large lists
- No virtualization for long task lists

**For Production:**
1. Add pagination to patient list (100 patients is already edge case)
2. Consider react-window for virtualized lists
3. Implement skeleton loading states
4. Add error boundaries

### Accessibility

**Observed:**
- Focus states present (Tailwind defaults)
- Semantic HTML mostly correct
- Icons have aria-labels in some places

**Missing:**
- Skip navigation links
- Consistent aria-labels on all interactive elements
- Keyboard navigation testing
- Screen reader testing

**Recommendations:**
1. Full WCAG 2.1 AA audit required
2. Add keyboard navigation to modals
3. Test with NVDA/VoiceOver
4. Add focus trapping to modals

---

## Security Review

### Current State

**Strengths:**
- No real PII in demo mode
- Feature flags gate sensitive features
- No API keys exposed

**Concerns:**
1. localStorage not encrypted (fine for Light version)
2. No CSRF protection (not needed without real API)
3. No rate limiting (client-side only currently)

### For Production (Medium+)

**Required:**
1. Supabase Row Level Security policies
2. Trust authentication integration
3. Session timeout handling
4. Audit logging for sensitive actions
5. Data encryption at rest

---

## Testing

### Current State

**Testing:** None observed

**Recommendations:**
1. Add Jest for unit tests
2. Add React Testing Library for component tests
3. Add Playwright for E2E tests
4. Add test coverage requirements (80%+)

**Priority Tests:**
1. Feature flag logic
2. Task state transitions
3. Modal interactions
4. Date handling functions

---

## Build & Deployment

### Current Build

**Strengths:**
- Clean build with no errors
- Static export possible
- Reasonable bundle size

**Areas for Improvement:**
1. Add bundle analyzer for size monitoring
2. Set up CI/CD pipeline
3. Add environment variable validation
4. Document deployment procedures

### Recommended CI/CD

```yaml
# Example GitHub Actions workflow
jobs:
  test:
    - lint
    - typecheck
    - unit tests
  build:
    - next build
    - bundle size check
  deploy:
    - preview deployment (PR)
    - production deployment (main)
```

---

## Technical Debt

### Low Priority
- Extract repeated styling patterns
- Add JSDoc comments
- Organize imports consistently

### Medium Priority
- Split large page components
- Add loading/error states
- Implement proper date handling (consider date-fns)

### High Priority (Before Production)
- Add authentication layer
- Implement proper data persistence
- Add comprehensive error handling
- Complete accessibility audit

---

## Recommendations Summary

### Immediate (Before User Testing)
1. Add loading states to async operations
2. Add error boundaries to major sections
3. Fix any accessibility blockers (keyboard nav)

### Short-term (Before Production)
1. Implement testing framework
2. Set up CI/CD pipeline
3. Complete accessibility audit
4. Add data persistence layer

### Long-term (Post-MVP)
1. Consider monorepo for multiple deployments
2. Add component documentation (Storybook)
3. Performance optimization pass
4. Analytics integration

---

## Scoring

| Category | Score (1-10) | Notes |
|----------|--------------|-------|
| Code Quality | 7 | Clean but could be DRYer |
| Architecture | 8 | Well-structured for scale |
| Type Safety | 7 | Good types, needs validation |
| Performance | 6 | Needs optimization for production |
| Accessibility | 5 | Basic support, needs audit |
| Security | 6 | Fine for demo, needs work for prod |
| Testing | 2 | No tests observed |
| Documentation | 6 | CLAUDE.md is good, code docs lacking |

**Overall: 6.1/10** - Solid prototype ready for user testing, requires work before production deployment.

---

*This review is intended to guide development priorities and does not represent a final technical assessment.*
