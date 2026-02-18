const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getImageUrl(path, size = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function searchMulti(query, page = 1) {
  if (!query?.trim()) return { results: [] };
  const res = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
  );
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return { ...data, results: (data.results || []).filter((r) => (r.media_type === "movie" || r.media_type === "tv") && (r.poster_path || r.backdrop_path)) };
}

export async function fetchTrending(timeWindow = "day") {
  const res = await fetch(
    `${BASE_URL}/trending/all/${timeWindow}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch trending");
  return res.json();
}

export async function fetchPopularMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
}

export async function fetchPopularTv(page = 1) {
  const res = await fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch popular TV");
  return res.json();
}

export async function fetchTopRatedMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch top rated");
  return res.json();
}

export async function fetchNowPlayingMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  if (!res.ok) throw new Error("Failed to fetch now playing");
  return res.json();
}

export async function fetchDiscoverByGenre(genreId, page = 1, type = "movie") {
  const res = await fetch(
    `${BASE_URL}/discover/${type}?api_key=${API_KEY}&language=en-US&page=${page}&with_genres=${genreId}&sort_by=popularity.desc`
  );
  if (!res.ok) throw new Error("Failed to fetch by genre");
  return res.json();
}

export async function fetchMovieDetails(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export async function fetchTvDetails(id) {
  const res = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch TV show");
  return res.json();
}

export async function fetchVideos(id, type = "movie") {
  const res = await fetch(
    `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch videos");
  const data = await res.json();
  const trailer = (data.results || []).find((v) => v.type === "Trailer" && v.site === "YouTube");
  return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : null;
}

// Genre IDs: 28=Action, 35=Comedy, 27=Horror, 878=Sci-Fi, 53=Thriller
export const GENRES = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  SCIFI: 878,
  THRILLER: 53,
};
