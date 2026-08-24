# securite et protection

Ce document decrit les mesures de securite et de protection de l'application (serveur API et client Next.js).

---

## 1. protections backend (NestJS API)

### headers de securite HTTP (Helmet)
L'API active des en-tetes HTTP de securite stricts via `helmet` :
- **X-Content-Type-Options** : `nosniff` (empeche le MIME sniffing)
- **X-Frame-Options** : `DENY` (protection contre le Clickjacking)
- **X-XSS-Protection** : `1; mode=block` (protection XSS navigateurs)
- **Strict-Transport-Security (HSTS)** : force l'utilisation de HTTPS en production
- **Content-Security-Policy (CSP)** : limite les sources de scripts et de contenu executes

### protection contre les attaques CSRF & CORS
- **CORS** (Cross-Origin Resource Sharing) : restreint strict aux origines autorisees (domaine client Next.js)
- **Rate Limiting** : protection contre le Brute Force via `@nestjs/throttler` (max 100 requetes / minute par IP)

---

## 2. protections frontend (Next.js Client)

### protection XSS (Cross-Site Scripting)
- **Stockage securise des jetons JWT** : Les jetons ne sont jamais stockes dans `localStorage` ou `sessionStorage`. Ils transitent via des **cookies `HttpOnly` et `SameSite=Strict`**.
- **Sanitisation du contenu** : React echappe automatiquement tout contenu injecte dans le DOM.

### protection contre la manipulation / clonage
- **Scoping des sessions** : Déconnexion automatique et expiration stricte du jeton JWT (`JWT_EXPIRES_IN=7d`).
- **Verifications de roles stricts** : Masquage visuel cote UI avec `RoleGate`, avec re-verification et enforcement systematique cote API (`RolesGuard`).
