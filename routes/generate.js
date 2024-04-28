import express from "express";
import { generateTrip } from "../controllers/generate.js";

const router = express.Router();

router.get("/", generateTrip);
export default router;
