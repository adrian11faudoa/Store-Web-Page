// client/src/components/MixMatch.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { mixMatch as mixMatchApi } from '../api.js'
import { useCart } from '../store/index.js'

// Simple image with fallback
function ProductImg({ src, bg, name, size = 160 }) {
  const [err, setErr] = useState(false)
  return (
    <div
      style={{
        width: size, height: size * 1.2,
        background: bg || '#f0eef8',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0, position: 'relative',
      }}
    >
      {err || !src ? (
        <span style={{ fontSize: size * 0.4 }}>👕</span>
      ) : (
        <img
          src={src} alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setErr(true)}
        />
      )}
    </div>
  )
}

// A single carousel row
function ItemCarousel({ items, activeIdx, onSelect, type }) {
  if (!items.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
      {/* Scrollable row */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
        className="mm-scroll-row"
      >
        {items.map((item, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={item.id}
              onClick={() => onSelect(i)}
              style={{
                flexShrink: 0,
                scrollSnapAlign: 'center',
                background: isActive ? '#fff' : 'transparent',
                border: isActive ? '2.5px solid var(--color-brand, #3C3489)' : '2.5px solid transparent',
                borderRadius: 14,
                padding: isActive ? 6 : 4,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                transform: isActive ? 'scale(1.07)' : 'scale(0.92)',
                boxShadow: isActive ? '0 4px 18px rgba(60,52,137,0.18)' : 'none',
                outline: 'none',
                position: 'relative',
              }}
            >
              <ProductImg
                src={item.image_url}
                bg={item.fallback_bg}
                name={item.name}
                size={isActive ? 130 : 110}
              />
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-brand, #3C3489)',
                  whiteSpace: 'nowrap',
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}>
                  {item.name}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function MixMatch() {
  const navigate = useNavigate()
  const add = useCart(s => s.add)

  const [gender,     setGender]     = useState('girl')
  const [data,       setData]       = useState({ tops: [], bottoms: [] })
  const [loading,    setLoading]    = useState(true)
  const [topIdx,     setTopIdx]     = useState(0)
  const [bottomIdx,  setBottomIdx]  = useState(0)
  const [added,      setAdded]      = useState(false)

  const load = useCallback(async (g) => {
    setLoading(true)
    setTopIdx(0)
    setBottomIdx(0)
    try {
      const res = await mixMatchApi.get(g, 12)
      setData(res)
    } catch {
      setData({ tops: [], bottoms: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(gender) }, [gender, load])

  const top    = data.tops[topIdx]
  const bottom = data.bottoms[bottomIdx]

  const combinedPrice = top && bottom
    ? (parseFloat(top.price) + parseFloat(bottom.price)).toFixed(2)
    : null

  function handleAddBoth() {
    if (!top || !bottom) return
    add({ ...top,    selectedSize: top.sizes?.[0]    || null })
    add({ ...bottom, selectedSize: bottom.sizes?.[0] || null })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleShopLook() {
    navigate(`/shop?category=tops&gender=${gender}`)
  }

  if (!loading && data.tops.length === 0 && data.bottoms.length === 0) return null

  return (
    <section
      className="section"
      style={{
        background: gender === 'girl'
          ? 'linear-gradient(160deg, #fff5f8 0%, #fce4f0 100%)'
          : 'linear-gradient(160deg, #f0f4ff 0%, #dce8fb 100%)',
        borderRadius: 24,
        margin: '0 0 2rem',
        padding: '2.5rem 1.5rem 2rem',
        overflow: 'hidden',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: 'var(--color-brand, #3C3489)', textTransform: 'uppercase', marginBottom: 6 }}>
          Mix &amp; Match
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px', color: '#1a1a2e', lineHeight: 1.2 }}>
          Pick a top, pick a bottom,
        </h2>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px', color: '#1a1a2e', lineHeight: 1.2 }}>
          shop the whole look in one click!
        </h2>
        <div style={{
          display: 'inline-block',
          background: gender === 'girl' ? '#ff5fa0' : '#3C3489',
          color: '#fff',
          borderRadius: 99,
          padding: '3px 14px',
          fontSize: 13,
          fontWeight: 800,
          transition: 'background 0.3s',
        }}>
          up to 50% off
        </div>
      </div>

      {/* Gender tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
        {[
          { key: 'girl', label: 'GIRL', color: '#ff5fa0' },
          { key: 'boy',  label: 'BOY',  color: '#3C3489' },
        ].map(g => (
          <button
            key={g.key}
            onClick={() => setGender(g.key)}
            style={{
              padding: '8px 32px',
              borderRadius: 99,
              border: 'none',
              background: gender === g.key ? g.color : 'rgba(255,255,255,0.6)',
              color: gender === g.key ? '#fff' : '#666',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: gender === g.key ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
          <div style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>Loading looks…</div>
        </div>
      ) : (
        <>
          {/* Tops carousel */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 16, paddingLeft: 4 }}>
              Tops
            </div>
            <ItemCarousel
              items={data.tops}
              activeIdx={topIdx}
              onSelect={setTopIdx}
              type="top"
            />
          </div>

          {/* Center divider with + icon */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '8px 0 16px',
            gap: 10,
          }}>
            <div style={{ flex: 1, height: 1.5, background: 'rgba(0,0,0,0.12)', borderRadius: 99 }} />
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              border: '2px solid rgba(0,0,0,0.18)',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 300, color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              flexShrink: 0,
            }}>+</div>
            <div style={{ flex: 1, height: 1.5, background: 'rgba(0,0,0,0.12)', borderRadius: 99 }} />
          </div>

          {/* Bottoms carousel */}
          <div style={{ marginTop: 8, marginBottom: 52 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 16, paddingLeft: 4 }}>
              Bottoms
            </div>
            <ItemCarousel
              items={data.bottoms}
              activeIdx={bottomIdx}
              onSelect={setBottomIdx}
              type="bottom"
            />
          </div>

          {/* Footer: price + add to bag */}
          {top && bottom && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexWrap: 'wrap', gap: 16, marginTop: 8,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 2 }}>Combined total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e' }}>
                  ${combinedPrice}
                </div>
              </div>
              <button
                onClick={handleAddBoth}
                style={{
                  background: added
                    ? '#10b981'
                    : (gender === 'girl' ? '#ff5fa0' : '#3C3489'),
                  color: '#fff',
                  border: 'none',
                  borderRadius: 99,
                  padding: '13px 32px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                  letterSpacing: 0.5,
                }}
              >
                {added ? '✓ Added to bag!' : 'ADD TO BAG'}
              </button>
              <button
                onClick={handleShopLook}
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  borderRadius: 99,
                  padding: '12px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#444',
                  transition: 'all 0.15s',
                }}
              >
                Shop all →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .mm-scroll-row::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
