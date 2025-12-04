# Architektur-Übersicht: Das Duell um die Geld

## 1. System-Kontext-Diagramm

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Externe Systeme                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐       │
│  │ Math Captcha│         │  PostgreSQL │         │  Render.com │       │
│  │   (local)   │         │  (embedded) │         │   (Docker)  │       │
│  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘       │
│         │                       │                       │               │
│         │ CAPTCHA               │ Database              │ Hosting       │
│         │ Validation            │ Connection            │               │
│         ▼                       ▼                       ▼               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Das Duell um die Geld                        │   │
│  │                                                                 │   │
│  │  ┌─────────────────────┐       ┌─────────────────────┐         │   │
│  │  │      Frontend       │◄─────►│       Backend       │         │   │
│  │  │     (Vue 3 SPA)     │ REST  │      (NestJS)       │         │   │
│  │  │                     │  API  │                     │         │   │
│  │  └─────────────────────┘       └─────────────────────┘         │   │
│  │           ▲                             ▲                       │   │
│  │           │                             │                       │   │
│  │           │ Browser                     │ Prisma ORM            │   │
│  │           │ LocalStorage                │                       │   │
│  │           │                             │                       │   │
│  └───────────┼─────────────────────────────┼───────────────────────┘   │
│              │                             │                           │
└──────────────┼─────────────────────────────┼───────────────────────────┘
               │                             │
               ▼                             ▼
        ┌─────────────┐               ┌─────────────┐
        │   Spieler   │               │    Admin    │
        │  (Tablet)   │               │  (Browser)  │
        └─────────────┘               └─────────────┘
```

## 2. Frontend-Architektur

### Komponenten-Hierarchie

```
App.vue
├── iPadFrame (responsive wrapper)
│   └── RouterView
├── DisclaimerModal (shown on every start)
├── HomeView
│   ├── CTAButton
│   └── InfoButton → InfoModal
├── GameSetupView
│   └── CTAButton
├── GameView
│   ├── MainGameScreen
│   │   ├── StepIndicator
│   │   ├── QuestionCard
│   │   ├── HintCard
│   │   ├── ExplanationPanel
│   │   ├── StarRating
│   │   ├── GameHelp → HelpModal
│   │   └── CTAButton
│   └── InfoButton → InfoModal
├── SubmitQuestionView
│   └── CTAButton
└── Admin Views
    ├── AdminLoginView
    ├── AdminDashboardView
    ├── AdminReviewView
    │   └── HelpModal (Reject)
    ├── AdminQuestionsView
    └── AdminQuestionDetailView
```

### State Management (Pinia)

```
┌─────────────────────────────────────────────┐
│                 Pinia Stores                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐      ┌─────────────┐      │
│  │  authStore  │      │  gameStore  │      │
│  ├─────────────┤      ├─────────────┤      │
│  │ token       │      │ sessionId   │      │
│  │ username    │      │ settings    │      │
│  │ isLoading   │      │ currentState│      │
│  │ error       │      │ question    │      │
│  ├─────────────┤      │ hints       │      │
│  │ login()     │      │ roundNumber │      │
│  │ logout()    │      ├─────────────┤      │
│  └─────────────┘      │ startGame() │      │
│                       │ nextHint()  │      │
│                       │ goToState() │      │
│                       │ endGame()   │      │
│                       └─────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

## 3. Backend-Architektur

### Modul-Struktur

```
┌─────────────────────────────────────────────────────────────────┐
│                        NestJS Application                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  AppModule  │──│ ConfigModule│──│      PrismaModule       │ │
│  └──────┬──────┘  └─────────────┘  │  (Global, DB Access)    │ │
│         │                          └─────────────────────────┘ │
│         │                                                       │
│         ├────────────────┬────────────────┬──────────────────┐ │
│         ▼                ▼                ▼                  ▼ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────┐ │
│  │ AuthModule  │  │ Questions   │  │ AdminModule │  │ Game  │ │
│  │             │  │   Module    │  │             │  │Module │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├───────┤ │
│  │ Controller  │  │ Controller  │  │ Controller  │  │Ctrl   │ │
│  │ Service     │  │ Service     │  │ Service     │  │Service│ │
│  │ JwtStrategy │  │ Captcha     │  │ (Auth Guard)│  │       │ │
│  │ DTOs        │  │ Service     │  │ DTOs        │  │DTOs   │ │
│  └─────────────┘  │ DTOs        │  └─────────────┘  └───────┘ │
│                   └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  Client  │───►│  Controller │───►│   Service   │───►│  Prisma  │
│          │    │             │    │             │    │          │
│          │◄───│  Response   │◄───│   Result    │◄───│  Query   │
└──────────┘    └─────────────┘    └─────────────┘    └──────────┘
                      │
                      │ Validation
                      ▼
               ┌─────────────┐
               │    DTOs     │
               │ (class-     │
               │  validator) │
               └─────────────┘
```

