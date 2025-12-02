# ADR 0006: Kein Spieler-Login erforderlich

## Status
Akzeptiert

## Kontext
Das Spiel wird auf einem gemeinsamen Tablet in der Mitte des Tisches gespielt. Die Frage ist, ob Spieler individuelle Accounts benötigen.

## Entscheidung
**Spieler benötigen kein Login**. Das Spiel ist für anonyme Gruppennutzung konzipiert.

### Gründe:
1. **Analoge Spielerfahrung**: Das Spiel ist ein Hilfsmittel, kein digitales Spiel
2. **Gemeinsames Gerät**: Alle Spieler teilen sich ein Tablet
3. **Schneller Start**: Keine Registrierung, sofort spielen
4. **Offline-Geld**: Spielgeld wird auf Papier verwaltet
5. **Datenschutz**: Keine persönlichen Daten erforderlich
6. **Einfachheit**: Weniger Komplexität in der App

### Spieler-Handling:
- Spielernamen werden nur für die aktuelle Session eingegeben
- Namen sind optional und dienen nur der Anzeige
- Keine Persistenz von Spielerdaten zwischen Sessions

### Ausnahme - Admin:
- Admins benötigen Login für die Fragenverwaltung
- JWT-basierte Authentifizierung
- Separater Admin-Bereich

## Konsequenzen

### Positiv
- Niedrige Einstiegshürde
- Kein Datenschutz-Problem mit Spielerdaten
- Einfachere Entwicklung
- Schnellerer Spielstart

### Negativ
- Keine Spieler-Statistiken
- Keine personalisierten Erfahrungen
- Keine Ranglisten

### Neutral
- Spielernamen müssen bei jeder Session neu eingegeben werden
