import React, { useState, useEffect } from 'react';
import { StadiumZone, Incident, TransitStatus } from '../types';
import { Sparkles, Loader2, AlertCircle, RefreshCw, MoveRight, Users2, ShieldAlert, Bus } from 'lucide-react';

interface OpsSummaryPanelProps {
  zones: StadiumZone[];
  incidents: Incident[];
  transit: TransitStatus[];
}

interface SummaryData {
  summaryText: string;
  keyAlerts: string[];
  crowdControlAdvice: string;
  volunteerDispatchAdvice: string;
  transitMitigationAdvice: string;
}

export default function OpsSummaryPanel({
  zones,
  incidents,
  transit,
}: OpsSummaryPanelProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/ops-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones, incidents, transit }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve real-time operational summary.');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error compiling operations summary.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate summary on initial mount
  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <section
      id="ops-summary-panel-container"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
      role="region"
      aria-label="FIFA Operations Intelligence Summary"
    >
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" aria-hidden="true" />
            FIFA 2026 AI Venue Commander Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry analysis, crowd dynamics evaluation, and incident-aware logistics dispatch.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={isLoading}
          id="btn-trigger-ops-summary"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          aria-label="Refresh operational summary report"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {isLoading ? 'Synthesizing...' : 'Refresh AI Analytics'}
        </button>
      </div>

      {error && (
        <div
          className="p-4 bg-red-950/60 border border-red-800/40 rounded-xl text-xs text-red-200 mb-4 flex items-start gap-2.5"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold">Summary Disruption Alert:</p>
            <p className="mt-1 text-slate-300">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div
          className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-slate-400"
          aria-live="polite"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" aria-hidden="true" />
          <span className="font-medium animate-pulse">Consulting Gemini operations models & correlating sensor maps...</span>
        </div>
      ) : summary ? (
        <div className="space-y-6" aria-live="polite" id="ops-report-body">
          
          {/* Executive Overview */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-1.5">Executive Status Brief</h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {summary.summaryText}
            </p>
          </div>

          {/* Active Bottlenecks & Warnings */}
          {summary.keyAlerts && summary.keyAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                Command Level Alerts ({summary.keyAlerts.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="ops-alert-grid">
                {summary.keyAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300 flex items-start gap-2"
                    id={`ops-alert-card-${idx}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Insights Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Crowd Control Column */}
            <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-sky-950/65 border border-sky-500/20 rounded-lg text-sky-400">
                  <Users2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-100">Crowd Flow Advice</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                {summary.crowdControlAdvice}
              </p>
            </div>

            {/* Volunteer Dispatch Advice */}
            <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-950/65 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-100">Steward Redefinement</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                {summary.volunteerDispatchAdvice}
              </p>
            </div>

            {/* Transit Advice */}
            <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-950/65 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Bus className="w-4 h-4" aria-hidden="true" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-100">Transit Coordination</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                {summary.transitMitigationAdvice}
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500">
          No operations telemetry compiled. Click "Refresh AI Analytics" to analyze stadium state.
        </div>
      )}
    </section>
  );
}
