import express from "express"
import color from "@colors/colors"
import cors from 'cors'
import morgan from "morgan";
import { DB } from "./src/DB/DB_connection.js";
import blogsRouter from "./src/modules/blogs/blogs.routes.js";
import userRouter from "./src/modules/auth/auth.routes.js";
import servicesRouter from "./src/modules/services/services.router.js";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { globalResponse } from "./src/middleware/ErrorHandeling.js";

import { fileURLToPath } from "url";

const app = express()
const port = process.env.PORT

app.use(morgan("dev"));
app.use(cors())
app.use(express.json());
app.use('/api/v1/blogs',blogsRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/services', servicesRouter)
app.use(globalResponse);
DB

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MACC API Documentation  📡",
      version: "1.0.0",
      description: "API documentation for the MACC backend services",
    },
     servers: [
      {
        url: "http://localhost:8080/",
        description: "Local Server",
      },
      {
        url: "https://MACC.vercel.app/",
        description: "Production Server",
      },
    ],
  },
apis: [
  path.join(__dirname, "./src/modules/blogs/blogs.routes.js"),
  path.join(__dirname, "./src/modules/services/services.router.js"),
  path.join(__dirname, "./src/modules/auth/auth.routes.js"),
  path.join(__dirname, "./src/modules/contact_us/contact.routes.js")
]
});


app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>API Docs</title>

      <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css" />

      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>

    <body>
      <div id="swagger-ui"></div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-bundle.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-standalone-preset.min.js"></script>

      <script>
        window.onload = function () {
          SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});


app.get('/', (req, res) => res.send('Welcome 💱')) 
app.listen(port, () => console.log(`App Runing On Port 8️⃣ 0️⃣ 8️⃣ 0️⃣ 🔗`.bold.underline.yellow))