import express from "express";
import cors from "cors";
import morgan from "morgan";

import reviewsRouter from "./routes/reviews.ts";
import propertiesRouter from "./routes/properties.ts";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//
// endpoints
//
// GET /hostway
// GET /:id
// PATCH /:id
// POST /seed
//

app.use("/api/reviews", reviewsRouter);

//
// endpoints
//
// GET /
// GET /:id
// GET /:id/reviews
// POST /seed
//

app.use("/api/properties", propertiesRouter);

// for checking the api server is running
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
