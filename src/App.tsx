/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Activity,
  Award,
  Info,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TeamStats, 
  TournamentWeights, 
  DEFAULT_TOURNAMENT_WEIGHTS, 
  TeamScore, 
  FairPlay, 
  Availability, 
  RankingGroup, 
  KnockoutPhase 
} from './types';
import { calculateScores } from './scoringEngine';
import { getAIAnalysis } from './aiService';

const INITIAL_TEAMS: TeamStats[] = [
  {
    id: '1',
    name: 'Lions de FECOB',
    globalGoals: 45,
    fairPlay: 'Plein',
    ligueMajeure: { enabled: true, ranking: '1-4', goalsScored: 24, goalsConceded: 8, availability: 100 },
    ligueChampions: { enabled: true, groupPhase: true, knockoutPhase: 'Finale', won: true, goalsScored: 15, goalsConceded: 5, availability: 100 },
    supercoupe: { enabled: true, knockoutPhase: 'Finale', goalsScored: 3 },
    powerLeague: { enabled: true, groupPhase: true, knockoutPhase: true, goalsScored: 12, goalsConceded: 4, availability: 100 }
  }
];

export default function App() {
  const [teams, setTeams] = useState<TeamStats[]>(INITIAL_TEAMS);
  const [weights, setWeights] = useState<TournamentWeights>(DEFAULT_TOURNAMENT_WEIGHTS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; insights: { teamName: string; comment: string }[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const scores = useMemo(() => calculateScores(teams, weights), [teams, weights]);
  const winner = scores[0];

  const handleAddTeam = () => {
    const newTeam: TeamStats = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nouvelle Équipe ${teams.length + 1}`,
      globalGoals: 0,
      fairPlay: 'Moyen',
      ligueMajeure: { enabled: true, ranking: '5-10', goalsScored: 0, goalsConceded: 0, availability: 75 },
      ligueChampions: { enabled: false, groupPhase: false, knockoutPhase: 'Aucune', won: false, goalsScored: 0, goalsConceded: 0, availability: 75 },
      supercoupe: { enabled: false, knockoutPhase: 'Aucune', goalsScored: 0 },
      powerLeague: { enabled: false, groupPhase: false, knockoutPhase: false, goalsScored: 0, goalsConceded: 0, availability: 75 }
    };
    setTeams([...teams, newTeam]);
  };

  const handleUpdateTeam = (id: string, path: string, value: any) => {
    setTeams(teams.map(t => {
      if (t.id !== id) return t;
      
      const newTeam = { ...t };
      const parts = path.split('.');
      let current: any = newTeam;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newTeam;
    }));
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const handleUpdateWeight = (field: keyof TournamentWeights, value: number) => {
    setWeights({ ...weights, [field]: value });
  };

  const totalWeights = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await getAIAnalysis(teams, weights, scores);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="sticky top-0 z-50 glass-card border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Trophy className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight gold-text-gradient">Ballon d'Or FECOB</h1>
        </div>
        <button 
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <Settings className={`w-6 h-6 ${isConfigOpen ? 'text-gold-400' : 'text-white/60'}`} />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {winner && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl glass-card-gold p-8 text-center border border-gold-500/30"
          >
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient opacity-50" />
            <Award className="w-16 h-16 mx-auto mb-4 text-gold-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h2 className="text-sm uppercase tracking-[0.2em] text-gold-400 font-semibold mb-1">Gagnant Actuel</h2>
            <div className="text-4xl font-black mb-2 gold-text-gradient">{winner.teamName}</div>
            <div className="text-6xl font-black text-white/90 mb-4">{winner.percentage.toFixed(1)}%</div>
          </motion.section>
        )}

        <AnimatePresence>
          {isConfigOpen && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gold-400" />
                    Pondération des Tournois
                  </h3>
                  <div className={`text-sm font-mono px-3 py-1 rounded-full ${totalWeights === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    Total: {totalWeights}%
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-white/70">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-gold-400">{value}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={value} 
                        onChange={(e) => handleUpdateWeight(key as keyof TournamentWeights, parseInt(e.target.value))}
                        className="w-full accent-gold-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold-400" />
              Saisie des Statistiques
            </h3>
            <button 
              onClick={handleAddTeam}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/10 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Ajouter Équipe
            </button>
          </div>

          <div className="space-y-8">
            {teams.map((team) => (
              <div key={team.id} className="glass-card rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl">
                      {team.name.charAt(0)}
                    </div>
                    <input 
                      type="text" 
                      value={team.name}
                      onChange={(e) => handleUpdateTeam(team.id, 'name', e.target.value)}
                      className="bg-transparent text-2xl font-black border-b-2 border-transparent focus:border-gold-500 outline-none pb-1"
                    />
                  </div>
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Global & Fair Play */}
                  <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gold-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Critères Globaux
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <StatSelect 
                        label="Buts Marqués (Total)"
                        value={team.globalGoals}
                        onChange={(val) => handleUpdateTeam(team.id, 'globalGoals', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Fair-Play</label>
                        <select 
                          value={team.fairPlay}
                          onChange={(e) => handleUpdateTeam(team.id, 'fairPlay', e.target.value as FairPlay)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
                        >
                          <option value="Faible" className="bg-zinc-900">Faible</option>
                          <option value="Moyen" className="bg-zinc-900">Moyen</option>
                          <option value="Plein" className="bg-zinc-900">Plein</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Ligue Majeure */}
                  <TournamentSection 
                    title="Ligue Majeure FEPLC"
                    enabled={team.ligueMajeure.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'ligueMajeure.enabled', val)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Classement</label>
                        <select 
                          value={team.ligueMajeure.ranking}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueMajeure.ranking', e.target.value as RankingGroup)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
                        >
                          <option value="1-4" className="bg-zinc-900">1 à 4</option>
                          <option value="5-10" className="bg-zinc-900">5 à 10</option>
                          <option value="11-14" className="bg-zinc-900">11 à 14</option>
                          <option value="15-16" className="bg-zinc-900">15 et 16</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués"
                        value={team.ligueMajeure.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <StatSelect 
                        label="Buts Encaissés"
                        value={team.ligueMajeure.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <AvailabilitySelect 
                        value={team.ligueMajeure.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.availability', val)}
                      />
                    </div>
                  </TournamentSection>

                  {/* Ligue des Champions */}
                  <TournamentSection 
                    title="Ligue des Champions FEPLC"
                    enabled={team.ligueChampions.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'ligueChampions.enabled', val)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.ligueChampions.groupPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.groupPhase', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className="text-xs font-bold uppercase">Phase de groupe</span>
                      </div>
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.ligueChampions.won}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.won', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className="text-xs font-bold uppercase">Remporté (Finale)</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Phase Éliminatoire</label>
                        <select 
                          value={team.ligueChampions.knockoutPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.knockoutPhase', e.target.value as KnockoutPhase)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
                        >
                          <option value="Aucune" className="bg-zinc-900">Aucune</option>
                          <option value="Quart" className="bg-zinc-900">Quart de finale</option>
                          <option value="Demi" className="bg-zinc-900">Demi finale</option>
                          <option value="Finale" className="bg-zinc-900">Finale</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués"
                        value={team.ligueChampions.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <StatSelect 
                        label="Buts Encaissés"
                        value={team.ligueChampions.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <AvailabilitySelect 
                        value={team.ligueChampions.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.availability', val)}
                      />
                    </div>
                  </TournamentSection>

                  {/* Supercoupe */}
                  <TournamentSection 
                    title="Supercoupe FEPLC"
                    enabled={team.supercoupe.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'supercoupe.enabled', val)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Phase Éliminatoire</label>
                        <select 
                          value={team.supercoupe.knockoutPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'supercoupe.knockoutPhase', e.target.value as KnockoutPhase)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
                        >
                          <option value="Aucune" className="bg-zinc-900">Aucune</option>
                          <option value="Quart" className="bg-zinc-900">Quart de finale</option>
                          <option value="Demi" className="bg-zinc-900">Demi finale</option>
                          <option value="Finale" className="bg-zinc-900">Finale</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués & Diff"
                        value={team.supercoupe.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'supercoupe.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                    </div>
                  </TournamentSection>

                  {/* Power League */}
                  <TournamentSection 
                    title="Power League Cup"
                    enabled={team.powerLeague.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'powerLeague.enabled', val)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.powerLeague.groupPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'powerLeague.groupPhase', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className="text-xs font-bold uppercase">Phase de groupe</span>
                      </div>
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.powerLeague.knockoutPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'powerLeague.knockoutPhase', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className="text-xs font-bold uppercase">Phase éliminatoire</span>
                      </div>
                      <StatSelect 
                        label="Total Buts Marqués"
                        value={team.powerLeague.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <StatSelect 
                        label="Total Buts Encaissés"
                        value={team.powerLeague.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                      />
                      <AvailabilitySelect 
                        value={team.powerLeague.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.availability', val)}
                      />
                    </div>
                  </TournamentSection>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-400" />
            Classement Ballon d'Or
          </h3>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rang</th>
                  <th className="px-6 py-4 font-semibold">Équipe</th>
                  <th className="px-6 py-4 font-semibold text-right">Score Final (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((score, index) => (
                  <tr key={score.teamId} className={`group hover:bg-white/5 transition-colors ${index === 0 ? 'bg-gold-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'gold-gradient text-black' : 
                        index === 1 ? 'bg-zinc-300 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{score.teamName}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold ${index === 0 ? 'text-gold-400' : 'text-white/80'}`}>
                        {score.percentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-400" />
              Analyse IA FECOB
            </h3>
            <button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 gold-gradient text-black px-6 py-3 rounded-2xl transition-all font-bold text-sm disabled:opacity-50 shadow-lg shadow-gold-500/20"
            >
              {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Générer l'Analyse Expert
            </button>
          </div>

          {aiAnalysis ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-3xl p-8 border border-gold-500/20 space-y-8"
            >
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-white/90 leading-relaxed font-medium italic border-l-4 border-gold-500 pl-6">
                  "{aiAnalysis.summary}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiAnalysis.insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-gold-500/30 transition-all">
                    <div className="text-gold-400 font-black text-lg mb-2">{insight.teamName}</div>
                    <p className="text-sm text-white/70 leading-relaxed">{insight.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center border border-dashed border-white/10">
              <Info className="w-12 h-12 mx-auto mb-4 text-white/10" />
              <p className="text-white/30 font-medium">L'IA attend vos données pour produire une analyse détaillée.</p>
            </div>
          )}
        </section>

      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 text-center border-t border-white/5">
        <p className="text-white/20 text-xs uppercase tracking-[0.3em] font-bold">
          Ballon d'Or FECOB • Intelligence Artificielle de Décision
        </p>
      </footer>
    </div>
  );
}

function TournamentSection({ title, enabled, onToggle, children }: { title: string, enabled: boolean, onToggle: (val: boolean) => void, children: React.ReactNode }) {
  return (
    <div className={`space-y-6 p-6 rounded-2xl border transition-all ${enabled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/80">{title}</h4>
        <button onClick={() => onToggle(!enabled)}>
          {enabled ? <ToggleRight className="w-8 h-8 text-gold-400" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
        </button>
      </div>
      {enabled && <div className="space-y-4">{children}</div>}
    </div>
  );
}

function StatSelect({ label, value, onChange, options }: { label: string, value: number, onChange: (val: number) => void, options: number[] }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/40 uppercase font-bold">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
      </select>
    </div>
  );
}

function AvailabilitySelect({ value, onChange }: { value: Availability, onChange: (val: Availability) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/40 uppercase font-bold">Disponibilité</label>
      <select 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) as Availability)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
      >
        <option value={25} className="bg-zinc-900">25%</option>
        <option value={50} className="bg-zinc-900">50%</option>
        <option value={75} className="bg-zinc-900">75%</option>
        <option value={100} className="bg-zinc-900">100%</option>
      </select>
    </div>
  );
}
