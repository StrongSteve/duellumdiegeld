# Das Duell um die Geld

> **Legal Disclaimer / Copyright Notice**
>
> **"Das Duell um die Geld"** is a TV show by **ProSieben** and **Joyn**, hosted by Joko Winterscheidt and Klaas Heufer-Umlauf.
>
> © Seven.One Entertainment Group GmbH | Produced by Florida Entertainment GmbH
>
> This web app is a **Proof of Concept (POC)** created to demonstrate the capabilities of **AI-assisted software development** using **Claude Code**. It is a **non-commercial fan project** with no profit intent. All rights to the original format, name, and concept remain with the rightful owners.
>
> [Watch the original on Joyn](https://www.joyn.de/serien/das-duell-um-die-geld)

---

A digital game facilitator for the analog quiz/poker card game. The app is placed on a tablet in the middle of the table and guides players step by step through each round.

## Features

### Game Module
- **Guided gameplay**: Step-by-step through each round
- **State Machine**: Clear state transitions (Question -> Guessing -> Betting rounds with hints -> Answer -> Summary)
- **Poker table visualization**: Player order with Small/Big Blind display
- **Tablet-optimized**: Large fonts, big buttons, high contrast
- **Offline play money**: Players manage their money on paper
- **Session persistence**: Survives browser reloads
- **PWA support**: Installable as app on mobile devices
- **Cookie-based question tracking**: Avoids question repetition
- **Question rating**: 5-star rating system with vote manipulation protection
- **Source URL display**: Clickable link to source when solution is revealed
- **Responsive design**: Separate layouts for desktop (iPad frame), tablet, and mobile portrait

### Public Question Submission
- Form with category, question, numeric answer, hints, source
- Math captcha protected (no external services)
- Questions are marked as "pending" in the database

### Admin Moderation
- Dashboard with statistics
- Approve/reject/edit questions
- Filter and search
- JWT authentication
- Rate-limited login with exponential backoff
- Import/Export questions as JSON (with duplicate detection)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vue 3, Vite, TailwindCSS, Pinia, Vue Router, PWA |
| Backend | Node.js, NestJS, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) with Rate Limiting |
| Security | Math Captcha (local), bcrypt (12 rounds), exponential login backoff |
| DevOps | Docker, docker-compose |

## Categories

- Science, History, Geography, Sports, Technology
- Pop Culture, Everyday Life, Animals, Food & Drink
- Health, Music, Astronomy, Miscellaneous

## REST API

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/questions/submit` | Submit question (with captcha) |
| GET | `/api/questions/random` | Random approved question |
| GET | `/api/questions/count` | Count of approved questions |
| GET | `/api/questions/captcha` | Math captcha challenge |
| POST | `/api/questions/rate` | Rate a question (1-5 stars) |
| GET | `/api/health` | Health check endpoint |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login (rate-limited) |

### Admin Endpoints (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/questions/pending` | Pending questions |
| GET | `/api/admin/questions` | All questions (with filters) |
| GET | `/api/admin/questions/:id` | Single question |
| POST | `/api/admin/questions/:id/approve` | Approve question |
| POST | `/api/admin/questions/:id/reject` | Reject question |
| PUT | `/api/admin/questions/:id` | Edit question |
| DELETE | `/api/admin/questions/:id` | Delete question |
| GET | `/api/admin/export` | Export all questions as JSON |
| POST | `/api/admin/import` | Import questions from JSON |

### Game Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/session` | Create new game session |
| GET | `/api/game/session/:id` | Get game session |
| PUT | `/api/game/session/:id` | Update game session |
| GET | `/api/game/session/:id/next-question` | Next question |
| POST | `/api/game/session/:id/end` | End game session |

## Deployment

### Render.com (Free)

> **POC Decision**: For this Proof of Concept, everything is deployed in a single Docker container.
> This enables free hosting on Render.com. See [ADR-0009](docs/adr/0009-single-container-deployment.md) for details.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/StrongSteve/duellumdiegeld)

