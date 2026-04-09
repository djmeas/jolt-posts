export const useTheme = () => {
  const isDark = useState('isDark', () => true)
  
  const toggle = () => {
    isDark.value = !isDark.value
    if (import.meta.client) {
      document.documentElement.classList.toggle('light', !isDark.value)
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }
  
  const init = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      if (saved) {
        isDark.value = saved === 'dark'
      }
      document.documentElement.classList.toggle('light', !isDark.value)
    }
  }
  
  return { isDark, toggle, init }
}