## 4. Datenfluss-Diagramme

### Spielablauf (Datenfluss)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Spielablauf                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Start]                                                        │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────────┐                                           │
│  │ Spiel einrichten│──► Spieleranzahl, Namen, Startgeld        │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐    GET /questions/random                  │
│  │ Frage laden     │◄──────────────────────────────────────────│
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ QUESTION_INTRO  │──► Frage anzeigen                         │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ WRITE_GUESSES   │──► Timer (optional), Anweisung            │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │HINT_AND_BETTING │──► Hinweis N anzeigen, Wettrunde          │
│  │    (Loop)       │                                           │
│  └────────┬────────┘                                           │
│           │ Alle Hinweise gezeigt?                             │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ REVEAL_ANSWER   │──► Antwort + Erklärung                    │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ ROUND_SUMMARY   │──► Zusammenfassung, Gewinner auswählen    │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ├──► Nächste Runde? ──► Zurück zu "Frage laden"      │
│           │                                                     │
│           ▼                                                     │
│       [Ende]                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Frageneinreichung (Sequenzdiagramm)

```
┌────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│ Nutzer │          │ Frontend │          │ Backend  │          │ hCaptcha │
└───┬────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
    │                    │                     │                     │
    │ Formular ausfüllen │                     │                     │
    │───────────────────►│                     │                     │
    │                    │                     │                     │
    │ CAPTCHA lösen      │                     │                     │
    │───────────────────►│                     │                     │
    │                    │                     │                     │
    │ Absenden           │                     │                     │
    │───────────────────►│                     │                     │
    │                    │                     │                     │
    │                    │ POST /questions/submit                    │
    │                    │────────────────────►│                     │
    │                    │                     │                     │
    │                    │                     │ Verify Token        │
    │                    │                     │────────────────────►│
    │                    │                     │                     │
    │                    │                     │◄────────────────────│
    │                    │                     │ Success             │
    │                    │                     │                     │
    │                    │                     │ Save (status:PENDING)
    │                    │                     │─────┐               │
    │                    │                     │     │               │
    │                    │                     │◄────┘               │
    │                    │                     │                     │
    │                    │◄────────────────────│                     │
    │                    │ 201 Created         │                     │
    │                    │                     │                     │
    │◄───────────────────│                     │                     │
    │ Erfolgsanzeige     │                     │                     │
    │                    │                     │                     │
```

### Admin-Review (Sequenzdiagramm)

```
┌───────┐          ┌──────────┐          ┌──────────┐          ┌────────┐
│ Admin │          │ Frontend │          │ Backend  │          │   DB   │
└───┬───┘          └────┬─────┘          └────┬─────┘          └───┬────┘
    │                   │                     │                    │
    │ Login             │                     │                    │
    │──────────────────►│                     │                    │
    │                   │ POST /auth/login    │                    │
    │                   │────────────────────►│                    │
    │                   │                     │ Validate           │
    │                   │                     │───────────────────►│
    │                   │                     │◄───────────────────│
    │                   │◄────────────────────│                    │
    │                   │ JWT Token           │                    │
    │◄──────────────────│                     │                    │
    │                   │                     │                    │
    │ Review öffnen     │                     │                    │
    │──────────────────►│                     │                    │
    │                   │ GET /admin/questions/pending             │
    │                   │────────────────────►│                    │
    │                   │                     │───────────────────►│
    │                   │                     │◄───────────────────│
    │                   │◄────────────────────│                    │
    │◄──────────────────│                     │                    │
    │ Pending Questions │                     │                    │
    │                   │                     │                    │
    │ Genehmigen        │                     │                    │
    │──────────────────►│                     │                    │
    │                   │ POST /admin/questions/:id/approve        │
    │                   │────────────────────►│                    │
    │                   │                     │ Update status      │
    │                   │                     │───────────────────►│
    │                   │                     │◄───────────────────│
    │                   │◄────────────────────│                    │
    │◄──────────────────│                     │                    │
    │ Bestätigung       │                     │                    │
```

