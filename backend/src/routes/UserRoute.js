import express from "express";
import {
  getUsers,
  getUsersById,
  addUser,
  updatedUser,
  deleteUser,
} from "../controller/UserController.js";

const router = express.Router();

router.get("/Minatkarir", getUsers);
router.get("/Minatkarir/:id", getUsersById);
router.post("/Minatkarir", addUser);
router.put("/Minatkarir/:id", updatedUser);
router.delete("/Minatkarir/:id", deleteUser);

export default router;
