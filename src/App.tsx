/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  teams2022,
  matches2022,
  bracket2022,
  timeline2022,
  teams2018,
  matches2018,
  bracket2018,
  timeline2018,
  teams2014,
  matches2014,
  bracket2014,
  timeline2014
} from "./data/initialData";
import { TeamNode, MatchEdge, BracketNode, TimelineNode } from "./types";
import GraphVisualizer from "./components/GraphVisualizer";
import TreeBracket from "./components/TreeBracket";
import TimelineLinkedList from "./components/TimelineLinkedList";
import ScoreCharts from "./components/ScoreCharts";
import { Trophy, GitBranch, Share2, Award, Info, RefreshCw, BarChart2, Calendar } from "lucide-react";

export default function App() {
  // Global States for World Cup Data Structures
  const [edition, setEdition] = useState<"2022" | "2018" | "2014">("2022");
  const [teams, setTeams] = useState<TeamNode[]>(teams2022);
  const [matches, setMatches] = useState<MatchEdge[]>(matches2022);
  const [bracket, setBracket] = useState<Record<string, BracketNode>>(bracket2022);
  const [timeline, setTimeline] = useState<TimelineNode[]>(timeline2022);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<"grafo" | "arbol" | "lista" | "stats">("grafo");

  // Reset all structures to initial state of currently selected edition
  const handleResetAllData = () => {
    if (window.confirm(`¿Estás seguro de que quieres restablecer todas las estructuras a los datos iniciales del Mundial de ${edition}?`)) {
      if (edition === "2022") {
        setTeams(teams2022);
        setMatches(matches2022);
        setBracket(bracket2022);
        setTimeline(timeline2022);
      } else if (edition === "2018") {
        setTeams(teams2018);
        setMatches(matches2018);
        setBracket(bracket2018);
        setTimeline(timeline2018);
      } else if (edition === "2014") {
        setTeams(teams2014);
        setMatches(matches2014);
        setBracket(bracket2014);
        setTimeline(timeline2014);
      }
    }
  };

  const handleEditionChange = (newEdition: "2022" | "2018" | "2014") => {
    setEdition(newEdition);
    if (newEdition === "2022") {
      setTeams(teams2022);
      setMatches(matches2022);
      setBracket(bracket2022);
      setTimeline(timeline2022);
    } else if (newEdition === "2018") {
      setTeams(teams2018);
      setMatches(matches2018);
      setBracket(bracket2018);
      setTimeline(timeline2018);
    } else if (newEdition === "2014") {
      setTeams(teams2014);
      setMatches(matches2014);
      setBracket(bracket2014);
      setTimeline(timeline2014);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-zinc-100 flex flex-col font-sans" id="app-root">
      {/* Dynamic Background subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]" id="grid-pattern-overlay">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      {/* Main Header with High Density styling and metrics */}
      <header className="relative z-10 border-b border-slate-800 bg-[#0D1117] px-4 py-3 shadow-sm" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-lg shadow-md text-zinc-950">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">WORLD CUP DS_VISUALIZER // v2.5</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h1 className="text-base font-bold text-white leading-tight">Mundial Data-Structures Platform</h1>
            </div>
          </div>

          {/* High Density Telemetry metrics boxes */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]" id="header-telemetry-panel">
            {/* Edition Switcher Button Group */}
            <div className="bg-[#161B22] border border-slate-800 p-0.5 rounded-md flex items-center gap-1" id="edition-selector-panel">
              <span className="text-zinc-500 font-bold px-1.5 uppercase select-none text-[9px] flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>EDICIÓN:</span>
              </span>
              <button
                onClick={() => handleEditionChange("2014")}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer uppercase ${
                  edition === "2014"
                    ? "bg-[#1F2937] text-sky-400 border border-slate-700/60"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                id="btn-select-2014"
              >
                2014 BRASIL
              </button>
              <button
                onClick={() => handleEditionChange("2018")}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer uppercase ${
                  edition === "2018"
                    ? "bg-[#1F2937] text-sky-400 border border-slate-700/60"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                id="btn-select-2018"
              >
                2018 RUSIA
              </button>
              <button
                onClick={() => handleEditionChange("2022")}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer uppercase ${
                  edition === "2022"
                    ? "bg-[#1F2937] text-sky-400 border border-slate-700/60"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                id="btn-select-2022"
              >
                2022 QATAR
              </button>
            </div>

            <div className="bg-[#161B22] border border-slate-800 px-2.5 py-1.5 rounded-md flex items-center gap-2">
              <span className="text-zinc-500 font-bold">VERTICES:</span>
              <span className="text-sky-400 font-extrabold">{teams.length}</span>
            </div>
            <div className="bg-[#161B22] border border-slate-800 px-2.5 py-1.5 rounded-md flex items-center gap-2">
              <span className="text-zinc-500 font-bold">EDGES:</span>
              <span className="text-amber-400 font-extrabold">{matches.length}</span>
            </div>
            <div className="bg-[#161B22] border border-slate-800 px-2.5 py-1.5 rounded-md flex items-center gap-2">
              <span className="text-zinc-500 font-bold">MODE:</span>
              <span className="text-emerald-400 font-extrabold">LIVE_CLIENT_REACTIVE</span>
            </div>

            <button
              onClick={handleResetAllData}
              className="flex items-center gap-1.5 bg-[#161B22] border border-slate-800 hover:border-red-500/40 hover:bg-red-950/20 text-zinc-300 hover:text-red-400 px-3 py-1.5 rounded-md transition cursor-pointer"
              id="btn-reset-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>

        </div>
      </header>

      {/* Navigation tabs - Clean console layout */}
      <nav className="relative z-10 border-b border-slate-800 bg-[#0D1117]/60 backdrop-blur-md" id="app-nav">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-1.5" id="tabs-list">
            <button
              onClick={() => setActiveTab("grafo")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "grafo"
                  ? "bg-[#1F2937] text-sky-400 border border-slate-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
              id="tab-grafo"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>01. GRAFO_CONEXIONES</span>
            </button>

            <button
              onClick={() => setActiveTab("arbol")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "arbol"
                  ? "bg-[#1F2937] text-sky-400 border border-slate-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
              id="tab-arbol"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>02. ARBOL_DECISION_PLAYOFFS</span>
            </button>

            <button
              onClick={() => setActiveTab("lista")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "lista"
                  ? "bg-[#1F2937] text-sky-400 border border-slate-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
              id="tab-lista"
            >
              <Award className="w-3.5 h-3.5" />
              <span>03. LISTA_ENLAZADA_TIMELINE</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "stats"
                  ? "bg-[#1F2937] text-sky-400 border border-slate-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
              id="tab-stats"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>04. GRAPH_LIVE_STATS</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10" id="app-main-content">
        {/* Render active view */}
        <div className="space-y-6" id="active-tab-container">
          {activeTab === "grafo" && (
            <GraphVisualizer
              teams={teams}
              matches={matches}
              onUpdateTeams={setTeams}
              onUpdateMatches={setMatches}
            />
          )}

          {activeTab === "arbol" && (
            <TreeBracket
              bracket={bracket}
              onUpdateBracket={setBracket}
            />
          )}

          {activeTab === "lista" && (
            <TimelineLinkedList
              timeline={timeline}
              onUpdateTimeline={setTimeline}
            />
          )}

          {activeTab === "stats" && (
            <ScoreCharts
              teams={teams}
              matches={matches}
            />
          )}
        </div>
      </main>

      {/* Footnote / Info panel */}
      <footer className="border-t border-slate-800 bg-[#0D1117] py-4 relative z-10 text-xs text-zinc-500 font-mono" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2" id="footer-data-structure-status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">CLUSTER: WC_2022_MAIN // SEED: 0xFA4B22 // RENDER: WEBGL_CANVAS_EMU</span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            React + Vite + Tailwind v4 + Recharts • Live Data Sincronizado
          </p>
        </div>
      </footer>
    </div>
  );
}
