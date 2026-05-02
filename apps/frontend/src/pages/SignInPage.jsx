import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

const TEXT = {
  activeSession: 'Sesi\u00f3n activa',
  closeSession: 'Cerrar sesi\u00f3n',
  signinTitle: 'Iniciar sesi\u00f3n o crear cuenta',
  enterPhone: 'Introduce el n\u00famero de celular',
  continue: 'Continuar',
  newUserTitle: 'Parece que eres nuevo por aqu\u00ed.',
  createWithPhone: 'Vamos a crear una cuenta con tu n\u00famero de celular.',
  proceedCreate: 'Proceder a crear una cuenta',
  alreadyClient: '\u00bfYa eres cliente?',
  signinOther: 'Inicia sesi\u00f3n con otro celular.',
  createAccountTitle: 'Crear cuenta',
  fullName: 'Nombre',
  fullNamePlaceholder: 'Nombre y apellido',
  passwordLabel: 'Contrase\u00f1a (al menos 6 caracteres)',
  confirmPasswordLabel: 'Vuelve a escribir la contrase\u00f1a',
  passwordHint: 'La contrase\u00f1a debe contener al menos seis caracteres.',
  verifyPhoneButton: 'Verificar el n\u00famero de tel\u00e9fono m\u00f3vil',
  verifyTitle: 'Verificar con WhatsApp',
  verifyExisting: 'Ingresa el c\u00f3digo enviado por WhatsApp.',
  verifyNew: 'Ingresa el c\u00f3digo enviado por WhatsApp.',
  codeLabel: 'Ingresa el c\u00f3digo de seguridad',
  codePlaceholder: '',
  verifyButton: 'Verificar',
  resendCode: 'Reenviar c\u00f3digo',
  changePhone: 'Cambiar',
  nameRequired: 'Escribe tu nombre para crear la cuenta.',
  passwordLength: 'La contrase\u00f1a debe tener al menos 6 caracteres.',
  passwordsMatch: 'Las contrase\u00f1as no coinciden.',
  sendCodeError: 'No pudimos reenviar el c\u00f3digo. Intenta de nuevo.',
}

