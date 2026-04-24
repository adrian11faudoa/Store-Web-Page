import { useMemo, useState } from 'react'
import { createProduct, deleteProduct, exportProductsCsv, importProductsCsv, updateProduct } from '../services/products.js'
import { formatCurrency, formatLabel } from '../assets/js/utils/format.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

const EMPTY_FORM = {
  temporada: '',
  nombre: '',
  genero: '',
  colorPrimario: '',
  colorSecundario: '',
  estampado: '',
  talla: '',
  precio: '',
  existencia: '',
  tipoPrenda: '',
  imagenes: [''],
}

function normalizeImageUrls(values) {
  return values.map(value => value.trim()).filter(Boolean)
}

function validateProduct(form) {
  const errors = {}
  const requiredFields = [
    ['temporada', 'Temporada is required'],
    ['nombre', 'Nombre is required'],
    ['genero', 'Genero is required'],
    ['colorPrimario', 'Color primario is required'],
    ['colorSecundario', 'Color secundario is required'],
    ['estampado', 'Estampado is required'],
    ['talla', 'Talla is required'],
    ['tipoPrenda', 'Tipo de prenda is required'],
  ]

  requiredFields.forEach(([field, message]) => {
    if (!String(form[field] || '').trim()) errors[field] = message
  })

  if (form.precio === '' || Number.isNaN(Number(form.precio))) errors.precio = 'Precio must be a valid number'
  if (form.existencia === '' || !Number.isInteger(Number(form.existencia))) errors.existencia = 'Existencia must be a whole number'

  const imagenes = normalizeImageUrls(form.imagenes)
  if (!imagenes.length) errors.imagenes = 'At least one image URL is required'

  const invalidImage = imagenes.find(url => {
    try {
      new URL(url)
      return false
    } catch {
      return true
    }
  })

  if (invalidImage) errors.imagenes = 'All image URLs must be valid'

  return {
    errors,
    payload: {
      ...form,
      precio: Number(form.precio),
      existencia: Number(form.existencia),
      talla: form.talla.split(',').map(value => value.trim()).filter(Boolean),
      imagenes,
    },
  }
}

function formFromProduct(product) {
  return {
    temporada: product.temporada || '',
    nombre: product.nombre || product.name || '',
    genero: product.genero || product.gender || '',
    colorPrimario: product.colorPrimario || '',
    colorSecundario: product.colorSecundario || '',
    estampado: product.estampado || '',
    talla: Array.isArray(product.talla) ? product.talla.join(', ') : (product.talla || product.sizes?.join(', ') || ''),
    precio: String(product.precio ?? product.price ?? ''),
    existencia: String(product.existencia ?? ''),
    tipoPrenda: product.tipoPrenda || product.category_label || product.category || '',
    imagenes: product.imagenes?.length ? product.imagenes : [''],
  }
}

