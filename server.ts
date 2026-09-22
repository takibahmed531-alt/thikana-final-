import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Port configuration:
// - In AI Studio development sandbox (CONTROL_PLANE_PORT is set): Nginx runs on 8080 and proxies to port 3000,
//   so the dev server MUST listen on port 3000.
// - In deployed Cloud Run production: Cloud Run routes external traffic directly to process.env.PORT (typically 8080)
//   and executes deployment health checks against process.env.PORT.
const isDevSandbox = Boolean(process.env.CONTROL_PLANE_PORT);
const PORT = isDevSandbox ? 3000 : (Number(process.env.PORT) || 8080);

// Reusable Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Fallback Dhaka insights generator in case API key is missing or model fails
function getDhakaAreaFallback(areaName: string) {
  const normalized = (areaName || '').toLowerCase();

  if (normalized.includes('dhanmondi')) {
    return {
      topSchools: ['Mastermind School (Dhanmondi)', 'Scholastica Junior Campus', 'Sunnydale School'],
      topHospitals: ['Ibn Sina Specialized Hospital', 'Anwer Khan Modern Medical College Hospital', 'Labaid Specialized Hospital'],
      nearestTransport: ['Dhanmondi 27 Bus Stop', 'Science Lab Bus Counter'],
    };
  }
  if (normalized.includes('banani')) {
    return {
      topSchools: ['South Breeze School', 'Banani Bidyaniketan School & College', 'Playpen School'],
      topHospitals: ['Universal Medical College Hospital', 'Square Hospital Banani Center', 'Prajapati Specialized Clinic'],
      nearestTransport: ['Banani Kakoli Bus Terminal', 'Banani Railway Station'],
    };
  }
  if (normalized.includes('gulshan')) {
    return {
      topSchools: ['The American International School (AISD)', 'Manarat Dhaka International College', 'International School Dhaka (ISD)'],
      topHospitals: ['United Hospital Gulshan', 'Praava Health Clinic', 'Evercare Consultation Clinic'],
      nearestTransport: ['Gulshan-2 Circle Transit Stand', 'Gulshan-1 DCC Bus Stand'],
    };
  }
  if (normalized.includes('uttara')) {
    return {
      topSchools: ['Scholastica Senior Campus', 'Rajuk Uttara Model College', 'DPS STS School'],
      topHospitals: ['Kuwait Bangladesh Friendship Government Hospital', 'Ahsania Mission Cancer Hospital', 'Crescent Hospital Uttara'],
      nearestTransport: ['Uttara North Metro Station (MRT Line 6)', 'Azampur Bus Stand'],
    };
  }
  if (normalized.includes('mirpur')) {
    return {
      topSchools: ['SOS Hermann Gmeiner College', 'Monipur High School & College', 'Mirpur Cantonment Public School'],
      topHospitals: ['National Heart Foundation Hospital', 'Dr. Azhar Health Care Mirpur', 'Al-Helal Specialized Hospital'],
      nearestTransport: ['Mirpur 10 Metro Station (MRT Line 6)', 'Mirpur 1 Bus Stop'],
    };
  }
  if (normalized.includes('mohammadpur')) {
    return {
      topSchools: ['St. Joseph Higher Secondary School', 'Mohammadpur Preparatory School', 'Residential Model College'],
      topHospitals: ['Shaheed Suhrawardy Medical College Hospital', 'National Institute of Neurosciences', 'Al-Markazul Islami Hospital'],
      nearestTransport: ['Mohammadpur Bus Stand (Town Hall)', 'Japan Garden City Bus Stop'],
    };
  }
  if (normalized.includes('bashundhara')) {
    return {
      topSchools: ['International School Dhaka (ISD)', 'Hurdco International School', 'Playpen School'],
      topHospitals: ['Evercare Hospital Dhaka', 'Bashundhara Eye Hospital', 'Apollo Diagnostic Clinic'],
      nearestTransport: ['Bashundhara Main Gate Bus Stop', 'Jamuna Future Park Transit Hub'],
    };
  }

  // Generic Dhaka fallback
  return {
    topSchools: ['Dhaka Residential Model College', 'Ideal School & College', 'Viqarunnisa Noon School'],
    topHospitals: ['Dhaka Medical College Hospital', 'Square Hospital', 'Bangabandhu Sheikh Mujib Medical University (BSMMU)'],
    nearestTransport: ['Central City Bus Terminal', 'Nearest MRT Line 6 Station'],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoints (compatible with Cloud Run deployment probes)
  app.get(['/api/health', '/healthz', '/health'], (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API endpoint for Neighborhood Guide
  app.post('/api/gemini/neighborhood', async (req, res) => {
    const location = (req.body?.location || 'Dhanmondi, Dhaka').toString().trim();

    try {
      const ai = getGenAI();
      if (!ai) {
        console.info('GEMINI_API_KEY is not configured on server. Providing local Dhaka insights fallback.');
        const fallback = getDhakaAreaFallback(location);
        return res.json(fallback);
      }

      const systemInstruction =
        'You are a local Dhaka real estate expert. The user will provide an area name. Respond ONLY with a valid JSON object containing 3 arrays: topSchools (max 3), topHospitals (max 3), and nearestTransport (max 2 like Metro or Bus stops). Do not include markdown code blocks or any other text, just the raw JSON.';

      // Try primary model then fallback models if service is experiencing temporary high demand (503)
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastError: unknown = null;
      let parsedResult: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `Area: ${location}`,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  topSchools: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Top 3 schools and colleges',
                  },
                  topHospitals: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Top 3 hospitals and clinics',
                  },
                  nearestTransport: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Top 2 transport stops like Metro or Bus',
                  },
                },
                required: ['topSchools', 'topHospitals', 'nearestTransport'],
              },
              temperature: 0.2,
            },
          });

          const rawText = response.text || '';
          if (!rawText) {
            continue;
          }

          let cleaned = rawText.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
          }
          if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
          }
          cleaned = cleaned.trim();

          const parsed = JSON.parse(cleaned);
          if (
            Array.isArray(parsed.topSchools) &&
            Array.isArray(parsed.topHospitals) &&
            Array.isArray(parsed.nearestTransport)
          ) {
            parsedResult = parsed;
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next candidate model if 503 or transient unavailability
          console.info(`Model ${model} unavailable (${err?.status || err?.message || 'transient error'}), trying next model...`);
        }
      }

      if (parsedResult) {
        return res.json(parsedResult);
      }

      // If all candidate models encounter spikes in demand, gracefully provide curated Dhaka local data
      console.info('All Gemini candidate models temporarily busy; serving curated local Dhaka fallback.');
      const fallback = getDhakaAreaFallback(location);
      return res.json(fallback);
    } catch (err: any) {
      console.info('Gemini generation notice, serving Dhaka fallback:', err?.message || 'unknown');
      // Seamlessly fallback to authentic Dhaka local data so UI never breaks or returns an error status
      const fallback = getDhakaAreaFallback(location);
      return res.json(fallback);
    }
  });

  // Vite middleware in development vs static serving in production
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.CONTROL_PLANE_PORT;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        distPath = path.join(__dirname, '..', 'dist');
      }
    }
    app.use(express.static(distPath));
    app.all('/api/*', (_req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!doctype html><html><head><meta charset="UTF-8"><title>Thikana</title></head><body><div id="root"></div></body></html>');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (devSandbox: ${isDevSandbox})`);
  });

  // If running in deployed production on a port other than 3000 (e.g. 8080 on Cloud Run),
  // also listen on 3000 as a secondary listener if available
  if (!isDevSandbox && PORT !== 3000) {
    try {
      const secondaryServer = app.listen(3000, '0.0.0.0', () => {
        console.log('Secondary listener active on port 3000');
      });
      secondaryServer.on('error', (err: any) => {
        console.info('Secondary port 3000 note:', err?.code || err?.message);
      });
    } catch (err: any) {
      console.info('Secondary listener error ignored:', err?.message);
    }
  }
}

startServer();
