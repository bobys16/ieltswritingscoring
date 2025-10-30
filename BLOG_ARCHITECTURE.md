# Blog System Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     IELTS Band Scorer                           │
│                   Blog System Architecture                      │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┐                    ┌──────────────────┐
│   Frontend    │                    │  Backend API     │
│   (React)     │                    │  (Go/Gin)        │
└───────────────┘                    └──────────────────┘
       │                                     │
       │                                     │
  ┌────┴────────────────────────────────────┴────┐
  │                                              │
  │  GET /api/blog                              │
  │  GET /api/blog/:slug                        │
  │  POST /api/sidigi/blog (admin)              │
  │  PUT /api/sidigi/blog/:id (admin)           │
  │  DELETE /api/sidigi/blog/:id (admin)        │
  │                                              │
  │  GET /sitemap.xml                           │
  │  GET /sitemap_index.xml                     │
  │                                              │
  └────┬────────────────────────────────────────┬────┘
       │                                        │
       ▼                                        ▼
  ┌──────────────┐                    ┌──────────────┐
  │ Pages:       │                    │  Database    │
  │ - /blog      │                    │  (PostgreSQL)│
  │ - /blog/:slug│◄──────────────────►│              │
  │              │                    │ blog_posts   │
  └──────────────┘                    └──────────────┘
                                            ▲
                                            │
                                    ┌───────┴────────┐
                                    │                │
                           ┌────────┴────────┐  ┌────┴─────────┐
                           │  Blog Generator │  │  Query Posts │
                           │    (Cronjob)    │  │  by Slug     │
                           │                 │  │              │
                           │ Runs 2 AM Daily │  │ Ordered by   │
                           │ (Goroutine)     │  │ published_at │
                           └─────────────────┘  └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    Blog Post Flow                               │
└─────────────────────────────────────────────────────────────────┘

FRONTEND FLOW:
──────────────

┌──────────────┐
│ User visits  │
│  /blog       │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Blog.tsx useEffect   │
│ triggers on mount    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Fetch /api/blog      │
│ (GET all posts)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Parse JSON response  │
│ - Parse tags (CSV)   │
│ - Set state          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Render blog list     │
│ - Show title         │
│ - Show excerpt       │
│ - Show category/tags │
│ - Show date/readTime │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User clicks post     │
│ Navigate to          │
│ /blog/:slug          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ BlogPost.tsx loads   │
│ useEffect triggers   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Fetch by slug        │
│ /api/blog/:slug      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Render full post     │
│ - Markdown parsing   │
│ - Show all content   │
│ - Show tags          │
│ - Load related posts │
└──────────────────────┘


BACKEND FLOW - AUTO GENERATION:
───────────────────────────────

┌─────────────────────┐
│ API Server Starts   │
│ main.go             │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ StartBlogGenerationCron()    │
│ Starts background goroutine  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Calculate next 2 AM          │
│ Logs scheduled time          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Sleep until scheduled time   │
│ (background task)            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 2 AM arrives                 │
│ GenerateBlogPosts() runs     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Select random topic from     │
│ getIELTSTopics()             │
│ (5 pre-defined topics)       │
└──────┬───────────────────────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
  ┌─────────┐  ┌──────────┐  ┌────────────┐
  │ English │  │Indonesian│  │ Both have: │
  │ Title   │  │ Title    │  │ - Category │
  │ & Body  │  │ & Body   │  │ - Tags     │
  │         │  │          │  │ - Excerpt  │
  └────┬────┘  └────┬─────┘  │ - ReadTime │
       │             │        └────────────┘
       ▼             ▼
┌─────────────────────────────┐
│ Generate slug from title    │
│ "Title Here" → "title-here" │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Check if post exists        │
│ Query by slug               │
└──────┬──────────────────────┘
       │
    ┌──┴──┐
    │     │
   NO    YES
    │     │
    ▼     ▼
  Create  Skip
  Post  (prevent duplicates)
    │
    ▼
