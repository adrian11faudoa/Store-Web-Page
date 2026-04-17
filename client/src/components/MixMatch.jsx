import { useState, useEffect, useCallback } from 'react'
import { mixMatch as mixMatchApi } from '../api.js'
import { useCart } from '../store/index.js'
import { t, useLang } from '../store/lang.js'

function ProductImg({ src, bg, name, size, ratio = 1.16, fit = 'contain' }) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  return (
    <div className="mm-img-shell" style={{ width: size, height: size * ratio, background: bg || 'transparent' }}>
      {errored || !src ? (
        <span className="mm-fallback" aria-hidden="true">👕</span>
      ) : (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: fit }}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}

function wrapIndex(index, length) {
  if (!length) return 0
  return (index % length + length) % length
}

function getSideItems(items, activeIdx, side) {
  if (!items.length) return []
  const offsets = side === 'left' ? [-2, -1] : [1, 2]
  return offsets.map(offset => {
    const index = wrapIndex(activeIdx + offset, items.length)
    return { index, offset, item: items[index] }
  })
}

function getMobileItems(items, activeIdx) {
  if (!items.length) return []
  return [-2, -1, 1, 2].map(offset => {
    const index = wrapIndex(activeIdx + offset, items.length)
    return { index, offset, item: items[index] }
  })
}

