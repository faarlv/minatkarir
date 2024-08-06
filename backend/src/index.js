import express from "express";
import cors from "cors";
import UserRoute from "./routes/UserRoute.js";
import dotenv from "dotenv";
import connectToDb from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

// database connection
connectToDb();

//   middleware
app.use(cors());
app.use(express.json());
app.use(UserRoute);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
