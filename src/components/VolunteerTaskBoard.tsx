import React, { useState } from 'react';
import { VolunteerTask } from '../types';
import { Users, Plus, Loader2, Sparkles, Check, Globe, HelpCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface VolunteerTaskBoardProps {
  tasks: VolunteerTask[];
  onAddTask: (task: VolunteerTask) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'active' | 'completed') => void;
}

export default function VolunteerTaskBoard({
  tasks,
  onAddTask,
  onUpdateStatus,
}: VolunteerTaskBoardProps) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchRequest, setDispatchRequest] = useState('');
  const [volunteersCount, setVolunteersCount] = useState(15);
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null);

  // Translation Helper State
  const [phrase, setPhrase] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    pronunciation: string;
    contextNote: string;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchRequest) return;

    setIsDispatchLoading(true);
    setDispatchError(null);

    try {
      const response = await fetch('/api/gemini/volunteer-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskRequest: dispatchRequest,
          currentVolunteersCount: volunteersCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to dispatch volunteer task. Please check your server log or key.');
      }

      const generatedTask = await response.json();

      const newTask: VolunteerTask = {
        id: 'task-' + Date.now(),
        taskName: generatedTask.taskName,
        duration: generatedTask.duration,
        status: 'active',
        distribution: generatedTask.distribution,
        equipment: generatedTask.equipment,
        briefing: generatedTask.briefing,
        createdAt: new Date().toISOString()
      };

      onAddTask(newTask);
      setSelectedTask(newTask);
      setIsDispatching(false);
      setDispatchRequest('');
    } catch (err: any) {
      console.error(err);
      setDispatchError(err.message || 'An error occurred during task scheduling.');
    } finally {
      setIsDispatchLoading(false);
    }
  };

  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase) return;

    setIsTranslating(true);
    setTranslationError(null);
    setTranslationResult(null);

    try {
      const response = await fetch('/api/gemini/translate-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, targetLang }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve translation. Please verify key setup.');
      }

      const result = await response.json();
      setTranslationResult(result);
    } catch (err: any) {
      console.error(err);
      setTranslationError(err.message || 'Failed to process translation.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="volunteer-tasks-panel">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Volunteer Coordination Hub & Translators
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Deploy volunteers and provide on-ground translation support.</p>
        </div>

        <button
          id="btn-open-dispatcher"
          onClick={() => setIsDispatching(!isDispatching)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          AI Shift Dispatcher
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tasks & Dispatcher */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Field Deployments</h3>

          {isDispatching && (
            <form onSubmit={handleDispatchSubmit} className="bg-slate-950 border border-indigo-900/30 rounded-xl p-4 space-y-4 shadow-inner" id="volunteer-dispatch-form">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI-Assisted Task Dispatch Coordinator
              </h4>

              {dispatchError && (
                <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-xs text-red-200">
                  {dispatchError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Describe What is Needed</label>
                <textarea
                  required
                  rows={2}
                  placeholder="E.g. Assign 8 volunteers to help with recycling distribution at Concourse West"
                  value={dispatchRequest}
                  onChange={(e) => setDispatchRequest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Volunteers Pool Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={volunteersCount}
                  onChange={(e) => setVolunteersCount(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatching(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatchLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-500/15"
                >
                  {isDispatchLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Assigning Shift...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Plan & Deploy
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-400">No Volunteer Tasks Created</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedTask(task);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Volunteer deployment task: ${task.taskName}, duration is ${task.duration}, status is ${task.status}. Click to view detailed sector allocations and briefing instructions.`}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all focus:border-indigo-500 outline-none ${
                    selectedTask?.id === task.id
                      ? 'bg-slate-950 border-indigo-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80'
                  }`}
                  id={`volunteer-task-item-${task.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{task.taskName}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Est. Duration: <span className="text-slate-300 font-semibold">{task.duration}</span>
                      </p>
                    </div>
                    <span className="text-[10px] bg-indigo-950/50 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                      {task.distribution.reduce((acc, d) => acc + d.count, 0)} Volunteers
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900/60">
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
                      task.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-500/20'
                    }`}>
                      {task.status}
                    </span>
                    {task.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(task.id, 'completed');
                          if (selectedTask?.id === task.id) {
                            setSelectedTask({ ...selectedTask, status: 'completed' });
                          }
                        }}
                        className="text-[9px] bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/25 transition-all"
                      >
                        Complete Shift
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Translation Tool */}
        <div className="lg:col-span-6 space-y-4">
          {selectedTask ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between" id="volunteer-task-details">
              <div>
                <div className="flex justify-between items-start pb-3 border-b border-slate-900">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                      Task Zoning Map
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-200 mt-2">{selectedTask.taskName}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Deselect
                  </button>
                </div>

                <div className="space-y-4 mt-3">
                  {/* Distribution list */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-1.5">Sector Allocation</h4>
                    <div className="space-y-1.5">
                      {selectedTask.distribution.map((d, index) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                          <div>
                            <p className="font-semibold text-slate-200">{d.subZone}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{d.role}</p>
                          </div>
                          <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-bold">{d.count} u</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gear List */}
                  {selectedTask.equipment && selectedTask.equipment.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-1">Assigned Equipment</h4>
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
                        {selectedTask.equipment.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Briefing notes */}
                  {selectedTask.briefing && selectedTask.briefing.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-1.5">Volunteer Safety & Guide Briefing</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1 leading-relaxed">
                        {selectedTask.briefing.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Real-Time Translation Helper */
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5" id="volunteer-translator-panel">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                Real-Time Spectator Translation Helper
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Instantly translate directions or procedures into Spanish or French with phonetic guidance to communicate with international visitors.
              </p>

              <form onSubmit={handleTranslateSubmit} className="space-y-3">
                {translationError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-xs text-red-200">
                    {translationError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">English Spectator Phrase</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Please walk down corridor B and take the escalator."
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    id="translation-input-phrase"
                  />
                </div>

                <div className="flex gap-2.5 items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Language:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      id="lang-selector-es"
                      onClick={() => setTargetLang('Spanish')}
                      className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                        targetLang === 'Spanish'
                          ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Spanish (ES)
                    </button>
                    <button
                      type="button"
                      id="lang-selector-fr"
                      onClick={() => setTargetLang('French')}
                      className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                        targetLang === 'French'
                          ? 'bg-purple-600/30 text-purple-400 border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      French (FR)
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isTranslating}
                    id="btn-trigger-translation"
                    className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/10"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        Translate
                      </>
                    )}
                  </button>
                </div>
              </form>

              {translationResult && (
                <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-inner" id="translation-result-box">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">Translation ({targetLang})</span>
                    <p className="text-sm font-bold text-slate-150">"{translationResult.translation}"</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">Phonetic Pronunciation</span>
                    <p className="text-xs font-mono text-slate-300">"{translationResult.pronunciation}"</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">Cultural Context Advice</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">{translationResult.contextNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
