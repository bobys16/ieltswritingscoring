import { useState, useEffect } from "react"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => void
}

interface FeedbackData {
  rating: number
  comment: string
  userEmail?: string
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating')

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setRating(0)
      setHoveredRating(0)
      setComment("")
      setUserEmail("")
      setStep('rating')
      setIsSubmitting(false)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating)
    if (selectedRating >= 4) {
      // For high ratings, proceed directly to success
      setTimeout(() => setStep('details'), 500)
    } else {
      // For lower ratings, ask for more details
      setTimeout(() => setStep('details'), 500)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        userEmail: userEmail.trim()
      })
      
      setStep('success')
      
      // Auto close after success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      // Still show success to user, but log error
      setStep('success')
      setTimeout(() => {
        onClose()
      }, 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (interactive: boolean = true) => {
    return (
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoveredRating || rating)
          return (
            <button
              key={star}
              type="button"
              className={`text-4xl transition-all duration-200 ${
                interactive ? 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md' : ''
              } ${
                filled ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => interactive && handleRatingSelect(star)}
              onMouseEnter={() => interactive && setHoveredRating(star)}
              onMouseLeave={() => interactive && setHoveredRating(0)}
              disabled={!interactive}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              ⭐
            </button>
          )
        })}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-full p-1"
          aria-label="Close feedback modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'rating' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 id="feedback-title" className="text-2xl font-bold text-gray-900 mb-2">
                How was your experience?
              </h2>
              <p className="text-gray-600">
                Your feedback helps us improve BandLy for everyone
              </p>
            </div>

            {renderStars()}

            <p className="text-sm text-gray-500">
              Click a star to rate your experience
            </p>
          </div>
        )}

        {step === 'details' && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {rating >= 4 ? 'Tell us what you loved!' : 'Help us improve'}
              </h2>
              {renderStars(false)}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  {rating >= 4 ? 'What did you love about BandLy?' : 'What could we do better?'} (Optional)
                </label>
                <textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={rating >= 4 ? 
                    "Tell us what made your experience great..." : 
                    "Tell us how we can improve your experience..."
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {comment.length}/500
                </div>
              </div>

              <div>
                <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="feedback-email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
                <p className="text-xs text-gray-500 mt-1 text-left">
                  We'll only use this to follow up on your feedback
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('rating')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-gray-600">
              {rating >= 4 ? 
                "We're thrilled you had a great experience!" : 
                "We appreciate your input and will work to improve."
              }
            </p>
            {rating >= 4 && (
              <p className="text-sm text-gray-500 mt-3">
                Consider sharing BandLy with friends who are preparing for IELTS!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
