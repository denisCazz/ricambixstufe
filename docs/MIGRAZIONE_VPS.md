# Migrazione a PostgreSQL su VPS — Guida operativa

Stack: **Next.js** + **Drizzle ORM** + **PostgreSQL 18** (self-hosted su Coolify) + **NextAuth JWT** + **Cloudflare R2**.

---

## 1. Prerequisiti

| Strumento | Versione minima | Note |
|-----------|----------------|-------|
| Node.js | 20 | |
| psql | 15+ | Windows: `C:\Program Files\PostgreSQL\18\bin\psql.exe` |
| Docker + Compose | qualsiasi | solo per deploy |

Il DB è già attivo su VPS a `212.227.193.249:60001` (Coolify → porta pubblica abilitata).

---

## 2. Variabili d ambiente

Copia `.env.local.example` in `.env.local` e compila:

```env
# PostgreSQL VPS
DATABASE_URL=postgresql://postgres:PASSWORD@212.227.193.249:60001/ricambixstufe

# NextAuth
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000        # in prod: https://www.ricambixstufe.it

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=RicambiXStufe <info@bitora.it>
ADMIN_EMAIL=info@ricambixstufe.it

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ricambixstufe-images
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

In produzione, `DATABASE_URL` usa il hostname Docker interno `db:5432` (rete interna Compose).

---

## 3. Applicare lo schema

```bash
psql "$DATABASE_URL" -f db/migrations/0000_vps_standalone.sql
```

Tabelle create: `app_users`, `profiles`, `dealer_profiles`, `categories`, `products`, `product_images`, `orders`, `order_items`, `cart_items`.

---

## 4. Importare i dati

### 4a. CSV master (categorie + prodotti + immagini)

```bash
psql "$DATABASE_URL" -f scripts/import-supabase-data.sql
```

File attesi in `ex_supabase/`:
- `categories_rows.csv`
- `products_rows_utf8.csv`  (vedi §4b per la conversione)
- `product_images_rows.csv`

L admin `deniscazzulo@icloud.com` (pwd `qqq`) viene inserito automaticamente.

### 4b. Conversione encoding prodotti (solo Windows, se necessario)

```powershell
$src = [System.IO.File]::ReadAllBytes("ex_supabase\products_rows.csv")
$txt = [System.Text.Encoding]::GetEncoding(1252).GetString($src)
[System.IO.File]::WriteAllText("ex_supabase\products_rows_utf8.csv", $txt, [System.Text.Encoding]::UTF8)
```

### 4c. Verifica conteggi

```sql
SELECT (SELECT COUNT(*) FROM categories)     AS cat,
       (SELECT COUNT(*) FROM products)       AS prod,
       (SELECT COUNT(*) FROM product_images) AS img,
       (SELECT COUNT(*) FROM app_users)      AS users;
-- atteso: 14 | 162 | 250 | 1
```

---

## 5. Sviluppo locale

```bash
npm install
npm run dev   # http://localhost:3000
```

Login admin: `deniscazzulo@icloud.com` / `qqq`

---

## 6. Deploy produzione (Docker Compose)

```bash
git pull
docker compose up -d --build
```

Il `docker-compose.yml` include:
- **`db`** — postgres:18-alpine, volume `pgdata`, healthcheck
- **`web`** — Next.js app, `depends_on: db` (attende healthcheck)

Applicare lo schema al primo avvio (con le credenziali interne Compose):

```bash
docker compose exec db psql -U postgres ricambixstufe -f /migrations/0000_vps_standalone.sql
```

---

## 7. Checklist post-deploy

- [ ] `AUTH_SECRET` diverso dall ambiente di sviluppo
- [ ] `AUTH_URL` = URL pubblico HTTPS
- [ ] Porta DB **non** esposta pubblicamente (solo rete Docker interna)
- [ ] Backup `pg_dump` schedulato (es. cron giornaliero)
- [ ] Certificato TLS valido via nginx/Coolify

---

## 8. File principali

| File | Ruolo |
|------|-------|
| `db/migrations/0000_vps_standalone.sql` | Schema completo |
| `db/schema.ts` | Definizione Drizzle |
| `db/index.ts` | Connessione DB |
| `auth.ts` | NextAuth config |
| `middleware.ts` | Protezione route |
| `docker-compose.yml` | Stack produzione |
| `scripts/import-supabase-data.sql` | Import dati master |
| `.env.local.example` | Template variabili dev |
| `.env.production.example` | Template variabili produzione |
