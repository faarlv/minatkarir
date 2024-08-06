import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const connectToDb = async () => {
  await mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("connect to mongodb");
    })
    .catch((error) => {
      console.log("failed connect to server");
    });
};

export default connectToDb;
