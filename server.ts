import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware with large payload limit for PDF base64
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // 1. Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. Gemini-powered Attendance PDF Extraction Endpoint
  app.post("/api/extract-attendance", async (req, res) => {
    try {
      const { pdfBase64, mimeType = "application/pdf", textContent, targetEmployee = "Amit" } = req.body;

      // Check if GEMINI_API_KEY is configured
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Return structured fallback signal so client-side deterministic extraction takes over seamlessly
        return res.json({
          success: false,
          fallbackRequired: true,
          message: "GEMINI_API_KEY not configured or using default placeholder. Fallback parser engaged.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert HR biometric and attendance parser.
Analyze this corporate attendance sheet / document.
Target employee to locate: "${targetEmployee}".

Extract:
1. List of all employees present in document (name, employeeId, department).
2. Detailed daily records for the target employee ("${targetEmployee}"):
   - date: "YYYY-MM-DD"
   - dayName: "Monday", "Tuesday", etc.
   - shift: e.g. "09:00 - 18:00"
   - inTime: "HH:mm" (e.g. "09:04" or "09:04 AM")
   - outTime: "HH:mm" (e.g. "19:42" or "07:42 PM")
   - totalDurationHours: number (e.g. 9.63)
   - workDurationSeconds: integer (e.g. 31080)
   - overtimeSeconds: integer (e.g. 5880)
   - overtimeHours: number (e.g. 1.63)
   - status: One of "PRESENT", "HALF_DAY", "ABSENT", "WEEKLY_OFF", "PAID_HOLIDAY", "LEAVE"
   - remarks: e.g. "Late in 4 min, OT 1h 42m approved"
   - rawPunches: array of punch time strings

Return strict JSON format:
{
  "documentTitle": "Office Attendance Report",
  "period": "August 2026",
  "companyName": "TechCorp Solutions Pvt Ltd",
  "employeesFound": [
    { "name": "Amit Kumar", "employeeId": "EMP-1042", "department": "Engineering" }
  ],
  "targetEmployee": {
    "name": "Amit Kumar",
    "employeeId": "EMP-1042",
    "department": "Engineering",
    "designation": "Senior Engineer",
    "records": [
      {
        "date": "2026-08-03",
        "dayName": "Monday",
        "shift": "09:00 - 18:00",
        "inTime": "09:04 AM",
        "outTime": "07:42 PM",
        "totalDurationHours": 9.63,
        "workDurationSeconds": 31080,
        "overtimeSeconds": 5880,
        "overtimeHours": 1.63,
        "status": "PRESENT",
        "remarks": "On time, +1h 42m OT",
        "rawPunches": ["09:04", "13:30", "14:30", "19:42"]
      }
    ]
  }
}`;

      let contents: any;

      if (pdfBase64) {
        contents = [
          {
            inlineData: {
              mimeType: mimeType,
              data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            },
          },
          { text: prompt },
        ];
      } else if (textContent) {
        contents = [
          { text: `Attendance Document Content:\n${textContent}\n\n${prompt}` },
        ];
      } else {
        return res.status(400).json({ success: false, error: "No PDF data or text content provided." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error("Gemini Attendance Extraction Error:", err);
      return res.json({
        success: false,
        fallbackRequired: true,
        error: err.message || "Failed to process PDF with AI",
      });
    }
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SalaryPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
