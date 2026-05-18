import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for analysis
  app.post("/api/analyze", async (req, res) => {
    const { url } = req.body;

    if (!url) {
       return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log(`[Server] Starting audit for: ${url}`);
      
      // 1. Fetch HTML
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // 2. Clean up HTML to reduce tokens
      $('script, style, link, svg, iframe').remove();
      const title = $('title').text() || 'Unknown Page';
      const cleanHtml = $('body').html()?.substring(0, 8000) || "No body content found";

      console.log(`[Server] Content fetched, title: ${title}. Sending to Gemini...`);

      // 3. Prompt Gemini
      const prompt = `
        Act as a Senior QA Automation Architect and Lead Security Researcher.
        I am performing an automated audit of a web application.
        Target URL: ${url}
        Page Title: ${title}

        Here is a snippet of the page content (HTML/Text):
        ---
        ${cleanHtml}
        ---

        Tasks:
        1. Identify 5-8 critical automation test scenarios (happy paths, edge cases).
        2. Identify 5-8 potential bugs, UI inconsistencies, or accessibility issues.
        3. Write a professional Executive Case Study summary in Markdown format.

        For each bug, assume the screenshot would be from the target URL: ${url}
        
        Return the response in a strict JSON format with the following structure:
        {
          "scenarios": [
            { "id": "SCEN-001", "name": "Scenario name", "description": "What it tests", "priority": "P0|P1|P2", "complexity": "Low|Medium|High" }
          ],
          "bugs": [
            { "id": "BUG-001", "component": "Login", "issue": "Description", "severity": "Critical|High|Medium|Low", "steps": "Steps to repro" }
          ],
          "caseStudy": "Markdown string here"
        }
      `;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    complexity: { type: Type.STRING }
                  },
                  required: ["id", "name", "description", "priority", "complexity"]
                }
              },
              bugs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    component: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    steps: { type: Type.STRING }
                  },
                  required: ["id", "component", "issue", "severity", "steps"]
                }
              },
              caseStudy: { type: Type.STRING }
            },
            required: ["scenarios", "bugs", "caseStudy"]
          }
        }
      });

      const resText = geminiResponse.text || "{}";
      const result = JSON.parse(resText);
      
      // Enhance results with visual URLs
      const screenshotBase = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1200`;
      result.bugs = result.bugs.map((b: any) => ({
        ...b,
        screenshotUrl: screenshotBase
      }));

      res.json(result);

    } catch (error: any) {
      console.error("[Server Error]", error.message);
      res.status(500).json({ error: "Failed to audit the application. " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
