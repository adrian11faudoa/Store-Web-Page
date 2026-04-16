import { useState, useEffect, useCallback } from 'react'
import { mixMatch as mixMatchApi } from '../api.js'
import { useCart } from '../store/index.js'

function ProductImg({ src, bg, name, size, ratio = 1.16, fit = 'contain' }) {
  const [errored, setErrored] = useState(false)
  useEffect(() => { setErrored(false) }, [src])

  return (
    <div
      className="mm-img-shell"
      style={{ width: size, height: size * ratio, background: bg || 'transparent' }}
    >
      {errored || !src ? (
        <span className="mm-fallback" aria-hidden="true">👕</span>
      ) : (
        <img
          src={src} alt={name}
          style={{ width: '100%', height: '100%', objectFit: fit }}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}

function wrapIndex(i, len) {
  if (!len) return 0
  return (i % len + len) % len
}

function getSideItems(items, activeIdx, side) {
  if (!items.length) return []
  const offsets = side === 'left' ? [-2, -1] : [1, 2]
  return offsets.map(offset => ({
    index: wrapIndex(activeIdx + offset, items.length),
    offset,
    item: items[wrapIndex(activeIdx + offset, items.length)],
  }))
}

export default function MixMatch() {
  const add = useCart(state => state.add)
  const [gender, setGender] = useState('girl')
  const [data, setData] = useState({ tops: [], bottoms: [] })
  const [loading, setLoading] = useState(true)
  const [topIdx, setTopIdx] = useState(0)
  const [bottomIdx, setBottomIdx] = useState(0)
  const [added, setAdded] = useState(false)

  const load = useCallback(async g => {
    setLoading(true); setTopIdx(0); setBottomIdx(0)
    try { setData(await mixMatchApi.get(g, 12)) }
    catch { setData({ tops: [], bottoms: [] }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(gender) }, [gender, load])

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

  const topLeft  = getSideItems(data.tops, topIdx, 'left')
  const topRight = getSideItems(data.tops, topIdx, 'right')
  const botLeft  = getSideItems(data.bottoms, bottomIdx, 'left')
  const botRight = getSideItems(data.bottoms, bottomIdx, 'right')

  return (
    <section className="mm">
      <div className="mm__header">
        <h2 className="mm__title">Pick a top, pick a bottom, shop the whole look in one click!</h2>
        <div className="mm__offer">up to 50% off</div>
        <div className="mm__tabs" role="tablist">
          {['girl', 'boy'].map(opt => (
            <button
              key={opt}
              className={`mm__tab${gender === opt ? ' mm__tab--active' : ''}`}
              onClick={() => setGender(opt)} role="tab" aria-selected={gender === opt}
            >{opt.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mm__loading">Loading looks…</div>
      ) : (
        <>
          <div className="mm__grid">
            {/* TOP ROW */}
            <button className="mm__arrow r1c1" onClick={() => setTopIdx(i => wrapIndex(i - 1, data.tops.length))} aria-label="Previous top">‹</button>

            <div className="mm__rail mm__rail--left r1c2">
              {topLeft.map(({ item, index, offset }) => (
                <button key={`tl-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setTopIdx(index)} aria-label={item.name}>
                  <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 128 : 106} ratio={1.18} />
                </button>
              ))}
            </div>

            {/* Focus card: col 3, rows 1-2 */}
            <div className="mm__focus-card">
              <div className="mm__focus-slot">
                {top && <ProductImg src={top.image_url} bg={top.fallback_bg} name={top.name} size={196} ratio={1.18} />}
              </div>
              <div className="mm__divider" aria-hidden="true">
                <span className="mm__divider-line" />
                <span className="mm__divider-plus">+</span>
                <span className="mm__divider-line" />
              </div>
              <div className="mm__focus-slot">
                {bottom && <ProductImg src={bottom.image_url} bg={bottom.fallback_bg} name={bottom.name} size={186} ratio={1.08} />}
              </div>
            </div>

            <div className="mm__rail mm__rail--right r1c4">
              {topRight.map(({ item, index, offset }) => (
                <button key={`tr-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setTopIdx(index)} aria-label={item.name}>
                  <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 128 : 106} ratio={1.18} />
                </button>
              ))}
            </div>

            <button className="mm__arrow r1c5" onClick={() => setTopIdx(i => wrapIndex(i + 1, data.tops.length))} aria-label="Next top">›</button>

            {/* BOTTOM ROW */}
            <button className="mm__arrow r2c1" onClick={() => setBottomIdx(i => wrapIndex(i - 1, data.bottoms.length))} aria-label="Previous bottom">‹</button>

            <div className="mm__rail mm__rail--left r2c2">
              {botLeft.map(({ item, index, offset }) => (
                <button key={`bl-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setBottomIdx(index)} aria-label={item.name}>
                  <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 128 : 106} ratio={1.08} />
                </button>
              ))}
            </div>

            <div className="mm__rail mm__rail--right r2c4">
              {botRight.map(({ item, index, offset }) => (
                <button key={`br-${index}`} className={`mm__tile ${Math.abs(offset) === 1 ? 'mm__tile--near' : 'mm__tile--far'}`} onClick={() => setBottomIdx(index)} aria-label={item.name}>
                  <ProductImg src={item.image_url} bg={item.fallback_bg} name={item.name} size={Math.abs(offset) === 1 ? 128 : 106} ratio={1.08} />
                </button>
              ))}
            </div>

            <button className="mm__arrow r2c5" onClick={() => setBottomIdx(i => wrapIndex(i + 1, data.bottoms.length))} aria-label="Next bottom">›</button>
          </div>

          <div className="mm__actions">
            <button onClick={handleAddBoth} className={`mm__add${added ? ' mm__add--added' : ''}`}>
              {added ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
            </button>
          </div>
        </>
      )}

      <style>{`
        .mm {
          background: #f0eeee;
          padding: 1.2rem 1rem 1.5rem;
        }
        .mm__header {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 0.2rem; margin-bottom: 0.9rem;
        }
        .mm__title {
          margin: 0; max-width: 680px; color: #1f9df0;
          font-size: clamp(0.8rem, 1vw + 0.48rem, 1rem);
          line-height: 1.2; font-weight: 800;
        }
        .mm__offer { color: #123af0; font-size: clamp(0.76rem, 0.5vw + 0.6rem, 0.88rem); font-weight: 800; }
        .mm__tabs { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.1rem; }
        .mm__tab {
          border: none; border-bottom: 1.5px solid transparent;
          background: transparent; color: #2d2d2d;
          font-size: 0.63rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 0 0 0.1rem; cursor: pointer;
        }
        .mm__tab--active { color: #123af0; border-bottom-color: currentColor; }
        .mm__loading {
          min-height: 340px; display: flex; align-items: center;
          justify-content: center; color: #5f7cb8; font-weight: 700;
        }

        /* ── GRID: 5 cols, 2 rows ── */
        .mm__grid {
          display: grid;
          grid-template-columns: 32px 1fr 292px 1fr 32px;
          grid-template-rows: auto auto;
          align-items: center;
          gap: 0.55rem 0.75rem;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* Arrows */
        .mm__arrow {
          border: none; background: transparent; color: #8d8480;
          font-size: 2.3rem; line-height: 1; width: 32px;
          padding: 0; cursor: pointer; transition: color 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .mm__arrow:hover { color: #333; }
        .r1c1 { grid-column: 1; grid-row: 1; }
        .r1c5 { grid-column: 5; grid-row: 1; }
        .r2c1 { grid-column: 1; grid-row: 2; }
        .r2c5 { grid-column: 5; grid-row: 2; }

        /* Rails */
        .mm__rail { display: flex; align-items: center; gap: clamp(0.7rem, 1.4vw, 1.8rem); min-width: 0; }
        .mm__rail--left  { justify-content: flex-end; }
        .mm__rail--right { justify-content: flex-start; }
        .r1c2 { grid-column: 2; grid-row: 1; }
        .r1c4 { grid-column: 4; grid-row: 1; }
        .r2c2 { grid-column: 2; grid-row: 2; }
        .r2c4 { grid-column: 4; grid-row: 2; }

        /* Focus card: center col, both rows */
        .mm__focus-card {
          grid-column: 3; grid-row: 1 / 3;
          background: #fff; border: 1px solid #e6e6e6;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; align-items: stretch;
          padding: 0.85rem 0.5rem 0.75rem;
          min-height: 490px;
        }

        /* Tiles */
        .mm__tile {
          border: none; background: transparent; padding: 0;
          flex: 0 0 auto; cursor: pointer;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .mm__tile--far { opacity: 0.68; }
        .mm__tile:hover { transform: translateY(-3px); opacity: 1; }

        /* Image shell */
        .mm-img-shell {
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .mm-img-shell img {
          width: 100%; height: 100%;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.09));
        }
        .mm-fallback { font-size: 3rem; }

        /* Focus slots */
        .mm__focus-slot {
          flex: 1; display: flex; align-items: center; justify-content: center; min-height: 185px;
        }

        /* Divider */
        .mm__divider { display: flex; align-items: center; gap: 0.28rem; padding: 0.12rem 0; }
        .mm__divider-line { flex: 1; height: 1px; background: #4a4a4a; }
        .mm__divider-plus {
          width: 20px; height: 20px; border-radius: 50%;
          border: 1px solid #3a3a3a; background: #fff; color: #1d1d1d;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 700; flex: 0 0 auto;
        }

        /* Add to bag */
        .mm__actions { display: flex; justify-content: center; margin-top: 0.85rem; }
        .mm__add {
          min-width: 280px; border: 1px solid #a2a2a2; background: #fff;
          color: #2e2e2e; font-size: 0.54rem; font-weight: 800;
          letter-spacing: 0.1em; padding: 0.55rem 1.2rem; cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .mm__add:hover { background: #f5f5f5; }
        .mm__add--added { background: #f4fff7; border-color: #39a857; color: #1f7d3b; }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .mm__grid { grid-template-columns: 28px 1fr 252px 1fr 28px; gap: 0.45rem 0.55rem; }
          .mm__focus-card { min-height: 430px; }
        }

        @media (max-width: 760px) {
          .mm__grid {
            grid-template-columns: 28px 1fr 28px;
            grid-template-rows: auto auto auto auto;
          }
          .mm__focus-card { grid-column: 1 / -1; grid-row: 1; min-height: auto; }
          .r1c1 { grid-column: 1; grid-row: 2; }
          .r1c2 { grid-column: 2; grid-row: 2; }
          .r1c4 { grid-column: 2; grid-row: 2; display: none; }
          .r1c5 { grid-column: 3; grid-row: 2; }
          .r2c1 { grid-column: 1; grid-row: 3; }
          .r2c2 { grid-column: 2; grid-row: 3; }
          .r2c4 { grid-column: 2; grid-row: 3; display: none; }
          .r2c5 { grid-column: 3; grid-row: 3; }
          .mm__rail { overflow-x: auto; justify-content: flex-start; padding-bottom: 0.2rem; }
        }

        @media (max-width: 480px) {
          .mm { padding-left: 0.5rem; padding-right: 0.5rem; }
          .mm__arrow { display: none; }
          .mm__grid { grid-template-columns: 1fr; }
          .mm__focus-card { grid-column: 1; }
          .r1c2, .r1c4, .r2c2, .r2c4 { grid-column: 1; display: flex; }
          .mm__add { min-width: min(260px, 100%); width: 100%; }
        }
      `}</style>
    </section>
  )
}
