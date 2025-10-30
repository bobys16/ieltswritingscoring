import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import analytics from '../utils/analytics'
import apiConfig from '../utils/api'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  readTime: string
  publishedAt: string
  category: string
  tags: string[]
  slug: string
  isPublished: boolean
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Fetch blog posts from database
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await apiConfig.fetch('/blog')
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        
        const data = await response.json()
        const posts = data.posts || []
        
        // Parse tags from JSON strings
        const parsedPosts = posts.map((post: any) => {
          let parsedTags: string[] = []
          if (post.tags) {
            if (typeof post.tags === 'string') {
              parsedTags = post.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
            } else if (Array.isArray(post.tags)) {
              parsedTags = post.tags
            }
          }
          return {
            ...post,
            tags: parsedTags
          }
        })
        
        setBlogPosts(parsedPosts)
      } catch (err) {
        console.error('Failed to fetch blog posts:', err)
        setBlogPosts([])
      }
    }

    fetchBlogPosts()
    analytics.trackPageView('/blog')
  }, [])

  const categories = blogPosts.length > 0
    ? ['all', ...Array.from(new Set(blogPosts.map(post => post.category || 'general')))]
    : ['all']
  
  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts
    : blogPosts.filter(post => (post.category || 'general') === selectedCategory)

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              IELTS Writing <span className="bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">Tips & Guides</span>
            </h1>
            <p className="text-xl text-slate-600">
              Expert advice, strategies, and insights to help you achieve your target IELTS Writing band score.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-slate-500">{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-slate-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <time className="text-sm text-slate-500">
                    {formatDate(post.publishedAt)}
                  </time>
                  
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-brand hover:text-brand/80 font-medium"
                    onClick={() => analytics.trackFunnelStep('blog_post_click', { postId: post.id })}
                  >
                    Read More →
                  </Link>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-brand to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Test Your Writing?</h3>
          <p className="text-lg mb-6 opacity-90">
            Put these tips into practice with our free AI-powered IELTS band calculator
          </p>
          <Link
            to="/analyze"
            className="inline-block px-8 py-3 bg-white text-brand font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => analytics.trackFunnelStep('blog_cta_click')}
          >
            Analyze Your Essay Now
          </Link>
        </section>
      </div>
    </div>
  )
}
