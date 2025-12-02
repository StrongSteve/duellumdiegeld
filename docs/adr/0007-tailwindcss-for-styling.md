# ADR 0007: Verwendung von TailwindCSS für Styling

## Status
Akzeptiert

## Kontext
Wir benötigen ein Styling-System für die Tablet-optimierte Benutzeroberfläche. Anforderungen:
- Große, gut lesbare Elemente
- Konsistentes Design-System
- Schnelle Entwicklung
- Responsive Design
- Dark Mode

## Entscheidung
Wir verwenden **TailwindCSS** als Utility-First CSS Framework.

### Gründe:
1. **Utility-First**: Schnelle Prototypenentwicklung
2. **Konsistenz**: Vordefinierte Spacing-, Color-, Typography-Scales
3. **Konfigurierbar**: Eigenes Design-System in `tailwind.config.js`
4. **Purging**: Minimale CSS-Dateigröße in Production
5. **Dark Mode**: Eingebaute Dark-Mode-Unterstützung
6. **Responsive**: Mobile-first Breakpoints
7. **IDE-Support**: Gute Autocomplete in VS Code

### Anpassungen:
- Erweiterte Farbpalette (Primary, Gold, Success, Danger)
- Größere Touch-Targets (min. 44px)
- Angepasste Schriftgrößen für Tablet
- Custom Components via `@apply`

## Konsequenzen

### Positiv
- Schnelle UI-Entwicklung
- Konsistentes Erscheinungsbild
- Kleine Bundle-Größe
- Keine CSS-Naming-Konflikte

### Negativ
- Längere Klassennamen in Templates
- Lernkurve für Utility-Klassen
- Templates können unübersichtlich werden

### Neutral
- Erfordert PostCSS-Setup
- Eigene Komponenten-Klassen für Wiederverwendbarkeit
