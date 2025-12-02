# ADR 0001: Verwendung von NestJS für das Backend

## Status
Akzeptiert

## Kontext
Wir benötigen ein Backend-Framework für die REST API des Spielleiters. Die API muss:
- RESTful Endpunkte bereitstellen
- JWT-Authentifizierung unterstützen
- Validierung von Eingabedaten ermöglichen
- Gut mit Prisma ORM zusammenarbeiten
- TypeScript unterstützen

## Entscheidung
Wir verwenden **NestJS** als Backend-Framework.

### Gründe:
1. **TypeScript-native**: NestJS ist vollständig in TypeScript geschrieben und bietet exzellente Typsicherheit
2. **Modulare Architektur**: Das Modul-System ermöglicht saubere Trennung von Concerns
3. **Dependency Injection**: Integriertes DI-System für testbaren, wartbaren Code
4. **Decorator-basiert**: Klare, deklarative API-Definition
5. **Passport-Integration**: Einfache JWT-Authentifizierung
6. **class-validator**: Eingebaute Validierung mit Decorators
7. **Große Community**: Viele Plugins, gute Dokumentation

### Alternativen betrachtet:
- **Express.js**: Zu minimalistisch, erfordert viel Boilerplate
- **Fastify**: Schneller, aber weniger strukturiert
- **Koa**: Ähnlich wie Express, keine klare Architektur

## Konsequenzen

### Positiv
- Klare Projektstruktur von Anfang an
- Einfache Integration von Middleware und Guards
- Gute Testbarkeit durch DI
- Konsistente Codebase

### Negativ
- Höhere Lernkurve als Express
- Mehr Boilerplate für kleine Projekte
- Dependency auf das NestJS-Ökosystem

### Neutral
- Erfordert Verständnis von Decorators und DI
