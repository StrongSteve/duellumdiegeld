# ADR 0005: Spielsitzung primär im Browser speichern

## Status
Akzeptiert

## Kontext
Der Spielzustand muss zwischen Seitenwechseln und Browser-Reloads persistieren. Es gibt zwei Optionen:
1. Alles auf dem Server speichern
2. Primär im Browser (LocalStorage) mit optionaler Server-Synchronisation

## Entscheidung
Wir speichern den **Spielzustand primär im Browser (LocalStorage)** mit optionaler Server-Backup.

### Gründe:
1. **Offline-Fähigkeit**: Spiel funktioniert auch ohne Internetverbindung
2. **Geschwindigkeit**: Keine Netzwerk-Latenz bei Zustandsänderungen
3. **Einfachheit**: Weniger Server-Komplexität
4. **Ein Tablet**: Das Spiel läuft auf einem einzigen Gerät
5. **Kein Multi-Device**: Keine Synchronisation zwischen Geräten nötig
6. **Schnelle Wiederherstellung**: Sofortiges Weiterspielen nach Reload

### Was wird gespeichert:
- Aktuelle Frage
- Spielphase (State)
- Bereits verwendete Fragen-IDs
- Spielereinstellungen
- Rundennummer

### Server-Komponente (optional):
- Session-ID für spätere Analyse
- Backup der verwendeten Fragen

## Konsequenzen

### Positiv
- Schnelle, reaktive Benutzeroberfläche
- Funktioniert offline
- Keine Server-Last für Spielzustand
- Einfachere Architektur

### Negativ
- Zustand geht verloren bei Browser-Cache-Löschung
- Keine Geräte-Synchronisation
- Keine Server-seitige Spielhistorie (ohne explizites Speichern)

### Neutral
- LocalStorage-Limit (5-10 MB) ist ausreichend
