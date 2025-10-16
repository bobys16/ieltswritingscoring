import { useState, useEffect, useCallback } from 'react'

interface FeedbackData {
  rating: number
  comment: string
  userEmail?: string
}

interface FeedbackState {
  hasShown: boolean
  lastShown: number
  dismissCount: number
  hasSubmitted: boolean
}

const FEEDBACK_STORAGE_KEY = 'bandly_feedback_state'
const FEEDBACK_COOLDOWN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const MAX_DISMISSALS = 3
const MIN_SESSION_TIME = 30000 // 30 seconds minimum session time

export function useFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedbackState, setFeedbackState] = useState<FeedbackState>(() => {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {
        hasShown: false,
        lastShown: 0,
        dismissCount: 0,
        hasSubmitted: false
      }
    } catch {
      return {
        hasShown: false,
        lastShown: 0,
        dismissCount: 0,
        hasSubmitted: false
      }
    }
  })

  const [sessionStartTime] = useState(Date.now())

  // Save feedback state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackState))
    } catch (error) {
      console.warn('Failed to save feedback state:', error)
    }
  }, [feedbackState])

  // Check if we should show feedback
  const shouldShowFeedback = useCallback((): boolean => {
    // Don't show if user has already submitted feedback
    if (feedbackState.hasSubmitted) {
      return false
    }

    // Don't show if user has dismissed too many times
    if (feedbackState.dismissCount >= MAX_DISMISSALS) {
      return false
    }

    // Don't show if shown recently (within cooldown period)
    const now = Date.now()
    if (feedbackState.lastShown && (now - feedbackState.lastShown) < FEEDBACK_COOLDOWN) {
      return false
    }

    // Don't show if session is too short
    if ((now - sessionStartTime) < MIN_SESSION_TIME) {
      return false
    }

    return true
  }, [feedbackState, sessionStartTime])

  // Trigger feedback modal with random chance
  const triggerFeedbackCheck = useCallback((forceShow: boolean = false) => {
    if (forceShow || (shouldShowFeedback() && Math.random() < 0.3)) { // 30% chance
      setIsModalOpen(true)
      setFeedbackState(prev => ({
        ...prev,
        hasShown: true,
        lastShown: Date.now()
      }))
    }
  }, [shouldShowFeedback])

  // Handle modal close (dismiss)
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setFeedbackState(prev => ({
      ...prev,
      dismissCount: prev.dismissCount + 1
    }))
  }, [])

  // Handle feedback submission
  const handleFeedbackSubmit = useCallback(async (feedback: FeedbackData) => {
    try {
      // Send feedback to API
      const token = localStorage.getItem('token')
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Mark as submitted
      setFeedbackState(prev => ({
        ...prev,
        hasSubmitted: true
      }))

      // Track analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'feedback_submitted', {
          event_category: 'engagement',
          value: feedback.rating
        })
      }

    } catch (error) {
      console.error('Failed to submit feedback:', error)
      // Don't throw error to user, just log it
      
      // Still mark as submitted to avoid pestering user
      setFeedbackState(prev => ({
        ...prev,
        hasSubmitted: true
      }))
    }
  }, [])

  // Trigger feedback on specific user actions
  const triggerOnResultView = useCallback(() => {
    // Delay to let user see their results first
    setTimeout(() => triggerFeedbackCheck(), 5000)
  }, [triggerFeedbackCheck])

  const triggerOnFeatureUse = useCallback(() => {
    // Delay for feature completion
    setTimeout(() => triggerFeedbackCheck(), 3000)
  }, [triggerFeedbackCheck])

  const triggerOnPageLeave = useCallback(() => {
    // Quick check before user leaves
    triggerFeedbackCheck()
  }, [triggerFeedbackCheck])

  // Reset feedback state (for testing or admin purposes)
  const resetFeedbackState = useCallback(() => {
    const newState = {
      hasShown: false,
      lastShown: 0,
      dismissCount: 0,
      hasSubmitted: false
    }
    setFeedbackState(newState)
    localStorage.removeItem(FEEDBACK_STORAGE_KEY)
  }, [])

  return {
    isModalOpen,
    setIsModalOpen,
    handleModalClose,
    handleFeedbackSubmit,
    triggerFeedbackCheck,
    triggerOnResultView,
    triggerOnFeatureUse,
    triggerOnPageLeave,
    shouldShowFeedback: shouldShowFeedback(),
    feedbackState,
    resetFeedbackState
  }
}