## 5. Game State Machine

```
                              ┌──────────────────┐
                              │    GAME_START    │
                              └────────┬─────────┘
                                       │
                                       ▼
┌──────────────┐             ┌──────────────────┐
│  GAME_OVER   │◄────────────│  QUESTION_INTRO  │◄──────────────┐
│  (no more    │  no quest.  │                  │               │
│  questions)  │             └────────┬─────────┘               │
└──────────────┘                      │                         │
                                      │ "Alle bereit"           │
                                      ▼                         │
                             ┌──────────────────┐               │
                             │  WRITE_GUESSES   │               │
                             │   (+ Timer?)     │               │
                             └────────┬─────────┘               │
                                      │                         │
                                      │ "Weiter"                │
                                      ▼                         │
                             ┌──────────────────┐               │
                     ┌──────►│ HINT_AND_BETTING │───────┐       │
                     │       │   (Hint N)       │       │       │
                     │       └────────┬─────────┘       │       │
                     │                │                 │       │
                     │ "Nächster      │ "Antwort       │       │
                     │  Hinweis"      │  aufdecken"    │       │
                     │                │                 │       │
                     └────────────────┘                 │       │
                                                       ▼       │
                             ┌──────────────────┐               │
                             │  REVEAL_ANSWER   │               │
                             │                  │               │
                             └────────┬─────────┘               │
                                      │                         │
                                      │ "Zur Zusammenfassung"   │
                                      ▼                         │
                             ┌──────────────────┐               │
                             │  ROUND_SUMMARY   │               │
                             │                  │               │
                             └────────┬─────────┘               │
                                      │                         │
                          ┌───────────┴───────────┐             │
                          │                       │             │
                          ▼                       ▼             │
                   ┌────────────┐         ┌────────────┐        │
                   │"Nächste    │         │"Spiel      │        │
                   │ Frage"     │─────────│ beenden"   │        │
                   └────────────┘         └────────────┘        │
                          │                       │             │
                          │                       ▼             │
                          │              ┌──────────────┐       │
                          │              │  GAME_END    │       │
                          │              └──────────────┘       │
                          │                                     │
                          └─────────────────────────────────────┘
```

## 6. Architektur-Entscheidungen

Siehe [Architecture Decision Records](/docs/adr/) für detaillierte Begründungen:

1. **ADR-0001**: NestJS für Backend (Struktur, DI, TypeScript)
2. **ADR-0002**: Vue 3 für Frontend (Composition API, Pinia)
3. **ADR-0003**: PostgreSQL (Zuverlässigkeit, JSON-Support)
4. **ADR-0004**: Prisma ORM (Type Safety, Migrations)
5. **ADR-0005**: Browser-seitige Sessions (Offline, Geschwindigkeit)
6. **ADR-0006**: Kein Spieler-Login (Analoge Erfahrung)
7. **ADR-0007**: TailwindCSS (Utility-First, Konsistenz)
8. **ADR-0008**: CAPTCHA für Submissions (Spam-Schutz)
9. **ADR-0009**: Single-Container Deployment (Render.com Free Tier)
10. **ADR-0010**: Dual-Layer Rating Protection (Vote Manipulation Prevention)
11. **ADR-0011**: Responsive Design Strategy (Device-specific layouts)
12. **ADR-0012**: Session Reset on Browser Refresh (UX consistency)

