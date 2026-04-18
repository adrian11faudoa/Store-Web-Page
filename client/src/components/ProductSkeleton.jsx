export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-card product-card--skeleton">
          <div className="skeleton skeleton--visual" />
          <div className="product-card__body">
            <div className="skeleton skeleton--line" style={{ width: '60%' }} />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
