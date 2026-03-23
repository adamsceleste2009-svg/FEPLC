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
  ToggleRight,
  AlertTriangle,
  Sun,
  Moon,
  Share2,
  Check
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
    powerLeague: { enabled: true, groupPhase: true, knockoutPhase: 'Finale', goalsScored: 12, goalsConceded: 4, availability: 100 }
  }
];

export default function App() {
  const [teams, setTeams] = useState<TeamStats[]>(INITIAL_TEAMS);
  const [weights, setWeights] = useState<TournamentWeights>(DEFAULT_TOURNAMENT_WEIGHTS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; insights: { teamName: string; comment: string }[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleCopyLink = () => {
    const shareUrl = "https://ais-pre-jow2ae4ptszf37gxtwisel-197130177783.us-east1.run.app";
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      powerLeague: { enabled: false, groupPhase: false, knockoutPhase: 'Aucune', goalsScored: 0, goalsConceded: 0, availability: 75 }
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
    setAnalysisError(null);
    try {
      const analysis = await getAIAnalysis(teams, weights, scores);
      if (analysis) {
        setAiAnalysis(analysis);
      } else {
        setAnalysisError("L'IA n'a pas pu générer l'analyse. Veuillez réessayer.");
      }
    } catch (e) {
      setAnalysisError("Une erreur est survenue lors de l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'} pb-20 transition-colors duration-300`}>
      <header className={`sticky top-0 z-50 ${theme === 'dark' ? 'glass-card border-white/10' : 'bg-white/80 backdrop-blur-md border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Trophy className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight gold-text-gradient">Ballon d'Or FECOB</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'hover:bg-white/5 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
            title="Copier le lien de l'analyse"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copié' : 'Partager'}
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <Settings className={`w-6 h-6 ${isConfigOpen ? 'text-gold-400' : theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`} />
          </button>
        </div>
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
            <div className={`text-6xl font-black mb-4 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>{winner.percentage.toFixed(1)}%</div>
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
              <div className={`${theme === 'dark' ? 'glass-card border-white/10' : 'bg-white border-gray-200 shadow-sm'} rounded-2xl p-6 border space-y-6`}>
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
                        <span className={`capitalize ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-gold-400">{value}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={value} 
                        onChange={(e) => handleUpdateWeight(key as keyof TournamentWeights, parseInt(e.target.value))}
                        className={`w-full accent-gold-500 h-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer`}
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
              <div key={team.id} className={`${theme === 'dark' ? 'glass-card border-white/5 hover:border-white/20' : 'bg-white border-gray-200 shadow-md hover:shadow-lg'} rounded-3xl p-8 border transition-all`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center font-bold text-xl`}>
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
                    className={`p-2 ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'} hover:text-red-400 transition-colors`}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Global & Fair Play */}
                  <div className={`space-y-6 p-6 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'} border`}>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gold-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Critères Globaux
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <StatSelect 
                        label="Buts Marqués (Total)"
                        value={team.globalGoals}
                        onChange={(val) => handleUpdateTeam(team.id, 'globalGoals', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <div className="space-y-2">
                        <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Fair-Play</label>
                        <select 
                          value={team.fairPlay}
                          onChange={(e) => handleUpdateTeam(team.id, 'fairPlay', e.target.value as FairPlay)}
                          className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
                        >
                          <option value="Faible" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Faible</option>
                          <option value="Moyen" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Moyen</option>
                          <option value="Plein" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Plein</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Ligue Majeure */}
                  <TournamentSection 
                    title="Ligue Majeure FEPLC"
                    enabled={team.ligueMajeure.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'ligueMajeure.enabled', val)}
                    theme={theme}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Classement</label>
                        <select 
                          value={team.ligueMajeure.ranking}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueMajeure.ranking', e.target.value as RankingGroup)}
                          className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
                        >
                          <option value="1-4" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>1 à 4</option>
                          <option value="5-10" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>5 à 10</option>
                          <option value="11-14" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>11 à 14</option>
                          <option value="15-16" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>15 et 16</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués"
                        value={team.ligueMajeure.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <StatSelect 
                        label="Buts Encaissés"
                        value={team.ligueMajeure.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <AvailabilitySelect 
                        value={team.ligueMajeure.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueMajeure.availability', val)}
                        theme={theme}
                      />
                    </div>
                  </TournamentSection>

                  {/* Ligue des Champions */}
                  <TournamentSection 
                    title="Ligue des Champions FEPLC"
                    enabled={team.ligueChampions.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'ligueChampions.enabled', val)}
                    theme={theme}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.ligueChampions.groupPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.groupPhase', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Phase de groupe</span>
                      </div>
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.ligueChampions.won}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.won', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Remporté (Finale)</span>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Phase Éliminatoire</label>
                        <select 
                          value={team.ligueChampions.knockoutPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'ligueChampions.knockoutPhase', e.target.value as KnockoutPhase)}
                          className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
                        >
                          <option value="Aucune" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Aucune</option>
                          <option value="8ème" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>8ème de finale</option>
                          <option value="Quart" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Quart de finale</option>
                          <option value="Demi" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Demi finale</option>
                          <option value="Finale" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Finale</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués"
                        value={team.ligueChampions.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <StatSelect 
                        label="Buts Encaissés"
                        value={team.ligueChampions.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <AvailabilitySelect 
                        value={team.ligueChampions.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'ligueChampions.availability', val)}
                        theme={theme}
                      />
                    </div>
                  </TournamentSection>

                  {/* Supercoupe */}
                  <TournamentSection 
                    title="Supercoupe FEPLC"
                    enabled={team.supercoupe.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'supercoupe.enabled', val)}
                    theme={theme}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Phase Éliminatoire</label>
                        <select 
                          value={team.supercoupe.knockoutPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'supercoupe.knockoutPhase', e.target.value as KnockoutPhase)}
                          className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
                        >
                          <option value="Aucune" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Aucune</option>
                          <option value="8ème" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>8ème de finale</option>
                          <option value="Quart" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Quart de finale</option>
                          <option value="Demi" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Demi finale</option>
                          <option value="Finale" className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>Finale</option>
                        </select>
                      </div>
                      <StatSelect 
                        label="Buts Marqués & Diff"
                        value={team.supercoupe.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'supercoupe.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                    </div>
                  </TournamentSection>

                  {/* Power League */}
                  <TournamentSection 
                    title="Power League Cup"
                    enabled={team.powerLeague.enabled}
                    onToggle={(val) => handleUpdateTeam(team.id, 'powerLeague.enabled', val)}
                    theme={theme}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          checked={team.powerLeague.groupPhase}
                          onChange={(e) => handleUpdateTeam(team.id, 'powerLeague.groupPhase', e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Phase de groupe</span>
                      </div>
                      <div className="col-span-2 space-y-3">
                        <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Phase Éliminatoire (Cocher la plus haute atteinte)</label>
                        <div className="flex flex-wrap gap-4">
                          {(['Quart', 'Demi', 'Finale'] as KnockoutPhase[]).map((phase) => (
                            <label key={phase} className="flex items-center gap-2 cursor-pointer group">
                              <div 
                                onClick={() => handleUpdateTeam(team.id, 'powerLeague.knockoutPhase', team.powerLeague.knockoutPhase === phase ? 'Aucune' : phase)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                  team.powerLeague.knockoutPhase === phase 
                                    ? 'bg-gold-500 border-gold-500' 
                                    : theme === 'dark' ? 'border-white/20 hover:border-white/40' : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {team.powerLeague.knockoutPhase === phase && <Check className="w-3.5 h-3.5 text-black" />}
                              </div>
                              <span className={`text-xs font-bold uppercase ${
                                team.powerLeague.knockoutPhase === phase 
                                  ? 'text-gold-400' 
                                  : theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                              }`}>
                                {phase === 'Quart' ? 'Quart' : phase === 'Demi' ? 'Demi' : 'Finale'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <StatSelect 
                        label="Total Buts Marqués"
                        value={team.powerLeague.goalsScored}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.goalsScored', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <StatSelect 
                        label="Total Buts Encaissés"
                        value={team.powerLeague.goalsConceded}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.goalsConceded', val)}
                        options={Array.from({length: 101}, (_, i) => i)}
                        theme={theme}
                      />
                      <AvailabilitySelect 
                        value={team.powerLeague.availability}
                        onChange={(val) => handleUpdateTeam(team.id, 'powerLeague.availability', val)}
                        theme={theme}
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
          <div className={`rounded-3xl overflow-hidden border ${theme === 'dark' ? 'glass-card border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
            <table className="w-full text-left">
              <thead className={`${theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'} text-xs uppercase tracking-wider`}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Rang</th>
                  <th className="px-6 py-4 font-semibold">Équipe</th>
                  <th className="px-6 py-4 font-semibold text-right">Score Final (%)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                {scores.map((score, index) => (
                  <tr key={score.teamId} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${index === 0 ? (theme === 'dark' ? 'bg-gold-500/5' : 'bg-gold-50') : ''}`}>
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'gold-gradient text-black' : 
                        index === 1 ? 'bg-zinc-300 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' : (theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-500')
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{score.teamName}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold ${index === 0 ? 'text-gold-400' : (theme === 'dark' ? 'text-white/80' : 'text-gray-700')}`}>
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
              className={`rounded-3xl p-8 border space-y-8 ${theme === 'dark' ? 'glass-card border-gold-500/20' : 'bg-white border-gold-200 shadow-xl'}`}
            >
              <div className="prose prose-invert max-w-none">
                <p className={`text-xl leading-relaxed font-medium italic border-l-4 border-gold-500 pl-6 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>
                  "{aiAnalysis.summary}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiAnalysis.insights.map((insight, idx) => (
                  <div key={idx} className={`rounded-2xl p-6 border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-gold-500/30' : 'bg-gray-50 border-gray-100 hover:border-gold-300 shadow-sm'}`}>
                    <div className="text-gold-400 font-black text-lg mb-2">{insight.teamName}</div>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>{insight.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : analysisError ? (
            <div className={`rounded-3xl p-16 text-center border ${theme === 'dark' ? 'glass-card border-red-500/20 bg-red-500/5' : 'bg-red-50 border-red-100'}`}>
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500/40" />
              <p className="text-red-400 font-medium">{analysisError}</p>
              <button 
                onClick={runAIAnalysis}
                className={`mt-6 text-xs uppercase tracking-widest font-bold transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className={`rounded-3xl p-16 text-center border border-dashed ${theme === 'dark' ? 'glass-card border-white/10' : 'bg-white border-gray-200'}`}>
              <Info className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-white/10' : 'text-gray-200'}`} />
              <p className={`${theme === 'dark' ? 'text-white/30' : 'text-gray-400'} font-medium`}>L'IA attend vos données pour produire une analyse détaillée.</p>
            </div>
          )}
        </section>

      </main>

      <footer className={`max-w-5xl mx-auto px-6 py-12 text-center border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
        <p className={`${theme === 'dark' ? 'text-white/20' : 'text-gray-400'} text-xs uppercase tracking-[0.3em] font-bold`}>
          Ballon d'Or FECOB • Intelligence Artificielle de Décision
        </p>
      </footer>
    </div>
  );
}

function TournamentSection({ title, enabled, onToggle, theme, children }: { title: string, enabled: boolean, onToggle: (val: boolean) => void, theme: 'dark' | 'light', children: React.ReactNode }) {
  return (
    <div className={`space-y-6 p-6 rounded-2xl border transition-all ${
      enabled 
        ? (theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm') 
        : (theme === 'dark' ? 'bg-black/40 border-white/5 opacity-50' : 'bg-gray-100 border-gray-200 opacity-50')
    }`}>
      <div className="flex justify-between items-center">
        <h4 className={`text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{title}</h4>
        <button onClick={() => onToggle(!enabled)}>
          {enabled ? <ToggleRight className="w-8 h-8 text-gold-400" /> : <ToggleLeft className={`w-8 h-8 ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`} />}
        </button>
      </div>
      {enabled && <div className="space-y-4">{children}</div>}
    </div>
  );
}

function StatSelect({ label, value, onChange, options, theme }: { label: string, value: number, onChange: (val: number) => void, options: number[], theme: 'dark' | 'light' }) {
  return (
    <div className="space-y-2">
      <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
      >
        {options.map(opt => <option key={opt} value={opt} className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>{opt}</option>)}
      </select>
    </div>
  );
}

function AvailabilitySelect({ value, onChange, theme }: { value: Availability, onChange: (val: Availability) => void, theme: 'dark' | 'light' }) {
  return (
    <div className="space-y-2">
      <label className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'} uppercase font-bold`}>Disponibilité</label>
      <select 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) as Availability)}
        className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500`}
      >
        <option value={25} className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>25%</option>
        <option value={50} className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>50%</option>
        <option value={75} className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>75%</option>
        <option value={100} className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}>100%</option>
      </select>
    </div>
  );
}
