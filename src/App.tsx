import React, { useState } from 'react';
import { Persona, StadiumZone, Incident, VolunteerTask, TransitStatus } from './types';
import {
  INITIAL_ZONES,
  INITIAL_TRANSIT,
  INITIAL_VOLUNTEER_TASKS,
  INITIAL_INCIDENTS,
  STADIUM_FAQS
} from './data';

import StadiumVisual from './components/StadiumVisual';
import OperationalMetrics from './components/OperationalMetrics';
import IncidentManager from './components/IncidentManager';
import VolunteerTaskBoard from './components/VolunteerTaskBoard';
import AIChatBot from './components/AIChatBot';

import {
  Shield,
  Users,
  Train,
  HeartHandshake,
  HelpCircle,
  Globe,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

export default function App() {
  const [activePersona, setActivePersona] = useState<Persona>('fan');
  const [zones, setZones] = useState<StadiumZone[]>(INITIAL_ZONES);
  const [transit, setTransit] = useState<TransitStatus[]>(INITIAL_TRANSIT);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [tasks, setTasks] = useState<VolunteerTask[]>(INITIAL_VOLUNTEER_TASKS);
  
  const [selectedZone, setSelectedZone] = useState<StadiumZone | null>(INITIAL_ZONES[0]);
  const [faqLang, setFaqLang] = useState<'en' | 'es' | 'fr'>('en');

  // Transit AI Advice state
  const [adviceTransit, setAdviceTransit] = useState<TransitStatus | null>(null);
  const [transitAdviceText, setTransitAdviceText] = useState<string>('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  // Simulated Scenario triggers
  const handleSimulateFlow = (scenario: 'match_start' | 'half_time' | 'match_end' | 'reset') => {
    let updatedZones = [...zones];
    let updatedTransit = [...transit];

    if (scenario === 'match_start') {
      updatedZones = zones.map(z => {
        if (z.id === 'gate-a' || z.id === 'gate-c') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.96), densityLevel: 'critical' };
        }
        if (z.type === 'concourse') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.55), densityLevel: 'medium' };
        }
        return { ...z, currentOccupancy: Math.round(z.capacity * 0.20), densityLevel: 'low' };
      });
      updatedTransit = transit.map(t => {
        if (t.mode === 'metro') {
          return { ...t, waitTime: 12, status: 'crowded', passengerLoad: 'heavy' };
        }
        if (t.mode === 'shuttle') {
          return { ...t, waitTime: 20, status: 'delayed', passengerLoad: 'heavy' };
        }
        return t;
      });
    } else if (scenario === 'half_time') {
      updatedZones = zones.map(z => {
        if (z.type === 'concourse') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.94), densityLevel: 'critical' };
        }
        if (z.type === 'stands') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.40), densityLevel: 'low' };
        }
        return { ...z, currentOccupancy: Math.round(z.capacity * 0.30), densityLevel: 'low' };
      });
      updatedTransit = transit.map(t => {
        if (t.mode === 'rideshare') {
          return { ...t, waitTime: 25, status: 'crowded', passengerLoad: 'overload' };
        }
        return t;
      });
    } else if (scenario === 'match_end') {
      updatedZones = zones.map(z => {
        if (z.type === 'stands') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.08), densityLevel: 'low' };
        }
        if (z.type === 'transit' || z.id === 'transit-hub' || z.id === 'rideshare-plaza') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.98), densityLevel: 'critical' };
        }
        if (z.type === 'gate') {
          return { ...z, currentOccupancy: Math.round(z.capacity * 0.88), densityLevel: 'high' };
        }
        return { ...z, currentOccupancy: Math.round(z.capacity * 0.45), densityLevel: 'medium' };
      });
      updatedTransit = transit.map(t => {
        if (t.mode === 'metro') {
          return { ...t, waitTime: 28, status: 'crowded', passengerLoad: 'overload', advice: 'Maximum train deployment active. Long platform queues, use shuttle backups.' };
        }
        if (t.mode === 'shuttle') {
          return { ...t, waitTime: 32, status: 'delayed', passengerLoad: 'overload' };
        }
        return { ...t, waitTime: 40, status: 'crowded', passengerLoad: 'heavy' };
      });
    } else {
      // standard reset
      updatedZones = [...INITIAL_ZONES];
      updatedTransit = [...INITIAL_TRANSIT];
    }

    setZones(updatedZones);
    setTransit(updatedTransit);
    // Auto-update selected zone reference if active to sync card metrics
    if (selectedZone) {
      const updatedSel = updatedZones.find(uz => uz.id === selectedZone.id);
      if (updatedSel) setSelectedZone(updatedSel);
    }
  };

  // Add Incident handler (connected to Command Center panel)
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents([newIncident, ...incidents]);
  };

  const handleUpdateIncidentStatus = (id: string, status: 'open' | 'mitigating' | 'resolved') => {
    setIncidents(incidents.map(inc => inc.id === id ? { ...inc, status } : inc));
  };

  // Add Volunteer Task handler
  const handleAddTask = (newTask: VolunteerTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTaskStatus = (id: string, status: 'pending' | 'active' | 'completed') => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  // Transit Click Advisor Retriever
  const handleTransitClick = async (line: TransitStatus) => {
    setAdviceTransit(line);
    setTransitAdviceText('');
    setIsAdviceLoading(true);

    try {
      const promptText = `As a FIFA World Cup 2026 Transit Advisor, the transport line "${line.lineName}" currently has an average waiting queue of ${line.waitTime} minutes and is experiencing a "${line.passengerLoad}" passenger load. Provide 3 short, direct, actionable advice bullet points for spectators to minimize wait times, and write a one-sentence polite advisory in English, Spanish, and French.`;
      
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          persona: 'fan'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve AI transport advisory. Please confirm key.');
      }

      const data = await response.json();
      setTransitAdviceText(data.text || 'Advisory text currently unavailable.');
    } catch (err: any) {
      console.error(err);
      setTransitAdviceText('Error loading transport recommendation. Please check your Gemini API key configurations.');
    } finally {
      setIsAdviceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* GLOBAL HEADER BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/65 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <span className="text-emerald-400 font-extrabold text-base tracking-wider">FIFA</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              Stadium Operations & Fan Experience Command Hub
              <span className="text-[10px] bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                World Cup 2026
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">GenAI-enabled intelligence directing safety, transit, and volunteer distribution.</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-slate-400">Open Incidents:</span>
            <span className="font-bold text-red-400">{incidents.filter(i => i.status !== 'resolved').length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Active Shifts:</span>
            <span className="font-bold text-indigo-400">{tasks.filter(t => t.status === 'active').length}</span>
          </div>
        </div>
      </header>

      {/* CORE PORTAL LAYOUT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE VIEW MODULES (7 COLS) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          
          {/* PERSUAL SELECTOR NAV TABS */}
          <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex gap-1.5 shadow-inner">
            <button
              id="tab-fan-experience"
              onClick={() => setActivePersona('fan')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePersona === 'fan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Fan Seating & Guides
            </button>
            <button
              id="tab-organizer-command"
              onClick={() => setActivePersona('organizer')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePersona === 'organizer'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Staff Command Center
            </button>
            <button
              id="tab-volunteer-coordinator"
              onClick={() => setActivePersona('volunteer')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePersona === 'volunteer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              Volunteer Portal
            </button>
          </nav>

          {/* DYNAMIC COMPONENT INJECTIONS */}
          {activePersona === 'fan' && (
            <div className="space-y-6" id="fan-experience-module">
              {/* Stadium Visualizer */}
              <StadiumVisual
                zones={zones}
                onZoneClick={setSelectedZone}
                selectedZone={selectedZone}
                onSimulateFlow={handleSimulateFlow}
              />

              {/* Transit & Green Telemetry */}
              <OperationalMetrics
                transit={transit}
                onTransitClick={handleTransitClick}
              />

              {/* FAQ Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="fan-faq-panel">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-400" />
                      FIFA Spectator Guidelines (Multilingual)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle language to view official FIFA security and entry codes.</p>
                  </div>

                  <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                    <button
                      id="faq-lang-en"
                      onClick={() => setFaqLang('en')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                        faqLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      id="faq-lang-es"
                      onClick={() => setFaqLang('es')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                        faqLang === 'es' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Español
                    </button>
                    <button
                      id="faq-lang-fr"
                      onClick={() => setFaqLang('fr')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                        faqLang === 'fr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Français
                    </button>
                  </div>
                </div>

                <div className="grid gap-3.5">
                  {STADIUM_FAQS.map((faq) => (
                    <div key={faq.id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-xs">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block mb-1">
                        {faq.category}
                      </span>
                      <h4 className="font-extrabold text-slate-200 mb-1.5">{faq.question}</h4>
                      <p className="text-slate-400 leading-relaxed italic">
                        "{faq.languages[faqLang]}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePersona === 'organizer' && (
            <div className="space-y-6" id="organizer-command-module">
              {/* Seating map on command dashboard */}
              <StadiumVisual
                zones={zones}
                onZoneClick={setSelectedZone}
                selectedZone={selectedZone}
                onSimulateFlow={handleSimulateFlow}
              />

              {/* Command Incident Board */}
              <IncidentManager
                incidents={incidents}
                onAddIncident={handleAddIncident}
                onUpdateStatus={handleUpdateIncidentStatus}
              />

              {/* Transit & Green Telemetry */}
              <OperationalMetrics
                transit={transit}
                onTransitClick={handleTransitClick}
              />
            </div>
          )}

          {activePersona === 'volunteer' && (
            <div className="space-y-6" id="volunteer-portal-module">
              {/* Stadium layout with clickable zones */}
              <StadiumVisual
                zones={zones}
                onZoneClick={setSelectedZone}
                selectedZone={selectedZone}
                onSimulateFlow={handleSimulateFlow}
              />

              {/* Volunteer Tasks Deployment log & translation cards */}
              <VolunteerTaskBoard
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateStatus={handleUpdateTaskStatus}
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: REAL-TIME AI ASSISTANT CHATBOT (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Connected AI assistant */}
          <AIChatBot
            activePersona={activePersona}
            onChangePersona={setActivePersona}
          />

          {/* Quick Informational widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Tournament Operations Log
            </h4>
            <div className="space-y-2.5 text-[11px] text-slate-400 leading-relaxed">
              <p>📍 Host Stadium: MetLife Seating & Transit Core</p>
              <p>⏱️ Current Match Phase: Round of 16 - Match 52</p>
              <p>💡 Click any transit node on the dispatcher board to get tailored AI queue relief advisories instantly.</p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-2">
        <p>© FIFA World Cup 2026 - Stadium Operations Platform. All rights reserved.</p>
        <p>Powered by Google Gemini 3.5 Flash Model Intelligence.</p>
      </footer>

      {/* TRANSPORT ADVICE LIGHTBOX MODAL */}
      {adviceTransit && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in" id="transit-advice-lightbox">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setAdviceTransit(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
              <div className="p-2 bg-blue-950/40 border border-blue-500/20 rounded-lg">
                <Train className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">AI Transport Advisor</span>
                <h3 className="text-sm font-bold text-slate-100">{adviceTransit.lineName}</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-950">
                <span className="text-slate-400">Current Wait Time:</span>
                <span className="text-slate-200 font-bold">{adviceTransit.waitTime} Minutes</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-950">
                <span className="text-slate-400">Current Load Level:</span>
                <span className="text-slate-200 font-bold uppercase">{adviceTransit.passengerLoad}</span>
              </div>

              <div className="pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Gemini-Generated Dispersion Advisory
                </h4>

                {isAdviceLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-xs text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span>Analyzing live shuttle queues and passenger loading...</span>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800/80">
                    <div className="space-y-2 whitespace-pre-wrap">
                      {transitAdviceText.split('\n').map((line, idx) => {
                        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                          return <div key={idx} className="pl-3.5 relative before:content-['•'] before:absolute before:left-0 text-slate-350">{line.substring(1).trim()}</div>;
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setAdviceTransit(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                Close Advisory
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
