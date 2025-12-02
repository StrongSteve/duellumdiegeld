# ADR 0004: Verwendung von Prisma als ORM

## Status
Akzeptiert

## Kontext
Wir benötigen eine Abstraktionsschicht für Datenbankzugriffe, die:
- Typsichere Abfragen ermöglicht
- Migrations unterstützt
- Einfache Relationen handhabt
- Gute Developer Experience bietet

## Entscheidung
Wir verwenden **Prisma** als Object-Relational Mapper (ORM).

### Gründe:
1. **Type Safety**: Generierte TypeScript-Typen aus dem Schema
2. **Prisma Schema**: Deklaratives, lesbares Datenbankschema
3. **Migrations**: Automatische Migration-Generierung
4. **Prisma Studio**: GUI für Datenbank-Inspektion
5. **Query API**: Intuitive, typsichere Abfrage-API
6. **Relations**: Einfache Definition von Beziehungen
7. **Seeding**: Eingebaute Seed-Unterstützung

### Alternativen betrachtet:
- **TypeORM**: Mehr Boilerplate, weniger typsicher
- **Sequelize**: Älteres API, JavaScript-fokussiert
- **Raw SQL**: Zu fehleranfällig, kein Typ-Support

## Konsequenzen

### Positiv
- Keine SQL-Injection-Risiken
- Automatische Typen für Frontend und Backend
- Einfache Schema-Änderungen
- Gute NestJS-Integration

### Negativ
- Zusätzliche Build-Step (Prisma Generate)
- Eingeschränkte komplexe Abfragen
- Dependency auf Prisma-Ökosystem

### Neutral
- Eigene Query-Sprache zu lernen
