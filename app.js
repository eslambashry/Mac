import express from "express"
import color from "@colors/colors"
import cors from 'cors'
import morgan from "morgan";
import { DB } from "./src/DB/DB_connection.js";
import blogsRouter from "./src/modules/blogs/blogs.routes.js";
import userRouter from "./src/modules/auth/auth.routes.js";
import servicesRouter from "./src/modules/services/services.router.js";

const app = express()
const port = process.env.PORT

app.use(morgan("dev"));
app.use(express.json());
app.use('/api/v1/blogs',blogsRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/services', servicesRouter)
DB

app.get('/', (req, res) => res.send('Welcome 💱')) 
app.listen(port, () => console.log(`App Runing On Port 8️⃣ 0️⃣ 8️⃣ 0️⃣ 🔗`.bold.underline.yellow))