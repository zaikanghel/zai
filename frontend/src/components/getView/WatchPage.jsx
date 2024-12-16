import React, { useState, useRef } from "react";
import { Home, PlayCircle, Tv, TrendingUp, Plus, Shuffle } from "lucide-react";
import { newThisWeek, trending } from "./dummyData";
import "./Style.css";

const WatchPage = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [showPopup, setShowPopup] = useState(false); // State for video popup

  const videoRef = useRef(null); // Reference for the video element
  
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    // Scroll to the top after setting the selectedMovie
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  };

  const handlePlayClick = () => {
    setShowPopup(true); // Show the popup on click
    console.log(selectedMovie?.videoSrc)
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> 
          <div className="relative w-full max-w-xl rounded-md bg-white p-4 shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleClosePopup} 
            >
              &times;
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={selectedMovie?.videoSrc} 
                title="Dailymotion Video Player"
                allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, overflow: 'hidden', border: 'none' }} 
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 z-40 h-full w-16 bg-black border-r border-gray-800">
        <div className="flex h-full flex-col items-center gap-8 py-8">
          <a href="/" className="text-red-600 hover:text-red-500">
            <img
              src="https://assets.nflxext.com/en_us/icons/nficon2016.ico"
              alt="Netflix"
              className="w-6 h-6"
            />
          </a>
          <div className="flex flex-col gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Home className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <PlayCircle className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Tv className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <TrendingUp className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Plus className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-16">
        {/* Hero Section */}
        {selectedMovie ? (
          <div className="relative min-h-[80vh] w-full">
            <div className="absolute inset-0">
              <img
                src={`https://picsum.photos/200/300?random=${selectedMovie.id}`}
                alt={selectedMovie.title}
                className="w-full h-full object-cover brightness-50"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <h1 className="mt-2 text-4xl font-bold md:text-6xl lg:text-7xl">
                {selectedMovie.title}
                <span className="block text-2xl font-normal md:text-3xl">
                  {selectedMovie.year}
                </span>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                    alt="IMDb"
                    className="h-5 w-10"
                  />
                  <span className="font-semibold">
                    {selectedMovie.rating}/10
                  </span>
                </div>
                <div className="text-red-600">
                  {selectedMovie.streams} Streams
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors" onClick={handlePlayClick}>
                  Play
                </button>
                <button className="px-8 py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors">
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative min-h-[80vh] w-full">
            <div className="absolute inset-0">
              <img
                src="https://wallpapercave.com/wp/wp6201564.jpg"
                alt="Money Heist"
                className="w-full h-full object-cover brightness-50"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-red-600">N</span>
                SERIES
              </div>
              <h1 className="mt-2 text-4xl font-bold md:text-6xl lg:text-7xl">
                MONEY HEIST
                <span className="block text-2xl font-normal md:text-3xl">
                  PART 4
                </span>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                    alt="IMDb"
                    className="h-5 w-10"
                  />
                  <span className="font-semibold">8.8/10</span>
                </div>
                <div className="text-red-600">2B+ Streams</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors">
                  Play
                </button>
                <button className="px-8 py-3 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors">
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New This Week Section */}
        <section className="px-8 py-8">
          <h2 className="mb-4 text-xl font-semibold">New this week</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {newThisWeek.map((movie) => (
                <div
                  key={movie.id}
                  className="relative flex-none cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  <img
                    src={`https://picsum.photos/200/300?random=${movie.id}`}
                    alt={movie.title}
                    className="w-[200px] h-[300px] rounded-md object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-sm font-semibold">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.rating}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="px-8 py-8">
          <h2 className="mb-4 text-xl font-semibold">Trending Now</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {trending.map((movie) => (
                <div
                  key={movie.id}
                  className="relative flex-none cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  <img
                    src={`https://picsum.photos/200/300?random=${movie.id + 100}`}
                    alt={movie.title}
                    className="w-[200px] h-[300px] rounded-md object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-sm font-semibold">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.rating}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WatchPage;
