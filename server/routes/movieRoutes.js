const express = require("express");
const router = express.Router();
const { getMovieInsights } = require("../controllers/movieController");

router.get("/:imdbId", getMovieInsights);

module.exports = router;