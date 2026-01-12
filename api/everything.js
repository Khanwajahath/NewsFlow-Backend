import { Redis } from "@upstash/redis";

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {

  // ✅ CORS HEADERS (MANDATORY)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    `https://newsapi.org/v2/everything?q=${query}&apiKey=${process.env.API_KEY}`
  );
  const data = await response.json();

  await redisClient.set(cacheKey, data, { ex: 300 });

  return res.status(200).json(data);
}
