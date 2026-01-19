import express from "express";
import cors from "cors";
import { Redis } from "@upstash/redis";

const app = express();
const api=process.env.API_KEY
// Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Middleware
app.use(cors());
app.use(express.json());

// News endpoint
app.get("/api/news", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Missing query param q" });
    }

    const cacheKey = `news:${query}`;
    const cacheData = await redisClient.get(cacheKey);

    if (cacheData) {
      console.log("from redis");
      return res.status(200).json(cacheData);
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${api}`
    );
    const data = await response.json();

    await redisClient.set(cacheKey, data, { ex: 10000 });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "News API with Redis cache" });
});

// Export for Vercel
export default app;