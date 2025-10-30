import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import analytics from '../utils/analytics'
import apiConfig from '../utils/api'

interface BlogPost {
  id: number
  title: string
  content: string
  readTime: string
  publishedAt: string
  category: string
  tags: string[]
  slug: string
  excerpt: string
  isPublished: boolean
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch blog post by slug
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        // Try to fetch by slug (id parameter contains the slug)
        const response = await apiConfig.fetch(`/blog/${id}`)
        
        if (!response.ok) {
          throw new Error('Blog post not found')
        }
        
        const data = await response.json()
        const blogPost = data.post
        
        // Parse tags
        let tags: string[] = []
        if (blogPost.tags) {
          if (typeof blogPost.tags === 'string') {
            tags = blogPost.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
          } else if (Array.isArray(blogPost.tags)) {
            tags = blogPost.tags
          }
        }
        
        const parsedPost: BlogPost = {
          ...blogPost,
          tags: tags
        }
        
        setPost(parsedPost)
        setError(null)
        
        // Track analytics
        analytics.trackPageView(`/blog/${blogPost.slug}`)
        analytics.trackFunnelStep('blog_post_view', { postId: blogPost.id, title: blogPost.title })
        
        // Fetch related posts (same category)
        const allPostsResponse = await apiConfig.fetch('/blog')
        if (allPostsResponse.ok) {
          const allPostsData = await allPostsResponse.json()
          const allPosts = (allPostsData.posts || []).map((p: any) => ({
            ...p,
            tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags) : []
          }))
          
          const related = allPosts
            .filter((p: BlogPost) => p.id !== blogPost.id && p.category === blogPost.category)
            .slice(0, 2)
          
          setRelatedPosts(related)
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err)
        setError('Failed to load blog post')
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBlogPost()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-slate-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post Not Found</h1>
          <p className="text-slate-600 mb-4">{error || "The blog post you're looking for doesn't exist."}</p>
          <Link to="/blog" className="text-brand hover:text-brand/80 font-medium">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{line.replace('## ', '')}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-slate-900 mt-6 mb-3">{line.replace('### ', '')}</h3>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-slate-900 mb-2">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="text-slate-700 mb-1">{line.replace('- ', '')}</li>
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return <li key={index} className="text-slate-700 mb-2">{line.replace(/^\d+\. /, '')}</li>
      }
      if (line.trim() === '') {
        return <br key={index} />
      }
      return <p key={index} className="text-slate-700 mb-4 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-8">
            <div className="mb-6">
              <Link 
                to="/blog" 
                className="text-brand hover:text-brand/80 font-medium"
                onClick={() => analytics.trackFunnelStep('blog_back_click')}
              >
                ← Back to Blog
              </Link>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-slate-500">{post.readTime}</span>
              <span className="text-sm text-slate-500">•</span>
              <time className="text-sm text-slate-500">
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {post.title}
            </h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="prose prose-slate max-w-none">
              {renderContent(post.content)}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-brand to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">Ready to Practice?</h3>
            <p className="text-lg mb-6 opacity-90">
              Apply what you've learned with our free AI-powered IELTS band calculator
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/analyze"
                className="inline-block px-8 py-3 bg-white text-brand font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => analytics.trackFunnelStep('blog_post_cta_analyze')}
              >
                Analyze Your Essay
              </Link>
              <Link
                to="/blog"
                className="inline-block px-8 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => analytics.trackFunnelStep('blog_post_cta_more')}
              >
                Read More Tips
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.length > 0 ? (
                relatedPosts.map((relatedPost: BlogPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="block bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-shadow"
                    onClick={() => analytics.trackFunnelStep('blog_related_click', { fromPost: post.id, toPost: relatedPost.id })}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded">
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-slate-500">{relatedPost.readTime}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">{relatedPost.title}</h4>
                    <p className="text-sm text-slate-600">
                      {relatedPost.excerpt.substring(0, 120)}...
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-slate-600 col-span-full">No related articles found.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
