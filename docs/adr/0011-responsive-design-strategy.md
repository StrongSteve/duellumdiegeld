# ADR-0011: Responsive Design Strategy

## Status

Accepted

## Context

The application was originally designed and optimized for iPad landscape orientation (1024x768), as this is the primary use case - a tablet placed in the middle of the table during game nights.

However, users may also:
- View the app on desktop browsers (for testing, admin, or casual browsing)
- Access the app on smartphones (to quickly check rules or submit questions)

The challenge is supporting multiple device types without breaking the carefully crafted iPad layout.

## Decision

Implement a **three-tier responsive design** with device-specific layouts:

### Tier 1: Desktop (>1100px width)
- Display app inside a decorative **iPad frame** to simulate tablet experience
- Frame scales dynamically to fit viewport while maintaining 4:3 aspect ratio
- Dark gradient background behind the "device"
- Content remains exactly as designed for iPad

### Tier 2: Tablet/iPad (<1100px, landscape or square)
- No frame decoration
- Content fills the full screen
- Original iPad-optimized layout preserved
- `overflow: hidden` to prevent scrolling (everything fits on one screen)

### Tier 3: Mobile Portrait (<768px width AND portrait orientation)
- **Completely separate layout** with different constraints
- JavaScript detection via `window.innerWidth` and orientation check
- `overflow: auto` enabled for scrolling
- Simplified single-column layouts
- Logo panel hidden to save vertical space
- Forms use single-column grid instead of multi-column

### Implementation Details

**iPadFrame.vue** component:
```vue
<script setup>
const isMobilePortrait = ref(false)

function checkMobilePortrait() {
  isMobilePortrait.value = window.innerWidth < 768 &&
                           window.innerHeight > window.innerWidth
}
</script>

<template>
  <!-- Mobile: scrollable wrapper, no frame -->
  <div v-if="isMobilePortrait" class="mobile-wrapper">
    <slot></slot>
  </div>

  <!-- Desktop/Tablet: iPad frame or full screen -->
  <div v-else class="ipad-wrapper">
    <!-- frame structure -->
  </div>
</template>
```

**CSS Media Queries**:
```css
/* Tablet adjustments */
@media (max-width: 768px) {
  /* Stacked layouts, full-width elements */
}

/* Mobile portrait - completely different behavior */
@media (max-width: 767px) and (orientation: portrait) {
  .view {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
}
```

## Consequences

### Positive

- **Primary use case preserved**: iPad layout remains untouched and pixel-perfect
- **Desktop preview**: iPad frame provides visual context for how app looks on tablet
- **Mobile usable**: Users can scroll through content on phones
- **Clear separation**: Each tier has independent styles, changes don't cascade
- **Future-proof**: Easy to add device-specific features if needed

### Negative

- **Code duplication**: Some styles repeated across media queries
- **Testing complexity**: Must verify changes on 3+ device types
- **Mobile is secondary**: Mobile layout is functional but not optimized for gameplay

### Trade-offs Accepted

- Mobile gameplay experience is compromised (scrolling required, smaller touch targets)
- This is acceptable because the game is designed to be played on a shared tablet
- Mobile is primarily for admin tasks, question submission, and quick reference

## Related

- ADR-0002: Vue 3 for Frontend (component-based architecture enables this)
- ADR-0007: TailwindCSS (utility classes make responsive styles manageable)
