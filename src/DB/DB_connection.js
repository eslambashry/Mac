import mongoose from "mongoose";
import { config } from 'dotenv'
import path from 'path'
config({path: path.resolve('./config/.env')})

export const DB = mongoose
.connect(process.env.DB_URL)
.then(() => {console.log("DB Connection Done 📶")})
.catch((err) => {console.log("Connection fail 💩")})

