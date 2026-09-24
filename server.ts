import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Port configuration:
// - Dev sandbox defaults to 3000
// - Cloud Run production provides PORT via process.env.PORT
const PORT = Number(process.env.PORT) || 3000;

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

// Curated Dhaka neighborhood insights dictionary
const dhakaNeighborhoodInsights: Record<string, { education: string[]; healthcare: string[]; recreation: string[]; transportation: string[] }> = {
  dhanmondi: {
    education: ['Dhaka City College', 'University of Liberal Arts Bangladesh (ULAB)', 'Mastermind School', 'Dhanmondi Govt. Boys High School'],
    healthcare: ['Ibn Sina Specialized Hospital', 'Labaid Cardiac Hospital', 'Anwer Khan Modern Medical College', 'Popular Diagnostic Centre'],
    recreation: ['Dhanmondi Lake & Park', 'Rabindra Sarobar', 'Abahani Playground', 'Kalabagan Krira Chakra Field'],
    transportation: ['Dhanmondi 27 Bus Stop', 'Science Lab Intersection', 'Jigatola Bus Stand', 'City College Transit'],
  },
  gulshan_banani: {
    education: ['North South University (Nearby)', 'American International School (AISD)', 'Banani Bidyaniketan', 'South Breeze School'],
    healthcare: ['United Hospital', 'Evercare Hospital', 'Banani Clinic', 'Praava Health'],
    recreation: ['Gulshan Lake Park', 'Justice Shahabuddin Ahmed Park', 'Banani Chairman Bari Field'],
    transportation: ['Kakoli Bus Stand', 'Gulshan 2 Circle', 'Banani Railway Station', 'Notun Bazar Transit'],
  },
  uttara: {
    education: ['Rajuk Uttara Model College', 'IUBAT', 'Scholastica Senior Campus', 'DPS STS School'],
    healthcare: ['Kuwait Bangladesh Friendship Govt Hospital', 'Ahsania Mission Cancer Hospital', 'Radical Hospitals'],
    recreation: ['Sector 4 Central Park', 'Sector 13 Lake', 'Uttara Sector 11 Park', 'Diabari Open Field'],
    transportation: ['Uttara North Metro Station (MRT 6)', 'Hazrat Shahjalal International Airport', 'Airport Railway Station', 'Azampur Bus Stand', 'Abdullahpur Bus Terminal'],
  },
  mirpur: {
    education: ['Bangladesh University of Business and Technology (BUBT)', 'Mirpur Bangla College', 'Monipur High School & College', 'SOS Hermann Gmeiner'],
    healthcare: ['National Heart Foundation', 'OSB Eye Hospital', 'Al-Helal Specialized Hospital', 'Marks Medical College'],
    recreation: ['National Botanical Garden', 'Sher-e-Bangla National Cricket Stadium', 'Bangladesh National Zoo', 'Mirpur 12 DOHS Park'],
    transportation: ['Mirpur 10 Metro Station', 'Mirpur 1 Bus Stand', 'Pallabi Metro Station', 'Gabtoli Bus Terminal (Nearby)'],
  },
  mohammadpur: {
    education: ['Dhaka Residential Model College', 'St. Joseph Higher Secondary School', 'Mohammadpur Preparatory', 'Shyamoli Ideal Polytechnic'],
    healthcare: ['Shaheed Suhrawardy Medical College Hospital', 'National Institute of Neurosciences', 'Al-Markazul Islami Hospital', 'City Hospital'],
    recreation: ['Shyamoli Shishu Mela (DNCC Wonderland)', 'Town Hall Field', 'Zakir Hossain Park', 'Bosila River View Walkway'],
    transportation: ['Mohammadpur Bus Stand', 'Shyamoli Square Transit', 'Japan Garden City Bus Stop', 'Gabtoli Bus Terminal (Nearby)'],
  },
  bashundhara_badda: {
    education: ['North South University (NSU)', 'Independent University, Bangladesh (IUB)', 'Hurdco International School', 'Cambrian College'],
    healthcare: ['Evercare Hospital Dhaka', 'Bashundhara Eye Hospital', 'AMZ Hospital Badda'],
    recreation: ['Bashundhara Sports Complex', 'Bashundhara Block D Park', 'Aftabnagar Main Field', 'Hatirjheel Walkway'],
    transportation: ['Jamuna Future Park Bus Stop', 'Bashundhara Main Gate', 'Badda Link Road', 'Rampura Bridge Transit'],
  },
  motijheel_paltan: {
    education: ['Notre Dame College', 'Ideal School & College', 'Motijheel Govt Boys High School', 'Dhaka University (Nearby)'],
    healthcare: ['Bangabandhu Sheikh Mujib Medical University (BSMMU)', 'Islami Bank Central Hospital', 'BIRDEM General Hospital'],
    recreation: ['Bangabandhu National Stadium', 'Osmani Udyan', 'Ramna Park (Nearby)', 'Motijheel T&T Club Field'],
    transportation: ['Motijheel Metro Station', 'Kamalapur Railway Station', 'Gulishtan Bus Terminal', 'Press Club Metro Station'],
  },
  old_dhaka: {
    education: ['Jagannath University', 'Kabi Nazrul Govt College', 'St. Gregorys High School', 'Pogose School'],
    healthcare: ['Sir Salimullah Medical College (Mitford Hospital)', 'Dhaka National Medical College Hospital', 'Mahanagar General Hospital'],
    recreation: ['Lalbagh Fort Grounds', 'Bahadur Shah Park', 'Ahsan Manzil Grounds'],
    transportation: ['Sadarghat Launch Terminal', 'Babubazar Bridge Transit', 'Ray Saheb Bazar Bus Stand'],
  },
  generic_dhaka: {
    education: ['Local Govt. Degree College', 'Reputed High School', 'Primary Education Institute'],
    healthcare: ['General Hospital', 'Local Community Clinic', '24/7 Pharmacy'],
    recreation: ['Community Playground', 'Sector/Block Park', 'Local Walkway'],
    transportation: ['Main Road Bus Stand', 'City Transit Hub', 'Rickshaw/Auto Stand'],
  },
};