function Arrow({ className, onClick, label, children }) {
  return (
    <button className={className} onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}

export default function MixMatch() {
  const lang = useLang(state => state.lang)
  const add = useCart(state => state.add)
  const [gender, setGender] = useState('girl')
  const [data, setData] = useState({ tops: [], bottoms: [] })
  const [loading, setLoading] = useState(true)
  const [topIdx, setTopIdx] = useState(0)
  const [bottomIdx, setBottomIdx] = useState(0)
  const [added, setAdded] = useState(false)

  const load = useCallback(async currentGender => {
    setLoading(true)
    setTopIdx(0)
    setBottomIdx(0)
    try {
      setData(await mixMatchApi.get(currentGender, 12))
    } catch {
      setData({ tops: [], bottoms: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(gender)
  }, [gender, load])

  const top = data.tops[topIdx]
  const bottom = data.bottoms[bottomIdx]

  function handleAddBoth() {
    if (!top || !bottom) return
    add({ ...top, selectedSize: top.sizes?.[0] || null })
    add({ ...bottom, selectedSize: bottom.sizes?.[0] || null })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!loading && !data.tops.length && !data.bottoms.length) return null

  const topLeft = getSideItems(data.tops, topIdx, 'left')
  const topRight = getSideItems(data.tops, topIdx, 'right')
  const bottomLeft = getSideItems(data.bottoms, bottomIdx, 'left')
  const bottomRight = getSideItems(data.bottoms, bottomIdx, 'right')
  const topMobile = getMobileItems(data.tops, topIdx)
  const bottomMobile = getMobileItems(data.bottoms, bottomIdx)

  return (
    <section className="mm">
      <div className="mm__header">
        <h2 className="mm__title">{t(lang, 'mixTitle')}</h2>
        <div className="mm__tabs" role="tablist">
          {['girl', 'boy'].map(option => (
            <button
              key={option}
              className={`mm__tab${gender === option ? ' mm__tab--active' : ''}`}
              onClick={() => setGender(option)}
              role="tab"
              aria-selected={gender === option}
            >
              {t(lang, option)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mm__loading">{t(lang, 'loadingLooks')}</div>
      ) : (
        <>
          <div className="mm__desktop">
            <div className="mm__grid">
              <Arrow className="mm__arrow r1c1" onClick={() => setTopIdx(i => wrapIndex(i - 1, data.tops.length))} label={t(lang, 'previousTop')}>‹</Arrow>
              <div className="mm__rail mm__rail--left r1c2">
                {topLeft.map(({ item, index, offset }) => (
                  <button key={`tl-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setTopIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 88 : 72} ratio={1.18} />
                  </button>
                ))}
              </div>
              <div className="mm__focus-card">
                <div className="mm__focus-slot">{top && <ProductImg src={top.image_url} bg={top.fallback_bg} name={top.name} size={132} ratio={1.18} />}</div>
                <div className="mm__divider" aria-hidden="true"><span className="mm__divider-line" /><span className="mm__divider-plus">+</span><span className="mm__divider-line" /></div>
                <div className="mm__focus-slot">{bottom && <ProductImg src={bottom.image_url} bg={bottom.fallback_bg} name={bottom.name} size={126} ratio={1.08} />}</div>
              </div>
              <div className="mm__rail mm__rail--right r1c4">
                {topRight.map(({ item, index, offset }) => (
                  <button key={`tr-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setTopIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 88 : 72} ratio={1.18} />
                  </button>
                ))}
              </div>
              <Arrow className="mm__arrow r1c5" onClick={() => setTopIdx(i => wrapIndex(i + 1, data.tops.length))} label={t(lang, 'nextTop')}>›</Arrow>
              <Arrow className="mm__arrow r2c1" onClick={() => setBottomIdx(i => wrapIndex(i - 1, data.bottoms.length))} label={t(lang, 'previousBottom')}>‹</Arrow>
              <div className="mm__rail mm__rail--left r2c2">
                {bottomLeft.map(({ item, index, offset }) => (
                  <button key={`bl-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setBottomIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 88 : 72} ratio={1.08} />
                  </button>
                ))}
              </div>
              <div className="mm__rail mm__rail--right r2c4">
                {bottomRight.map(({ item, index, offset }) => (
                  <button key={`br-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setBottomIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 88 : 72} ratio={1.08} />
                  </button>
                ))}
              </div>
              <Arrow className="mm__arrow r2c5" onClick={() => setBottomIdx(i => wrapIndex(i + 1, data.bottoms.length))} label={t(lang, 'nextBottom')}>›</Arrow>
            </div>
          </div>

          <div className="mm__mobile">
            <div className="mm__focus-card mm__focus-card--mobile">
              <div className="mm__focus-slot">{top && <ProductImg src={top.image_url} bg={top.fallback_bg} name={top.name} size={122} ratio={1.18} />}</div>
              <div className="mm__divider" aria-hidden="true"><span className="mm__divider-line" /><span className="mm__divider-plus">+</span><span className="mm__divider-line" /></div>
              <div className="mm__focus-slot">{bottom && <ProductImg src={bottom.image_url} bg={bottom.fallback_bg} name={bottom.name} size={116} ratio={1.08} />}</div>
            </div>

            <div className="mm__mobile-row">
              <Arrow className="mm__mobile-arrow" onClick={() => setTopIdx(i => wrapIndex(i - 1, data.tops.length))} label={t(lang, 'previousTop')}>‹</Arrow>
              <div className="mm__mobile-rail">
                {topMobile.map(({ item, index, offset }) => (
                  <button key={`mt-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setTopIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 84 : 70} ratio={1.18} />
                  </button>
                ))}
              </div>
              <Arrow className="mm__mobile-arrow" onClick={() => setTopIdx(i => wrapIndex(i + 1, data.tops.length))} label={t(lang, 'nextTop')}>›</Arrow>
            </div>

            <div className="mm__mobile-row">
              <Arrow className="mm__mobile-arrow" onClick={() => setBottomIdx(i => wrapIndex(i - 1, data.bottoms.length))} label={t(lang, 'previousBottom')}>‹</Arrow>
              <div className="mm__mobile-rail">
                {bottomMobile.map(({ item, index, offset }) => (
                  <button key={`mb-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setBottomIdx(index)} aria-label={item.name}>
                    <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 84 : 70} ratio={1.08} />
                  </button>
                ))}
              </div>
              <Arrow className="mm__mobile-arrow" onClick={() => setBottomIdx(i => wrapIndex(i + 1, data.bottoms.length))} label={t(lang, 'nextBottom')}>›</Arrow>
            </div>
          </div>

          <div className="mm__actions">
            <button onClick={handleAddBoth} className={`mm__add${added ? ' mm__add--added' : ''}`}>
              {added ? `${t(lang, 'addedToBagUpper')} ✓` : t(lang, 'addToBagUpper')}
            </button>
          </div>
        </>
      )}

      <style>{`
        .mm { background: #f0eeee; padding: 0.5rem 0.45rem 0.8rem; }
        .mm__header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.12rem; margin-bottom: 0.28rem; }
        .mm__title { margin: 0; max-width: 520px; color: #2497f2; font-size: clamp(0.7rem, 0.48vw + 0.5rem, 0.86rem); line-height: 1.15; font-weight: 800; }
        .mm__tabs { display: flex; align-items: center; gap: 0.65rem; }
        .mm__tab { border: none; border-bottom: 1.5px solid transparent; background: transparent; color: #2d2d2d; font-size: 0.52rem; font-weight: 700; letter-spacing: 0.04em; padding: 0 0 0.1rem; cursor: pointer; }
        .mm__tab--active { color: #123af0; border-bottom-color: currentColor; }
        .mm__loading { min-height: 340px; display: flex; align-items: center; justify-content: center; color: #5f7cb8; font-weight: 700; }
        .mm__desktop { display: block; }
        .mm__mobile { display: none; }
        .mm__grid { display: grid; grid-template-columns: 34px 1fr 170px 1fr 34px; grid-template-rows: auto auto; align-items: center; gap: 0.16rem 0.14rem; max-width: 700px; margin: 0 auto; }
        .mm__arrow, .mm__mobile-arrow { border: none; background: transparent; color: #8d8480; cursor: pointer; transition: color 0.15s; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; }
        .mm__arrow { font-size: 2.35rem; width: 34px; }
        .mm__arrow:hover, .mm__mobile-arrow:hover { color: #333; }
        .r1c1 { grid-column: 1; grid-row: 1; } .r1c5 { grid-column: 5; grid-row: 1; } .r2c1 { grid-column: 1; grid-row: 2; } .r2c5 { grid-column: 5; grid-row: 2; } .r1c2 { grid-column: 2; grid-row: 1; } .r1c4 { grid-column: 4; grid-row: 1; } .r2c2 { grid-column: 2; grid-row: 2; } .r2c4 { grid-column: 4; grid-row: 2; }
        .mm__rail { display: flex; align-items: center; gap: clamp(0.16rem, 0.35vw, 0.28rem); min-width: 0; }
        .mm__rail--left { justify-content: flex-end; } .mm__rail--right { justify-content: flex-start; }
        .mm__focus-card { background: #fff; border: 1px solid #e6e6e6; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: stretch; padding: 0.45rem 0.22rem 0.42rem; min-height: 286px; }
        .mm__focus-card:not(.mm__focus-card--mobile) { grid-column: 3; grid-row: 1 / 3; }
        .mm__tile { border: none; background: transparent; padding: 0; flex: 0 0 auto; cursor: pointer; transition: transform 0.18s ease, opacity 0.18s ease; }
        .mm__tile--far { opacity: 0.68; }
        .mm__tile:hover { transform: translateY(-3px); opacity: 1; }
        .mm-img-shell { display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .mm-img-shell img { width: 100%; height: 100%; filter: drop-shadow(0 5px 12px rgba(0,0,0,0.09)); }
        .mm-fallback { font-size: 3rem; }
        .mm__focus-slot { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 118px; }
        .mm__divider { display: flex; align-items: center; gap: 0.22rem; padding: 0.08rem 0; }
        .mm__divider-line { flex: 1; height: 1px; background: #4a4a4a; }
        .mm__divider-plus { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #3a3a3a; background: #fff; color: #1d1d1d; display: flex; align-items: center; justify-content: center; font-size: 0.66rem; font-weight: 700; flex: 0 0 auto; }
        .mm__actions { display: flex; justify-content: center; margin-top: 0.35rem; }
        .mm__add { min-width: 166px; border: 1px solid #a2a2a2; background: #fff; color: #2e2e2e; font-size: 0.42rem; font-weight: 800; letter-spacing: 0.1em; padding: 0.36rem 0.8rem; cursor: pointer; transition: background 0.18s, border-color 0.18s, color 0.18s; }
        .mm__add:hover { background: #f5f5f5; }
        .mm__add--added { background: #f4fff7; border-color: #39a857; color: #1f7d3b; }
        @media (max-width: 1100px) { .mm__grid { grid-template-columns: 30px 1fr 160px 1fr 30px; gap: 0.14rem 0.12rem; max-width: 640px; } .mm__focus-card:not(.mm__focus-card--mobile) { min-height: 268px; } }
        @media (max-width: 760px) { .mm { display: none; } }
        @media (max-width: 480px) { .mm { padding-left: 0.35rem; padding-right: 0.35rem; } .mm__title { font-size: 0.72rem; } .mm__tabs { gap: 0.5rem; } .mm__focus-card--mobile { width: min(180px, 100%); } .mm__add { min-width: min(260px, 100%); width: 100%; } }
      `}</style>
    </section>
  )
}
