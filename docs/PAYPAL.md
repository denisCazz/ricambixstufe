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

`PAYPAL_MODE` deve essere esattamente `live` in produzione. Qualsiasi altro valore usa l’API sandbox.

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
| funziona in sandbox ma non in prod | `PAYPAL_MODE` non è `live`, o stai usando credenziali sandbox in live |

## Nota sicurezza

Non committare mai Client Secret. Dopo aver generato un secret nuovo, il precedente smette di funzionare: aggiorna subito il server.
