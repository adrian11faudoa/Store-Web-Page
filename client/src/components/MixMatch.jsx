import { useState, useEffect, useCallback } from 'react'
import { mixMatch as mixMatchApi } from '../api.js'
import { useCart } from '../store/index.js'

function ProductImg({ src, bg, name, size, ratio = 1.16, fit = 'contain' }) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  return (
    <div
      className="mm-builder__image-shell"
      style={{
        width: size,
        height: size * ratio,
        background: bg || 'transparent',
      }}
    >
      {errored || !src ? (
        <span className="mm-builder__fallback" aria-hidden="true">👕</span>
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

function getRailItems(items, activeIdx) {
  if (!items.length) return []

  return [-2, -1, 1, 2].map(offset => {
    const index = wrapIndex(activeIdx + offset, items.length)
    return {
      index,
      offset,
      item: items[index],
    }
  })
}

function Arrow({ direction, onClick, label }) {
  return (
    <button className="mm-builder__arrow" onClick={onClick} aria-label={label}>
      {direction === 'left' ? '‹' : '›'}
    </button>
  )
}

function Rail({ items, activeIdx, onSelect, row, side }) {
  const railItems = getRailItems(items, activeIdx).filter(entry =>
    side === 'left' ? entry.offset < 0 : entry.offset > 0
  )

  return (
    <div className={`mm-builder__rail mm-builder__rail--${side}`}>
      {railItems.map(({ item, index, offset }) => {
        const nearCenter = Math.abs(offset) === 1
        const size = row === 'top'
          ? (nearCenter ? 146 : 178)
          : (nearCenter ? 140 : 162)

        return (
          <button
            key={`${row}-${item.id}-${offset}`}
            className="mm-builder__tile"
            onClick={() => onSelect(index)}
            aria-label={item.name}
          >
            <ProductImg
              src={item.image_url}
              bg={item.fallback_bg}
              name={item.name}
              size={size}
              ratio={row === 'top' ? 1.16 : 1.08}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function MixMatch() {
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
      const response = await mixMatchApi.get(currentGender, 12)
      setData(response)
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

  function shiftTop(step) {
    setTopIdx(current => wrapIndex(current + step, data.tops.length))
  }

  function shiftBottom(step) {
    setBottomIdx(current => wrapIndex(current + step, data.bottoms.length))
  }

  function handleAddBoth() {
    if (!top || !bottom) return

    add({ ...top, selectedSize: top.sizes?.[0] || null })
    add({ ...bottom, selectedSize: bottom.sizes?.[0] || null })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!loading && data.tops.length === 0 && data.bottoms.length === 0) return null

  return (
    <section className="mm-builder">
      <div className="mm-builder__header">
        <h2 className="mm-builder__title">Pick a top, pick a bottom, shop the whole look in one click!</h2>
        <div className="mm-builder__offer">up to 50% off</div>
        <div className="mm-builder__tabs" role="tablist" aria-label="Mix and match by gender">
          {['girl', 'boy'].map(option => (
            <button
              key={option}
              className={`mm-builder__tab${gender === option ? ' mm-builder__tab--active' : ''}`}
              onClick={() => setGender(option)}
              role="tab"
              aria-selected={gender === option}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mm-builder__loading">Loading looks...</div>
      ) : (
        <>
          <div className="mm-builder__stage">
            <div className="mm-builder__row">
              <Arrow direction="left" onClick={() => shiftTop(-1)} label="Previous top" />
              <Rail items={data.tops} activeIdx={topIdx} onSelect={setTopIdx} row="top" side="left" />
              <div className="mm-builder__focus-card">
                {top && (
                  <div className="mm-builder__focus-slot mm-builder__focus-slot--top">
                    <ProductImg
                      src={top.image_url}
                      bg={top.fallback_bg}
                      name={top.name}
                      size={182}
                      ratio={1.18}
                    />
                  </div>
                )}

                <div className="mm-builder__divider" aria-hidden="true">
                  <span className="mm-builder__divider-line" />
                  <span className="mm-builder__divider-plus">+</span>
                  <span className="mm-builder__divider-line" />
                </div>

                {bottom && (
                  <div className="mm-builder__focus-slot mm-builder__focus-slot--bottom">
                    <ProductImg
                      src={bottom.image_url}
                      bg={bottom.fallback_bg}
                      name={bottom.name}
                      size={174}
                      ratio={1.08}
                    />
                  </div>
                )}
              </div>
              <Rail items={data.tops} activeIdx={topIdx} onSelect={setTopIdx} row="top" side="right" />
              <Arrow direction="right" onClick={() => shiftTop(1)} label="Next top" />
            </div>

            <div className="mm-builder__row">
              <Arrow direction="left" onClick={() => shiftBottom(-1)} label="Previous bottom" />
              <Rail items={data.bottoms} activeIdx={bottomIdx} onSelect={setBottomIdx} row="bottom" side="left" />
              <div className="mm-builder__focus-spacer" aria-hidden="true" />
              <Rail items={data.bottoms} activeIdx={bottomIdx} onSelect={setBottomIdx} row="bottom" side="right" />
              <Arrow direction="right" onClick={() => shiftBottom(1)} label="Next bottom" />
            </div>
          </div>

          <div className="mm-builder__actions">
            <button
              onClick={handleAddBoth}
              className={`mm-builder__add${added ? ' mm-builder__add--added' : ''}`}
            >
              {added ? 'ADDED TO BAG' : 'ADD TO BAG'}
            </button>
          </div>
        </>
      )}

      <style>{`
        .mm-builder {
          background: #f8f5f5;
          padding: 0.2rem 0.9rem 1rem;
          border-radius: 0;
        }

        .mm-builder__header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.28rem;
          margin-bottom: 0.35rem;
        }

        .mm-builder__title {
          margin: 0;
          max-width: 700px;
          color: #1f9df0;
          font-size: clamp(0.88rem, 0.58vw + 0.72rem, 1.08rem);
          line-height: 1.15;
          font-weight: 800;
        }

        .mm-builder__offer {
          color: #123af0;
          font-size: clamp(0.82rem, 0.42vw + 0.68rem, 0.94rem);
          font-weight: 800;
        }

        .mm-builder__tabs {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .mm-builder__tab {
          border: none;
          border-bottom: 1px solid transparent;
          background: transparent;
          color: #2d2d2d;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0 0 0.14rem;
        }

        .mm-builder__tab--active {
          color: #123af0;
          border-bottom-color: currentColor;
        }

        .mm-builder__loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5f7cb8;
          font-weight: 700;
        }

        .mm-builder__stage {
          display: grid;
          gap: 1.05rem;
          max-width: 1580px;
          margin: 0 auto;
        }

        .mm-builder__row {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) 284px minmax(0, 1fr) 28px;
          align-items: center;
          gap: 0.75rem;
        }

        .mm-builder__rail {
          display: flex;
          align-items: center;
          gap: clamp(1.1rem, 2vw, 2.3rem);
          min-width: 0;
        }

        .mm-builder__rail--left {
          justify-content: flex-end;
        }

        .mm-builder__rail--right {
          justify-content: flex-start;
        }

        .mm-builder__tile {
          border: none;
          background: transparent;
          padding: 0;
          flex: 0 0 auto;
          transition: transform 0.18s ease;
        }

        .mm-builder__tile:hover {
          transform: translateY(-2px);
        }

        .mm-builder__image-shell {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .mm-builder__image-shell img {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.08));
        }

        .mm-builder__fallback {
          font-size: 3rem;
        }

        .mm-builder__arrow {
          border: none;
          background: transparent;
          color: #8d8480;
          font-size: 2.4rem;
          line-height: 1;
          width: 28px;
          height: 48px;
          padding: 0;
        }

        .mm-builder__focus-card {
          grid-row: span 2;
          background: #fff;
          border: 1px solid #ededed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          min-height: 480px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.82rem 0.4rem 0.72rem;
        }

        .mm-builder__focus-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 208px;
        }

        .mm-builder__divider {
          display: flex;
          align-items: center;
          gap: 0.28rem;
          margin: 0.1rem 0 0.15rem;
        }

        .mm-builder__divider-line {
          flex: 1;
          height: 1px;
          background: #545454;
        }

        .mm-builder__divider-plus {
          width: 19px;
          height: 19px;
          border-radius: 999px;
          border: 1px solid #404040;
          background: #fff;
          color: #1d1d1d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .mm-builder__focus-spacer {
          min-height: 1px;
        }

        .mm-builder__actions {
          display: flex;
          justify-content: center;
          margin-top: 0.38rem;
        }

        .mm-builder__add {
          min-width: 276px;
          border: 1px solid #a2a2a2;
          background: #fff;
          color: #2e2e2e;
          font-size: 0.52rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.5rem 1rem;
        }

        .mm-builder__add--added {
          background: #f4fff7;
          border-color: #39a857;
          color: #1f7d3b;
        }

        @media (max-width: 1280px) {
          .mm-builder__row {
            grid-template-columns: 24px minmax(0, 1fr) 244px minmax(0, 1fr) 24px;
            gap: 0.55rem;
          }

          .mm-builder__focus-card {
            min-height: 432px;
          }

          .mm-builder__rail {
            gap: 0.9rem;
          }
        }

        @media (max-width: 980px) {
          .mm-builder__stage {
            gap: 1rem;
          }

          .mm-builder__row {
            grid-template-columns: 26px 1fr 26px;
          }

          .mm-builder__focus-card {
            grid-row: auto;
            grid-column: 1 / -1;
            order: -1;
            min-height: auto;
          }

          .mm-builder__focus-spacer {
            display: none;
          }

          .mm-builder__rail {
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 0.2rem;
          }
        }

        @media (max-width: 640px) {
          .mm-builder {
            padding-left: 0.55rem;
            padding-right: 0.55rem;
          }

          .mm-builder__row {
            grid-template-columns: 1fr;
          }

          .mm-builder__arrow {
            display: none;
          }

          .mm-builder__title {
            max-width: 22rem;
          }

          .mm-builder__focus-card {
            order: 0;
          }

          .mm-builder__add {
            min-width: min(258px, 100%);
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
