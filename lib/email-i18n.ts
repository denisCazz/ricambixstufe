import { defaultLocale, type Locale } from "@/lib/i18n";

const emailTranslations: Record<Locale, Record<string, string>> = {
  it: {
    "email.team": "— Il team RicambiXStufe",
    "email.hello": "Ciao",
    "email.payment.paypal": "PayPal",
    "email.payment.satispay": "Satispay",
    "email.payment.bank_transfer": "Bonifico bancario",
    "email.payment.cod": "Contrassegno",
    "email.order.subject": "📬 Ordine ricevuto #{orderNumber} — RicambiXStufe",
    "email.order.title": "📬 Ordine ricevuto!",
    "email.order.number": "Ordine #{orderNumber}",
    "email.order.thanks": "Grazie per il tuo ordine! Ecco il riepilogo:",
    "email.order.col_product": "Prodotto",
    "email.order.col_qty": "Qtà",
    "email.order.col_price": "Prezzo",
    "email.order.col_total": "Totale",
    "email.order.subtotal": "Subtotale",
    "email.order.shipping": "Spedizione",
    "email.order.total": "Totale",
    "email.order.payment": "Pagamento",
    "email.order.billing": "Fatturazione",
    "email.order.vat": "P.IVA",
    "email.order.sdi": "SDI",
    "email.order.tracking_soon":
      "Riceverai un'email con il numero di tracking non appena il pacco sarà spedito.",
    "email.order.bank_title": "Coordinate per il bonifico:",
    "email.order.iban": "IBAN",
    "email.order.account_holder": "Intestatario",
    "email.order.reference": "Causale",
    "email.order.reference_value": "Ordine #{orderNumber}",
    "email.order.receipt_text":
      "Carica la contabile del bonifico per consentire una verifica anticipata del pagamento e ridurre i tempi di attesa.",
    "email.order.receipt_button": "Carica contabile",
    "email.order.cod_note":
      "Il pagamento avverrà in contanti alla consegna. Supplemento contrassegno incluso nel totale.",
    "email.status.subject": "{emoji} Ordine #{orderNumber}: {label} — RicambiXStufe",
    "email.status.pending.label": "In attesa",
    "email.status.pending.message":
      "Il tuo ordine è in attesa di conferma. Ti aggiorneremo a breve.",
    "email.status.confirmed.label": "Confermato",
    "email.status.confirmed.message":
      "Il tuo ordine è stato confermato e sarà messo in lavorazione.",
    "email.status.processing.label": "In lavorazione",
    "email.status.processing.message":
      "Il tuo ordine è in fase di preparazione nel nostro magazzino.",
    "email.status.shipped.label": "Spedito",
    "email.status.shipped.message":
      "Il tuo pacco è stato affidato al corriere e sta per arrivare!",
    "email.status.delivered.label": "Consegnato",
    "email.status.delivered.message":
      "Il tuo pacco risulta consegnato. Grazie per aver scelto RicambiXStufe!",
    "email.status.cancelled.label": "Annullato",
    "email.status.cancelled.message":
      "Il tuo ordine è stato annullato. Contattaci per qualsiasi chiarimento.",
    "email.status.tracking_title": "📬 Numero di tracking",
    "email.status.tracking_hint":
      "Usa questo codice sul sito del corriere per seguire la spedizione.",
    "email.status.view_orders": "Visualizza i tuoi ordini",
    "email.status.support": "Per assistenza rispondi a questa email o scrivici a",
    "email.dealer.approved.subject": "Richiesta approvata — {companyName}",
    "email.dealer.approved.title": "Richiesta approvata! ✓",
    "email.dealer.approved.body_before": "La tua richiesta come rivenditore per",
    "email.dealer.approved.body_after": "è stata approvata.",
    "email.dealer.approved.discount_label": "Il tuo sconto riservato",
    "email.dealer.approved.discount_text":
      "Lo sconto verrà applicato automaticamente al tuo account. Accedi al sito per iniziare ad acquistare con i prezzi riservati.",
    "email.dealer.approved.cta": "Accedi al tuo account",
    "email.dealer.rejected.subject": "Richiesta rivenditore — {companyName}",
    "email.dealer.rejected.title": "Richiesta non approvata",
    "email.dealer.rejected.body_before": "La tua richiesta come rivenditore per",
    "email.dealer.rejected.body_after": "non è stata approvata.",
    "email.dealer.rejected.reason": "Motivo",
    "email.dealer.rejected.contact": "Per qualsiasi domanda, contattaci a",
    "email.dealer.rejected.or_phone": "o al numero",
    "email.verify.subject": "Conferma il tuo indirizzo email — RicambiXStufe",
    "email.verify.title": "✉️ Conferma la tua email",
    "email.verify.body":
      "Grazie per esserti registrato su RicambiXStufe! Clicca il pulsante qui sotto per confermare il tuo indirizzo email e attivare il tuo account.",
    "email.verify.cta": "Conferma email",
    "email.verify.expiry":
      "Il link è valido per 24 ore. Se non hai creato un account, ignora questa email.",
    "email.verify.or_copy": "Oppure copia questo link nel browser:",
    "email.reset.subject": "Reimposta la tua password — RicambiXStufe",
    "email.reset.title": "🔑 Reimposta password",
    "email.reset.body":
      "Hai richiesto di reimpostare la password del tuo account RicambiXStufe. Clicca il pulsante qui sotto per procedere.",
    "email.reset.cta": "Reimposta password",
    "email.reset.expiry":
      "Il link è valido per 1 ora. Se non hai richiesto il reset, ignora questa email — la tua password rimane invariata.",
    "email.reset.or_copy": "Oppure copia questo link nel browser:",
  },
  en: {
    "email.team": "— The RicambiXStufe team",
    "email.hello": "Hi",
    "email.payment.paypal": "PayPal",
    "email.payment.satispay": "Satispay",
    "email.payment.bank_transfer": "Bank transfer",
    "email.payment.cod": "Cash on delivery",
    "email.order.subject": "📬 Order received #{orderNumber} — RicambiXStufe",
    "email.order.title": "📬 Order received!",
    "email.order.number": "Order #{orderNumber}",
    "email.order.thanks": "Thank you for your order! Here is the summary:",
    "email.order.col_product": "Product",
    "email.order.col_qty": "Qty",
    "email.order.col_price": "Price",
    "email.order.col_total": "Total",
    "email.order.subtotal": "Subtotal",
    "email.order.shipping": "Shipping",
    "email.order.total": "Total",
    "email.order.payment": "Payment",
    "email.order.billing": "Billing",
    "email.order.vat": "VAT",
    "email.order.sdi": "SDI",
    "email.order.tracking_soon":
      "You will receive an email with the tracking number as soon as the parcel is shipped.",
    "email.order.bank_title": "Bank transfer details:",
    "email.order.iban": "IBAN",
    "email.order.account_holder": "Account holder",
    "email.order.reference": "Reference",
    "email.order.reference_value": "Order #{orderNumber}",
    "email.order.receipt_text":
      "Upload the bank transfer receipt so we can verify payment earlier and reduce waiting times.",
    "email.order.receipt_button": "Upload receipt",
    "email.order.cod_note":
      "Payment will be made in cash on delivery. The cash-on-delivery surcharge is included in the total.",
    "email.status.subject": "{emoji} Order #{orderNumber}: {label} — RicambiXStufe",
    "email.status.pending.label": "Pending",
    "email.status.pending.message":
      "Your order is awaiting confirmation. We will update you shortly.",
    "email.status.confirmed.label": "Confirmed",
    "email.status.confirmed.message":
      "Your order has been confirmed and will be processed.",
    "email.status.processing.label": "Processing",
    "email.status.processing.message":
      "Your order is being prepared in our warehouse.",
    "email.status.shipped.label": "Shipped",
    "email.status.shipped.message":
      "Your parcel has been handed to the courier and is on its way!",
    "email.status.delivered.label": "Delivered",
    "email.status.delivered.message":
      "Your parcel has been delivered. Thank you for choosing RicambiXStufe!",
    "email.status.cancelled.label": "Cancelled",
    "email.status.cancelled.message":
      "Your order has been cancelled. Contact us if you need any clarification.",
    "email.status.tracking_title": "📬 Tracking number",
    "email.status.tracking_hint":
      "Use this code on the courier's website to track your shipment.",
    "email.status.view_orders": "View your orders",
    "email.status.support": "For support, reply to this email or write to",
    "email.dealer.approved.subject": "Request approved — {companyName}",
    "email.dealer.approved.title": "Request approved! ✓",
    "email.dealer.approved.body_before": "Your dealer request for",
    "email.dealer.approved.body_after": "has been approved.",
    "email.dealer.approved.discount_label": "Your exclusive discount",
    "email.dealer.approved.discount_text":
      "The discount will be applied automatically to your account. Sign in to start buying at reserved prices.",
    "email.dealer.approved.cta": "Sign in to your account",
    "email.dealer.rejected.subject": "Dealer request — {companyName}",
    "email.dealer.rejected.title": "Request not approved",
    "email.dealer.rejected.body_before": "Your dealer request for",
    "email.dealer.rejected.body_after": "has not been approved.",
    "email.dealer.rejected.reason": "Reason",
    "email.dealer.rejected.contact": "If you have any questions, contact us at",
    "email.dealer.rejected.or_phone": "or call",
    "email.verify.subject": "Confirm your email address — RicambiXStufe",
    "email.verify.title": "✉️ Confirm your email",
    "email.verify.body":
      "Thanks for registering with RicambiXStufe! Click the button below to confirm your email address and activate your account.",
    "email.verify.cta": "Confirm email",
    "email.verify.expiry":
      "This link is valid for 24 hours. If you did not create an account, you can ignore this email.",
    "email.verify.or_copy": "Or copy this link into your browser:",
    "email.reset.subject": "Reset your password — RicambiXStufe",
    "email.reset.title": "🔑 Reset password",
    "email.reset.body":
      "You requested to reset the password for your RicambiXStufe account. Click the button below to continue.",
    "email.reset.cta": "Reset password",
    "email.reset.expiry":
      "This link is valid for 1 hour. If you did not request a reset, ignore this email — your password will stay the same.",
    "email.reset.or_copy": "Or copy this link into your browser:",
  },
  fr: {
    "email.team": "— L'équipe RicambiXStufe",
    "email.hello": "Bonjour",
    "email.payment.paypal": "PayPal",
    "email.payment.satispay": "Satispay",
    "email.payment.bank_transfer": "Virement bancaire",
    "email.payment.cod": "Contre-remboursement",
    "email.order.subject": "📬 Commande reçue #{orderNumber} — RicambiXStufe",
    "email.order.title": "📬 Commande reçue !",
    "email.order.number": "Commande #{orderNumber}",
    "email.order.thanks": "Merci pour votre commande ! Voici le récapitulatif :",
    "email.order.col_product": "Produit",
    "email.order.col_qty": "Qté",
    "email.order.col_price": "Prix",
    "email.order.col_total": "Total",
    "email.order.subtotal": "Sous-total",
    "email.order.shipping": "Livraison",
    "email.order.total": "Total",
    "email.order.payment": "Paiement",
    "email.order.billing": "Facturation",
    "email.order.vat": "TVA",
    "email.order.sdi": "SDI",
    "email.order.tracking_soon":
      "Vous recevrez un e-mail avec le numéro de suivi dès que le colis sera expédié.",
    "email.order.bank_title": "Coordonnées pour le virement :",
    "email.order.iban": "IBAN",
    "email.order.account_holder": "Titulaire",
    "email.order.reference": "Libellé",
    "email.order.reference_value": "Commande #{orderNumber}",
    "email.order.receipt_text":
      "Téléchargez le justificatif de virement pour permettre une vérification anticipée du paiement et réduire les délais d'attente.",
    "email.order.receipt_button": "Télécharger le justificatif",
    "email.order.cod_note":
      "Le paiement se fera en espèces à la livraison. Le supplément contre-remboursement est inclus dans le total.",
    "email.status.subject": "{emoji} Commande #{orderNumber} : {label} — RicambiXStufe",
    "email.status.pending.label": "En attente",
    "email.status.pending.message":
      "Votre commande est en attente de confirmation. Nous vous tiendrons informé sous peu.",
    "email.status.confirmed.label": "Confirmée",
    "email.status.confirmed.message":
      "Votre commande a été confirmée et va être mise en préparation.",
    "email.status.processing.label": "En préparation",
    "email.status.processing.message":
      "Votre commande est en cours de préparation dans notre entrepôt.",
    "email.status.shipped.label": "Expédiée",
    "email.status.shipped.message":
      "Votre colis a été remis au transporteur et est en route !",
    "email.status.delivered.label": "Livrée",
    "email.status.delivered.message":
      "Votre colis a été livré. Merci d'avoir choisi RicambiXStufe !",
    "email.status.cancelled.label": "Annulée",
    "email.status.cancelled.message":
      "Votre commande a été annulée. Contactez-nous pour toute question.",
    "email.status.tracking_title": "📬 Numéro de suivi",
    "email.status.tracking_hint":
      "Utilisez ce code sur le site du transporteur pour suivre l'expédition.",
    "email.status.view_orders": "Voir vos commandes",
    "email.status.support": "Pour toute assistance, répondez à cet e-mail ou écrivez à",
    "email.dealer.approved.subject": "Demande approuvée — {companyName}",
    "email.dealer.approved.title": "Demande approuvée ! ✓",
    "email.dealer.approved.body_before": "Votre demande de revendeur pour",
    "email.dealer.approved.body_after": "a été approuvée.",
    "email.dealer.approved.discount_label": "Votre remise exclusive",
    "email.dealer.approved.discount_text":
      "La remise sera appliquée automatiquement à votre compte. Connectez-vous pour commencer à acheter aux prix réservés.",
    "email.dealer.approved.cta": "Accéder à votre compte",
    "email.dealer.rejected.subject": "Demande revendeur — {companyName}",
    "email.dealer.rejected.title": "Demande non approuvée",
    "email.dealer.rejected.body_before": "Votre demande de revendeur pour",
    "email.dealer.rejected.body_after": "n'a pas été approuvée.",
    "email.dealer.rejected.reason": "Motif",
    "email.dealer.rejected.contact": "Pour toute question, contactez-nous à",
    "email.dealer.rejected.or_phone": "ou au",
    "email.verify.subject": "Confirmez votre adresse e-mail — RicambiXStufe",
    "email.verify.title": "✉️ Confirmez votre e-mail",
    "email.verify.body":
      "Merci de vous être inscrit sur RicambiXStufe ! Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail et activer votre compte.",
    "email.verify.cta": "Confirmer l'e-mail",
    "email.verify.expiry":
      "Le lien est valable 24 heures. Si vous n'avez pas créé de compte, ignorez cet e-mail.",
    "email.verify.or_copy": "Ou copiez ce lien dans votre navigateur :",
    "email.reset.subject": "Réinitialisez votre mot de passe — RicambiXStufe",
    "email.reset.title": "🔑 Réinitialiser le mot de passe",
    "email.reset.body":
      "Vous avez demandé à réinitialiser le mot de passe de votre compte RicambiXStufe. Cliquez sur le bouton ci-dessous pour continuer.",
    "email.reset.cta": "Réinitialiser le mot de passe",
    "email.reset.expiry":
      "Le lien est valable 1 heure. Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail — votre mot de passe reste inchangé.",
    "email.reset.or_copy": "Ou copiez ce lien dans votre navigateur :",
  },
  es: {
    "email.team": "— El equipo RicambiXStufe",
    "email.hello": "Hola",
    "email.payment.paypal": "PayPal",
    "email.payment.satispay": "Satispay",
    "email.payment.bank_transfer": "Transferencia bancaria",
    "email.payment.cod": "Contrareembolso",
    "email.order.subject": "📬 Pedido recibido #{orderNumber} — RicambiXStufe",
    "email.order.title": "📬 ¡Pedido recibido!",
    "email.order.number": "Pedido #{orderNumber}",
    "email.order.thanks": "¡Gracias por tu pedido! Aquí tienes el resumen:",
    "email.order.col_product": "Producto",
    "email.order.col_qty": "Ud.",
    "email.order.col_price": "Precio",
    "email.order.col_total": "Total",
    "email.order.subtotal": "Subtotal",
    "email.order.shipping": "Envío",
    "email.order.total": "Total",
    "email.order.payment": "Pago",
    "email.order.billing": "Facturación",
    "email.order.vat": "NIF/IVA",
    "email.order.sdi": "SDI",
    "email.order.tracking_soon":
      "Recibirás un email con el número de seguimiento en cuanto se envíe el paquete.",
    "email.order.bank_title": "Datos para la transferencia:",
    "email.order.iban": "IBAN",
    "email.order.account_holder": "Titular",
    "email.order.reference": "Concepto",
    "email.order.reference_value": "Pedido #{orderNumber}",
    "email.order.receipt_text":
      "Sube el justificante de la transferencia para que podamos verificar el pago antes y reducir los tiempos de espera.",
    "email.order.receipt_button": "Subir justificante",
    "email.order.cod_note":
      "El pago se realizará en efectivo a la entrega. El recargo de contrareembolso está incluido en el total.",
    "email.status.subject": "{emoji} Pedido #{orderNumber}: {label} — RicambiXStufe",
    "email.status.pending.label": "Pendiente",
    "email.status.pending.message":
      "Tu pedido está pendiente de confirmación. Te actualizaremos en breve.",
    "email.status.confirmed.label": "Confirmado",
    "email.status.confirmed.message":
      "Tu pedido ha sido confirmado y se pondrá en preparación.",
    "email.status.processing.label": "En preparación",
    "email.status.processing.message":
      "Tu pedido se está preparando en nuestro almacén.",
    "email.status.shipped.label": "Enviado",
    "email.status.shipped.message":
      "Tu paquete ha sido entregado al transportista y está en camino.",
    "email.status.delivered.label": "Entregado",
    "email.status.delivered.message":
      "Tu paquete consta como entregado. ¡Gracias por elegir RicambiXStufe!",
    "email.status.cancelled.label": "Anulado",
    "email.status.cancelled.message":
      "Tu pedido ha sido anulado. Contáctanos para cualquier aclaración.",
    "email.status.tracking_title": "📬 Número de seguimiento",
    "email.status.tracking_hint":
      "Usa este código en la web del transportista para seguir el envío.",
    "email.status.view_orders": "Ver tus pedidos",
    "email.status.support": "Para asistencia responde a este email o escríbenos a",
    "email.dealer.approved.subject": "Solicitud aprobada — {companyName}",
    "email.dealer.approved.title": "¡Solicitud aprobada! ✓",
    "email.dealer.approved.body_before": "Tu solicitud como revendedor para",
    "email.dealer.approved.body_after": "ha sido aprobada.",
    "email.dealer.approved.discount_label": "Tu descuento exclusivo",
    "email.dealer.approved.discount_text":
      "El descuento se aplicará automáticamente a tu cuenta. Accede al sitio para empezar a comprar con los precios reservados.",
    "email.dealer.approved.cta": "Acceder a tu cuenta",
    "email.dealer.rejected.subject": "Solicitud de revendedor — {companyName}",
    "email.dealer.rejected.title": "Solicitud no aprobada",
    "email.dealer.rejected.body_before": "Tu solicitud como revendedor para",
    "email.dealer.rejected.body_after": "no ha sido aprobada.",
    "email.dealer.rejected.reason": "Motivo",
    "email.dealer.rejected.contact": "Para cualquier consulta, contáctanos en",
    "email.dealer.rejected.or_phone": "o en el número",
    "email.verify.subject": "Confirma tu dirección de email — RicambiXStufe",
    "email.verify.title": "✉️ Confirma tu email",
    "email.verify.body":
      "¡Gracias por registrarte en RicambiXStufe! Haz clic en el botón de abajo para confirmar tu dirección de email y activar tu cuenta.",
    "email.verify.cta": "Confirmar email",
    "email.verify.expiry":
      "El enlace es válido durante 24 horas. Si no has creado una cuenta, ignora este email.",
    "email.verify.or_copy": "O copia este enlace en el navegador:",
    "email.reset.subject": "Restablece tu contraseña — RicambiXStufe",
    "email.reset.title": "🔑 Restablecer contraseña",
    "email.reset.body":
      "Has solicitado restablecer la contraseña de tu cuenta RicambiXStufe. Haz clic en el botón de abajo para continuar.",
    "email.reset.cta": "Restablecer contraseña",
    "email.reset.expiry":
      "El enlace es válido durante 1 hora. Si no has solicitado el restablecimiento, ignora este email: tu contraseña no cambia.",
    "email.reset.or_copy": "O copia este enlace en el navegador:",
  },
};

export function te(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const table = emailTranslations[locale] ?? emailTranslations[defaultLocale];
  let value = table[key] ?? emailTranslations[defaultLocale][key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}