## 7. Deployment-Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                     Production Deployment                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐                                              │
│   │   Vercel/   │ ◄── Frontend (Static Files + SPA)            │
│   │   Netlify   │                                              │
│   └──────┬──────┘                                              │
│          │                                                      │
│          │ API Calls                                           │
│          ▼                                                      │
│   ┌─────────────┐                                              │
│   │  Railway/   │ ◄── Backend (Node.js Container)              │
│   │   Render    │                                              │
│   └──────┬──────┘                                              │
│          │                                                      │
│          │ Prisma Connection                                   │
│          ▼                                                      │
│   ┌─────────────┐                                              │
│   │  Supabase/  │ ◄── PostgreSQL Database                      │
│   │    Neon     │                                              │
│   └─────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Sicherheitsmaßnahmen

| Bereich | Maßnahme |
|---------|----------|
| API | JWT-Authentifizierung für Admin |
| CAPTCHA | Math-Captcha für öffentliche Submissions (lokal, keine externen Services) |
| Validierung | class-validator DTOs im Backend |
| SQL Injection | Prisma (Parameterized Queries) |
| XSS | Vue 3 (automatisches Escaping) |
| CORS | Konfiguriert für erlaubte Origins |
| Headers | Security Headers via Nginx |
| Rating-Schutz | Dual-Layer: localStorage (Frontend) + IP-Hash (Backend) |
| Login | Rate Limiting mit exponential backoff |

## 9. Bewertungssystem (Rating)

### Datenmodell

```
┌─────────────────────────────────────────────────────────────────┐
│                     QuestionRating Tabelle                       │
├─────────────────────────────────────────────────────────────────┤
│  id           │ String (CUID)    │ Primary Key                  │
│  questionId   │ String           │ Referenz zur Frage           │
│  ipHash       │ String           │ SHA-256 Hash der IP-Adresse  │
│  rating       │ Int (1-5)        │ Bewertung                    │
│  createdAt    │ DateTime         │ Zeitstempel                  │
├─────────────────────────────────────────────────────────────────┤
│  UNIQUE(questionId, ipHash)      │ Verhindert Doppelbewertungen │
└─────────────────────────────────────────────────────────────────┘
```

### Schutz vor Manipulation

```
┌──────────────────────────────────────────────────────────────────┐
│                    Rating-Schutz Flow                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐                      ┌─────────────┐            │
│  │   Nutzer    │                      │   Backend   │            │
│  │  bewertet   │                      │             │            │
│  └──────┬──────┘                      └──────┬──────┘            │
│         │                                    │                    │
│         ▼                                    │                    │
│  ┌─────────────┐                             │                    │
│  │ localStorage│ ◄── Check: Bereits         │                    │
│  │   Check     │     bewertet?              │                    │
│  └──────┬──────┘                             │                    │
│         │ Nein                               │                    │
│         ▼                                    │                    │
│  ┌─────────────┐   POST /rate   ┌───────────┴───────────┐       │
│  │   API Call  │───────────────►│  IP aus Header/Socket │       │
│  └─────────────┘                └───────────┬───────────┘       │
│                                             │                    │
│                                             ▼                    │
│                                  ┌─────────────────────┐        │
│                                  │   SHA-256(IP) →     │        │
│                                  │   ipHash            │        │
│                                  └──────────┬──────────┘        │
│                                             │                    │
│                                             ▼                    │
│                                  ┌─────────────────────┐        │
│                                  │  DB Check:          │        │
│                                  │  questionId+ipHash  │        │
│                                  │  bereits vorhanden? │        │
│                                  └──────────┬──────────┘        │
│                                             │                    │
│                           ┌─────────────────┴─────────────────┐ │
│                           │                                   │ │
│                           ▼ Nein                     Ja ▼     │ │
│                  ┌─────────────────┐         ┌─────────────┐  │ │
│                  │ Rating speichern│         │ 400 Error:  │  │ │
│                  │ ratingSum++     │         │ "Bereits    │  │ │
│                  │ ratingCount++   │         │  bewertet"  │  │ │
│                  └─────────────────┘         └─────────────┘  │ │
│                                                               │ │
└───────────────────────────────────────────────────────────────┘ │
```

### Datenschutz

- IP-Adressen werden **nicht** im Klartext gespeichert
- SHA-256 Hash ist nicht umkehrbar
- Ermöglicht Duplikat-Erkennung ohne Nutzer-Identifikation
