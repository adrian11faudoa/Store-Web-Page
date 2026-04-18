import { useEffect, useState } from 'react'

const THEME_KEY = 'sahara-kids-theme'

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark'),
  }
}
