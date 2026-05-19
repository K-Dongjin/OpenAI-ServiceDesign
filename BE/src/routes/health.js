import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "openai-service-design-be",
  });
});

export default router;