export default function AdminProducts({ products, reloadProducts }) {
  const { currency, locale, t } = useLocale()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [importErrors, setImportErrors] = useState([])

  const sortedProducts = useMemo(
    () => [...products].sort((left, right) => Number(right.id) - Number(left.id)),
    [products]
  )

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function updateImage(index, value) {
    setForm(current => ({
      ...current,
      imagenes: current.imagenes.map((image, imageIndex) => (imageIndex === index ? value : image)),
    }))
    setErrors(current => ({ ...current, imagenes: '' }))
  }

  function addImageField() {
    setForm(current => ({ ...current, imagenes: [...current.imagenes, ''] }))
  }

  function removeImageField(index) {
    setForm(current => {
      const nextImages = current.imagenes.filter((_, imageIndex) => imageIndex !== index)
      return { ...current, imagenes: nextImages.length ? nextImages : [''] }
    })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
  }

  async function handleExport() {
    setStatus('')
    try {
      const blob = await exportProductsCsv()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'products.csv'
      link.click()
      URL.revokeObjectURL(url)
      setStatus(t('csvExported'))
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function handleImport(event) {
    const [file] = Array.from(event.target.files || [])
    if (!file) return

    setStatus('')
    setImportErrors([])
    setIsSaving(true)

    try {
      const response = await importProductsCsv(file)
      const result = response.data
      setImportErrors(result.errors || [])
      setStatus(t('importedProducts', { inserted: result.inserted, skipped: result.skipped }))
      await reloadProducts()
    } catch (error) {
      setStatus(error.message)
    } finally {
      event.target.value = ''
      setIsSaving(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    const { errors: nextErrors, payload } = validateProduct(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setStatus('Product updated successfully.')
      } else {
        await createProduct(payload)
        setStatus('Product created successfully.')
      }
      resetForm()
      await reloadProducts()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(productId) {
    setStatus('')
    setIsSaving(true)
    try {
      await deleteProduct(productId)
      if (editingId === productId) resetForm()
      setStatus('Product deleted successfully.')
      await reloadProducts()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="section">
      <div className="container admin-products">
            <div className="section-heading">
              <div>
            <p className="eyebrow">{t('adminPanel')}</p>
            <h1>{t('createProducts')}</h1>
              </div>
              <p className="catalog-count">{products.length} products</p>
            </div>

        <div className="admin-products__layout">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__grid">
              <label>
                Temporada
                <input value={form.temporada} onChange={event => updateField('temporada', event.target.value)} />
                {errors.temporada && <span className="form-error">{errors.temporada}</span>}
              </label>
              <label>
                Nombre de la prenda
                <input value={form.nombre} onChange={event => updateField('nombre', event.target.value)} />
                {errors.nombre && <span className="form-error">{errors.nombre}</span>}
              </label>
              <label>
                Genero
                <input value={form.genero} onChange={event => updateField('genero', event.target.value)} />
                {errors.genero && <span className="form-error">{errors.genero}</span>}
              </label>
              <label>
                Color primario
                <input value={form.colorPrimario} onChange={event => updateField('colorPrimario', event.target.value)} />
                {errors.colorPrimario && <span className="form-error">{errors.colorPrimario}</span>}
              </label>
              <label>
                Color secundario
                <input value={form.colorSecundario} onChange={event => updateField('colorSecundario', event.target.value)} />
                {errors.colorSecundario && <span className="form-error">{errors.colorSecundario}</span>}
              </label>
              <label>
                Estampado
                <input value={form.estampado} onChange={event => updateField('estampado', event.target.value)} />
                {errors.estampado && <span className="form-error">{errors.estampado}</span>}
              </label>
              <label>
                Talla
                <input
                  placeholder="S, M, L or Unica"
                  value={form.talla}
                  onChange={event => updateField('talla', event.target.value)}
                />
                {errors.talla && <span className="form-error">{errors.talla}</span>}
              </label>
              <label>
                Precio
                <input type="number" min="0" step="0.01" value={form.precio} onChange={event => updateField('precio', event.target.value)} />
                {errors.precio && <span className="form-error">{errors.precio}</span>}
              </label>
              <label>
                Existencia
                <input type="number" min="0" step="1" value={form.existencia} onChange={event => updateField('existencia', event.target.value)} />
                {errors.existencia && <span className="form-error">{errors.existencia}</span>}
              </label>
              <label className="admin-form__full">
                Tipo de prenda
                <input value={form.tipoPrenda} onChange={event => updateField('tipoPrenda', event.target.value)} />
                {errors.tipoPrenda && <span className="form-error">{errors.tipoPrenda}</span>}
              </label>
            </div>

            <div className="admin-form__section">
              <div className="admin-form__section-head">
                <h2>{t('imageUrls')}</h2>
                <button type="button" className="button button--ghost" onClick={addImageField}>{t('addUrl')}</button>
              </div>
              {form.imagenes.map((image, index) => (
                <div key={`${index}-${image}`} className="admin-image-row">
                  <input
                    type="url"
                    placeholder="https://example.com/front-view.jpg"
                    value={image}
                    onChange={event => updateImage(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => removeImageField(index)}
                    disabled={form.imagenes.length === 1}
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
              {errors.imagenes && <span className="form-error">{errors.imagenes}</span>}

              <div className="admin-image-preview-grid">
                {normalizeImageUrls(form.imagenes).map(url => (
                  <figure key={url} className="admin-image-preview">
                    <img src={url} alt="Product preview" loading="lazy" />
                    <figcaption>{url}</figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {status && <p className={status.includes('successfully') ? 'product-card__status' : 'product-card__status is-error'}>{status}</p>}

            <div className="admin-form__actions">
              <button type="submit" className="button" disabled={isSaving}>
                {editingId ? t('updateProduct') : t('createProduct')}
              </button>
              <button type="button" className="button button--ghost" onClick={handleExport} disabled={isSaving}>
                {t('exportCsv')}
              </button>
              <label className="button button--ghost admin-import-label">
                {t('importCsv')}
                <input type="file" accept=".csv,text/csv" onChange={handleImport} hidden />
              </label>
              <button type="button" className="button button--ghost" onClick={resetForm} disabled={isSaving}>
                {t('resetForm')}
              </button>
            </div>

            <p className="auth-helper">{t('importTitle')}</p>

            {importErrors.length > 0 && (
              <div className="admin-import-errors">
                <h3>{t('skippedRows')}</h3>
                {importErrors.map(error => (
                  <p key={`${error.row}-${error.nombre}`}>
                    Row {error.row} {error.nombre ? `(${error.nombre})` : ''}: {error.errors.join(', ')}
                  </p>
                ))}
              </div>
            )}
          </form>

          <div className="admin-products__list">
            {sortedProducts.map(product => (
              <article key={product.id} className="admin-product-card">
                <img src={product.imagenes?.[0] || product.image_url} alt={product.nombre || product.name} loading="lazy" />
                <div>
                  <p className="eyebrow">{formatLabel(product.temporada)}</p>
                  <h2>{product.nombre || product.name}</h2>
                  <p>{formatLabel(product.tipoPrenda || product.category)}</p>
                  <p>{formatCurrency(product.precio ?? product.price, { locale, currency })} | {product.existencia} in stock</p>
                </div>
                <div className="admin-product-card__actions">
                  <button type="button" className="button button--ghost" onClick={() => {
                    setEditingId(product.id)
                    setForm(formFromProduct(product))
                    setErrors({})
                    setStatus(`Editing ${product.nombre || product.name}`)
                  }}>
                    Edit
                  </button>
                  <button type="button" className="button" onClick={() => handleDelete(product.id)} disabled={isSaving}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
