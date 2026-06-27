/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { BracketNode } from "../types";
import { Trophy, ArrowRight, RefreshCw, GitFork, HelpCircle } from "lucide-react";
import { buildHldModelFromBracket, type HLDModel } from "../lib/hld";

interface TreeBracketProps {
  bracket: Record<string, BracketNode>;
  onUpdateBracket: (bracket: Record<string, BracketNode>) => void;
}

export default function TreeBracket({ bracket, onUpdateBracket }: TreeBracketProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState<string>("");
  const [scoreB, setScoreB] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);

  const [hldModel, setHldModel] = useState<HLDModel>(() => buildHldModelFromBracket(bracket));
  const [hldRefreshKey, setHldRefreshKey] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("Alemania");
  const [scenarioNodeId, setScenarioNodeId] = useState("F");
  const [scenarioHome, setScenarioHome] = useState("2");
  const [scenarioAway, setScenarioAway] = useState("1");
  const [scenarioWinner, setScenarioWinner] = useState("");
  const [activeHldVersion, setActiveHldVersion] = useState(0);

  useEffect(() => {
    setHldModel(buildHldModelFromBracket(bracket));
    setActiveHldVersion(0);
    setHldRefreshKey((value) => value + 1);
  }, [bracket]);

  const hldTeamOptions = useMemo(() => {
    const teams = Object.values(bracket)
      .flatMap((node) => [node.teamA, node.teamB])
      .filter((team): team is string => Boolean(team));
    return Array.from(new Set(teams));
  }, [bracket]);

  const hldNodeOptions = useMemo(() => Object.values(bracket), [bracket]);

  const currentTeamPath = hldModel.queryTeamPath(selectedTeam, activeHldVersion);
  const currentNodeValue = hldModel.getNodeValue(scenarioNodeId, activeHldVersion);
  const hldChains = hldModel.getChains();

  const handleCreateScenario = (event: React.FormEvent) => {
    event.preventDefault();
    const home = Number(scenarioHome);
    const away = Number(scenarioAway);
    const version = hldModel.createScenario(scenarioNodeId, home, away, scenarioWinner || "");
    setActiveHldVersion(version);
    setHldRefreshKey((value) => value + 1);
  };

  // Trigger score update and winner propagation in the tree
  const updateMatchScore = (nodeId: string, sA: number, sB: number) => {
    const updatedBracket = { ...bracket };
    const node = { ...updatedBracket[nodeId] };

    node.scoreA = sA;
    node.scoreB = sB;

    // Determine winner (resolve draw for knockout - simple default)
    let winnerName: string | null = null;
    if (sA > sB) {
      winnerName = node.teamA;
    } else if (sB > sA) {
      winnerName = node.teamB;
    } else {
      // In case of draws in tournament knockout, we assume a penalty winner (for simplicity, teamA wins)
      winnerName = node.teamA;
    }
    node.winner = winnerName;
    updatedBracket[nodeId] = node;

    // Propagate up to parent node
    if (node.parentId) {
      const parentNode = { ...updatedBracket[node.parentId] };
      const isLeft = parentNode.leftChildId === nodeId;

      if (isLeft) {
        parentNode.teamA = winnerName;
      } else {
        parentNode.teamB = winnerName;
      }

      // If the parent had a winner previously, it should be cleared or updated, as team participants changed
      parentNode.scoreA = null;
      parentNode.scoreB = null;
      parentNode.winner = null;

      updatedBracket[node.parentId] = parentNode;

      let grandparentPointer = parentNode.parentId;
      let childPointer = node.parentId;
      while (grandparentPointer) {
        const grandparent = { ...updatedBracket[grandparentPointer] };
        const isLeftChild = grandparent.leftChildId === childPointer;
        if (isLeftChild) {
          grandparent.teamA = null;
        } else {
          grandparent.teamB = null;
        }
        grandparent.scoreA = null;
        grandparent.scoreB = null;
        grandparent.winner = null;
        updatedBracket[grandparentPointer] = grandparent;

        childPointer = grandparentPointer;
        grandparentPointer = grandparent.parentId;
      }
    }

    onUpdateBracket(updatedBracket);
  };

  const handleOpenEdit = (nodeId: string) => {
    const node = bracket[nodeId];
    setSelectedNodeId(nodeId);
    setScoreA(node.scoreA !== null ? String(node.scoreA) : "");
    setScoreB(node.scoreB !== null ? String(node.scoreB) : "");
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId) return;

    const valA = scoreA === "" ? 0 : Number(scoreA);
    const valB = scoreB === "" ? 0 : Number(scoreB);

    updateMatchScore(selectedNodeId, valA, valB);
    setSelectedNodeId(null);
  };

  // Simulates random scores for all matches in the bracket tree to show dynamic propagation
  const handleSimulateAll = () => {
    const newBracket = { ...bracket };
    const leaves = ["QF1", "QF2", "QF3", "QF4"];

    // 1. Simulate QF
    leaves.forEach((id) => {
      const node = newBracket[id];
      const sa = Math.floor(Math.random() * 4);
      const sb = Math.floor(Math.random() * 4);
      // force non-draw for simulation
      const scoreA = sa === sb ? sa + 1 : sa;
      const scoreB = sb;
      node.scoreA = scoreA;
      node.scoreB = scoreB;
      node.winner = scoreA > scoreB ? node.teamA : node.teamB;
    });

    // 2. Propagate to SF
    newBracket["SF1"].teamA = newBracket["QF1"].winner;
    newBracket["SF1"].teamB = newBracket["QF2"].winner;
    newBracket["SF1"].scoreA = null;
    newBracket["SF1"].scoreB = null;
    newBracket["SF1"].winner = null;

    newBracket["SF2"].teamA = newBracket["QF3"].winner;
    newBracket["SF2"].teamB = newBracket["QF4"].winner;
    newBracket["SF2"].scoreA = null;
    newBracket["SF2"].scoreB = null;
    newBracket["SF2"].winner = null;

    // 3. Simulate SF
    ["SF1", "SF2"].forEach((id) => {
      const node = newBracket[id];
      const sa = Math.floor(Math.random() * 3);
      const sb = Math.floor(Math.random() * 3);
      const scoreA = sa === sb ? sa + 1 : sa;
      const scoreB = sb;
      node.scoreA = scoreA;
      node.scoreB = scoreB;
      node.winner = scoreA > scoreB ? node.teamA : node.teamB;
    });

    // 4. Propagate to F
    newBracket["F"].teamA = newBracket["SF1"].winner;
    newBracket["F"].teamB = newBracket["SF2"].winner;
    newBracket["F"].scoreA = null;
    newBracket["F"].scoreB = null;
    newBracket["F"].winner = null;

    // 5. Simulate Final
    const finalNode = newBracket["F"];
    const sa = Math.floor(Math.random() * 3);
    const sb = Math.floor(Math.random() * 3);
    const scoreA = sa === sb ? sa + 1 : sa;
    const scoreB = sb;
    finalNode.scoreA = scoreA;
    finalNode.scoreB = scoreB;
    finalNode.winner = scoreA > scoreB ? finalNode.teamA : finalNode.teamB;

    onUpdateBracket(newBracket);
  };

  const handleResetBracket = () => {
    const freshBracket: Record<string, BracketNode> = {
      "QF1": { id: "QF1", stageName: "Cuartos de Final", teamA: "Países Bajos", teamB: "Argentina", scoreA: null, scoreB: null, winner: null, leftChildId: null, rightChildId: null, parentId: "SF1" },
      "QF2": { id: "QF2", stageName: "Cuartos de Final", teamA: "Croacia", teamB: "Brasil", scoreA: null, scoreB: null, winner: null, leftChildId: null, rightChildId: null, parentId: "SF1" },
      "QF3": { id: "QF3", stageName: "Cuartos de Final", teamA: "Inglaterra", teamB: "Francia", scoreA: null, scoreB: null, winner: null, leftChildId: null, rightChildId: null, parentId: "SF2" },
      "QF4": { id: "QF4", stageName: "Cuartos de Final", teamA: "Marruecos", teamB: "Portugal", scoreA: null, scoreB: null, winner: null, leftChildId: null, rightChildId: null, parentId: "SF2" },
      "SF1": { id: "SF1", stageName: "Semifinal", teamA: null, teamB: null, scoreA: null, scoreB: null, winner: null, leftChildId: "QF1", rightChildId: "QF2", parentId: "F" },
      "SF2": { id: "SF2", stageName: "Semifinal", teamA: null, teamB: null, scoreA: null, scoreB: null, winner: null, leftChildId: "QF3", rightChildId: "QF4", parentId: "F" },
      "F": { id: "F", stageName: "Final del Mundial", teamA: null, teamB: null, scoreA: null, scoreB: null, winner: null, leftChildId: "SF1", rightChildId: "SF2", parentId: null }
    };
    onUpdateBracket(freshBracket);
  };

  // Node Component for rendering inside columns
  const NodeCard = ({ id }: { id: string }) => {
    const node = bracket[id];
    const isEditing = selectedNodeId === id;
    const hasTeams = node.teamA || node.teamB;

    return (
      <div
        className={`bg-[#0D1117] border ${
          isEditing
            ? "border-sky-500 shadow-md shadow-sky-500/5 ring-1 ring-sky-500"
            : node.winner
            ? "border-emerald-500/40 hover:border-emerald-500/70"
            : "border-slate-800 hover:border-slate-700"
        } rounded-lg p-3 transition-all w-52 relative group`}
        id={`node-card-${id}`}
      >
        <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{node.stageName}</span>
          <span className="text-[9px] font-mono bg-[#161B22] border border-slate-800 px-1 py-0.5 rounded text-sky-400 font-bold">{node.id}</span>
        </div>

        {/* Score & Teams View */}
        <div className="space-y-1 text-xs font-mono">
          {/* Team A Row */}
          <div className={`flex justify-between items-center py-0.5 px-1 rounded ${node.winner === node.teamA && node.winner ? "bg-emerald-950/20 text-emerald-400 font-bold" : "text-zinc-300"}`}>
            <span className="truncate max-w-[120px]">
              {node.teamA ? node.teamA : <span className="text-zinc-600 italic text-[11px]">TBD_LEFT</span>}
            </span>
            <span className="font-mono text-[11px] text-zinc-200 bg-[#07090E] px-1 py-0.5 rounded min-w-[18px] text-center border border-slate-800/40">
              {node.scoreA !== null ? node.scoreA : "-"}
            </span>
          </div>

          {/* Team B Row */}
          <div className={`flex justify-between items-center py-0.5 px-1 rounded ${node.winner === node.teamB && node.winner ? "bg-emerald-950/20 text-emerald-400 font-bold" : "text-zinc-300"}`}>
            <span className="truncate max-w-[120px]">
              {node.teamB ? node.teamB : <span className="text-zinc-600 italic text-[11px]">TBD_RIGHT</span>}
            </span>
            <span className="font-mono text-[11px] text-zinc-200 bg-[#07090E] px-1 py-0.5 rounded min-w-[18px] text-center border border-slate-800/40">
              {node.scoreB !== null ? node.scoreB : "-"}
            </span>
          </div>
        </div>

        {/* Action controls inside the node */}
        <div className="mt-2 pt-1 border-t border-slate-800/60 flex justify-between items-center text-[9px] font-mono">
          {node.winner ? (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <Trophy className="w-2.5 h-2.5 text-amber-500" />
              <span className="truncate max-w-[90px]">{node.winner}</span>
            </div>
          ) : (
            <span className="text-zinc-500 italic">PENDIENTE</span>
          )}

          {hasTeams && !isEditing && (
            <button
              onClick={() => handleOpenEdit(id)}
              className="text-amber-500 hover:text-amber-400 hover:underline font-mono cursor-pointer transition-all"
            >
              [SCORE]
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" id="tree-bracket-container">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1117] border border-slate-800 rounded-xl px-4 py-3" id="tree-bracket-toolbar">
        <div className="flex items-center gap-3">
          <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
            <GitFork className="w-4 h-4 transform rotate-90" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-tight">ARBOL_BINARIO_PLAYOFFS</h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              Los ganadores propagan recursivamente de forma ascendente hacia la Raíz (Final)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 border border-slate-800 hover:bg-slate-800/40 px-2.5 py-1.5 rounded transition font-medium cursor-pointer uppercase"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explicación</span>
          </button>
          <button
            onClick={handleResetBracket}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 px-2.5 py-1.5 rounded transition font-medium cursor-pointer uppercase"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
          <button
            onClick={handleSimulateAll}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded transition font-bold shadow-sm cursor-pointer uppercase"
          >
            <Trophy className="w-3 h-3" />
            <span>Simular Todo</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4" id="hld-advanced-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-tight">HLD + PATH COPYING</h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              El árbol del torneo se aplana en cadenas pesadas para consultar trayectorias con complejidad logarítmica y crear versiones persistentes por escenario.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span className="rounded-full border border-slate-700 px-2 py-1">Versiones: {hldModel.getCurrentVersion()}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1">Cadenas: {hldChains.length}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCreateScenario} className="space-y-3 rounded-lg border border-slate-800 bg-[#07090E] p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Equipo
                <select
                  value={selectedTeam}
                  onChange={(event) => setSelectedTeam(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-700 bg-[#0D1117] px-2 py-2 text-sm text-zinc-100"
                >
                  {hldTeamOptions.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Partido a modificar
                <select
                  value={scenarioNodeId}
                  onChange={(event) => setScenarioNodeId(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-700 bg-[#0D1117] px-2 py-2 text-sm text-zinc-100"
                >
                  {hldNodeOptions.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.id} · {node.stageName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Goles local
                <input
                  type="number"
                  min="0"
                  value={scenarioHome}
                  onChange={(event) => setScenarioHome(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-700 bg-[#0D1117] px-2 py-2 text-sm text-zinc-100"
                />
              </label>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Goles visita
                <input
                  type="number"
                  min="0"
                  value={scenarioAway}
                  onChange={(event) => setScenarioAway(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-700 bg-[#0D1117] px-2 py-2 text-sm text-zinc-100"
                />
              </label>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Ganador
                <input
                  type="text"
                  value={scenarioWinner}
                  onChange={(event) => setScenarioWinner(event.target.value)}
                  placeholder="Opcional"
                  className="mt-1 w-full rounded border border-slate-700 bg-[#0D1117] px-2 py-2 text-sm text-zinc-100"
                />
              </label>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded bg-sky-600 px-3 py-2 text-[10px] font-mono font-bold uppercase text-white transition hover:bg-sky-500"
            >
              <Trophy className="h-3.5 w-3.5" />
              Crear escenario
            </button>
          </form>

          <div className="space-y-3 rounded-lg border border-slate-800 bg-[#07090E] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wide text-zinc-400">Resumen de la versión activa</p>
                <p className="text-sm font-semibold text-zinc-100">v{activeHldVersion}</p>
              </div>
              <div className="text-right text-[10px] font-mono text-zinc-400">
                <p>Goles totales: <span className="text-sky-400">{currentTeamPath.totalGoals}</span></p>
                <p>Mayor diferencia: <span className="text-amber-400">{currentTeamPath.maxGoalDiff}</span></p>
              </div>
            </div>

            <div className="rounded border border-slate-800 p-2 text-[10px] font-mono text-zinc-400">
              <p className="mb-1 text-[9px] uppercase tracking-wide text-zinc-500">Trayectoria de {selectedTeam}</p>
              <div className="space-y-1">
                {currentTeamPath.path.map((node, index) => {
                  const versionValue = hldModel.getNodeValue(node.id, activeHldVersion);
                  return (
                    <div key={`${node.id}-${index}`} className="flex items-center justify-between rounded bg-[#0D1117] px-2 py-1 text-zinc-300">
                      <span>{node.id} · {node.stageName}</span>
                      <span>{versionValue.homeScore}-{versionValue.awayScore}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded border border-slate-800 p-2 text-[10px] font-mono text-zinc-400">
              <p className="mb-1 text-[9px] uppercase tracking-wide text-zinc-500">Nodo seleccionado</p>
              <div className="flex items-center justify-between rounded bg-[#0D1117] px-2 py-1 text-zinc-300">
                <span>{scenarioNodeId} · {currentNodeValue.homeScore}-{currentNodeValue.awayScore}</span>
                <span>{currentNodeValue.winner ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured explanation panel */}
      {showExplanation && (
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 text-[11px] leading-relaxed text-zinc-300 space-y-2 font-mono shadow-sm" id="tree-structural-explanation">
          <p className="text-sky-400 font-bold">🎄 ARBOL BINARIO Y EL MUNDIAL:</p>
          <p>
            Un torneo de eliminación directa es un árbol binario invertido:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>La <strong>Raíz</strong> es el partido final (ID: <code>F</code>). El ganador de la raíz es el Campeón.</li>
            <li>Cada nodo padre tiene dos <strong>Hijos</strong> (izquierdo y derecho) que representan los enfrentamientos previos.</li>
            <li>Las hojas (leaves) son los Cuartos de Final (<code>QF1 - QF4</code>).</li>
            <li>Actualizar un marcador propaga el ganador de manera ascendente re-enlazando los valores de los padres.</li>
          </ul>
        </div>
      )}

      {/* Main Bracket Layout and Score Editor Popup */}
      <div className="relative" id="bracket-main-layout">
        {selectedNodeId && (
          <div className="absolute inset-0 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl p-4">
            <form onSubmit={handleSaveScore} className="bg-[#0D1117] border border-slate-800 p-5 rounded-xl shadow-2xl max-w-xs w-full space-y-3 font-mono">
              <div className="text-center">
                <span className="text-[9px] text-sky-400 uppercase tracking-widest">{bracket[selectedNodeId].stageName}</span>
                <h4 className="text-xs font-bold text-zinc-100">MODIFICAR_NODO // {selectedNodeId}</h4>
              </div>

              <div className="flex items-center justify-between gap-2 py-2.5 bg-[#07090E] rounded-lg px-3 border border-slate-800">
                <div className="text-center flex-1">
                  <span className="text-[10px] font-bold text-zinc-300 block truncate">{bracket[selectedNodeId].teamA}</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className="w-12 bg-[#0D1117] border border-slate-700 rounded py-1 text-center font-mono text-sm text-zinc-100 font-bold mt-1.5"
                  />
                </div>
                <span className="text-zinc-600 font-bold text-sm">-</span>
                <div className="text-center flex-1">
                  <span className="text-[10px] font-bold text-zinc-300 block truncate">{bracket[selectedNodeId].teamB}</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className="w-12 bg-[#0D1117] border border-slate-700 rounded py-1 text-center font-mono text-sm text-zinc-100 font-bold mt-1.5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-zinc-300 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-1.5 rounded-lg text-[10px] uppercase font-bold shadow-sm cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tree Render in Columns */}
        <div className="overflow-x-auto pb-4 pt-6" id="tree-scroll-container">
          <div className="flex justify-center items-center gap-12 min-w-[850px] relative px-6">
            
            {/* COLUMN 1: Cuartos de Final (Hojas - Leaves) Left Side */}
            <div className="flex flex-col gap-8 justify-around h-[420px]">
              <NodeCard id="QF1" />
              <NodeCard id="QF2" />
            </div>

            {/* Visual SVG connectors for Left side tree */}
            <div className="w-10 h-[420px] relative pointer-events-none hidden md:block">
              <svg className="absolute inset-0 w-full h-full" stroke="#334155" strokeWidth="1.5" fill="none">
                {/* QF1 to SF1 */}
                <path d="M 0 110 L 20 110 L 20 160 L 40 160" strokeDasharray="3 3" />
                {/* QF2 to SF1 */}
                <path d="M 0 310 L 20 310 L 20 260 L 40 260" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* COLUMN 2: Semifinales (Nivel 1) */}
            <div className="flex flex-col gap-12 justify-around h-[420px]">
              <NodeCard id="SF1" />
              <NodeCard id="SF2" />
            </div>

            {/* Visual SVG connectors for Center to Right */}
            <div className="w-10 h-[420px] relative pointer-events-none hidden md:block">
              <svg className="absolute inset-0 w-full h-full" stroke="#334155" strokeWidth="1.5" fill="none">
                {/* SF1 to F */}
                <path d="M 0 110 L 20 110 L 20 185 L 40 185" />
                {/* SF2 to F */}
                <path d="M 0 310 L 20 310 L 20 235 L 40 235" />
              </svg>
            </div>

            {/* COLUMN 3: Gran Final (Raíz - Root) */}
            <div className="flex flex-col justify-center h-[420px]">
              <div className="relative">
                <NodeCard id="F" />
                {/* Little champion trophy crown on final node winner */}
                {bracket["F"].winner && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 font-bold font-mono text-[10px] px-2.5 py-1 rounded border border-slate-950 flex items-center gap-1 shadow-md animate-bounce">
                    <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                    <span>CAMPEON: {bracket["F"].winner}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual SVG connectors for Right side tree */}
            <div className="w-10 h-[420px] relative pointer-events-none hidden md:block">
              <svg className="absolute inset-0 w-full h-full" stroke="#334155" strokeWidth="1.5" fill="none">
                {/* QF3 to SF2 */}
                <path d="M 40 110 L 20 110 L 20 160 L 0 160" strokeDasharray="3 3" />
                {/* QF4 to SF2 */}
                <path d="M 40 310 L 20 310 L 20 260 L 0 260" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* COLUMN 4: Cuartos de Final (Hojas - Leaves) Right Side */}
            <div className="flex flex-col gap-8 justify-around h-[420px]">
              <NodeCard id="QF3" />
              <NodeCard id="QF4" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
