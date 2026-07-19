import React, { useState } from 'react';
import { Incident, IncidentSeverity, IncidentStatus } from '../types';
import { ShieldAlert, AlertTriangle, AlertCircle, Plus, Loader2, Sparkles, CheckCircle, Volume2 } from 'lucide-react';

interface IncidentManagerProps {
  incidents: Incident[];
  onAddIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
}

export default function IncidentManager({
  incidents,
  onAddIncident,
  onUpdateStatus,
}: IncidentManagerProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsLoading(true);
    setAssessmentError(null);

    try {
      const response = await fetch('/api/gemini/incident-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location, severity }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve AI incident assessment. Please verify your Gemini API key in Secrets.');
      }

      const aiAssessment = await response.json();

      const newIncident: Incident = {
        id: 'inc-' + Date.now(),
        title,
        description,
        location,
        reportedAt: new Date().toISOString(),
        severity,
        status: 'open',
        ...aiAssessment
      };

      onAddIncident(newIncident);
      setSelectedIncident(newIncident); // Open detailed view
      setIsReporting(false);
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setSeverity('medium');
    } catch (err: any) {
      console.error(err);
      setAssessmentError(err.message || 'An error occurred during safety assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (level: IncidentSeverity) => {
    switch (level) {
      case 'low': return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-950/40 border-amber-500/20';
      case 'high': return 'text-orange-400 bg-orange-950/40 border-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-950/40 border-red-500/30 animate-pulse';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return <span className="text-[10px] bg-red-950/55 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Active (Open)</span>;
      case 'mitigating':
        return <span className="text-[10px] bg-amber-950/55 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">Mitigating</span>;
      case 'resolved':
        return <span className="text-[10px] bg-emerald-950/55 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Resolved</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="command-incidents-panel">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Command Center Incident Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Report, escalate, and auto-generate crowd protocols using AI.</p>
        </div>

        <button
          id="btn-report-incident"
          onClick={() => setIsReporting(!isReporting)}
          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-red-600/10"
        >
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className={`${selectedIncident ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          {isReporting && (
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-red-900/30 rounded-xl p-4 space-y-4 shadow-inner" id="incident-report-form">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                AI-Ground Safety Report Form
              </h3>

              {assessmentError && (
                <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-xs text-red-200">
                  {assessmentError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Slip hazard at Gate C Escalators"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Specific Location</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Concourse Sec 104"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Initial Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Emergency</option>
                    <option value="critical">Critical Gridlock</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the incident, crowd mood, and safety elements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-red-900/40 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-500/15"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing with GenAI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Report & Run Assessment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {incidents.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-400">No Incidents Reported</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Stadium operations currently stable.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                    selectedIncident?.id === inc.id
                      ? 'bg-slate-950 border-blue-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80'
                  }`}
                  id={`incident-item-${inc.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{inc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>{inc.location}</span>
                        <span>•</span>
                        <span>{new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900/60">
                    {getStatusBadge(inc.status)}
                    {inc.threatScore && (
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Threat: <span className="text-amber-400 font-bold">{inc.threatScore}/10</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Assessment Panel */}
        {selectedIncident && (
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between" id="incident-assessment-details">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-900">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-blue-400 font-bold uppercase bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                      Threat Analysis Result
                    </span>
                    {selectedIncident.riskLevel && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        selectedIncident.riskLevel === 'Critical' ? 'bg-red-950 text-red-400 border-red-500/30' : 'bg-slate-900 text-amber-400 border-amber-500/20'
                      }`}>
                        {selectedIncident.riskLevel} Risk
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-200 mt-2">{selectedIncident.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedIncident.description}</p>
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              {/* Status Update Control */}
              <div className="flex gap-2 items-center my-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400">Mark Operational State:</span>
                <div className="flex gap-1.5 ml-auto">
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedIncident.id, 'mitigating');
                      setSelectedIncident({ ...selectedIncident, status: 'mitigating' });
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      selectedIncident.status === 'mitigating'
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    Mitigating
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedIncident.id, 'resolved');
                      setSelectedIncident({ ...selectedIncident, status: 'resolved' });
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      selectedIncident.status === 'resolved'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    Resolve
                  </button>
                </div>
              </div>

              {/* Action protocols */}
              <div className="space-y-4 overflow-y-auto max-h-[250px] pr-1">
                {selectedIncident.protocols && selectedIncident.protocols.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                      Immediate Staff Protocols (Secured)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1 leading-relaxed">
                      {selectedIncident.protocols.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedIncident.volunteerInstructions && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Volunteer On-Ground Advisory
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                      {selectedIncident.volunteerInstructions}
                    </p>
                  </div>
                )}

                {selectedIncident.crowdReroute && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      Spectator Re-routing Coordinates
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                      {selectedIncident.crowdReroute}
                    </p>
                  </div>
                )}

                {selectedIncident.announcements && (
                  <div className="pt-2 border-t border-slate-900">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      Draft Public Address Broadcasts (Multilingual)
                    </h4>
                    <div className="space-y-2.5">
                      <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 text-xs">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">EN - English Broadcast</span>
                        <p className="text-slate-350 italic leading-relaxed">"{selectedIncident.announcements.en}"</p>
                      </div>
                      <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 text-xs">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">ES - Spanish Broadcast</span>
                        <p className="text-slate-350 italic leading-relaxed">"{selectedIncident.announcements.es}"</p>
                      </div>
                      <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 text-xs">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">FR - French Broadcast</span>
                        <p className="text-slate-350 italic leading-relaxed">"{selectedIncident.announcements.fr}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
