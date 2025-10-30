# Blog System - Quick Start Testing Guide

## 🚀 Quick Test (5 minutes)

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8080/health
```
Expected response:
```json
{"ok":true,"database":true,"redis":true}
```

### Step 2: Fetch All Blog Posts
```bash
curl http://localhost:8080/api/blog
```
Should return empty array `{"posts":[]}` initially, or existing posts if any.

### Step 3: Visit Blog Page
1. Open browser: `http://localhost:3000/blog` (or `http://localhost:5173/blog` for Vite dev)
2. Should see a loading spinner then blog list
3. If no posts, you'll see empty state

### Step 4: Create a Test Blog Post (Admin)

Via curl:
```bash
curl -X POST http://localhost:8080/api/sidigi/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Test Blog Post",
    "excerpt": "This is a test blog post",
    "content": "# Heading\n\nThis is test content for the blog post.",
    "category": "Tips",
    "tags": ["test", "blog"],
    "readTime": "3 min read",
    "isPublished": true
  }'
```

Or via UI (if admin dashboard is available):
1. Navigate to `/sidigi/blog`
2. Click "Create Blog Post"
3. Fill in details
4. Toggle "Publish" ON
5. Save

### Step 5: Refresh Blog Page
1. Go back to `/blog`
2. Should now see the new blog post
3. Click "Read More" to view full post

### Step 6: Check Sitemap
```bash
curl http://localhost:8080/sitemap.xml
```

Should return XML with:
- Static pages (home, analyze, blog, login)
- All published blog posts with slug

---

## ⏰ Auto-Generation Test (24 hours)

The blog system automatically generates new posts daily at 2:00 AM UTC.

### To Test Immediately:
**Temporarily modify timing in code:**

File: `apps/api/internal/blog_generator.go` line 72

Change:
```go
next = time.Date(next.Year(), next.Month(), next.Day(), 2, 0, 0, 0, next.Location())
```

To (for 30 seconds from now):
```go
next = time.Now().Add(30 * time.Second)
```

Then:
1. Rebuild and restart API: `go run main.go`
2. Watch logs for: `"Created English blog post:"` and `"Created Indonesian blog post:"`
3. Wait 30 seconds
4. Check `/api/blog` - should have new posts
5. Revert the change back to 2 AM schedule

### Check Database Directly:
```bash
psql -U postgres -d ielts -c "SELECT id, title, is_published, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 5;"
```

---

## 📊 Full End-to-End Test

### Prerequisites:
- ✅ Database running
- ✅ Redis running
- ✅ API server running
- ✅ Frontend development server running

### Test Flow:

**1. Check Health**
```bash
curl http://localhost:8080/health
```

**2. Fetch Blog Posts**
```bash
curl http://localhost:8080/api/blog
```

**3. Visit Blog on Frontend**
- Open `http://localhost:3000/blog`
- See posts loading from database
- Click on a post

**4. Verify Individual Post**
```bash
curl http://localhost:8080/api/blog/your-blog-post-slug
```

**5. Check Sitemap**
```bash
curl http://localhost:8080/sitemap.xml | head -50
```

**6. Monitor Logs**
Watch API server logs for:
- `Next blog generation scheduled for:` (when server starts)
- `Created English blog post:` (when posts are generated)
- `Created Indonesian blog post:` (Indonesian versions)

---

## 🐛 Troubleshooting Quick Fixes

### No Blog Posts Showing?
```bash
# Check if posts exist in database
psql -U postgres -d ielts -c "SELECT COUNT(*) FROM blog_posts;"

# Check if posts are published
psql -U postgres -d ielts -c "SELECT title, is_published FROM blog_posts LIMIT 3;"

# Check API response
curl http://localhost:8080/api/blog | jq .
```

### API Endpoint Returning 404?
```bash
# Verify routes are registered
curl -X OPTIONS http://localhost:8080/api/blog -v

# Check for CORS issues
curl -I http://localhost:8080/api/blog
```

### Frontend Not Fetching?
1. Open browser DevTools (F12)
2. Check Network tab for `/api/blog` request
3. Check Console for errors
4. Verify CSP headers allow localhost:8080

### Sitemap Empty?
```bash
# Check published posts count
psql -U postgres -d ielts -c "SELECT COUNT(*) FROM blog_posts WHERE is_published = true;"

# Manually trigger in database
psql -U postgres -d ielts -c "UPDATE blog_posts SET is_published = true WHERE title LIKE '%Test%';"
```

---

## 📝 Manual Database Insert Test

Create a test blog post directly in database:

```sql
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, read_time, is_published, published_at, author_id, created_at, updated_at)
VALUES (
  'Test Blog Post',
  'test-blog-post',
  'This is a test excerpt',
  '# Test Heading\n\nThis is test content with multiple sections.\n\n## Sub Heading\n\nMore content here.',
  'Tips',
  'test,blog,tutorial',
  '5 min',
  true,
  NOW(),
  1,
  NOW(),
  NOW()
);
```

Then check:
```bash
curl http://localhost:8080/api/blog
curl http://localhost:3000/blog
```

---

## 🔍 Expected Results

### Blog List Response:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Common IELTS Writing Mistakes",
      "slug": "common-ielts-writing-mistakes",
      "excerpt": "...",
      "content": "...",
      "category": "Tips",
      "tags": "writing-tips,mistakes,band-improvement",
      "readTime": "8 min read",
      "publishedAt": "2025-10-29T10:00:00Z",
      "isPublished": true,
      "authorID": 1,
      "createdAt": "2025-10-29T10:00:00Z",
      "updatedAt": "2025-10-29T10:00:00Z"
    }
  ]
}
```

### Individual Post Response:
```json
{
  "post": {
    "id": 1,
    "title": "Common IELTS Writing Mistakes",
    "slug": "common-ielts-writing-mistakes",
    "excerpt": "...",
    "content": "...",
    "category": "Tips",
    "tags": "writing-tips,mistakes,band-improvement",
    "readTime": "8 min read",
    "publishedAt": "2025-10-29T10:00:00Z",
    "isPublished": true,
    "authorID": 1,
    "createdAt": "2025-10-29T10:00:00Z",
    "updatedAt": "2025-10-29T10:00:00Z"
  }
}
```

### Sitemap Structure:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>localhost:8080/</loc>
    <lastmod>2025-10-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bandlyapp.com/blog/common-ielts-writing-mistakes</loc>
    <lastmod>2025-10-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

---

## ✅ Sign-Off Checklist

After completing all tests, verify:

- [ ] Blog posts fetch via API (`/api/blog`)
- [ ] Individual posts fetch by slug (`/api/blog/:slug`)
- [ ] Frontend blog page loads and displays posts
- [ ] Blog post detail page works with related posts
- [ ] Sitemap generates correctly (`/sitemap.xml`)
- [ ] Blog routes in main.go are active
- [ ] Date handling shows correct publish dates
- [ ] Tags parse correctly from database
- [ ] Category filtering works (if implemented)
- [ ] Links use slugs correctly

---

## 🔧 Performance Monitoring

### Monitor API Performance:
```bash
# Time the blog endpoint
time curl http://localhost:8080/api/blog

# Check database query logs
# For PostgreSQL, enable query logging in postgresql.conf
```

### Check Cronjob Status:
Watch API logs for:
- Scheduled time messages
- Successful post creation
- Any errors during generation

---

**Last Updated:** October 29, 2025
**Quick Test Time:** ~5 minutes
**Full Test Time:** ~30 minutes (including auto-generation test)
