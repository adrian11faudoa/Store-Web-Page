// server/utils/mailer.js
// Transactional emails (Amazon-style template) + WhatsApp via Twilio.
//
// Required env vars:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM  (for WhatsApp)
//     TWILIO_WHATSAPP_FROM should be the Twilio WhatsApp sender, e.g. whatsapp:+14155238886
//
// The WHATSAPP notification number to receive codes is +52 (639) 130 5922

import nodemailer from 'nodemailer'

// ── SMTP transporter ──────────────────────────────────────────────────────────
function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

const FROM  = () => process.env.SMTP_FROM || '"SaharaKids" <no-reply@saharakids.com>'
const YEAR  = new Date().getFullYear()
const BRAND = 'SaharaKids'
const BRAND_COLOR = '#c8933f'   // warm gold
const DARK        = '#1a1a1a'

// ── Amazon-style HTML base ────────────────────────────────────────────────────
function base({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;</span>

<!-- wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f3f3;">
<tr><td align="center" style="padding:20px 10px;">

  <!-- container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #dddddd;border-radius:4px;">

    <!-- logo row -->
    <tr>
      <td align="center" style="padding:20px 30px 14px;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:${DARK};letter-spacing:-1px;">${BRAND}</span>
      </td>
    </tr>

    <!-- divider -->
    <tr><td style="height:1px;background:#dddddd;"></td></tr>

    <!-- body -->
    <tr>
      <td style="padding:30px 30px 24px;">
        ${body}
      </td>
    </tr>

    <!-- divider -->
    <tr><td style="height:1px;background:#dddddd;"></td></tr>

    <!-- footer -->
    <tr>
      <td align="center" style="padding:16px 30px;font-size:12px;color:#767676;">
        &copy; 1996&ndash;${YEAR} ${BRAND}, Inc. or its affiliates<br/>
        All rights reserved.
      </td>
    </tr>

  </table>
  <!-- /container -->

</td></tr>
</table>
<!-- /wrapper -->
</body>
</html>`
}

// ── Building blocks ───────────────────────────────────────────────────────────
const h1  = t => `<h1 style="font-size:20px;font-weight:700;color:${DARK};margin:0 0 16px;line-height:1.3;">${t}</h1>`
const p   = t => `<p  style="font-size:14px;line-height:1.6;color:#333333;margin:0 0 14px;">${t}</p>`
const sm  = t => `<p  style="font-size:12px;color:#767676;margin:14px 0 0;line-height:1.5;">${t}</p>`

// Big yellow code block — exactly like Amazon
const codeBox = c => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
<tr>
  <td align="center">
    <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:10px;color:${DARK};background:#fff;border:1px solid #cccccc;border-radius:4px;padding:14px 28px;">${c}</span>
  </td>
</tr>
</table>`

// ── sendVerificationEmail ─────────────────────────────────────────────────────
export async function sendVerificationEmail({ to, name, code }) {
  const subject = `${code} es tu código de ${BRAND} para verificar tu nueva cuenta`

  const body =
    h1(`Verifica tu nueva cuenta de ${BRAND}`) +
    p('Ingresa el siguiente código:') +
    codeBox(code) +
    p('Este código expira en <strong>30 minutos</strong>.') +
    sm(`No compartas este código con nadie ya que esto les ayudaría a acceder a tu cuenta.<br/>Si no creaste una cuenta en ${BRAND}, ignora este mensaje.`)

  const text = `${code} es tu código de ${BRAND} para verificar tu nueva cuenta.\n\nIngresa el siguiente código: ${code}\n\nExpira en 30 minutos. No compartas este código con nadie.`

  const t = getTransporter()
  if (!t) {
    console.log(`[VERIFY EMAIL] to=${to} code=${code}`)
    return
  }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: `${code} es tu código de ${BRAND}`, body }) })
}

// ── sendPasswordResetEmail ────────────────────────────────────────────────────
export async function sendPasswordResetEmail({ to, code }) {
  const subject = `${code} es tu código para restablecer la contraseña — ${BRAND}`

  const body =
    h1('Restablecer contraseña') +
    p(`Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${BRAND}</strong>.`) +
    p('Ingresa el siguiente código para continuar:') +
    codeBox(code) +
    p('Este código expira en <strong>10 minutos</strong>. Si no lo usas, tu contraseña actual no cambia.') +
    sm('Si no solicitaste esto, ignora este correo. No compartas este código con nadie.')

  const text = `Tu código de restablecimiento de contraseña de ${BRAND}: ${code}\n\nExpira en 10 minutos.`

  const t = getTransporter()
  if (!t) {
    console.log(`[RESET EMAIL] to=${to} code=${code}`)
    return
  }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: `Código reset: ${code}`, body }) })
}

// ── sendGoogleAccountResetEmail ───────────────────────────────────────────────
export async function sendGoogleAccountResetEmail({ to, name }) {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/signin`
  const subject  = `Tu cuenta ${BRAND} está vinculada a Google`

  const body =
    h1('Cuenta con Google') +
    p(`Hola${name ? ' ' + name : ''}, recibimos una solicitud de restablecimiento de contraseña para <strong>${to}</strong>.`) +
    p(`Esta cuenta fue creada con <strong>Google Sign-In</strong>, por lo que no tiene contraseña propia. Inicia sesión en: <a href="${loginUrl}" style="color:#0066c0;">${loginUrl}</a>`) +
    sm('¿Tienes problemas? Escríbenos.')

  const text = `Tu cuenta (${to}) está vinculada a Google.\n\nInicia sesión en: ${loginUrl}`

  const t = getTransporter()
  if (!t) {
    console.log(`[GOOGLE RESET EMAIL] to=${to}`)
    return
  }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: 'Tu cuenta usa Google para iniciar sesión', body }) })
}

// ── sendWhatsAppVerification ──────────────────────────────────────────────────
// Sends verification code via WhatsApp using Twilio.
// Notification also forwarded to the business number: +52 (639) 130 5922
const NOTIFY_NUMBER = '+526391305922'

export async function sendWhatsAppVerification({ to, name, code }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  const userMsg = `*${BRAND}*\n\n¡Hola${name ? ' ' + name : ''}! 👋\n\nTu código de verificación es:\n\n*${code}*\n\nExpira en 30 minutos. No compartas este código con nadie.`
  const notifyMsg = `[${BRAND}] Nueva verificación\nNúmero: ${to}\nNombre: ${name || '—'}\nCódigo: ${code}`

  if (!accountSid || !authToken) {
    console.log(`[WHATSAPP VERIFY] to=${to} code=${code}`)
    console.log(`[WHATSAPP NOTIFY] to=${NOTIFY_NUMBER} msg=${notifyMsg}`)
    return
  }

  // Dynamic import so missing env doesn't crash server startup
  const twilio = (await import('twilio')).default
  const client = twilio(accountSid, authToken)

  // Send to user
  await client.messages.create({
    from,
    to: `whatsapp:${to}`,
    body: userMsg,
  })

  // Forward notification to business number
  await client.messages.create({
    from,
    to: `whatsapp:${NOTIFY_NUMBER}`,
    body: notifyMsg,
  })
}
