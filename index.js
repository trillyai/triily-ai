import express from "express";
import config from "./config/express.js";
import routes from "./routes/index.js";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB on application startup

try {
  config(app);
  routes(app);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error("Unable to start the application:", err);
  process.exit(1);
}
