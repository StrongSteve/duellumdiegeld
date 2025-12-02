# ADR 0002: Verwendung von Vue 3 für das Frontend

## Status
Akzeptiert

## Kontext
Wir benötigen ein Frontend-Framework für die Tablet-Anwendung. Die Anforderungen sind:
- Schnelle, reaktive Benutzeroberfläche
- Komponenten-basierte Architektur
- State Management für Spielzustand
- TypeScript-Unterstützung
- Gute Developer Experience

## Entscheidung
Wir verwenden **Vue 3** mit der Composition API als Frontend-Framework.

### Gründe:
1. **Composition API**: Bessere Code-Organisation und Wiederverwendbarkeit
2. **TypeScript-Support**: Exzellente TypeScript-Integration in Vue 3
3. **Pinia**: Modernes, typsicheres State Management
4. **Geringe Bundle-Größe**: Wichtig für schnelles Laden auf Tablets
5. **Einfache Lernkurve**: Klare Dokumentation
6. **Single-File Components**: Übersichtliche Komponenten-Struktur
7. **Reactivity System**: Automatisches Tracking von Abhängigkeiten

### Alternativen betrachtet:
- **React**: Größere Community, aber mehr Boilerplate
- **Svelte**: Kleinere Bundle-Größe, aber weniger Ökosystem
- **Angular**: Zu komplex für diese Anwendung

## Konsequenzen

### Positiv
- Klare Komponenten-Struktur
- Einfaches State Management mit Pinia
- Gute Performance auf Tablets
- Schnelle Entwicklung

### Negativ
- Kleinere Community als React
- Weniger Job-Market-Relevanz

### Neutral
- Erfordert Verständnis der Composition API
