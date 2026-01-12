import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
 
 import { Redis } from "@upstash/redis";

app.use(cors())
dotenv.config()

const redisClient=new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const app=express();
const port=4000;
const api= process.env.API_KEY


app.get('/everything', async (req, res) => {
  const query = req.query.q;
  const cacheKey = `news:${query}`; // ✅ consistent key

  const cacheData = await redisClient.get(cacheKey);
  if (cacheData) {
    console.log("from redis");
    return res.json(
  typeof cacheData === "string" ? JSON.parse(cacheData) : cacheData
);

  }

  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&apiKey=${api}`
  );
  const data = await response.json();
  console.log("from API");

  // ✅ correct Upstash SET with expiry
  await redisClient.set(cacheKey, JSON.stringify(data), {
    ex: 60 * 5, // 5 minutes
  });

  res.json(data);
});

app.listen(port,()=>{
    console.log("listenning at port number :"+port);
})