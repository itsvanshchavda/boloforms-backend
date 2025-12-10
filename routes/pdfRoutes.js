import express from "express";
import signPdf from "../controllers/signPdf.js";
import getPdf from "../controllers/getPdf.js";

const router = express.Router();

router.get("/get-pdf", getPdf);

router.post("/sign-pdf", signPdf);

export default router;
