import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

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

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API endpoint for Neighborhood Guide
  app.post('/api/gemini/neighborhood', async (req, res) => {
    const location = (req.body?.location || 'Dhanmondi, Dhaka').toString().trim();

    try {
      const ai = getGenAI();
      if (!ai) {
        console.warn('GEMINI_API_KEY is not configured on server. Providing local Dhaka insights fallback.');
        const fallback = getDhakaAreaFallback(location);
        return res.json(fallback);
      }

      const systemInstruction =
        'You are a local Dhaka real estate expert. The user will provide an area name. Respond ONLY with a valid JSON object containing 3 arrays: topSchools (max 3), topHospitals (max 3), and nearestTransport (max 2 like Metro or Bus stops). Do not include markdown code blocks or any other text, just the raw JSON.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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
        throw new Error('Empty response from Gemini API');
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

      // Validate arrays
      if (
        !Array.isArray(parsed.topSchools) ||
        !Array.isArray(parsed.topHospitals) ||
        !Array.isArray(parsed.nearestTransport)
      ) {
        throw new Error('Malformed schema from model');
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Server-side Gemini generation error:', err);
      // Seamlessly fallback to authentic Dhaka local data so UI never shows a 404 or broken state
      const fallback = getDhakaAreaFallback(location);
      return res.json(fallback);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
