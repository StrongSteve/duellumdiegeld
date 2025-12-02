# Das Duell um die Geld

Ein digitaler Spielleiter für das analoge Quiz/Poker-Kartenspiel. Die App wird auf einem Tablet in der Mitte des Tisches platziert und führt die Spieler Schritt für Schritt durch jede Runde.

## Features

### Spielmodul
- **Geführter Spielablauf**: Schritt-für-Schritt durch jede Runde
- **State Machine**: Klare Zustandsübergänge (Frage -> Schätzen -> Einsatzrunden mit Hinweisen -> Antwort -> Zusammenfassung)
- **Poker-Tisch Visualisierung**: Spielerordnung mit Small/Big Blind Anzeige
- **Tablet-optimiert**: Große Schrift, große Buttons, hoher Kontrast
- **Offline-Spielgeld**: Spieler verwalten ihr Geld auf Papier
- **Session-Persistenz**: Übersteht Browser-Reloads
- **PWA-Support**: Installierbar als App auf mobilen Geräten
- **Cookie-basierte Fragenverfolgung**: Vermeidet Wiederholung von Fragen

### Öffentliche Frageneinreichung
- Formular mit Kategorie, Frage, numerische Antwort, Hinweise, Quelle
- Math-Captcha geschützt (keine externen Services)
- Fragen landen als "ausstehend" in der Datenbank

### Admin-Moderation
- Dashboard mit Statistiken
- Fragen genehmigen/ablehnen/bearbeiten
- Filter und Suche
- JWT-Authentifizierung
- Rate-Limited Login mit exponentiellem Backoff

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | Vue 3, Vite, TailwindCSS, Pinia, Vue Router, PWA |
| Backend | Node.js, NestJS, Prisma ORM |
| Datenbank | PostgreSQL |
| Auth | JWT (JSON Web Tokens) mit Rate Limiting |
| Security | Math-Captcha (lokal), bcrypt (12 rounds), exponentielles Login-Backoff |
| DevOps | Docker, docker-compose |

## Kategorien

- Wissenschaft, Geschichte, Geografie, Sport, Technologie
- Popkultur, Alltag, Tiere, Essen & Trinken
- Gesundheit, Musik, Astronomie, Sonstiges

## REST API

### Öffentliche Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/api/questions/submit` | Frage einreichen (mit Captcha) |
| GET | `/api/questions/random` | Zufällige genehmigte Frage |
| GET | `/api/questions/count` | Anzahl genehmigter Fragen |
| GET | `/api/questions/captcha` | Math-Captcha Challenge |

### Auth Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/api/auth/login` | Admin-Login (rate-limited) |

### Admin Endpunkte (Auth erforderlich)

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/api/admin/dashboard` | Dashboard-Statistiken |
| GET | `/api/admin/questions/pending` | Ausstehende Fragen |
| GET | `/api/admin/questions` | Alle Fragen (mit Filtern) |
| GET | `/api/admin/questions/:id` | Einzelne Frage |
| POST | `/api/admin/questions/:id/approve` | Frage genehmigen |
| POST | `/api/admin/questions/:id/reject` | Frage ablehnen |
| PUT | `/api/admin/questions/:id` | Frage bearbeiten |
| DELETE | `/api/admin/questions/:id` | Frage löschen |

### Game Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/api/game/session` | Neue Spielsitzung erstellen |
| GET | `/api/game/session/:id` | Spielsitzung abrufen |
| PUT | `/api/game/session/:id` | Spielsitzung aktualisieren |
| GET | `/api/game/session/:id/next-question` | Nächste Frage |
| POST | `/api/game/session/:id/end` | Spielsitzung beenden |

## Docker Deployment

### Quick Start

```bash
# Alle Services starten
docker-compose up -d --build

# App öffnen: http://localhost:8080
# Die Datenbank wird automatisch mit 40 Fragen geseeded
```

### Umgebungsvariablen

Erstelle eine `.env` Datei im `backend/` Verzeichnis:

```env
# Datenbank
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dasduell?schema=public"

# Admin (REQUIRED - 64 chars, alphanumeric + special)
ADMIN_PASSWORD="your-secure-64-character-password-here"

# JWT (change in production!)
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_EXPIRATION="24h"

# Server
PORT=3000
NODE_ENV=production
```

### Admin-Zugang

- **Username**: `admin`
- **Passwort**: Aus `ADMIN_PASSWORD` Umgebungsvariable

Generiere ein sicheres Passwort:
```bash
openssl rand -base64 48 | tr -dc 'a-zA-Z0-9!@#$%^&*()_+-=' | head -c 64
```

### Sicherheitsfeatures

- **Passwort-Hashing**: bcrypt mit 12 Runden
- **Rate Limiting**: Exponentielles Backoff bei fehlgeschlagenen Logins
  - 1. Fehlversuch: 5 Sekunden Sperre
  - 2. Fehlversuch: 50 Sekunden Sperre
  - 3. Fehlversuch: 500 Sekunden Sperre
  - Maximal: 1 Stunde Sperre
- **JWT-Token**: 24h Gültigkeit, validiert gegen Datenbank

## Lokale Entwicklung

### Voraussetzungen

- Node.js 20+
- Docker & Docker Compose

### Setup

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd das-duell-um-die-geld
   ```

2. **Backend einrichten**
   ```bash
   cd backend
   cp .env.example .env  # Dann ADMIN_PASSWORD setzen!
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

3. **Frontend einrichten** (neues Terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **App öffnen**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Spielregeln

### Grundprinzip
Bei jeder Frage müssen die Spieler eine Zahl schätzen. Die Antwort wird geheim aufgeschrieben. Nach und nach werden Hinweise aufgedeckt, und die Spieler können wetten oder aussteigen.

### Ablauf
1. **Frage anzeigen** - Alle lesen die Frage
2. **Schätzen** - Jeder schreibt seine Schätzung auf
3. **Einsatzrunde 1** - Erste Wetten
4. **Hinweis 1** - Erster Hinweis wird aufgedeckt
5. **Einsatzrunde 2** - Weitere Wetten
6. **Hinweis 2** - Zweiter Hinweis wird aufgedeckt
7. **Einsatzrunde 3** - Weitere Wetten
8. **Auflösung** - Antwort wird gezeigt
9. **Einsatzrunde 4** - Finale Wetten
10. **Gewinner** - Nächste Runde

### Wetten
- Nach jedem Hinweis gibt es eine Wettrunde
- Small Blind und Big Blind rotieren jede Runde
- Das Geld wird offline (auf Papier) verwaltet
- Bluffen ist erlaubt!

### Gewinner
- Wer am nächsten an der korrekten Zahl liegt, gewinnt den Pot
- Bei Gleichstand wird geteilt

## Lizenz

MIT
