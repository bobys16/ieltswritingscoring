// Performance optimization utilities for better Core Web Vitals

// Lazy loading images
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' },
    { href: '/api/health', as: 'fetch' }
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.as === 'style') {
      link.onload = () => {
        link.rel = 'stylesheet'
      }
    }
    document.head.appendChild(link)
  })
}

// Debounce function for input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// Web Vitals measurement (placeholder - would need web-vitals package)
export function measureWebVitals() {
  // Basic performance measurement
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.startTime}`)
      })
    })
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
  }
}

// Font loading optimization
export function optimizeFontLoading() {
  // Add font-display: swap to critical fonts
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400 700;
      font-display: swap;
      src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
  `
  document.head.appendChild(style)
}

// Critical CSS inlining (for above-the-fold content)
export const criticalCSS = `
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: Inter, sans-serif;
  }
  .skip-to-content {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #3a7afe;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
  }
  .skip-to-content:focus {
    top: 6px;
  }
`

// Performance budget monitoring
export function checkPerformanceBudget() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics = {
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      LCP: 0, // Would be measured via web-vitals
      FID: 0, // Would be measured via web-vitals
      CLS: 0, // Would be measured via web-vitals
      TTFB: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart
    }

    // Budget thresholds (in milliseconds)
    const budget = {
      FCP: 1800, // First Contentful Paint
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      TTFB: 600, // Time to First Byte
      domContentLoaded: 1000,
      loadComplete: 2000
    }

    // Check if metrics exceed budget
    Object.entries(metrics).forEach(([key, value]) => {
      const threshold = budget[key as keyof typeof budget]
      if (value > threshold) {
        console.warn(`Performance budget exceeded for ${key}: ${value}ms (budget: ${threshold}ms)`)
      }
    })

    return metrics
  }
}

// Resource hints for better loading
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: '//api.openai.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
  ]

  hints.forEach(hint => {
    const link = document.createElement('link')
    link.rel = hint.rel
    link.href = hint.href
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin
    }
    document.head.appendChild(link)
  })
}

// Initialize all performance optimizations
export function initializePerformanceOptimizations() {
  setupLazyLoading()
  preloadCriticalResources()
  optimizeFontLoading()
  addResourceHints()
  
  // Measure performance after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      checkPerformanceBudget()
      measureWebVitals()
    }, 1000)
  })
}
