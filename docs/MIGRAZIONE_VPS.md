# Guida: da Supabase a PostgreSQL su VPS

L’applicazione usa **PostgreSQL** (Drizzle ORM + `pg`), **NextAuth** (JWT) per email/password e **nessun RLS**: i controlli sono in middleware e server actions.

## 1. Schema e init database

- SQL autonomo: [`db/migrations/0000_vps_standalone.sql`](../db/migrations/0000_vps_standalone.sql) (tabelle `app_users`, `profiles`, catalogo, ordini, ecc.).
- Definizione Drizzle: [`db/schema.ts`](../db/schema.ts).

Su un VPS con PostgreSQL 15+:

```bash
psql "$DATABASE_URL" -f db/migrations/0000_vps_standalone.sql
```

Eventuale immagine Docker ufficiale: `postgres:16-alpine`; mount del volume per i dati; variabile `POSTGRES_PASSWORD`.

## 2. Variabili d’ambiente

| Variabile | Ruolo |
|-----------|--------|
| `DATABASE_URL` | Connessione Postgres (meglio con `sslmode=require` se esposto su rete). |
| `AUTH_SECRET` | Segreto NextAuth (genera con `openssl rand -base64 32`). |
| `AUTH_URL` / `NEXTAUTH_URL` | URL pubblico del sito (es. `https://www.ricambixstufe.it`). |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Pagamenti. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email. |
| `R2_*` / `R2_PUBLIC_URL` | Immagini (invariato). |
| DANEa, VIES, ecc. | Come già in uso. |

Rimuovere: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

**Build Docker**: il [`Dockerfile`](../Dockerfile) richiede `DATABASE_URL` e `AUTH_SECRET` in fase build (per `generateStaticParams` che legge slug da DB), oltre al runtime in `.env.production`.

## 3. Esporto dati da Supabase (cutover)

1. **Dati business** (schema `public`): `pg_dump` solo dati o `COPY` tabelle, adattando i nomi se migravi da `auth.users` a `app_users` (gli ID UUID degli utenti vanno riallineati: `profiles.id` → `app_users.id`).
2. **Password**: in migrazione reale, importare hash compatibili con bcrypt (come in NextAuth) oppure forzare **reset password** per tutti.
3. **Sequenze** (`products_id_seq`, …): `SELECT setval('…', (SELECT MAX(id) FROM …));` dopo l’import.
4. **Product images** da `image_url` su `products` se usi la stessa logica del vecchio `004` migration: copiare in `product_images` se necessario.

## 4. Infrastruttura VPS (checklist)

- **TLS**: collegamento app→DB cifrato (o DB solo su rete privata).
- **Firewall**: Postgres in ascolto solo sull’IP dell’app o sulla rete interna.
- **Backup**: `pg_dump` giornaliero o pgBackRest; copia off-site.
- **PgBouncer** (opzionale) se molte connessioni da Next.js.
- **Monitoraggio** spazio disco e log errori.

## 5. Script legacy in `scripts/`

Alcuni script (es. `migrate-prestashop.ts`, `associate-images-to-products.ts`, `check-*.js`) usano ancora `@supabase/supabase-js` in **devDependency** per import storici. Per usarli serve un progetto Supabase o adattarli a `DATABASE_URL` + Drizzle. Non fanno parte del runtime dell’app.

## 6. Riferimenti file principali

- Connessione DB: [`db/index.ts`](../db/index.ts)
- Autenticazione: [`auth.ts`](../auth.ts), [`auth.config.ts`](../auth.config.ts)
- Middleware: [`middleware.ts`](../middleware.ts)
- Tipo utente sessione: [`types/next-auth.d.ts`](../types/next-auth.d.ts)
