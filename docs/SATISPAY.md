# Satispay Business — pagamenti online (web-redirect)

Il checkout usa le **GBusiness API** Satispay (`KeyId` + chiave privata RSA), non le credenziali di login del conto Business.

Flusso: `MATCH_CODE` con redirect sulla pagina Satispay (QR / numero di telefono / app). Dopo il pagamento Satispay chiama il callback S2S e riporta l’utente sul sito.

## Variabili richieste

Nel `.env.local` (o env Coolify/Docker) sul server:

```env
SATISPAY_MODE=live
SATISPAY_KEY_ID=...
SATISPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
```

`SATISPAY_MODE` deve essere esattamente `live` in produzione. Qualsiasi altro valore usa l’API sandbox (`staging.authservices.satispay.com`).

La chiave privata può stare su una sola riga: usa `\n` al posto dei ritorni a capo. Non committare mai la chiave.

`AUTH_URL` deve essere l’URL pubblico HTTPS (es. `https://www.ricambixstufe.it`): Satispay lo usa per `callback_url` e `redirect_url`.

## Attivazione (una tantum)

1. Accedi a [dashboard.satispay.com](https://dashboard.satispay.com/) con il conto **Satispay Business**.
2. Apri **Negozi** → il negozio online (es. elettroservice snc).
3. Nella card **Codice di attivazione** clicca **+ Crea un codice di attivazione**.
   È lo stesso pulsante dei POS: per le API e-commerce serve proprio quel codice (stringa breve, monouso). La sezione **API** della dashboard rimanda solo alla documentazione, non genera credenziali.
4. Dal progetto, con quel codice:

   ```bash
   node scripts/satispay-activate.mjs CODICE --live
   ```

   Lo script genera una coppia RSA 4096, la registra su Satispay e stampa `SATISPAY_KEY_ID` + `SATISPAY_PRIVATE_KEY` da copiare nelle env.
5. Imposta le variabili sul server e riavvia:

   ```bash
   docker compose up -d --force-recreate web
   ```
6. In admin → **Impostazioni** → **Testa Satispay**. Deve risultare OK in modalità `live`.
7. Prova un checkout di piccolo importo.

## Sandbox

Per i test usa un codice di attivazione sandbox (fornito da Satispay) e:

```env
SATISPAY_MODE=sandbox
```

Il codice sandbox **non** funziona sugli endpoint live, e viceversa.

## Diagnostica

- Admin → Impostazioni → card **Satispay** (GET autenticata, senza creare pagamenti).
- Log server: `Satispay authentication failed` / `Satispay create payment failed` con status HTTP e body.

Errori tipici:

| Sintomo | Causa probabile |
|---------|-----------------|
| auth failed / HTTP 401–403 | KeyId o chiave privata errati, oppure `SATISPAY_MODE` non allineato all’ambiente del KeyId |
| credenziali mancanti | `SATISPAY_KEY_ID` / `SATISPAY_PRIVATE_KEY` non impostate nel container |
| Invalid RSA key / `error:1E08010C:DECODER routines::unsupported` | PEM malformata o spezzata da Coolify. Incolla su **una sola riga** con `\\n` tra `BEGIN`/`END`, senza virgolette extra, poi riavvia |
| token already paired | il codice di attivazione è già stato usato: generarne uno nuovo |
| funziona in sandbox ma non in prod | KeyId sandbox usato con `SATISPAY_MODE=live`, o viceversa |

## Nota sicurezza

Non committare mai la chiave privata. Il codice di attivazione è monouso: dopo `satispay-activate` salva subito KeyId e chiave sul server.
