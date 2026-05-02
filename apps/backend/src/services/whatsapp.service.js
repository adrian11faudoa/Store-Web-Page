import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import { logger } from '../utils/logger.js'

const WHATSAPP_GRAPH_BASE = `https://graph.facebook.com/${env.whatsappApiVersion}`

function buildTemplatePayload(phone, code) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: env.whatsappTemplateName,
      language: { code: env.whatsappTemplateLanguage },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
      ],
    },
  }
}

function buildTextPayload(phone, code, ttlMinutes) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'text',
    text: {
      preview_url: false,
      body: `Tu codigo de verificacion de Sahara Kids es ${code}. Caduca en ${ttlMinutes} minutos.`,
    },
  }
}

export async function sendWhatsappVerificationCode({ phone, code, ttlMinutes }) {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    if (env.isProduction) {
      throw new AppError(503, 'WhatsApp verification is not configured')
    }

    logger.warn({ phone, code }, 'WhatsApp credentials are missing; using local development fallback')
    return
  }

  const payload = env.whatsappTemplateName
    ? buildTemplatePayload(phone, code)
    : buildTextPayload(phone, code, ttlMinutes)

  const response = await fetch(`${WHATSAPP_GRAPH_BASE}/${env.whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.whatsappAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let details = null

    try {
      details = await response.json()
    } catch {
      details = null
    }

    logger.error({ phone, status: response.status, details }, 'Failed to deliver WhatsApp verification code')
    throw new AppError(502, 'Unable to send verification code by WhatsApp')
  }
}
