// server/utils/mailer.js
// All transactional emails with styled HTML templates.
// Gmail:   SMTP_HOST=smtp.gmail.com   SMTP_PORT=587  (use App Password, not your real password)
// Outlook: SMTP_HOST=smtp.office365.com  SMTP_PORT=587

import nodemailer from 'nodemailer'

function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

const FROM = () => process.env.SMTP_FROM || 'tiny.fits <no-reply@tinyfits.com>'
const YEAR = new Date().getFullYear()

function base({ preheader, body }) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:32px 16px;">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#3C3489;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
  <span style="font-family:Georgia,serif;font-size:26px;color:#fff;letter-spacing:-0.5px;">tiny<span style="color:#D85A30;">.</span>fits</span>
</td></tr>
<tr><td style="background:#fff;padding:36px 36px 28px;border-radius:0 0 16px 16px;box-shadow:0 4px 16px rgba(0,0,0,.07);">
  ${body}
</td></tr>
<tr><td style="padding:20px 0;text-align:center;font-size:12px;color:#a8a29e;">
  &copy; ${YEAR} tiny.fits Ltd. &nbsp;|&nbsp; Si no solicitaste esto, ignora este correo.
</td></tr>
</table></td></tr></table></body></html>`
}

const codeBox = c => `<div style="margin:24px 0;text-align:center;"><span style="display:inline-block;background:#EEEDFE;border-radius:12px;padding:16px 32px;font-size:36px;font-weight:700;letter-spacing:10px;color:#3C3489;">${c}</span></div>`
const btn = (href, label) => `<div style="margin:24px 0;text-align:center;"><a href="${href}" style="display:inline-block;background:#3C3489;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;">${label}</a></div>`
const p   = t => `<p style="font-size:15px;line-height:1.7;color:#44403c;margin:0 0 12px;">${t}</p>`
const h1  = t => `<h1 style="font-size:22px;font-weight:800;color:#1c1917;margin:0 0 16px;">${t}</h1>`
const sm  = t => `<p style="font-size:13px;color:#a8a29e;margin:16px 0 0;text-align:center;">${t}</p>`

export async function sendVerificationEmail({ to, name, code }) {
  const subject = '¡Bienvenido a tiny.fits! Confirma tu correo'
  const body = h1(`¡Hola${name ? ', ' + name : ''}! 👋`) +
    p('Gracias por crear tu cuenta en <strong>tiny.fits</strong>. Estamos muy contentos de tenerte con nosotros.') +
    p('Para activar tu cuenta introduce este código de confirmación:') +
    codeBox(code) +
    p('Este código es válido por <strong>30 minutos</strong>.') +
    sm('Si no creaste esta cuenta, puedes ignorar este correo sin problema.')
  const text = `¡Bienvenido a tiny.fits, ${name || ''}!\n\nTu código de verificación es: ${code}\n\nExpira en 30 minutos.`
  const t = getTransporter()
  if (!t) { console.log(`[VERIFY EMAIL] ${to} code=${code}`); return }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: `Tu código: ${code}`, body }) })
}

export async function sendPasswordResetEmail({ to, code }) {
  const subject = 'Código para restablecer tu contraseña — tiny.fits'
  const body = h1('Restablecer contraseña 🔑') +
    p('Recibimos una solicitud para restablecer la contraseña de tu cuenta de <strong>tiny.fits</strong>.') +
    p('Usa este código en la aplicación:') +
    codeBox(code) +
    p('Expira en <strong>10 minutos</strong>. Si no lo usas, tu contraseña actual no cambia.') +
    sm('Si no solicitaste esto, ignora este correo. No compartas este código con nadie.')
  const text = `Código para restablecer tu contraseña de tiny.fits: ${code}\n\nExpira en 10 minutos.`
  const t = getTransporter()
  if (!t) { console.log(`[RESET EMAIL] ${to} code=${code}`); return }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: `Código reset: ${code}`, body }) })
}

export async function sendGoogleAccountResetEmail({ to, name }) {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/?openAuth=1`
  const subject  = 'Tu cuenta tiny.fits está vinculada a Google'
  const body = h1('Cuenta con Google 🔵') +
    p(`Hola${name ? ' ' + name : ''}, recibimos una solicitud de restablecimiento de contraseña para <strong>${to}</strong>.`) +
    p('Esta cuenta fue creada con <strong>Google Sign-In</strong>, por lo que no tiene contraseña propia — no necesitas una.') +
    p('Para iniciar sesión haz clic en el botón:') +
    btn(loginUrl, 'Continuar con Google') +
    sm('¿Tienes problemas? Escríbenos a soporte@tinyfits.com')
  const text = `Hola ${name || ''},\n\nTu cuenta (${to}) está vinculada a Google. Inicia sesión usando "Continuar con Google".\n\n${loginUrl}`
  const t = getTransporter()
  if (!t) { console.log(`[GOOGLE RESET EMAIL] ${to} — google-only account`); return }
  await t.sendMail({ from: FROM(), to, subject, text, html: base({ preheader: 'Tu cuenta usa Google para iniciar sesión', body }) })
}
