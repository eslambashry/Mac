import express from "express"
import color from "@colors/colors"
import cors from 'cors'
import morgan from "morgan";
import { DB } from "./src/DB/DB_connection.js";


const app = express()
app.use(morgan)

const port = process.env.PORT
DB
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`.bold.underline.yellow))