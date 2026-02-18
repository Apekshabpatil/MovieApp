# MovieApp - Netflix-Style Movie Discovery

A Netflix-inspired frontend app that fetches and displays movies and TV shows from [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Features

- **Search** - Search for movies and TV shows in real-time
- **Browse** - Home, TV Shows, Movies, New & Popular, My List tabs
- **Play** - Watch trailers via YouTube (when available)
- **More Info** - View detailed information in a modal
- **My List** - Save titles to your list (stored in localStorage)
- **Responsive** - Hamburger menu on mobile, profile dropdown

## Setup

1. Clone the repo
2. Create a `.env` file with your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```
3. Get a free API key from [TMDB](https://www.themoviedb.org/settings/api)
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Build

```bash
npm run build
npm run preview
```
