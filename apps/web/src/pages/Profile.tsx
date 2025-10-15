import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import analytics from '../utils/analytics'

interface UserProfile {
  id: number
  email: string
  plan: string
  joinedAt: string
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    analytics.trackPageView('/profile')
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEmail(data.user.email)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const updateData: any = {}

      // Email update
      if (email !== profile?.email) {
        updateData.email = email
      }

      // Password update
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match')
          setSaving(false)
          return
        }
        if (newPassword.length < 8) {
          setError('New password must be at least 8 characters long')
          setSaving(false)
          return
        }
        updateData.currentPassword = currentPassword
        updateData.newPassword = newPassword
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save')
        setSaving(false)
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        analytics.trackFunnelStep('profile_updated', {
          emailChanged: !!updateData.email,
          passwordChanged: !!updateData.newPassword
        })
        
        // Refresh profile data
        fetchProfile()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    const confirmation = prompt(
      'Are you sure you want to delete your account? This will permanently delete all your essays and data. Type "DELETE" to confirm:'
    )
    
    if (confirmation !== 'DELETE') {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        analytics.trackFunnelStep('account_deleted')
        localStorage.removeItem('token')
        alert('Your account has been deleted successfully.')
        navigate('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-600">Loading your profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-800 mb-2">Profile not found</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
              <p className="text-slate-600 mt-1">
                Manage your account information and preferences
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        {/* Account Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="text-slate-900">{profile.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
              <span className="inline-flex px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
                {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Plan
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
              <div className="text-slate-900">{formatDate(profile.joinedAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
              <div className="text-slate-500 text-sm font-mono">#{profile.id}</div>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Update Profile</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={updateProfile} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                required
              />
            </div>

            {/* Password Change */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    placeholder="Enter current password to change"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    placeholder="At least 8 characters"
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail(profile.email)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setError('')
                  setSuccess('')
                }}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-800">Export Data</div>
                <div className="text-sm text-slate-600">Download all your essay data and analysis results</div>
              </div>
              <button 
                onClick={() => {
                  analytics.trackFunnelStep('data_export_requested')
                  alert('Data export feature coming soon!')
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-800">Logout</div>
                <div className="text-sm text-slate-600">Sign out of your account on this device</div>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Logout
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <div className="font-medium text-red-800">Delete Account</div>
                <div className="text-sm text-red-600">Permanently delete your account and all data</div>
              </div>
              <button 
                onClick={deleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
