# RicambiXStufe

E-commerce ricambi stufe: **Next.js 16** + **PostgreSQL** (Drizzle) + **NextAuth** + **Cloudflare R2** + **PayPal**.

## Sviluppo locale

```bash
npm install
cp .env.local.example .env.local   # compila le variabili
npm run dev                        # http://localhost:3000
```

Guida DB e import: [`docs/MIGRAZIONE_VPS.md`](docs/MIGRAZIONE_VPS.md)

## Check pre-deploy

```bash
npm run lint
npm run build
curl -f http://localhost:3000/api/health
```

## Analisi bundle (opzionale)

```bash
npm run analyze
```

Apre il report interattivo dei chunk JS dopo il build (`ANALYZE=true`).

## Deploy produzione (Docker)

```bash
cp .env.production.example .env.local   # sul server, valori reali
docker compose up -d --build
```

- App: porta host `3100` → container `3000`
- Healthcheck: `GET /api/health`
- Nginx: vedi [`nginx/ricambixstufe.conf`](nginx/ricambixstufe.conf)

### Checklist produzione

- [ ] `AUTH_SECRET` univoco e lungo (≥ 32 byte)
- [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = URL HTTPS pubblico
- [ ] PostgreSQL solo rete Docker (nessuna porta DB esposta)
- [ ] `DANEA_API_USER` / `DANEA_API_PASSWORD` impostati in produzione
- [ ] `PAYPAL_MODE=live` con credenziali live
- [ ] Backup `pg_dump` schedulato
- [ ] TLS attivo (Let's Encrypt / Certbot)

## Script utili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Build standalone |
| `npm run start` | Avvio post-build |
| `npm run lint` | ESLint |
| `npm run db:clone-qa` | Clone DB verso QA (Docker) |
