// Simple analytics tracking utility
class Analytics {
  private sessionId: string;
  private baseUrl: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.baseUrl = '/api/analytics';
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Track page views
  trackPageView(page: string, data?: Record<string, any>) {
    this.track('page_view', page, data);
  }

  // Track essay analysis
  trackEssayAnalyze(taskType: string, wordCount: number, bandScore?: number) {
    this.track('essay_analyze', window.location.pathname, {
      taskType,
      wordCount,
      bandScore
    });
  }

  // Track PDF downloads
  trackPdfDownload(reportId: string, bandScore: number) {
    this.track('download_pdf', window.location.pathname, {
      reportId,
      bandScore
    });
  }

  // Track social shares
  trackShare(platform: string, reportId: string, bandScore: number) {
    this.track('share', window.location.pathname, {
      platform,
      reportId,
      bandScore
    });
  }

  // Track user signup/login
  trackAuth(eventType: 'signup' | 'login', plan?: string) {
    this.track(eventType, window.location.pathname, { plan });
  }

  // Track conversion funnel steps
  trackFunnelStep(step: string, data?: Record<string, any>) {
    this.track('funnel_step', window.location.pathname, {
      step,
      ...data
    });
  }

  private async track(eventType: string, page: string, data?: Record<string, any>) {
    try {
      // Don't track in development
      if (window.location.hostname === 'localhost') {
        console.log('📊 Analytics (dev):', { eventType, page, data });
        return;
      }

      await fetch(this.baseUrl + '/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          eventType,
          page,
          data
        })
      });
    } catch (error) {
      // Fail silently for analytics
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Get session ID for debugging
  getSessionId(): string {
    return this.sessionId;
  }
}

// Create global analytics instance
const analytics = new Analytics();

export default analytics;
