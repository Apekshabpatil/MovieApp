import React, { useEffect, useState, useCallback } from "react";
import {
  fetchTrending,
  fetchPopularMovies,
  fetchPopularTv,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchDiscoverByGenre,
  searchMulti,
  fetchMovieDetails,
  fetchTvDetails,
  fetchVideos,
  getImageUrl,
  GENRES,
} from "./api/tmdb.js";
import { getMyList, addToMyList, removeFromMyList, isInMyList } from "./lib/myList.js";
import "./styles.css";

const TABS = { HOME: "home", TV: "tv", MOVIES: "movies", NEW: "new", MYLIST: "mylist" };

function Nav({ onSearchClick, activeTab, onTabChange, onLogoClick, profileOpen, onProfileToggle, menuOpen, onMenuToggle }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`netflix-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-content">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Menu">
          <span className={menuOpen ? "open" : ""}></span>
          <span className={menuOpen ? "open" : ""}></span>
          <span className={menuOpen ? "open" : ""}></span>
        </button>
        <a href="#" className="netflix-logo" onClick={(e) => { e.preventDefault(); onLogoClick?.(); }}>
          NETFLIX
        </a>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <button className={activeTab === TABS.HOME ? "active" : ""} onClick={() => { onTabChange(TABS.HOME); onMenuToggle(); }}>Home</button>
          <button className={activeTab === TABS.TV ? "active" : ""} onClick={() => { onTabChange(TABS.TV); onMenuToggle(); }}>TV Shows</button>
          <button className={activeTab === TABS.MOVIES ? "active" : ""} onClick={() => { onTabChange(TABS.MOVIES); onMenuToggle(); }}>Movies</button>
          <button className={activeTab === TABS.NEW ? "active" : ""} onClick={() => { onTabChange(TABS.NEW); onMenuToggle(); }}>New & Popular</button>
          <button className={activeTab === TABS.MYLIST ? "active" : ""} onClick={() => { onTabChange(TABS.MYLIST); onMenuToggle(); }}>My List</button>
        </div>
        <div className="nav-right">
          <button className="nav-search" onClick={onSearchClick} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          <div className="profile-wrap" onClick={(e) => e.stopPropagation()}>
            <button className="nav-profile" onClick={onProfileToggle} aria-label="Profile">
              <div className="profile-avatar" />
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <a href="#">Account</a>
                <a href="#">Help Center</a>
                <a href="#">Sign out of Netflix</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function SearchOverlay({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchMulti(query);
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(search, 350);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <input
            type="text"
            placeholder="Titles, people, genres"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="search-results">
          {loading && <p className="search-loading">Searching...</p>}
          {!loading && query && results.length === 0 && <p className="search-empty">No results for "{query}"</p>}
          {!loading && results.length > 0 && (
            <div className="search-grid">
              {results.map((item) => (
                <div key={`${item.media_type}-${item.id}`} className="search-result-item" onClick={() => { onSelect(item); onClose(); }}>
                  <img src={getImageUrl(item.poster_path || item.backdrop_path)} alt={item.title || item.name} />
                  <div>
                    <h4>{item.title || item.name}</h4>
                    <span className="media-type">{item.media_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onPlay, onAddToList }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const inList = item ? isInMyList(item) : false;

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    const load = async () => {
      try {
        const type = item.media_type || "movie";
        const data = type === "movie" ? await fetchMovieDetails(item.id) : await fetchTvDetails(item.id);
        setDetails(data);
      } catch {
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [item]);

  if (!item) return null;

  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const backdrop = getImageUrl(details?.backdrop_path || item.backdrop_path, "original");
  const overview = details?.overview || item.overview;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-hero" style={{ backgroundImage: `url(${backdrop})` }}>
          <div className="detail-gradient" />
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          <div className="detail-content">
            <h1>{title}</h1>
            <p className="detail-overview">{overview}</p>
            <div className="detail-actions">
              <button className="hero-btn play" onClick={() => onPlay(item)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z" /></svg>
                Play
              </button>
              <button className="hero-btn more add-list" onClick={() => onAddToList(item)}>
                {inList ? "✓ In My List" : "+ My List"}
              </button>
            </div>
          </div>
        </div>
        {loading && <div className="detail-loading">Loading...</div>}
      </div>
    </div>
  );
}

function TrailerModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="modal-overlay trailer-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close trailer-close" onClick={onClose} aria-label="Close">×</button>
        <iframe src={url} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" allowFullScreen />
      </div>
    </div>
  );
}

function Hero({ movie, onPlay, onMoreInfo }) {
  if (!movie) return null;
  const title = movie.title || movie.name;
  const backdrop = getImageUrl(movie.backdrop_path, "original");
  const overview = movie.overview?.slice(0, 160) + (movie.overview?.length > 160 ? "..." : "");

  return (
    <section className="hero" style={{ backgroundImage: `url(${backdrop})` }}>
      <div className="hero-gradient" />
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-overview">{overview}</p>
        <div className="hero-actions">
          <button className="hero-btn play" onClick={() => onPlay(movie)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z" /></svg>
            Play
          </button>
          <button className="hero-btn more" onClick={() => onMoreInfo(movie)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}

function MovieCard({ item, onClick, onPlay, onAddToList }) {
  const title = item.title || item.name;
  const poster = getImageUrl(item.poster_path);
  const inList = isInMyList(item);

  return (
    <div className="movie-card" onClick={() => onClick(item)}>
      <div className="movie-card-poster">
        <img src={poster} alt={title} loading="lazy" />
        <div className="movie-card-overlay">
          <h3>{title}</h3>
          <p>{item.overview ? (item.overview.slice(0, 100) + (item.overview.length > 100 ? "..." : "")) : ""}</p>
          <div className="movie-card-badges">
            <span className="rating">★ {item.vote_average?.toFixed(1)}</span>
          </div>
          <div className="card-actions">
            <button className="card-btn play" onClick={(e) => { e.stopPropagation(); onPlay(item); }}>▶ Play</button>
            <button className="card-btn add" onClick={(e) => { e.stopPropagation(); onAddToList(item); }}>
              {inList ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieRow({ title, items, onSelect, onPlay, onAddToList }) {
  if (!items?.length) return null;
  return (
    <section className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {items.map((item) => (
          <div key={`${item.media_type || "movie"}-${item.id}`} className="movie-card-wrap">
            <MovieCard item={item} onClick={onSelect} onPlay={onPlay} onAddToList={onAddToList} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [myList, setMyList] = useState(getMyList());
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHome = useCallback(async () => {
    try {
      const [trendRes, popRes, topRes, nowRes, actionRes, comedyRes] = await Promise.all([
        fetchTrending("day"),
        fetchPopularMovies(1),
        fetchTopRatedMovies(1),
        fetchNowPlayingMovies(1),
        fetchDiscoverByGenre(GENRES.ACTION, 1),
        fetchDiscoverByGenre(GENRES.COMEDY, 1),
      ]);
      setTrending(trendRes.results || []);
      setFeatured((trendRes.results || [])[0]);
      setPopular((popRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setTopRated((topRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setNowPlaying((nowRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setAction((actionRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setComedy((comedyRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadTv = useCallback(async () => {
    try {
      setLoading(true);
      const [trendRes, popRes] = await Promise.all([
        fetchTrending("day"),
        fetchPopularTv(1),
      ]);
      const tvTrending = (trendRes.results || []).filter((r) => r.media_type === "tv");
      setTrending(tvTrending.length ? tvTrending : (trendRes.results || []));
      setFeatured((tvTrending[0] || trendRes.results?.[0]));
      setPopularTv((popRes.results || []).map((r) => ({ ...r, media_type: "tv" })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const [popRes, topRes] = await Promise.all([
        fetchPopularMovies(1),
        fetchTopRatedMovies(1),
      ]);
      setPopular((popRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setTopRated((topRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setFeatured((popRes.results || [])[0] ? { ...(popRes.results || [])[0], media_type: "movie" } : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNew = useCallback(async () => {
    try {
      setLoading(true);
      const [nowRes, trendRes] = await Promise.all([
        fetchNowPlayingMovies(1),
        fetchTrending("week"),
      ]);
      setNowPlaying((nowRes.results || []).map((r) => ({ ...r, media_type: "movie" })));
      setTrending((trendRes.results || []));
      setFeatured((trendRes.results || [])[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === TABS.HOME) {
      setLoading(true);
      loadHome().finally(() => setLoading(false));
    } else if (activeTab === TABS.TV) loadTv();
    else if (activeTab === TABS.MOVIES) loadMovies();
    else if (activeTab === TABS.NEW) loadNew();
  }, [activeTab, loadHome, loadTv, loadMovies, loadNew]);

  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDetailItem(null);
        setTrailerUrl(null);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const handleAddToList = (item) => {
    if (isInMyList(item)) {
      removeFromMyList(item);
    } else {
      addToMyList(item);
    }
    setMyList(getMyList());
  };

  const handlePlay = async (item) => {
    setDetailItem(null);
    const type = item.media_type || "movie";
    try {
      const url = await fetchVideos(item.id, type);
      setTrailerUrl(url || null);
      if (!url) alert("No trailer available for this title.");
    } catch {
      alert("Could not load trailer.");
    }
  };

  const handleSelect = (item) => setDetailItem(item);

  const renderContent = () => {
    if (activeTab === TABS.MYLIST) {
      return (
        <main className="movie-rows">
          <MovieRow title="My List" items={myList} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          {!myList.length && (
            <div className="empty-mylist">
              <h2>Your list is empty</h2>
              <p>Add titles you want to watch later by clicking + on any movie or show.</p>
            </div>
          )}
        </main>
      );
    }
    if (activeTab === TABS.TV) {
      return (
        <>
          <Hero movie={featured} onPlay={handlePlay} onMoreInfo={handleSelect} />
          <main className="movie-rows">
            <MovieRow title="Trending TV" items={trending} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
            <MovieRow title="Popular TV Shows" items={popularTv} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          </main>
        </>
      );
    }
    if (activeTab === TABS.MOVIES) {
      return (
        <>
          <Hero movie={featured} onPlay={handlePlay} onMoreInfo={handleSelect} />
          <main className="movie-rows">
            <MovieRow title="Popular Movies" items={popular} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
            <MovieRow title="Top Rated" items={topRated} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          </main>
        </>
      );
    }
    if (activeTab === TABS.NEW) {
      return (
        <>
          <Hero movie={featured} onPlay={handlePlay} onMoreInfo={handleSelect} />
          <main className="movie-rows">
            <MovieRow title="New Releases" items={nowPlaying} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
            <MovieRow title="Trending This Week" items={trending} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          </main>
        </>
      );
    }
    return (
      <>
        <Hero movie={featured} onPlay={handlePlay} onMoreInfo={handleSelect} />
        <main className="movie-rows">
          <MovieRow title="Trending Now" items={trending} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          <MovieRow title="Popular on Netflix" items={popular} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          <MovieRow title="Top Rated" items={topRated} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          <MovieRow title="New Releases" items={nowPlaying} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          <MovieRow title="Action Movies" items={action} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
          <MovieRow title="Comedies" items={comedy} onSelect={handleSelect} onPlay={handlePlay} onAddToList={handleAddToList} />
        </main>
      </>
    );
  };

  if (loading && activeTab === TABS.HOME && !trending.length) {
    return (
      <div className="netflix-app">
        <div className="loader-screen">
          <div className="netflix-loader" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !trending.length) {
    return (
      <div className="netflix-app">
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>{error}</p>
          <p className="hint">Check your API key in .env (VITE_TMDB_API_KEY)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="netflix-app" onClick={() => { setProfileOpen(false); }}>
      <Nav
        onSearchClick={() => setSearchOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogoClick={() => setActiveTab(TABS.HOME)}
        profileOpen={profileOpen}
        onProfileToggle={(e) => { e.stopPropagation(); setProfileOpen((v) => !v); }}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSelect} />
      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onPlay={handlePlay} onAddToList={handleAddToList} />
      <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl(null)} />
      {renderContent()}
    </div>
  );
}
