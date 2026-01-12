import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createClient } from 'redis'
 import { Redis } from "@upstash/redis";


 dotenv.config()
const redisClient=new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const app=express();
const port=4000;
const api= process.env.API_KEY

app.use(cors())
app.get('/',async(req,res)=>{
 
    res.json("backend is fine");
})

app.get('/everything',async(req,res)=>{


    const query=req.query.q;
    const cacheData = await redisClient.get(query);
    if(cacheData){
        console.log("from redis")
        return res.json(JSON.parse(cacheData));
    }

    const response =await fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${api}`)
    const data=await response.json();
        console.log("from API")
      await redisClient.setEx(query, 60*60*12, JSON.stringify(data));

    res.json(data);
})

app.listen(port,()=>{
    console.log("listenning at port number :"+port);
})