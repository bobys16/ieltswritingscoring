# IELTS Band Estimator

A professional web application that estimates IELTS Writing band scores with AI-powered analysis.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS + React Router + Recharts
- **Backend**: Go + Gin + GORM + MySQL + Redis
- **AI**: Server-side OpenAI/Claude integration
- **Infrastructure**: Docker Compose + Nginx

## Development

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

### Backend
```bash
cd apps/api
go run main.go
```

## Features

- ✅ Task 1 & Task 2 essay analysis
- ✅ TA, CC, LR, GRA scoring with overall band
- ✅ CEFR level mapping
- ✅ Detailed feedback and suggestions
- ✅ PDF report generation with QR codes
- ✅ User authentication and history
- ✅ Rate limiting and caching
- ✅ Mobile-responsive design

## License

MIT