┌─────────────────────────────┐
│ Save to database:           │
│ - title                     │
│ - slug (unique index)       │
│ - excerpt                   │
│ - content                   │
│ - category                  │
│ - tags (CSV format)         │
│ - readTime                  │
│ - publishedAt (NOW())       │
│ - isPublished (true)        │
│ - authorID (1 - admin)      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Log success:                │
│ "Created English blog post" │
│ "Created Indonesian blog..."│
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Sleep 24 hours              │
│ Wait until next 2 AM        │
└─────────────────────────────┘


SITEMAP GENERATION FLOW:
───────────────────────

┌──────────────────────────────┐
│ User/Bot requests            │
│ /sitemap.xml                 │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ GenerateSitemap() handler    │
│ runs                         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Query all published posts    │
│ WHERE is_published = true    │
│ ORDER BY published_at DESC   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Build XML structure:         │
│                              │
│ <urlset>                     │
│   <!-- Static pages -->      │
│   <url>                      │
│     <loc>/</loc              │
│     <priority>1.0</priority> │
│   </url>                     │
│                              │
│   <!-- Blog posts -->        │
│   <url>                      │
│     <loc>/blog/{slug}</loc   │
│     <lastmod>date</lastmod>  │
│     <priority>0.7</priority> │
│   </url>                     │
│ </urlset>                    │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Set response headers:        │
│ Content-Type: application/xml│
│ Cache-Control: 24 hours      │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Return XML to user/bot       │
│ Bot indexes all posts        │
└──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  Database Schema                                │
└─────────────────────────────────────────────────────────────────┘

blog_posts table:
┌──────────────┬──────────┬──────────────────────────┐
│ Column       │ Type     │ Notes                    │
├──────────────┼──────────┼──────────────────────────┤
│ id           │ uint PK  │ Primary Key              │
│ title        │ string   │ Post title (required)    │
│ slug         │ string   │ Unique index, SEO URL    │
│ excerpt      │ text     │ Short preview            │
│ content      │ text     │ Full markdown content    │
│ category     │ string   │ Category (default: gen)  │
│ tags         │ string   │ CSV format: "tag1,tag2"  │
│ read_time    │ string   │ e.g., "5 min"           │
│ is_published │ bool     │ Publication status       │
│ published_at │ *time    │ When published           │
│ author_id    │ uint FK  │ Author (admin) ID        │
│ created_at   │ time     │ Created timestamp        │
│ updated_at   │ time     │ Last updated timestamp   │
└──────────────┴──────────┴──────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  File Structure                                 │
└─────────────────────────────────────────────────────────────────┘

apps/api/
├── internal/
│   ├── blog_generator.go    ← NEW (Cronjob service)
│   ├── sitemap.go           ← NEW (Sitemap generation)
│   ├── handlers.go          ← MODIFIED (Public endpoints)
│   ├── admin_handlers.go    ← MODIFIED (Date ordering)
│   └── models.go            (BlogPost struct)
└── main.go                  ← MODIFIED (Routes + Cronjob)

apps/web/
├── src/pages/
│   ├── Blog.tsx             ← MODIFIED (Dynamic fetching)
│   └── BlogPost.tsx         ← MODIFIED (Post loading)
└── index.html               ← MODIFIED (CSP headers)

docs/
├── BLOG_SYSTEM_GUIDE.md            ← NEW
├── BLOG_TESTING_GUIDE.md           ← NEW
├── BLOG_IMPLEMENTATION_SUMMARY.md  ← NEW
└── (this file)


┌─────────────────────────────────────────────────────────────────┐
│               Technology Stack                                  │
└─────────────────────────────────────────────────────────────────┘

Backend:
├── Go 1.x
├── Gin Web Framework
├── GORM ORM
├── PostgreSQL Database
└── Goroutines for scheduling

Frontend:
├── React 18+
├── TypeScript
├── Axios/Fetch API
├── React Router v6
└── Tailwind CSS

DevOps:
├── Docker (optional)
├── PostgreSQL 14+
└── Linux/macOS servers


Legend:
────
▼     = Flow direction (downward)
◄────► = Bidirectional communication
→     = One-way flow
│     = Connection line
└─┘   = Box boundaries
