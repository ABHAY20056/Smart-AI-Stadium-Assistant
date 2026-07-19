import React from 'react';
import { TransitStatus } from '../types';
import { Bus, Train, AlertTriangle, Car, Check, Flame, HelpCircle, Leaf, Recycle, Wind } from 'lucide-react';

interface OperationalMetricsProps {
  transit: TransitStatus[];
  onTransitClick?: (line: TransitStatus) => void;
}

export default function OperationalMetrics({
  transit,
  onTransitClick,
}: OperationalMetricsProps) {
  // Sustainability mock KPIs
  const sustainabilityKPIs = {
    recycleRate: '84%',
    renewablePower: '100%',
    greenTransitShare: '72%',
    offsetScore: '8.4t'
  };

  const getTransitIcon = (mode: 'shuttle' | 'metro' | 'rideshare' | 'parking') => {
    switch (mode) {
      case 'metro':
        return <Train className="w-5 h-5 text-blue-400" />;
      case 'shuttle':
        return <Bus className="w-5 h-5 text-indigo-400" />;
      case 'rideshare':
        return <Car className="w-5 h-5 text-purple-400" />;
      case 'parking':
        return <Car className="w-5 h-5 text-amber-500" />;
    }
  };

  const getLoadBadge = (load: 'light' | 'moderate' | 'heavy' | 'overload') => {
    switch (load) {
      case 'light':
        return <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Light Load</span>;
      case 'moderate':
        return <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Moderate</span>;
      case 'heavy':
        return <span className="text-[10px] bg-orange-950 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">Heavy</span>;
      case 'overload':
        return <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">Overload</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative" id="operations-metrics-board">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Train className="w-5 h-5 text-blue-400" />
            Transit Telemetry & Sustainability KPIs
          </h2>
          <p className="text-xs text-slate-400">Real-time transportation throughput & eco-efficiency tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Transportation Lists */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transit Dispatch Feeds</h3>
          <div className="grid gap-3">
            {transit.map((line) => (
              <div
                key={line.id}
                onClick={() => onTransitClick?.(line)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onTransitClick?.(line);
                  }
                }}
                className="bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-xl p-4 transition-all cursor-pointer flex justify-between items-center group focus:border-blue-500 outline-none"
                id={`transit-card-${line.id}`}
                role="button"
                tabIndex={0}
                aria-label={`Transit line ${line.lineName}, current wait time ${line.waitTime} minutes, passenger load level is ${line.passengerLoad}. Click to generate AI dispersion advisory.`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-slate-700 transition-colors">
                    {getTransitIcon(line.mode)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{line.lineName}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      Average queue: <span className="font-semibold text-slate-200">{line.waitTime} mins</span>
                      {line.status === 'delayed' && (
                        <span className="flex items-center gap-0.5 text-red-400 bg-red-950/40 px-1 py-0.5 rounded text-[10px]">
                          <AlertTriangle className="w-2.5 h-2.5" /> Delay
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {getLoadBadge(line.passengerLoad)}
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors">Click for AI advice →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Dashboard */}
        <div className="xl:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Green Stadium Logistics (FIFA Goal)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Recycle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium">Recycling Divergence</span>
                </div>
                <p className="text-lg font-extrabold text-emerald-400">{sustainabilityKPIs.recycleRate}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Compostable & cup capture</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Wind className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium">Eco Transit Share</span>
                </div>
                <p className="text-lg font-extrabold text-blue-400">{sustainabilityKPIs.greenTransitShare}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Rail & shuttle users</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 col-span-2 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold">Clean Energy Ratio</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Solar rooftop + hydro grid gridlock offset</p>
                </div>
                <span className="text-base font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded">
                  {sustainabilityKPIs.renewablePower} Active
                </span>
              </div>
            </div>

            {/* Micro message about sustainability actions */}
            <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-slate-400">
              <p className="font-semibold text-emerald-400 mb-0.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Eco-Goal Accomplished
              </p>
              Mass transit use has reduced local parking carbon output by estimated 12.4 tonnes this match day.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
