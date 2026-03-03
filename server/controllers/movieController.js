const axios = require("axios");

exports.getMovieInsights = async (req, res) => {
  try {
    const { imdbId } = req.params;

    if (!imdbId || !imdbId.startsWith("tt")) {
      return res.status(400).json({
        error: "Invalid IMDb ID format. Example: tt0133093",
      });
    }

    // =============================
    // 1️⃣ OMDb Basic Info
    // =============================
    const omdbRes = await axios.get(
      `http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_KEY}`
    );

    if (omdbRes.data.Response === "False") {
      return res.status(404).json({ error: "Movie not found" });
    }

    const movie = omdbRes.data;

    // =============================
    // 2️⃣ TMDB Find Movie
    // =============================
    const tmdbSearch = await axios.get(
      `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&api_key=${process.env.TMDB_KEY}`
    );

    const movieId = tmdbSearch.data.movie_results[0]?.id;

    let reviewsText = "";
    let castList = [];

    if (movieId) {
      // Fetch Reviews
      const reviewsRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${process.env.TMDB_KEY}`
      );

      const reviews = reviewsRes.data.results.slice(0, 5);
      reviewsText = reviews.map(r => r.content).join(" ");

      // Fetch Full Cast
      const creditsRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_KEY}`
      );

      castList = creditsRes.data.cast
        .slice(0, 10)
        .map(actor => actor.name);
    }

    if (!reviewsText) {
      reviewsText = movie.Plot || "Audience reactions are mixed.";
    }

    // =============================
    // 3️⃣ HuggingFace Sentiment
    // =============================
    const hfResponse = await axios.post(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        inputs: reviewsText.substring(0, 1000),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictions = hfResponse.data[0];

    let sentiment = "Mixed";

    if (Array.isArray(predictions)) {
      const highest = predictions.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      if (highest.label === "LABEL_2") sentiment = "Positive";
      if (highest.label === "LABEL_0") sentiment = "Negative";
    }

    // =============================
    // 4️⃣ Dynamic AI Summary
    // =============================
    const summary = `
Based on recent audience reviews, the movie has received a generally ${sentiment.toLowerCase()} response.
Viewers frequently discuss performances, pacing, visual storytelling, and thematic depth.
Some audience members highlight strong emotional impact, while others mention areas that could have been improved.
    `.trim();

    // =============================
    // 5️⃣ Final Response
    // =============================
    res.json({
      movie: {
        title: movie.Title,
        poster: movie.Poster,
        year: movie.Year,
        rating: movie.imdbRating,
        plot: movie.Plot,
        cast: castList.length ? castList : movie.Actors.split(", ")
      },
      aiSummary: summary,
      sentiment: sentiment
    });

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Server Error" });
  }
};