# PayPal — ripristino dopo cambio password / secret

Il checkout usa le **REST API** PayPal (`Client ID` + `Client Secret`), non la password di login del conto.

Cambiare la password del conto PayPal **non** invalida di per sé le API.
Se dopo un cambio password (o un reset di sicurezza) i pagamenti non partono più, di solito è perché:

1. è stato **rigenerato il Client Secret** nel Developer Dashboard, oppure
2. le variabili sul server sono ancora quelle vecchie / in modalità sbagliata (`sandbox` vs `live`).

## Variabili richieste

Nel `.env.local` (o env Coolify/Docker) sul server:

```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

`PAYPAL_MODE` deve essere `live` in produzione (credenziali tab **Live**).

Se manca: con `NODE_ENV=production` il sito usa live; in sviluppo usa sandbox.

**Sintomo tipico:** test admin → `modalità sandbox` + HTTP 401 → Client ID Live inviato all’API sandbox. Fix immediato nel `.env` del server:

```env
PAYPAL_MODE=live
```

poi `docker compose up -d --force-recreate web`.

## Se Client ID/Secret non sono cambiati

È normale: la password di login e le API REST sono separate.

In quel caso controlla nell’ordine:

1. **Admin → Testa PayPal**
   - Deve dire `modalità live` e `OK`.
   - Se dice `sandbox`, sul server manca `PAYPAL_MODE=live`.
   - Controlla anche che `AUTH_URL` sia esattamente l’URL pubblico del sito (es. `https://www.ricambixstufe.it`), altrimenti al ritorno da PayPal il cookie di sessione può perdersi.
2. **Checkout di prova**
   - Se fallisce *prima* del redirect a PayPal → errore API create-order (log server).
   - Se fallisce *dopo* aver pagato su PayPal → ora il checkout mostra un messaggio chiaro (`paypal_capture_failed`, `paypal_session_expired`, …).
3. **Conto business PayPal**
   - Dopo un cambio password PayPal a volte limita temporaneamente l’incasso finché non completi la verifica di sicurezza sul conto (anche se le API OAuth rispondono OK).

## Passi di ripristino

1. Accedi a [developer.paypal.com](https://developer.paypal.com/) con il conto business.
2. **Apps & Credentials** → tab **Live** (non Sandbox).
3. Apri l’app usata da RicambiXStufe (o creane una nuova).
4. Copia **Client ID**. Se il secret non è più noto, clicca **Show** / **Generate new secret**.
5. Aggiorna sul VPS:
   - file `.env.local` usato da `docker compose`, oppure
   - variabili d’ambiente in Coolify.
6. Riavvia il container web:
   ```bash
   docker compose up -d --force-recreate web
   ```
7. In admin → **Impostazioni** → **Testa PayPal**. Deve risultare OK in modalità `live`.
8. Prova un checkout di piccolo importo.

## Diagnostica

- Admin → Impostazioni → card **PayPal** (test OAuth senza creare ordini).
- Log server: messaggi `PayPal authentication failed` / `PayPal create order failed` con status HTTP e body.

Errori tipici:

| Sintomo | Causa probabile |
|---------|-----------------|
| auth failed / HTTP 401 | Client Secret vecchio o Client ID sbagliato |
| credenziali mancanti | `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` non impostate nel container |
| `sandbox` + HTTP 401 | Credenziali **Live** con `PAYPAL_MODE` assente/sandbox → metti `PAYPAL_MODE=live` |
| funziona in sandbox ma non in prod | `PAYPAL_MODE` non è `live`, o stai usando credenziali sandbox in live |

## Nota sicurezza

Non committare mai Client Secret. Dopo aver generato un secret nuovo, il precedente smette di funzionare: aggiorna subito il server.
