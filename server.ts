import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent startup crash if GEMINI_API_KEY is not set.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// 1. Health check & API state
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 2. Multilingual Assistant Persona Chat (with conversation history support)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, persona, history } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = '';
    if (persona === 'fan') {
      systemInstruction = `You are the official FIFA World Cup 2026 Multilingual Fan Assistant. Your goal is to help fans navigate the stadium, find facilities (concessions, seating gates, restrooms, medical points, accessible ramps), understand transit schedules (shuttles, rails, ride-hailing), and make their experience fantastic. Respond in the fan's preferred language (English, Spanish, or French). Be extremely polite, use brief bullet points for steps, and keep answers concise so they are readable on a mobile screen in a crowded stadium. Always prioritize spectator safety and comfort.`;
    } else if (persona === 'organizer') {
      systemInstruction = `You are the FIFA World Cup 2026 Operations Command Advisor. Your role is to assist organizers and venue staff with crowd management, queue mitigation, safety protocols, incident resolution, and emergency drafting. Provide analytical, crisp, objective, and safety-focused guidance. Avoid fluff; use professional logistics terminology.`;
    } else if (persona === 'volunteer') {
      systemInstruction = `You are the FIFA World Cup 2026 Volunteer Support Lead. Your role is to guide venue volunteers with ticket scanning protocols, queue coordination, lost-and-found policies, guest reception, and translation practices. Keep responses encouraging, step-by-step, warm, and highly actionable.`;
    } else {
      systemInstruction = `You are an operational assistant for the FIFA World Cup 2026.`;
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

// 3. Command Center Incident Assessor (returns structured security and crowd rerouting details)
app.post('/api/gemini/incident-assess', async (req, res) => {
  try {
    const { title, description, location, severity } = req.body;
    const ai = getGeminiClient();

    const prompt = `Assess the following stadium incident during the FIFA World Cup 2026:
    Incident Title: "${title}"
    Description: "${description}"
    Location: "${location}"
    Initial Reported Severity Level: "${severity}"
    
    Please analyze this incident and provide a structured JSON response covering calculated threat score, risk level, physical containment protocols, instructions for nearby volunteers, re-routing plans, and official PA system announcements in English, Spanish, and French.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are the FIFA World Cup 2026 Incident Command Specialist. Analyze stadium incidents for safety, security, and crowd flow, returning structured, highly actionable protocols. Ensure announcements are calming, clear, and direct.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatScore: { type: Type.INTEGER, description: 'Threat score from 1 to 10' },
            riskLevel: { type: Type.STRING, description: 'Risk level: Low, Medium, High, or Critical' },
            protocols: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step immediate containment protocols for venue staff.'
            },
            volunteerInstructions: { type: Type.STRING, description: 'Instructions for volunteers on the ground.' },
            crowdReroute: { type: Type.STRING, description: 'Detailed crowd routing and evacuation or zone bypass advice.' },
            announcements: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING, description: 'English PA announcement draft' },
                es: { type: Type.STRING, description: 'Spanish PA announcement draft' },
                fr: { type: Type.STRING, description: 'French PA announcement draft' }
              },
              required: ['en', 'es', 'fr']
            }
          },
          required: ['threatScore', 'riskLevel', 'protocols', 'volunteerInstructions', 'crowdReroute', 'announcements']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Incident assessment error:', error);
    res.status(500).json({ error: error.message || 'Failed to assess incident' });
  }
});

// 4. Smart Volunteer Dispatcher (allocates volunteers to stadium zones based on requests)
app.post('/api/gemini/volunteer-assign', async (req, res) => {
  try {
    const { taskRequest, currentVolunteersCount } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a structured task-assignment for FIFA 2026 volunteers based on this dispatch request:
    Request: "${taskRequest}"
    Total Available Volunteers Count: ${currentVolunteersCount}
    
    Provide a structured layout explaining the task name, duration, spatial distribution of volunteers, mandatory gear, and briefing guidelines.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are the FIFA World Cup 2026 Volunteer Dispatch Coordinator. Break down coordination requests into detailed volunteer action cards with clear briefings.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskName: { type: Type.STRING, description: 'The overall name of the task' },
            duration: { type: Type.STRING, description: 'Estimated time required' },
            distribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subZone: { type: Type.STRING, description: 'E.g. Gate B Upper Tier, Concourse Section 112' },
                  count: { type: Type.INTEGER, description: 'Number of volunteers to send here' },
                  role: { type: Type.STRING, description: 'Role name, e.g. Gate Usher, Queue Monitor, Helper' }
                },
                required: ['subZone', 'count', 'role']
              }
            },
            equipment: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Required volunteer equipment'
            },
            briefing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bullet points of safety and operational briefings for volunteers.'
            }
          },
          required: ['taskName', 'duration', 'distribution', 'equipment', 'briefing']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Volunteer assignment error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch tasks' });
  }
});

// 5. Translation Assistance for Volunteers
app.post('/api/gemini/translate-assist', async (req, res) => {
  try {
    const { phrase, targetLang } = req.body;
    const ai = getGeminiClient();

    const prompt = `Translate the following spectator assistance phrase into ${targetLang}: "${phrase}"
    Also provide a phonetic pronunciation helper and a polite variant or helpful tip.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a professional, polite stadium translator for the FIFA World Cup 2026. Keep translations extremely helpful, clear, and easy for volunteers to say.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING, description: 'Direct translation' },
            pronunciation: { type: Type.STRING, description: 'Phonetic pronunciation guide' },
            contextNote: { type: Type.STRING, description: 'Helpful context or tip for assistants' }
          },
          required: ['translation', 'pronunciation', 'contextNote']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Failed to translate phrase' });
  }
});

// ---------------------------------------------------------
// Vite Integration and Static Asset Serving
// ---------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FIFA World Cup 2026 Assistant Server running on http://localhost:${PORT}`);
  });
}

startServer();
