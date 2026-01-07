import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// simple test route
app.get("/", (req, res) => {
  res.send("Backend is working");
});
const myAPI=process.env.NEWS_API_KEY
// news proxy route
app.get("/news", async (req, res) => {
  console.log("requst received for breaking news")
  try {
    const query=req.query.q || "technology";
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${myAPI}`
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});
//for sources => to get categories
app.get("/news/categories", async (req, res) => {
  console.log("requst received for categories")
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines/sources?apiKey=${myAPI}`
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

//route for the latest news
app.get("/news/latest", async (req, res) => {
  console.log("requst received for latest news")
  try {
    const category=req.query.category || "technology";
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${myAPI}`
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