const COUNTRY_OPTIONS = [
  { code: 'AF', name: 'Afghanistan', dial: '+93' },
  { code: 'AL', name: 'Albania', dial: '+355' },
  { code: 'DZ', name: 'Algeria', dial: '+213' },
  { code: 'AD', name: 'Andorra', dial: '+376' },
  { code: 'AO', name: 'Angola', dial: '+244' },
  { code: 'AG', name: 'Antigua and Barbuda', dial: '+1' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'AM', name: 'Armenia', dial: '+374' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994' },
  { code: 'BS', name: 'Bahamas', dial: '+1' },
  { code: 'BH', name: 'Bahrain', dial: '+973' },
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'BB', name: 'Barbados', dial: '+1' },
  { code: 'BY', name: 'Belarus', dial: '+375' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'BZ', name: 'Belize', dial: '+501' },
  { code: 'BJ', name: 'Benin', dial: '+229' },
  { code: 'BT', name: 'Bhutan', dial: '+975' },
  { code: 'BO', name: 'Bolivia', dial: '+591' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dial: '+387' },
  { code: 'BW', name: 'Botswana', dial: '+267' },
  { code: 'BR', name: 'Brasil', dial: '+55' },
  { code: 'BN', name: 'Brunei', dial: '+673' },
  { code: 'BG', name: 'Bulgaria', dial: '+359' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226' },
  { code: 'BI', name: 'Burundi', dial: '+257' },
  { code: 'CV', name: 'Cabo Verde', dial: '+238' },
  { code: 'KH', name: 'Cambodia', dial: '+855' },
  { code: 'CM', name: 'Cameroon', dial: '+237' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'CF', name: 'Central African Republic', dial: '+236' },
  { code: 'TD', name: 'Chad', dial: '+235' },
  { code: 'CL', name: 'Chile', dial: '+56' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'CO', name: 'Colombia', dial: '+57' },
  { code: 'KM', name: 'Comoros', dial: '+269' },
  { code: 'CG', name: 'Congo', dial: '+242' },
  { code: 'CD', name: 'Congo (DRC)', dial: '+243' },
  { code: 'CR', name: 'Costa Rica', dial: '+506' },
  { code: 'CI', name: "Cote d'Ivoire", dial: '+225' },
  { code: 'HR', name: 'Croatia', dial: '+385' },
  { code: 'CU', name: 'Cuba', dial: '+53' },
  { code: 'CY', name: 'Cyprus', dial: '+357' },
  { code: 'CZ', name: 'Czechia', dial: '+420' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'DJ', name: 'Djibouti', dial: '+253' },
  { code: 'DM', name: 'Dominica', dial: '+1' },
  { code: 'DO', name: 'Dominican Republic', dial: '+1' },
  { code: 'EC', name: 'Ecuador', dial: '+593' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'SV', name: 'El Salvador', dial: '+503' },
  { code: 'GQ', name: 'Equatorial Guinea', dial: '+240' },
  { code: 'ER', name: 'Eritrea', dial: '+291' },
  { code: 'EE', name: 'Estonia', dial: '+372' },
  { code: 'SZ', name: 'Eswatini', dial: '+268' },
  { code: 'ET', name: 'Ethiopia', dial: '+251' },
  { code: 'FJ', name: 'Fiji', dial: '+679' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'GA', name: 'Gabon', dial: '+241' },
  { code: 'GM', name: 'Gambia', dial: '+220' },
  { code: 'GE', name: 'Georgia', dial: '+995' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'GH', name: 'Ghana', dial: '+233' },
  { code: 'GR', name: 'Greece', dial: '+30' },
  { code: 'GD', name: 'Grenada', dial: '+1' },
  { code: 'GT', name: 'Guatemala', dial: '+502' },
  { code: 'GN', name: 'Guinea', dial: '+224' },
  { code: 'GW', name: 'Guinea-Bissau', dial: '+245' },
  { code: 'GY', name: 'Guyana', dial: '+592' },
  { code: 'HT', name: 'Haiti', dial: '+509' },
  { code: 'HN', name: 'Honduras', dial: '+504' },
  { code: 'HU', name: 'Hungary', dial: '+36' },
  { code: 'IS', name: 'Iceland', dial: '+354' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'ID', name: 'Indonesia', dial: '+62' },
  { code: 'IR', name: 'Iran', dial: '+98' },
  { code: 'IQ', name: 'Iraq', dial: '+964' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'IL', name: 'Israel', dial: '+972' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'JM', name: 'Jamaica', dial: '+1' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'JO', name: 'Jordan', dial: '+962' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'KI', name: 'Kiribati', dial: '+686' },
  { code: 'KW', name: 'Kuwait', dial: '+965' },
  { code: 'KG', name: 'Kyrgyzstan', dial: '+996' },
  { code: 'LA', name: 'Laos', dial: '+856' },
  { code: 'LV', name: 'Latvia', dial: '+371' },
  { code: 'LB', name: 'Lebanon', dial: '+961' },
  { code: 'LS', name: 'Lesotho', dial: '+266' },
  { code: 'LR', name: 'Liberia', dial: '+231' },
  { code: 'LY', name: 'Libya', dial: '+218' },
  { code: 'LI', name: 'Liechtenstein', dial: '+423' },
  { code: 'LT', name: 'Lithuania', dial: '+370' },
  { code: 'LU', name: 'Luxembourg', dial: '+352' },
  { code: 'MG', name: 'Madagascar', dial: '+261' },
  { code: 'MW', name: 'Malawi', dial: '+265' },
  { code: 'MY', name: 'Malaysia', dial: '+60' },
  { code: 'MV', name: 'Maldives', dial: '+960' },
  { code: 'ML', name: 'Mali', dial: '+223' },
  { code: 'MT', name: 'Malta', dial: '+356' },
  { code: 'MH', name: 'Marshall Islands', dial: '+692' },
  { code: 'MR', name: 'Mauritania', dial: '+222' },
  { code: 'MU', name: 'Mauritius', dial: '+230' },
  { code: 'MX', name: 'M\u00e9xico', dial: '+52' },
  { code: 'FM', name: 'Micronesia', dial: '+691' },
  { code: 'MD', name: 'Moldova', dial: '+373' },
  { code: 'MC', name: 'Monaco', dial: '+377' },
  { code: 'MN', name: 'Mongolia', dial: '+976' },
  { code: 'ME', name: 'Montenegro', dial: '+382' },
  { code: 'MA', name: 'Morocco', dial: '+212' },
  { code: 'MZ', name: 'Mozambique', dial: '+258' },
  { code: 'MM', name: 'Myanmar', dial: '+95' },
  { code: 'NA', name: 'Namibia', dial: '+264' },
  { code: 'NR', name: 'Nauru', dial: '+674' },
  { code: 'NP', name: 'Nepal', dial: '+977' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'NI', name: 'Nicaragua', dial: '+505' },
  { code: 'NE', name: 'Niger', dial: '+227' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'KP', name: 'North Korea', dial: '+850' },
  { code: 'MK', name: 'North Macedonia', dial: '+389' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'PW', name: 'Palau', dial: '+680' },
  { code: 'PA', name: 'Panama', dial: '+507' },
  { code: 'PG', name: 'Papua New Guinea', dial: '+675' },
  { code: 'PY', name: 'Paraguay', dial: '+595' },
  { code: 'PE', name: 'Peru', dial: '+51' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'PR', name: 'Puerto Rico', dial: '+1' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'RO', name: 'Romania', dial: '+40' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'RW', name: 'Rwanda', dial: '+250' },
  { code: 'KN', name: 'Saint Kitts and Nevis', dial: '+1' },
  { code: 'LC', name: 'Saint Lucia', dial: '+1' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', dial: '+1' },
  { code: 'WS', name: 'Samoa', dial: '+685' },
  { code: 'SM', name: 'San Marino', dial: '+378' },
  { code: 'ST', name: 'Sao Tome and Principe', dial: '+239' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'SN', name: 'Senegal', dial: '+221' },
  { code: 'RS', name: 'Serbia', dial: '+381' },
  { code: 'SC', name: 'Seychelles', dial: '+248' },
  { code: 'SL', name: 'Sierra Leone', dial: '+232' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'SK', name: 'Slovakia', dial: '+421' },
  { code: 'SI', name: 'Slovenia', dial: '+386' },
  { code: 'SB', name: 'Solomon Islands', dial: '+677' },
  { code: 'SO', name: 'Somalia', dial: '+252' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'SS', name: 'South Sudan', dial: '+211' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'SD', name: 'Sudan', dial: '+249' },
  { code: 'SR', name: 'Suriname', dial: '+597' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'SY', name: 'Syria', dial: '+963' },
  { code: 'TW', name: 'Taiwan', dial: '+886' },
  { code: 'TJ', name: 'Tajikistan', dial: '+992' },
  { code: 'TZ', name: 'Tanzania', dial: '+255' },
  { code: 'TH', name: 'Thailand', dial: '+66' },
  { code: 'TL', name: 'Timor-Leste', dial: '+670' },
  { code: 'TG', name: 'Togo', dial: '+228' },
  { code: 'TO', name: 'Tonga', dial: '+676' },
  { code: 'TT', name: 'Trinidad and Tobago', dial: '+1' },
  { code: 'TN', name: 'Tunisia', dial: '+216' },
  { code: 'TR', name: 'Turkey', dial: '+90' },
  { code: 'TM', name: 'Turkmenistan', dial: '+993' },
  { code: 'TV', name: 'Tuvalu', dial: '+688' },
  { code: 'UG', name: 'Uganda', dial: '+256' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'UY', name: 'Uruguay', dial: '+598' },
  { code: 'UZ', name: 'Uzbekistan', dial: '+998' },
  { code: 'VU', name: 'Vanuatu', dial: '+678' },
  { code: 'VA', name: 'Vatican City', dial: '+379' },
  { code: 'VE', name: 'Venezuela', dial: '+58' },
  { code: 'VN', name: 'Vietnam', dial: '+84' },
  { code: 'YE', name: 'Yemen', dial: '+967' },
  { code: 'ZM', name: 'Zambia', dial: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263' },
]

const INITIAL_FORM = {
  phoneCountryCode: 'MX',
  phoneNumber: '',
  challengeId: '',
  code: '',
  name: '',
  password: '',
  confirmPassword: '',
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function getCountryByCode(countryCode) {
  return COUNTRY_OPTIONS.find(option => option.code === countryCode) || COUNTRY_OPTIONS.find(option => option.code === 'MX')
}

function buildPhoneE164(countryCode, localNumber) {
  const country = getCountryByCode(countryCode)
  return `+${onlyDigits(country?.dial || '+52')}${onlyDigits(localNumber)}`
}

function formatPhoneDisplay(countryCode, localNumber) {
  const country = getCountryByCode(countryCode)
  const label = country ? `${country.name} ${country.dial}` : 'M\u00e9xico +52'
  const number = String(localNumber || '').trim()
  return number ? `${label} ${number}` : label
}

function PhoneField({ id, countryCode, number, onCountryChange, onNumberChange, onClear }) {
  return (
    <div className="auth-phone-input" id={id}>
      <select
        className="auth-phone-input__country"
        value={countryCode}
        onChange={event => onCountryChange(event.target.value)}
        aria-label="Pa\u00eds"
      >
        {COUNTRY_OPTIONS.map(option => (
          <option key={option.code} value={option.code}>{`${option.name} ${option.dial}`}</option>
        ))}
      </select>
      <input
        className="auth-phone-input__number"
        type="tel"
        placeholder="0123456789"
        value={number}
        onChange={event => onNumberChange(onlyDigits(event.target.value))}
        required
      />
      {number ? (
        <button
          type="button"
          className="auth-phone-input__clear"
          onClick={onClear}
          aria-label="Limpiar n\u00famero"
        >
          {'\u00D7'}
        </button>
      ) : null}
    </div>
  )
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const store = useAppStore()
  const requestPhoneCode = store.requestPhoneCode
  const verifyPhoneCode = store.verifyPhoneCode
  const logout = store.logout
  const currentUser = store.auth.user
  const [form, setForm] = useState(INITIAL_FORM)
  const [step, setStep] = useState('request')
  const [isRegistered, setIsRegistered] = useState(true)
  const [registerError, setRegisterError] = useState('')

  function resetFlow() {
    setForm(INITIAL_FORM)
    setRegisterError('')
    setIsRegistered(true)
    setStep('request')
  }

  useEffect(() => {
    if (location.state?.resetAuthAt) {
      resetFlow()
    }
  }, [location.state?.resetAuthAt])

  if (currentUser) {
    return (
      <section className="panel auth-panel">
        <h1>{currentUser.name}</h1>
        <p>{currentUser.phone || currentUser.email || TEXT.activeSession}</p>
        <button className="button" type="button" onClick={() => logout()}>{TEXT.closeSession}</button>
      </section>
    )
  }

  async function requestCodeForCurrentPhone() {
    const phone = buildPhoneE164(form.phoneCountryCode, form.phoneNumber)
    const response = await requestPhoneCode({ phone })
    setForm(current => ({ ...current, challengeId: response.challengeId }))
    return response
  }

  async function handleRequestCode(event) {
    event.preventDefault()
    const response = await requestCodeForCurrentPhone()
    setIsRegistered(Boolean(response.isRegistered))
    setStep(response.isRegistered ? 'verify-login' : 'new-user')
  }

  async function handleVerifyCode(event) {
    event.preventDefault()
    await verifyPhoneCode({
      challengeId: form.challengeId,
      phone: buildPhoneE164(form.phoneCountryCode, form.phoneNumber),
      code: form.code,
      name: form.name.trim() || undefined,
    })
    navigate('/')
  }

  async function handleResendCode() {
    try {
      await requestCodeForCurrentPhone()
    } catch {
      setRegisterError(TEXT.sendCodeError)
    }
  }

  function handleUseOtherPhone() {
    resetFlow()
  }

  async function handleStartRegistration() {
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setRegisterError(TEXT.nameRequired)
      return
    }

    if ((form.password || '').length < 6) {
      setRegisterError(TEXT.passwordLength)
      return
    }

    if (form.password !== form.confirmPassword) {
      setRegisterError(TEXT.passwordsMatch)
      return
    }

    try {
      await requestCodeForCurrentPhone()
    } catch {
      setRegisterError(TEXT.sendCodeError)
      return
    }

    setRegisterError('')
    setStep('verify-register')
  }

  function handleSubmit(event) {
    if (step === 'request') {
      void handleRequestCode(event)
      return
    }

    if (step === 'verify-login' || step === 'verify-register') {
      void handleVerifyCode(event)
      return
    }

    event.preventDefault()
  }

  return (
    <section className="auth-grid">
      <form className="panel auth-panel" onSubmit={handleSubmit}>
        {step === 'request' || step === 'verify-login' ? <h1>{TEXT.signinTitle}</h1> : null}

        {step === 'request' ? (
          <>
            <p>{TEXT.enterPhone}</p>
            <PhoneField
              id="signin-phone"
              countryCode={form.phoneCountryCode}
              number={form.phoneNumber}
              onCountryChange={value => setForm({ ...form, phoneCountryCode: value })}
              onNumberChange={value => setForm({ ...form, phoneNumber: value })}
              onClear={() => setForm({ ...form, phoneNumber: '' })}
            />
            <button className="button" type="submit">{TEXT.continue}</button>
          </>
        ) : null}

        {step === 'new-user' ? (
          <div className="auth-new-user">
            <h1>{TEXT.newUserTitle}</h1>
            <p className="auth-new-user__phone">
              {formatPhoneDisplay(form.phoneCountryCode, form.phoneNumber)}{' '}
              <button type="button" className="link-button" onClick={handleUseOtherPhone}>{TEXT.changePhone}</button>
            </p>
            <p>{TEXT.createWithPhone}</p>
            <button className="button button--full" type="button" onClick={() => setStep('register')}>
              {TEXT.proceedCreate}
            </button>
            <hr />
            <p className="auth-new-user__subtitle">{TEXT.alreadyClient}</p>
            <button type="button" className="link-button" onClick={handleUseOtherPhone}>
              {TEXT.signinOther}
            </button>
          </div>
        ) : null}

        {step === 'register' ? (
          <div className="auth-register">
            <h1>{TEXT.createAccountTitle}</h1>
            <label htmlFor="register-phone">{TEXT.enterPhone}</label>
            <PhoneField
              id="register-phone"
              countryCode={form.phoneCountryCode}
              number={form.phoneNumber}
              onCountryChange={value => setForm({ ...form, phoneCountryCode: value })}
              onNumberChange={value => setForm({ ...form, phoneNumber: value })}
              onClear={() => setForm({ ...form, phoneNumber: '' })}
            />

            <label htmlFor="register-name">{TEXT.fullName}</label>
            <input
              id="register-name"
              className="input"
              type="text"
              placeholder={TEXT.fullNamePlaceholder}
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              required
            />

            <label htmlFor="register-password">{TEXT.passwordLabel}</label>
            <input
              id="register-password"
              className="input"
              type="password"
              value={form.password}
              onChange={event => setForm({ ...form, password: event.target.value })}
              required
            />
            <p className="auth-register__hint">{TEXT.passwordHint}</p>

            <label htmlFor="register-confirm">{TEXT.confirmPasswordLabel}</label>
            <input
              id="register-confirm"
              className="input"
              type="password"
              value={form.confirmPassword}
              onChange={event => setForm({ ...form, confirmPassword: event.target.value })}
              required
            />

            {registerError ? <p className="auth-register__error">{registerError}</p> : null}

            <button className="button button--full" type="button" onClick={() => { void handleStartRegistration() }}>
              {TEXT.verifyPhoneButton}
            </button>

            <hr />
            <p className="auth-new-user__subtitle">{TEXT.alreadyClient}</p>
            <button type="button" className="link-button" onClick={handleUseOtherPhone}>
              {TEXT.signinOther}
            </button>
          </div>
        ) : null}

        {step === 'verify-login' || step === 'verify-register' ? (
          <div className="auth-verify">
            <div className="auth-verify__title-row">
              <span className="auth-verify__icon" aria-hidden="true">WA</span>
              <h1>{TEXT.verifyTitle}</h1>
            </div>
            <p>{isRegistered ? TEXT.verifyExisting : TEXT.verifyNew}</p>
            <p className="auth-verify__phone">
              {formatPhoneDisplay(form.phoneCountryCode, form.phoneNumber)}{' '}
              <button type="button" className="link-button" onClick={handleUseOtherPhone}>{TEXT.changePhone}</button>
            </p>
            <label htmlFor="verify-code">{TEXT.codeLabel}</label>
            <input
              id="verify-code"
              className="input"
              type="text"
              placeholder={TEXT.codePlaceholder}
              value={form.code}
              onChange={event => setForm({ ...form, code: event.target.value })}
              required
            />
            <button className="button button--full" type="submit">{TEXT.verifyButton}</button>
            <button className="link-button auth-verify__resend" type="button" onClick={() => { void handleResendCode() }}>
              {TEXT.resendCode}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  )
}
