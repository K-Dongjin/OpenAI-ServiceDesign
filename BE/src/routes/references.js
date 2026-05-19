import { Router } from "express";
import { listConsultationLinks, listMinimumWages } from "../services/minimumWageService.js";

const router = Router();

router.get("/minimum-wages", (req, res) => {
  res.json({
    items: listMinimumWages(req.query.year),
  });
});

router.get("/consultation-links", (req, res) => {
  res.json({
    items: listConsultationLinks(),
  });
});

export default router;
