const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const { getTemplates, createTemplate } = require("../services/metaApi");

const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 16 * 1024 * 1024 },
});

// In-memory cache for Meta templates
let templateCache = null;
let templateCacheTime = 0;
const TEMPLATE_CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/templates
 * Fetches approved/pending Meta message templates with in-memory caching
 */
router.get("/", async (req, res) => {
  const forceRefresh = req.query.refresh === "true";
  const now = Date.now();

  if (!forceRefresh && templateCache && now - templateCacheTime < TEMPLATE_CACHE_TTL) {
    return res.json(templateCache);
  }

  try {
    const templates = await getTemplates();
    templateCache = templates;
    templateCacheTime = now;
    res.json(templates);
  } catch (err) {
    console.error("❌ Fetch templates error:", err.message);
    if (templateCache) {
      // Fallback to stale cache on network glitch
      return res.json(templateCache);
    }
    res.status(500).json({ error: err.message || "Failed to fetch templates from Meta Cloud." });
  }
});

/**
 * POST /api/templates
 * Submit a new message template to Meta for review
 */
router.post("/", upload.single("sampleFile"), async (req, res) => {
  try {
    const { name, language, category, text, headerType, headerText, footerText, buttons, sampleUrl } = req.body || {};

    if (!name || !language || !category || !text) {
      return res.status(400).json({ error: "Missing required fields: name, language, category, text." });
    }

    const cleanName = String(name).trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const cleanText = String(text).trim();

    if (!cleanName) {
      return res.status(400).json({ error: "Invalid template name format." });
    }

    let parsedButtons = buttons;
    if (typeof buttons === "string") {
      try {
        parsedButtons = JSON.parse(buttons);
      } catch (e) {
        parsedButtons = [];
      }
    }

    const result = await createTemplate(
      cleanName,
      language,
      category,
      cleanText,
      headerType,
      headerText,
      footerText,
      parsedButtons,
      req.file,
      sampleUrl
    );

    if (req.file) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }

    // Invalidate template cache so subsequent requests get fresh data
    templateCache = null;
    templateCacheTime = 0;

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (req.file) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    console.error("❌ Create template error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create template on Meta Cloud." });
  }
});

module.exports = router;
