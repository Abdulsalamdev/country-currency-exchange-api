// import express from "express";
// import router from "./routes/countryRoutes.js";

// const app = express();
// app.use(express.json());
// app.use("/", router);

// app.use((err, req, res, next) => {
//   res.status(500).json({ error: "Internal server error" });
// });

// export default app;

import express from "express";
import router from "./routes/countryRoutes.js";

const app = express();

app.use(express.json());
app.use("/", router);

// ✅ Add this route for Railway root check
app.get("/", (req, res) => {
  res.send("🌍 Country Currency Exchange API is Live!");
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error" });
});

export default app;
