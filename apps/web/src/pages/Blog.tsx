import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import analytics from '../utils/analytics'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  readTime: string
  publishedAt: string
  category: string
  tags: string[]
}

// Static blog posts for SEO
const blogPosts: BlogPost[] = [
  {
    id: 'ielts-band-7-vs-8-differences',
    title: 'IELTS Band 7 vs Band 8: What Makes the Difference?',
    excerpt: 'Understanding the key differences between Band 7 and Band 8 in IELTS Writing can help you target your improvement efforts effectively.',
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
    excerpt: 'Learn the specific strategies and approaches needed for each type of IELTS Writing task to maximize your band scores.',
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
    excerpt: 'Discover how our advanced AI technology analyzes your IELTS essays and provides accurate band predictions with detailed feedback.',
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

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    analytics.trackPageView('/blog')
  }, [])

  const categories = ['all', ...Array.from(new Set(blogPosts.map(post => post.category.toLowerCase())))]
  
  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category.toLowerCase() === selectedCategory)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                    to={`/blog/${post.id}`}
                    className="text-brand hover:text-brand/80 font-medium"
                    onClick={() => analytics.trackFunnelStep('blog_post_click', { postId: post.id })}
                  >
                    Read More →
                  </Link>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {post.tags.slice(0, 3).map(tag => (
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
