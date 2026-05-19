import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.post("/api/analyze", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log("Analyzing:", url);

      // Fetch target HTML
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        timeout: 15000
      });

      const html = response.data;
      const $ = cheerio.load(html);

      $("script, style, svg, iframe").remove();

      const title = $("title").text() || "Unknown Page";
      const content = $("body").text().replace(/\s+/g, " ").slice(0, 6000);

      const prompt = `
You are an expert QA automation engineer.

Analyze this website:

URL: ${url}
Title: ${title}

Page content:
${content}

Return STRICT valid JSON only:

{
  "scenarios": [
    {
      "id": "SCEN-001",
      "name": "",
      "description": "",
      "priority": "P0",
      "complexity": "Medium"
    }
  ],
  "bugs": [
    {
      "id": "BUG-001",
      "component": "",
      "issue": "",
      "severity": "High",
      "steps": ""
    }
  ],
  "caseStudy": ""
}

Generate:
- 5 test scenarios
- 5 possible bugs
- caseStudy summary
`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const text = geminiResponse.text;

      console.log("Gemini raw:", text);

      let result;

      try {
        result = JSON.parse(text || "{}");
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);

        return res.status(500).json({
          error: "Gemini returned invalid JSON",
          raw: text
        });
      }

      // Add screenshots
      const screenshotBase = `https://s0.wp.com/mshots/v1/${encodeURIComponent(
        url
      )}?w=1200`;

      result.bugs = (result.bugs || []).map((bug: any) => ({
        ...bug,
        screenshotUrl: screenshotBase
      }));

      res.json(result);
    } catch (error: any) {
      console.error("Server Error:", error.message);

      res.status(500).json({
        error: error.message
      });
    }
  });

  // Dev / Prod handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();