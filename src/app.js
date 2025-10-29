import express from "express";
import router from "./routes/countryRoutes.js";

const app = express();
app.use(express.json());
app.use("/", router);

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error" });
});

export default app;
