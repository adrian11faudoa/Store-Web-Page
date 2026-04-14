// client/src/store/location.js
// Stores delivery location from browser geolocation or manual entry
import { create } from 'zustand'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem('sk_location') || 'null') } catch { return null }
}

export const useLocation = create((set) => ({
  location: loadSaved(), // { lat, lng, label }
  status: 'idle',        // 'idle' | 'requesting' | 'granted' | 'denied' | 'saved'

  async requestGeolocation() {
    set({ status: 'requesting' })
    if (!navigator.geolocation) {
      set({ status: 'denied' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        // Reverse geocode using browser-free nominatim
        let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const d = await r.json()
          label = d.address?.city || d.address?.town || d.address?.village || d.address?.state || label
          if (d.address?.country) label += `, ${d.address.country}`
        } catch {}
        const loc = { lat, lng, label }
        localStorage.setItem('sk_location', JSON.stringify(loc))
        set({ location: loc, status: 'granted' })
      },
      () => set({ status: 'denied' })
    )
  },

  setManual(label) {
    const loc = { lat: null, lng: null, label }
    localStorage.setItem('sk_location', JSON.stringify(loc))
    set({ location: loc, status: 'saved' })
  },

  clear() {
    localStorage.removeItem('sk_location')
    set({ location: null, status: 'idle' })
  },
}))
