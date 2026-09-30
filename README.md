# AI BlogNest Frontend

A polished React/Vite frontend for the supplied AI BlogNest Express API.

## Features
- Login and registration
- JWT authentication with profile loading
- Public blog feed and search/filter
- Blog detail pages
- Create, edit and delete your own blogs
- Gemini-powered blog generation
- AI summarization
- Responsive dashboard
- Dark editorial UI with glass panels and micro-interactions

## Run

```bash
npm install
npm run dev
```

The backend is expected at `http://localhost:5000` by default.

If your API runs elsewhere, create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API mapping

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/blogs`
- `GET /api/blogs/:id`
- `POST /api/blogs`
- `PUT /api/blogs/:id`
- `DELETE /api/blogs/:id`
- `POST /api/ai/generate-blog`
- `POST /api/ai/summarize`
