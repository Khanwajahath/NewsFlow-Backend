import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Redis } from "@upstash/redis";

dotenv.config();

const app = express();
const port = 4000;

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const api = process.env.API_KEY;

app.use(cors());

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json("backend is fine");
});

app.get("/everything", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  console.log("request received for everything");

  const cacheData = await redisClient.get(query);
  if (cacheData) {
    console.log("from redis");
    return res.json(cacheData);
  }

  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&apiKey=${api}`
  );

  const data = await response.json();
  console.log("from API");

  await redisClient.set(query, data, {
    ex: 60 * 60 * 12, // 12 hours
  });

  res.json(data);
});

app.listen(port, () => {
  console.log("listening at port number :" + port);
});
