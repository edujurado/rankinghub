export const GA_ID = 'G-0RR1L0RM4X'

export const isGAEnabled = () => Boolean(GA_ID)

export const pageview = (url: string) => {
  if (!isGAEnabled()) return
  // @ts-ignore
  window.gtag('config', GA_ID, {
    page_path: url,
  })
}

export const event = (action: string, category: string, label?: string, value?: number) => {
  if (!isGAEnabled()) return
  // @ts-ignore
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Enhanced GA4 event tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!isGAEnabled()) return
  // @ts-ignore
  window.gtag('event', eventName, parameters)
}

// Track provider views
export const trackProviderView = (providerName: string, category: string) => {
  trackEvent('view_provider', {
    provider_name: providerName,
    provider_category: category,
    event_category: 'engagement'
  })
}

// Track contact form submissions
export const trackContactForm = (providerName?: string, eventType?: string) => {
  trackEvent('contact_form_submit', {
    provider_name: providerName || 'general',
    event_type: eventType || 'inquiry',
    event_category: 'conversion'
  })
}

// Track search queries
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
    event_category: 'engagement'
  })
}

// Track category filters
export const trackCategoryFilter = (category: string) => {
  trackEvent('filter_by_category', {
    category: category,
    event_category: 'engagement'
  })
}