**Manual Deployment:**
1. Fork/Clone this repository
2. Create a new "Web Service" on [render.com](https://render.com)
3. Connect your GitHub repository
4. Render automatically detects the `render.yaml` configuration
5. Click "Create Web Service"

**Notes:**
- The container includes PostgreSQL, Backend and Frontend
- First start takes ~2-3 minutes (Build + Migrations)
- Free Tier: Container sleeps after 15 min of inactivity (Cold Start ~30-60s)
- Admin credentials appear in Render Logs

### Docker Compose (Local)

```bash
# Start all services
docker-compose up -d --build

# Open app: http://localhost:8080
# The database is automatically seeded with 40+ questions
```

### Admin Access

**IMPORTANT**: Admin password and JWT secret are automatically regenerated on every server start!

The credentials are prominently displayed in the server logs:

```
docker-compose logs backend
```

Example output:
```
══════════════════════════════════════════════════════════════════════

   🔐  ADMIN CREDENTIALS - GENERATED ON STARTUP  🔐

──────────────────────────────────────────────────────────────────────

   Username:  admin
   Password:  <auto-generated-32-char-password>

──────────────────────────────────────────────────────────────────────

   ⚠️  IMPORTANT: These credentials are regenerated
   on every restart! Please note them down.

══════════════════════════════════════════════════════════════════════
```

### Security Features

- **Auto-generated credentials**: Password and JWT secret are regenerated on every start
- **Password hashing**: bcrypt with 12 rounds
- **Rate limiting**: Exponential backoff on failed logins
  - 1st failure: 5 seconds lockout
  - 2nd failure: 50 seconds lockout
  - 3rd failure: 500 seconds lockout
  - Maximum: 1 hour lockout
- **JWT tokens**: 24h validity, validated against database
- **Rating protection**: Dual-layer protection against vote manipulation
  - Frontend: localStorage check prevents re-rating same question
  - Backend: IP hash stored per rating, rejects duplicate ratings from same IP

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd das-duell-um-die-geld
   ```

2. **Setup backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

3. **Setup frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Game Rules

### Basic Principle
For each question, players must estimate a number. The answer is written down secretly. Hints are revealed one by one, and players can bet or fold.

### Flow
1. **Show question** - Everyone reads the question
2. **Estimate** - Everyone writes down their estimate
3. **Betting round 1** - First bets
4. **Hint 1** - First hint is revealed
5. **Betting round 2** - More bets
6. **Hint 2** - Second hint is revealed
7. **Betting round 3** - More bets
8. **Reveal** - Answer is shown
9. **Betting round 4** - Final bets
10. **Winner** - Next round

### Betting
- After each hint there's a betting round
- Small Blind and Big Blind rotate each round
- Money is managed offline (on paper)
- Bluffing is allowed!

### Winner
- Whoever is closest to the correct number wins the pot
- In case of a tie, the pot is split

## Documentation

### Architecture

- [Architecture Overview](docs/architecture/overview.md) - System architecture, components, and data flow

### Architecture Decision Records (ADRs)

| ADR | Title |
|-----|-------|
| [ADR-0001](docs/adr/0001-use-nestjs.md) | Use NestJS for Backend |
| [ADR-0002](docs/adr/0002-use-vue3.md) | Use Vue 3 for Frontend |
| [ADR-0003](docs/adr/0003-use-postgresql.md) | Use PostgreSQL for Database |
| [ADR-0004](docs/adr/0004-use-prisma.md) | Use Prisma as ORM |
| [ADR-0005](docs/adr/0005-session-browser-side-only.md) | Browser-Side Session Management |
| [ADR-0006](docs/adr/0006-no-player-login.md) | No Player Login Required |
| [ADR-0007](docs/adr/0007-tailwindcss-for-styling.md) | TailwindCSS for Styling |
| [ADR-0008](docs/adr/0008-captcha-for-submissions.md) | Math Captcha for Submissions |
| [ADR-0009](docs/adr/0009-single-container-deployment.md) | Single Container Deployment |
| [ADR-0010](docs/adr/0010-dual-layer-rating-protection.md) | Dual-Layer Rating Protection |
| [ADR-0011](docs/adr/0011-responsive-design-strategy.md) | Responsive Design Strategy |
