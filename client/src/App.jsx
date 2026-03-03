import { useState } from "react";
import axios from "axios";

function App() {
  const [imdbId, setImdbId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMovie = async () => {
    if (!imdbId) return;

    try {
      setLoading(true);
      setData(null);

      const res = await axios.get(
        `http://localhost:5000/api/movie/${imdbId}`
      );

      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Error fetching movie");
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = {
    Positive: "from-emerald-500 to-green-400",
    Mixed: "from-yellow-500 to-orange-400",
    Negative: "from-red-500 to-pink-500",
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-black blur-3xl"></div>

      <div className="relative z-10">

        {/* HERO */}
        <div className="text-center pt-20 pb-12">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Movie Insight Builder
          </h1>
          <p className="text-gray-400 mt-5 text-lg">
            Enter IMDb ID to unlock cinematic audience insights
          </p>
        </div>

        {/* SEARCH */}
        <div className="flex justify-center mb-20 px-4">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex gap-4 shadow-2xl w-full max-w-3xl">
            <input
              className="flex-1 px-6 py-4 rounded-2xl text-black focus:outline-none text-lg"
              placeholder="tt0111161"
              value={imdbId}
              onChange={(e) => setImdbId(e.target.value)}
            />
            <button
              onClick={fetchMovie}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition rounded-2xl text-lg font-semibold shadow-xl"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center mb-20">
            <div className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* RESULT */}
        {data && (
          <div className="max-w-7xl mx-auto px-6 pb-32 animate-fadeIn">

            <div className="grid md:grid-cols-2 gap-20 items-center">

              {/* POSTER */}
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={data.movie.poster}
                    alt={data.movie.title}
                    className="rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.4)] w-[380px] transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </div>

              {/* DETAILS */}
              <div>
                <h2 className="text-5xl font-bold mb-6">
                  {data.movie.title}
                </h2>

                <div className="flex gap-8 text-gray-400 text-lg mb-6">
                  <span>📅 {data.movie.year}</span>
                  <span>⭐ {data.movie.rating}</span>
                </div>

                <div className={`inline-block px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r ${sentimentColor[data.sentiment]}`}>
                  {data.sentiment} Audience Sentiment
                </div>

                {/* Plot */}
                <div className="mt-10">
                  <h3 className="text-2xl font-semibold mb-4">Plot</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {data.movie.plot}
                  </p>
                </div>

                {/* Cast */}
                <div className="mt-10">
                  <h3 className="text-2xl font-semibold mb-4">Cast</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.movie.cast.map((actor, index) => (
                      <span
                        key={index}
                        className="bg-white/10 border border-white/20 px-5 py-2 rounded-full text-sm text-gray-200 hover:bg-white/20 transition"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* INSIGHT */}
            <div className="mt-24 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl font-semibold mb-6">
                AI Audience Insight
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {data.aiSummary}
              </p>
            </div>

          </div>
        )}

        <div className="text-center text-gray-600 text-sm pb-10">
          Built with React • Node.js • AI Sentiment
        </div>

      </div>
    </div>
  );
}

export default App;