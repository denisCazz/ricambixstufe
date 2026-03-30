# Guida Configurazione Stripe e Danea Easyfatt

## Parte 1 — STRIPE (Pagamenti online)

### 1.1 Creare l'account Stripe

1. Vai su **https://dashboard.stripe.com/register**
2. Inserisci email, nome completo e password
3. Conferma l'email
4. Completa la verifica dell'identità aziendale:
   - Tipo attività (ditta individuale, SRL, ecc.)
   - Ragione sociale e P.IVA
   - Indirizzo sede legale
   - Documento d'identità del titolare
   - IBAN per ricevere i pagamenti

> ⚠️ Finché la verifica non è completata, Stripe funziona in **modalità test** (nessun pagamento reale).

---

### 1.2 Copiare le chiavi API

1. Nella dashboard Stripe, vai su **Developers → API keys** (menu a sinistra)
2. Troverai due chiavi:
   - **Publishable key** → inizia con `pk_test_...` (test) o `pk_live_...` (produzione)
   - **Secret key** → inizia con `sk_test_...` (test) o `sk_live_...` (produzione)
3. Copia entrambe

**Dove inserirle:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXX
```

> 🔑 Per andare in produzione, attiva la **modalità Live** (switch in alto a destra nella dashboard) e usa le chiavi `pk_live_` e `sk_live_`.

---

### 1.3 Creare il Webhook

Il webhook permette a Stripe di notificare il sito quando un pagamento va a buon fine.

1. Vai su **Developers → Webhooks**
2. Clicca **"Add endpoint"**
3. Compila:
   - **Endpoint URL**: `https://www.ricambixstufe.it/api/webhook/stripe`
   - **Events to listen to**: clicca "Select events" → cerca e seleziona **`checkout.session.completed`**
4. Clicca **"Add endpoint"**
5. Nella pagina del webhook appena creato, clicca **"Reveal"** sotto "Signing secret"
6. Copia il valore che inizia con `whsec_...`

**Dove inserirlo:**
```
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX
```

---

### 1.4 Test di verifica

Per verificare che tutto funzioni in modalità test:

1. Vai sul sito e aggiungi un prodotto al carrello
2. Procedi al checkout
3. Usa la carta di test Stripe: **`4242 4242 4242 4242`**, scadenza qualsiasi futura, CVV qualsiasi
4. Il pagamento dovrebbe completarsi
5. Nella dashboard Stripe → **Payments** vedrai il pagamento di test
6. Nel pannello admin → **Ordini** vedrai l'ordine creato

---

### 1.5 Riepilogo chiavi Stripe

| Variabile | Dove trovarla | Esempio |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys | `pk_test_51...` |
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys | `sk_test_51...` |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → il tuo endpoint | `whsec_...` |

---
---

## Parte 2 — DANEA EASYFATT (Scaricamento ordini)

### 2.0 Requisiti

- **Danea Easyfatt Enterprise One** oppure **Enterprise** (le versioni Standard e Professional NON hanno il modulo e-commerce)
- Il programma deve essere installato sul PC di Ivan

---

### 2.1 Credenziali da decidere insieme

Scegliete una username e una password per proteggere il collegamento. Esempio:

```
DANEA_API_USER=ricambixstufe
DANEA_API_PASSWORD=Rx5tufe2026!Danea
```

> 🔐 Scegliete una password robusta. Queste credenziali vanno inserite sia nel sito che in Easyfatt.

---

### 2.2 Configurare il sito

Aggiungere al file `.env.local` (e su Vercel):

```
DANEA_API_USER=ricambixstufe
DANEA_API_PASSWORD=la-password-scelta
```

---

### 2.3 Configurare Danea Easyfatt (sul PC di Ivan)

1. Aprire **Danea Easyfatt**
2. Andare su **Strumenti → Opzioni → Moduli**
3. Attivare il modulo **E-commerce** (spuntare la casella)
4. Cliccare **OK** e riavviare Easyfatt se richiesto
5. Andare su **Strumenti → E-commerce → Scaricamento ordini**
6. Cliccare sulla scheda **Impostazioni**
7. Compilare:

| Campo | Valore |
|---|---|
| **URL** | `https://www.ricambixstufe.it/api/danea/orders` |
| **Login** | `ricambixstufe` (il valore di DANEA_API_USER) |
| **Password** | la password scelta (il valore di DANEA_API_PASSWORD) |

8. Cliccare **OK** per salvare

---

### 2.4 Scaricare gli ordini

1. In Easyfatt, andare su **Strumenti → E-commerce → Scaricamento ordini**
2. Opzionale: impostare il filtro date (da / a) per limitare gli ordini
3. Cliccare **"Scarica ordini"**
4. Easyfatt scaricherà gli ordini dal sito in formato XML
5. Gli ordini appariranno come **Ordini Cliente** nella sezione Documenti
6. Da lì Ivan può trasformarli in **DDT**, **Fattura**, ecc.

> 📌 Ogni ordine viene scaricato **una sola volta**. Dopo il download, il sito lo segna come "esportato". Se serve ri-scaricarlo, l'admin può cliccare "Re-esporta" dal pannello Ordini del sito.

---

### 2.5 Cosa arriva in Easyfatt per ogni ordine

- **Tipo documento**: Ordine Cliente
- **Dati cliente**: nome, indirizzo, email, telefono, P.IVA (se dealer)
- **Indirizzo di spedizione**: se diverso dall'indirizzo cliente
- **Righe prodotto**: codice SKU, descrizione, quantità, prezzo unitario, eventuale sconto dealer
- **IVA**: 22% su ogni riga
- **Pagamento**: "Carta di credito", segnato come già pagato
- **Totale ordine**

---

### 2.6 Test di verifica

1. Fai un ordine di test sul sito (con carta test Stripe `4242 4242 4242 4242`)
2. Verifica che l'ordine appaia nel pannello admin → Ordini
3. In Easyfatt, prova a scaricare gli ordini
4. L'ordine di test dovrebbe apparire come Ordine Cliente
5. Nel pannello admin, l'ordine ora mostrerà l'icona verde ✓ (esportato)

---
---

## Parte 3 — DEPLOY SU VERCEL

Tutte le variabili d'ambiente vanno aggiunte anche su Vercel:

1. Vai su **vercel.com** → il tuo progetto → **Settings → Environment Variables**
2. Aggiungi TUTTE queste variabili:

```
NEXT_PUBLIC_SUPABASE_URL=https://ycnvrpvxpkuhtzgzxjbo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=RicambiXStufe <info@bitora.it>
ADMIN_EMAIL=info@bitora.it
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DANEA_API_USER=ricambixstufe
DANEA_API_PASSWORD=la-password-scelta
```

3. Clicca **"Save"** e poi **"Redeploy"**

> ⚠️ Per Stripe in produzione, usa le chiavi **live** (`pk_live_`, `sk_live_`), non quelle test.

---

## Checklist finale

- [ ] Account Stripe creato e verificato
- [ ] Chiavi API Stripe copiate nel `.env.local`
- [ ] Webhook Stripe creato con URL di produzione
- [ ] Credenziali Danea scelte e inserite nel `.env.local`
- [ ] Variabili aggiunte su Vercel
- [ ] Deploy su Vercel completato
- [ ] Easyfatt configurato sul PC di Ivan (URL + credenziali)
- [ ] Ordine di test completato con carta `4242 4242 4242 4242`
- [ ] Ordine visibile nel pannello admin
- [ ] Ordine scaricato correttamente in Easyfatt
- [ ] Passaggio a chiavi Stripe live per produzione
