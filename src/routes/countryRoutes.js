import express from "express";
import {
  refresh,
  getAll,
  getOne,
  remove,
  status,
  image
} from "../controllers/countryController.js";

const router = express.Router();

router.post("/countries/refresh", refresh);
router.get("/countries", getAll);
router.get("/countries/:name", getOne);
router.delete("/countries/:name", remove);
router.get("/status", status);
router.get("/countries/image", image);

export default router;
