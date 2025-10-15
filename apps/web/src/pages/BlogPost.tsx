import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import analytics from '../utils/analytics'

interface BlogPost {
  id: string
  title: string
  content: string
  readTime: string
  publishedAt: string
  category: string
  tags: string[]
}

// Static blog posts (same as Blog.tsx)
const blogPosts: BlogPost[] = [
  {
    id: 'ielts-band-7-vs-8-differences',
    title: 'IELTS Band 7 vs Band 8: What Makes the Difference?',
    content: `Getting from Band 7 to Band 8 in IELTS Writing requires understanding the subtle but crucial differences that examiners look for.

## Task Achievement (TA)

**Band 7:** Addresses all parts of the task with well-developed ideas and clear position.
**Band 8:** Addresses all parts of the task with well-developed, relevant ideas that are extended and supported.

Key difference: Band 8 requires more sophisticated idea development and stronger supporting evidence.

## Coherence and Cohesion (CC)

**Band 7:** Logically organizes information with clear progression and variety of cohesive devices.
**Band 8:** Sequences information logically with wide range of cohesive devices used naturally.

Key difference: Band 8 writing flows more naturally with seamless transitions.

## Lexical Resource (LR)

**Band 7:** Uses sufficient range of vocabulary with some flexibility and style awareness.
**Band 8:** Uses wide range of vocabulary naturally and flexibly with precise meanings.

Key difference: Band 8 vocabulary is more precise and sophisticated.

## Grammatical Range and Accuracy (GRA)

**Band 7:** Uses variety of complex structures with good control and frequent error-free sentences.
**Band 8:** Uses wide range of structures with flexibility and accuracy, with only occasional errors.

Key difference: Band 8 has fewer errors and more varied sentence structures.

## Practical Tips for Band 8

1. **Develop ideas more deeply** - Don't just state opinions, explain the reasoning behind them
2. **Use more sophisticated vocabulary** - Choose precise words over general ones
3. **Vary sentence structure** - Mix simple, compound, and complex sentences naturally
4. **Perfect your transitions** - Use a wider range of linking words and phrases
5. **Proofread carefully** - Band 8 allows very few grammatical errors

Practice analyzing Band 8 sample essays to understand the level of sophistication required.`,
    readTime: '5 min read',
    publishedAt: '2025-10-15',
    category: 'Tips',
    tags: ['band-improvement', 'scoring', 'writing-tips']
  },
  {
    id: 'task-1-vs-task-2-strategies',
    title: 'IELTS Task 1 vs Task 2: Different Strategies for Success',
    content: `IELTS Writing includes two very different tasks that require distinct approaches and strategies.

## Task 1: Academic Writing

**Purpose:** Describe, summarize or explain information presented in graphs, charts, tables or diagrams.

**Key Strategies:**
- **Overview first:** Always include a clear overview paragraph highlighting main trends
- **Data selection:** Choose the most significant data points, not every detail
- **Comparison:** Compare and contrast different categories or time periods
- **Accurate language:** Use precise vocabulary for describing trends and data

**Common Mistakes:**
- Giving opinions or explanations for the data
- Including too much detail
- Missing the overview
- Inaccurate data reporting

## Task 2: Essay Writing

**Purpose:** Present an argument, discussion, or solution to a given problem or statement.

**Key Strategies:**
- **Clear position:** State your opinion clearly in the introduction
- **Strong arguments:** Develop 2-3 main points with examples and evidence
- **Balanced discussion:** Consider different perspectives where required
- **Logical structure:** Use clear paragraph structure with topic sentences

**Common Mistakes:**
- Unclear or changing position
- Weak or irrelevant examples
- Poor paragraph structure
- Not addressing all parts of the question

## Time Management

**Task 1:** 20 minutes (150 words minimum)
- 5 minutes: Analyze the visual and plan
- 12 minutes: Write
- 3 minutes: Review and check

**Task 2:** 40 minutes (250 words minimum)
- 10 minutes: Plan your essay structure
- 25 minutes: Write
- 5 minutes: Review and edit

## Practice Tips

1. **Task 1:** Practice describing different chart types (line, bar, pie, tables)
2. **Task 2:** Practice different question types (opinion, discussion, problem-solution)
3. Use our AI analyzer to get instant feedback on both task types
4. Focus on your weaker task type for improvement

Remember: Task 2 is worth twice as much as Task 1 in your overall Writing score.`,
    readTime: '6 min read',
    publishedAt: '2025-10-14',
    category: 'Strategy',
    tags: ['task-1', 'task-2', 'writing-strategy', 'time-management']
  },
  {
    id: 'free-ielts-band-calculator-guide',
    title: 'Free IELTS Band Calculator: How Our AI Analysis Works',
    content: `Our free IELTS band calculator uses advanced AI technology to analyze your writing and provide accurate band predictions.

## How Our AI Analysis Works

### 1. Multi-Criteria Assessment
Our AI examiner evaluates your essay across all four official IELTS criteria:
- **Task Achievement (TA):** How well you address the task requirements
- **Coherence and Cohesion (CC):** Organization and flow of ideas
- **Lexical Resource (LR):** Vocabulary range and accuracy
- **Grammatical Range and Accuracy (GRA):** Grammar variety and correctness

### 2. Machine Learning Training
Our AI has been trained on thousands of IELTS essays with verified band scores from certified examiners, achieving 95% accuracy compared to human scoring.

### 3. Natural Language Processing
Advanced NLP algorithms analyze:
- Sentence complexity and variety
- Vocabulary sophistication and accuracy
- Coherence patterns and transitions
- Grammar structures and error frequency

## Features of Our Band Calculator

### Instant Analysis
- Get your band scores in under 60 seconds
- No registration required for basic analysis
- Support for both Task 1 and Task 2 essays

### Detailed Feedback
- Specific suggestions for improvement
- Identification of strengths and weaknesses
- CEFR level mapping (A1-C2)

### Professional Reports
- Downloadable PDF reports
- Shareable results with unique links
- Progress tracking for registered users

## Why Use Our Calculator?

### 1. Save Time and Money
- No need to wait weeks for official results
- Avoid expensive tutoring for initial assessment
- Practice unlimited times for free

### 2. Accurate Predictions
- 95% correlation with official IELTS scores
- Continuous model improvement
- Based on official scoring criteria

### 3. Actionable Feedback
- Specific areas for improvement
- Example corrections and suggestions
- Progress tracking over time

## Getting Started

1. **Paste your essay** into our analyzer
2. **Select task type** (Task 1 or Task 2)
3. **Click analyze** to get instant results
4. **Review feedback** and improvement suggestions
5. **Download your report** for future reference

## Tips for Best Results

- Ensure your essay is 150-320 words
- Use proper paragraph structure
- Include introduction and conclusion
- Proofread before submitting

Try our free IELTS band calculator now and start improving your writing today!`,
    readTime: '4 min read',
    publishedAt: '2025-10-13',
    category: 'Guide',
    tags: ['band-calculator', 'ai-analysis', 'free-tools', 'getting-started']
  }
]

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const post = blogPosts.find(p => p.id === id)

  useEffect(() => {
    if (post) {
      analytics.trackPageView(`/blog/${post.id}`)
      analytics.trackFunnelStep('blog_post_view', { postId: post.id, title: post.title })
    }
  }, [post])

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post Not Found</h1>
          <p className="text-slate-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-brand hover:text-brand/80 font-medium">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
              {blogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 2)
                .map(relatedPost => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
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
                      {relatedPost.content.split('\n')[0].substring(0, 120)}...
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
