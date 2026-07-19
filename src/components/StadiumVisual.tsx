import React, { useState } from 'react';
import { StadiumZone, DensityLevel } from '../types';
import { Users, AlertCircle, ShieldAlert, CheckCircle2, Sliders, Play } from 'lucide-react';

interface StadiumVisualProps {
  zones: StadiumZone[];
  onZoneClick: (zone: StadiumZone) => void;
  selectedZone: StadiumZone | null;
  onSimulateFlow: (scenario: 'match_start' | 'half_time' | 'match_end' | 'reset') => void;
}

export default function StadiumVisual({
  zones,
  onZoneClick,
  selectedZone,
  onSimulateFlow,
}: StadiumVisualProps) {
  const [activeScenario, setActiveScenario] = useState<string>('reset');

  // Helper to map density level to Tailwind color classes for maps
  const getDensityColor = (level: DensityLevel) => {
    switch (level) {
      case 'low':
        return 'fill-emerald-500/80 stroke-emerald-400 hover:fill-emerald-400 shadow-emerald-500/20';
      case 'medium':
        return 'fill-amber-500/80 stroke-amber-400 hover:fill-amber-400 shadow-amber-500/20';
      case 'high':
        return 'fill-orange-500/80 stroke-orange-400 hover:fill-orange-400 shadow-orange-500/20';
      case 'critical':
        return 'fill-red-600/95 stroke-red-500 hover:fill-red-500 animate-pulse shadow-red-500/40';
      default:
        return 'fill-slate-600 stroke-slate-500';
    }
  };

  const getDensityBadge = (level: DensityLevel) => {
    switch (level) {
      case 'low':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">Low Density</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-950/50 text-amber-400 border border-amber-500/30">Moderate</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-950/50 text-orange-400 border border-orange-500/30">Heavy</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/50 text-red-400 border border-red-500/30 animate-pulse">Critical Gridlock</span>;
    }
  };

  const handleScenario = (scenario: 'match_start' | 'half_time' | 'match_end' | 'reset') => {
    setActiveScenario(scenario);
    onSimulateFlow(scenario);
  };

  // High level totals
  const totalOccupancy = zones.reduce((acc, z) => acc + z.currentOccupancy, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const overallDensityPercent = Math.round((totalOccupancy / totalCapacity) * 100);

  const highDensityZonesCount = zones.filter(z => z.densityLevel === 'high' || z.densityLevel === 'critical').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="stadium-operations-map">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Stadium Core & Crowd Densities
          </h2>
          <p className="text-sm text-slate-400 mt-1">Interactive layout of the host venue during tournament flow.</p>
        </div>

        {/* Live counter tags */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Attendance</p>
              <p className="text-sm font-bold text-slate-200">
                {totalOccupancy.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {totalCapacity.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${overallDensityPercent > 80 ? 'bg-red-500' : overallDensityPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Grid Cap</p>
              <p className="text-sm font-bold text-slate-200">{overallDensityPercent}% Load</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Diagram */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-full max-w-[320px] md:max-w-[380px] aspect-square relative">
            <svg viewBox="0 0 400 400" className="w-full h-full select-none cursor-pointer">
              {/* Outer boundary stadium Ring */}
              <circle cx="200" cy="200" r="185" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle cx="200" cy="200" r="170" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />

              {/* Pitch center green field */}
              <rect x="150" y="130" width="100" height="140" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="2" className="opacity-60" />
              <line x1="150" y1="200" x2="250" y2="200" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="22" fill="none" stroke="#10b981" strokeWidth="1.5" />

              {/* Sectors Map (Clickable Zones) */}
              {/* North Stand */}
              <path
                d="M 120,40 A 165,165 0 0,1 280,40 L 260,110 A 100,100 0 0,0 140,110 Z"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'stands-n')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`North Stands, density level: ${zones.find(z => z.id === 'stands-n')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'stands-n');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'stands-n');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="80" textAnchor="middle" fill="#f8fafc" className="text-[10px] font-bold pointer-events-none uppercase tracking-wider">North Stands</text>

              {/* South Stand */}
              <path
                d="M 120,360 A 165,165 0 0,0 280,360 L 260,290 A 100,100 0 0,1 140,290 Z"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'stands-s')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`South Stands, density level: ${zones.find(z => z.id === 'stands-s')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'stands-s');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'stands-s');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="330" textAnchor="middle" fill="#f8fafc" className="text-[10px] font-bold pointer-events-none uppercase tracking-wider">South Stands</text>

              {/* West Premium Seating */}
              <path
                d="M 40,120 A 165,165 0 0,1 40,280 L 110,260 A 100,100 0 0,0 110,140 Z"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'stands-w')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`West Premium Seating, density level: ${zones.find(z => z.id === 'stands-w')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'stands-w');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'stands-w');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="75" y="205" textAnchor="middle" fill="#f8fafc" className="text-[10px] font-bold pointer-events-none uppercase tracking-wider -rotate-90 origin-center translate-y-[-10px] translate-x-[110px]">West Stands</text>

              {/* East Seating */}
              <path
                d="M 360,120 A 165,165 0 0,0 360,280 L 290,260 A 100,100 0 0,1 290,140 Z"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'stands-e')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`East General Stands, density level: ${zones.find(z => z.id === 'stands-e')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'stands-e');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'stands-e');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="325" y="205" textAnchor="middle" fill="#f8fafc" className="text-[10px] font-bold pointer-events-none uppercase tracking-wider rotate-90 origin-center translate-y-[20px] translate-x-[-120px]">East Stands</text>

              {/* GATE INDICATORS (Small colored circles at perimeter) */}
              {/* Gate A - North */}
              <circle
                cx="200"
                cy="25"
                r="12"
                className={`transition-all duration-300 cursor-pointer outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'gate-a')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`Gate A (North Entrance), density level: ${zones.find(z => z.id === 'gate-a')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'gate-a');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'gate-a');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="28" textAnchor="middle" fill="#0f172a" className="text-[9px] font-extrabold pointer-events-none">A</text>

              {/* Gate B - East */}
              <circle
                cx="375"
                cy="200"
                r="12"
                className={`transition-all duration-300 cursor-pointer outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'gate-b')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`Gate B (East Entrance), density level: ${zones.find(z => z.id === 'gate-b')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'gate-b');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'gate-b');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="375" y="203" textAnchor="middle" fill="#0f172a" className="text-[9px] font-extrabold pointer-events-none">B</text>

              {/* Gate C - South */}
              <circle
                cx="200"
                cy="375"
                r="12"
                className={`transition-all duration-300 cursor-pointer outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'gate-c')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`Gate C (South Entrance), density level: ${zones.find(z => z.id === 'gate-c')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'gate-c');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'gate-c');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="378" textAnchor="middle" fill="#0f172a" className="text-[9px] font-extrabold pointer-events-none">C</text>

              {/* Gate D - West */}
              <circle
                cx="25"
                cy="200"
                r="12"
                className={`transition-all duration-300 cursor-pointer outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'gate-d')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`Gate D (West Entrance), density level: ${zones.find(z => z.id === 'gate-d')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'gate-d');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'gate-d');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="25" y="203" textAnchor="middle" fill="#0f172a" className="text-[9px] font-extrabold pointer-events-none">D</text>

              {/* Concentric Concourse rings */}
              <circle cx="200" cy="200" r="100" fill="none" stroke="#475569" strokeWidth="1.5" />
              {/* Concourse Areas */}
              <rect
                x="160"
                y="105"
                width="80"
                height="18"
                rx="3"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'concourse-n')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`North Concourse & Food Court, density level: ${zones.find(z => z.id === 'concourse-n')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'concourse-n');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'concourse-n');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="117" textAnchor="middle" fill="#0f172a" className="text-[8px] font-bold pointer-events-none">N Concourse</text>

              <rect
                x="160"
                y="277"
                width="80"
                height="18"
                rx="3"
                className={`transition-all duration-300 outline-none focus:stroke-blue-400 focus:stroke-2 ${getDensityColor(zones.find(z => z.id === 'concourse-s')?.densityLevel || 'low')}`}
                role="button"
                tabIndex={0}
                aria-label={`South Concourse Plaza, density level: ${zones.find(z => z.id === 'concourse-s')?.densityLevel || 'unknown'}`}
                onClick={() => {
                  const z = zones.find(x => x.id === 'concourse-s');
                  if (z) onZoneClick(z);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const z = zones.find(x => x.id === 'concourse-s');
                    if (z) onZoneClick(z);
                  }
                }}
              />
              <text x="200" y="289" textAnchor="middle" fill="#0f172a" className="text-[8px] font-bold pointer-events-none">S Concourse</text>
            </svg>

            {/* Selection Outline indicator overlay */}
            {selectedZone && (
              <div className="absolute top-2 left-2 bg-slate-950/90 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-200">Selected: {selectedZone.name}</span>
              </div>
            )}
          </div>

          {/* Quick Map Legend */}
          <div className="flex justify-center gap-4 mt-4 text-[11px] text-slate-400 border-t border-slate-800/60 w-full pt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500 opacity-80" />
              <span>Low (&lt;45%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500 opacity-80" />
              <span>Mod (45-70%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500 opacity-80" />
              <span>Heavy (70-90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-600 opacity-90 animate-pulse" />
              <span>Gridlock (&gt;90%)</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Info Card & Scenario Simulations */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* Detailed Info Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col justify-between">
            {selectedZone ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded">
                      {selectedZone.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-200 mt-2">{selectedZone.name}</h3>
                  </div>
                  {getDensityBadge(selectedZone.densityLevel)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Seating / Capacity:</span>
                    <span className="text-slate-200 font-semibold">{selectedZone.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <span className="text-slate-200 font-semibold">{selectedZone.currentOccupancy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                    <span className="text-slate-400">Saturation Level:</span>
                    <span className="text-slate-200 font-semibold">{Math.round((selectedZone.currentOccupancy / selectedZone.capacity) * 100)}%</span>
                  </div>
                </div>

                {/* AI advice preview */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                    AI Operations Advisory
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedZone.densityLevel === 'critical' ? (
                      <span className="text-red-400 font-medium">Critical congestion detected. Initiating immediate volunteer re-routing and public address diversion messaging. Suggesting open manual entry overrides at adjacent gates.</span>
                    ) : selectedZone.densityLevel === 'high' ? (
                      <span className="text-orange-400">Heavy crowd accumulation. Advise deploying secondary usher guides to smooth flow at ticket-scanning lanes.</span>
                    ) : (
                      <span>Sector flow within optimal safety margins. Normal spectator scanning rates. No immediate dispatcher intervention required.</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
                <Users className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No Zone Selected</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Click any sector or gate letter on the SVG map to check real-time telemetry.</p>
              </div>
            )}
          </div>

          {/* Simulation Commands */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Operations Simulation Console
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Trigger tournament events to simulate sudden surges and watch the AI dashboard dynamically re-prioritize routes and alerts.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="sim-match-start"
                onClick={() => handleScenario('match_start')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  activeScenario === 'match_start'
                    ? 'bg-amber-600/20 text-amber-400 border-amber-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Play className="w-3 h-3 text-amber-400" />
                Gates Opening
              </button>
              <button
                id="sim-half-time"
                onClick={() => handleScenario('half_time')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  activeScenario === 'half_time'
                    ? 'bg-orange-600/20 text-orange-400 border-orange-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Play className="w-3 h-3 text-orange-400" />
                Halftime Concourse
              </button>
              <button
                id="sim-match-end"
                onClick={() => handleScenario('match_end')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  activeScenario === 'match_end'
                    ? 'bg-red-600/20 text-red-400 border-red-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Play className="w-3 h-3 text-red-400" />
                Match Exit Rush
              </button>
              <button
                id="sim-reset"
                onClick={() => handleScenario('reset')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  activeScenario === 'reset'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Standard Flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
