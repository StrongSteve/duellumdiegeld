# ADR 0008: CAPTCHA für öffentliche Frageneinreichungen

## Status
Akzeptiert

## Kontext
Die öffentliche Frageneinreichung ist ohne Login zugänglich. Wir müssen uns gegen:
- Spam-Einreichungen
- Bots und automatisierte Angriffe
- Missbräuchliche Inhalte

schützen.

## Entscheidung
Wir verwenden **hCaptcha** (oder alternativ reCAPTCHA) für die Frageneinreichung.

### Gründe:
1. **Spam-Schutz**: Verhindert automatisierte Einreichungen
2. **Datenschutz**: hCaptcha ist DSGVO-freundlicher als reCAPTCHA
3. **Einfache Integration**: JavaScript-Widget + Server-Validierung
4. **Bewährt**: Weit verbreitete Lösung
5. **Kostenlos**: Beide Optionen sind für unser Volumen kostenlos

### Implementierung:
- Frontend: CAPTCHA-Widget im Formular
- Backend: Token-Validierung via API-Call
- Development: Bypass-Modus wenn kein Secret konfiguriert

### Konfiguration:
```env
CAPTCHA_SECRET=your-secret-key
CAPTCHA_VERIFY_URL=https://hcaptcha.com/siteverify
```

## Konsequenzen

### Positiv
- Effektiver Schutz gegen Bots
- Reduziert Admin-Aufwand für Spam-Entfernung
- Standardlösung, gut dokumentiert

### Negativ
- Zusätzlicher Schritt für legitime Nutzer
- Abhängigkeit von externem Service
- Kann Accessibility beeinträchtigen

### Neutral
- Erfordert API-Key-Setup
- Server-seitige Validierung notwendig
