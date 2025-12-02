# ADR 0003: Verwendung von PostgreSQL als Datenbank

## Status
Akzeptiert

## Kontext
Wir benötigen eine Datenbank für:
- Speicherung von Fragen, Hinweisen und Antworten
- Admin-Benutzer und Authentifizierung
- Optionale Spielsitzungen
- Status-Tracking (pending, approved, rejected)

## Entscheidung
Wir verwenden **PostgreSQL** als relationale Datenbank.

### Gründe:
1. **Zuverlässigkeit**: Bewährte, stabile Datenbank
2. **ACID-konform**: Garantierte Transaktionen
3. **JSON-Support**: Flexible Speicherung von Einstellungen
4. **Prisma-Integration**: Exzellente Unterstützung durch Prisma ORM
5. **Cloud-Optionen**: Supabase, Neon, Railway bieten managed PostgreSQL
6. **Skalierbarkeit**: Von klein bis groß skalierbar
7. **Kostenlos**: Open Source, keine Lizenzkosten

### Alternativen betrachtet:
- **MySQL/MariaDB**: Weniger Features, schlechtere JSON-Unterstützung
- **MongoDB**: Nicht notwendig für relationale Daten
- **SQLite**: Nicht geeignet für Production mit mehreren Clients

## Konsequenzen

### Positiv
- Zuverlässige Datenspeicherung
- Einfaches Hosting bei Cloud-Anbietern
- Gute Prisma-Integration
- Migrations-Support

### Negativ
- Erfordert separate Datenbank-Instanz
- Komplexer als SQLite für lokale Entwicklung

### Neutral
- Benötigt Docker für lokale Entwicklung
