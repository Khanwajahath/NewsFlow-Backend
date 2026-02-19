import express from "express";
import cors from "cors";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";

 
dotenv.config();
connectDB();
const app = express();
const api = process.env.API_KEY;
const weatherApi=process.env.WEATHER_API_KEY
// Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Middleware
const corsOptions = {
  origin: "*", // or specify: "http://localhost:5173"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests for all routes
app.options("*", cors(corsOptions));

app.use(express.json());

// ... rest of your routes
 

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
      console.log("from redis for /api/news");
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

app.get("/api/news/top-headlines/sources", async (req, res) => {
  try {
    const cacheKey = "news:sources";
    const cacheData = await redisClient.get(cacheKey);

    if (cacheData) {
      // console.log("from redis for /api/news/top-headlines/sources");
      return res.status(200).json(cacheData);  
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines/sources?apiKey=${api}`
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

app.get("/api/weather", async (req, res) => {
  try {
    const cacheKey = "news:weather";
    const cacheData = await redisClient.get(cacheKey);

    if (cacheData) {
      // console.log("from redis for /api/weather");
      return res.status(200).json(cacheData);  
    }

    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Hyderabad,IN?key=${weatherApi}`
    );

    const data = await response.json();

    await redisClient.set(cacheKey, data, { ex: 10000 });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.use("/api/auth", authRoutes);



// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });


// Export for Vercel
export default app;