function getDhakaAreaFallback(areaName: string) {
  const location = (areaName || '').toString().toLowerCase();

  let matchedKey = 'generic_dhaka';

  if (location.includes('dhanmondi') || location.includes('jigatola') || location.includes('kalabagan')) matchedKey = 'dhanmondi';
  else if (location.includes('gulshan') || location.includes('banani') || location.includes('baridhara') || location.includes('niketan')) matchedKey = 'gulshan_banani';
  else if (location.includes('uttara') || location.includes('turag') || location.includes('airport')) matchedKey = 'uttara';
  else if (location.includes('mirpur') || location.includes('pallabi') || location.includes('kazipara') || location.includes('kafrul') || location.includes('rupnagar')) matchedKey = 'mirpur';
  else if (location.includes('mohammadpur') || location.includes('shyamoli') || location.includes('adabor') || location.includes('agargaon') || location.includes('kalyanpur')) matchedKey = 'mohammadpur';
  else if (location.includes('bashundhara') || location.includes('badda') || location.includes('rampura') || location.includes('aftabnagar') || location.includes('khilkhet')) matchedKey = 'bashundhara_badda';
  else if (location.includes('motijheel') || location.includes('paltan') || location.includes('shahbagh') || location.includes('faramgate') || location.includes('farmgate') || location.includes('tejgaon') || location.includes('khilgaon') || location.includes('ramna')) matchedKey = 'motijheel_paltan';
  else if (location.includes('lalbagh') || location.includes('kotwali') || location.includes('sutrapur') || location.includes('chowk') || location.includes('wari') || location.includes('bangshal') || location.includes('gandaria')) matchedKey = 'old_dhaka';

  return dhakaNeighborhoodInsights[matchedKey];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoints (compatible with Cloud Run deployment probes)
  app.get(['/api/health', '/healthz', '/health'], (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side Neighborhood Insights endpoint
  app.post('/api/gemini/neighborhood', (req, res) => {
    const location = (req.body?.location || '').toString().toLowerCase();

    let matchedKey = 'generic_dhaka';

    if (location.includes('dhanmondi') || location.includes('jigatola') || location.includes('kalabagan')) matchedKey = 'dhanmondi';
    else if (location.includes('gulshan') || location.includes('banani') || location.includes('baridhara') || location.includes('niketan')) matchedKey = 'gulshan_banani';
    else if (location.includes('uttara') || location.includes('turag') || location.includes('airport')) matchedKey = 'uttara';
    else if (location.includes('mirpur') || location.includes('pallabi') || location.includes('kazipara') || location.includes('kafrul') || location.includes('rupnagar')) matchedKey = 'mirpur';
    else if (location.includes('mohammadpur') || location.includes('shyamoli') || location.includes('adabor') || location.includes('agargaon') || location.includes('kalyanpur')) matchedKey = 'mohammadpur';
    else if (location.includes('bashundhara') || location.includes('badda') || location.includes('rampura') || location.includes('aftabnagar') || location.includes('khilkhet')) matchedKey = 'bashundhara_badda';
    else if (location.includes('motijheel') || location.includes('paltan') || location.includes('shahbagh') || location.includes('faramgate') || location.includes('tejgaon') || location.includes('khilgaon') || location.includes('ramna')) matchedKey = 'motijheel_paltan';
    else if (location.includes('lalbagh') || location.includes('kotwali') || location.includes('sutrapur') || location.includes('chowk') || location.includes('wari') || location.includes('bangshal') || location.includes('gandaria')) matchedKey = 'old_dhaka';

    return res.json(dhakaNeighborhoodInsights[matchedKey]);
  });

  // Automated Email Alert Dispatch Endpoint
  let mailTransporter: any = null;
  function getMailTransporter(): any {
    if (!mailTransporter) {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        mailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Safe JSON / Stream fallback transporter for development and environments without active SMTP
        mailTransporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }
    return mailTransporter;
  }

  // Endpoint to send a property match email alert
  app.post('/api/notifications/property-alert-trigger', async (req, res) => {
    try {
      const { to, subject, html, text, propertyId, alertId, userUid } = req.body || {};

      if (!to || typeof to !== 'string' || !to.includes('@')) {
        return res.status(400).json({ error: 'Valid recipient email address is required.' });
      }

      if (!html || !subject) {
        return res.status(400).json({ error: 'Subject and HTML email content are required.' });
      }

      const transporter = getMailTransporter();
      const fromAddress = process.env.SMTP_FROM || '"Thikana Alerts" <alerts@thikana.app>';

      const mailOptions = {
        from: fromAddress,
        to,
        subject,
        text: text || 'A new property matching your saved preferences has been listed on Thikana.',
        html,
      };

      const sendResult = await transporter.sendMail(mailOptions);
      const isSimulated = !process.env.SMTP_HOST;

      console.log(
        `[Email Alert Dispatch] ${isSimulated ? 'Simulated' : 'Sent'} property match alert to ${to} (Property: ${propertyId || 'N/A'}, Alert: ${alertId || 'N/A'})`
      );

      return res.json({
        success: true,
        status: isSimulated ? 'simulated' : 'sent',
        messageId: sendResult.messageId || `msg_${Date.now()}`,
        recipient: to,
        propertyId,
        alertId,
        userUid,
      });
    } catch (error: any) {
      console.error('[Email Alert Error]:', error);
      return res.status(500).json({
        error: 'Failed to dispatch email alert.',
        details: error?.message || 'Unknown error',
      });
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
    const distPath = path.join(process.cwd(), 'dist');
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
    console.log(`Server running on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer();
