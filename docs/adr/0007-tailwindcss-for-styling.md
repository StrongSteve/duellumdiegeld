# ADR 0007: Use TailwindCSS for Styling

## Status
Accepted

## Context
We need a styling system for the tablet-optimized user interface. Requirements:
- Large, readable elements
- Consistent design system
- Fast development
- Responsive design
- Dark mode

## Decision
We use **TailwindCSS** as the utility-first CSS framework.

### Reasons:
1. **Utility-first**: Fast prototype development
2. **Consistency**: Predefined spacing, color, typography scales
3. **Configurable**: Custom design system in `tailwind.config.js`
4. **Purging**: Minimal CSS file size in production
5. **Dark mode**: Built-in dark mode support
6. **Responsive**: Mobile-first breakpoints
7. **IDE support**: Good autocomplete in VS Code

### Customizations:
- Extended color palette (Primary, Gold, Success, Danger)
- Larger touch targets (min. 44px)
- Adjusted font sizes for tablet
- Custom components via `@apply`

## Consequences

### Positive
- Fast UI development
- Consistent appearance
- Small bundle size
- No CSS naming conflicts

### Negative
- Longer class names in templates
- Learning curve for utility classes
- Templates can become cluttered

### Neutral
- Requires PostCSS setup
- Custom component classes for reusability
