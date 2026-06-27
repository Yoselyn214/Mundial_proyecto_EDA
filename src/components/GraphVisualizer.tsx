import React, { useState, useRef, useEffect } from "react";
import { TeamNode, MatchEdge } from "../types";
import { Plus, Trash2, Edit2, Share2, HelpCircle, Activity, Info } from "lucide-react";

interface GraphVisualizerProps {
  teams: TeamNode[];
  matches: MatchEdge[];
  onUpdateTeams: (teams: TeamNode[]) => void;
  onUpdateMatches: (matches: MatchEdge[]) => void;
}

export default function GraphVisualizer({
  teams,
  matches,
  onUpdateTeams,
  onUpdateMatches,
}: GraphVisualizerProps) {
  // Graph interaction state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Forms state
  const [newTeamId, setNewTeamId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamFlag, setNewTeamFlag] = useState("🏳️");
  const [newTeamGroup, setNewTeamGroup] = useState("Grupo A");

  const [matchSource, setMatchSource] = useState("");
  const [matchTarget, setMatchTarget] = useState("");
  const [matchScoreA, setMatchScoreA] = useState(0);
  const [matchScoreB, setMatchScoreB] = useState(0);
  const [matchStage, setMatchStage] = useState("Amistoso");

  // Editing match state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editScoreA, setEditScoreA] = useState(0);
  const [editScoreB, setEditScoreB] = useState(0);

  // Info modal toggle
  const [showInfo, setShowInfo] = useState(false);

  // Popular flags mapping for easy selection
  const popularFlags = [
    { name: "Argentina", flag: "🇦🇷", code: "ARG" },
    { name: "Francia", flag: "🇫🇷", code: "FRA" },
    { name: "Brasil", flag: "🇧🇷", code: "BRA" },
    { name: "Croacia", flag: "🇭🇷", code: "CRO" },
    { name: "Marruecos", flag: "🇲🇦", code: "MAR" },
    { name: "España", flag: "🇪🇸", code: "ESP" },
    { name: "Portugal", flag: "🇵🇹", code: "POR" },
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
    { name: "Países Bajos", flag: "🇳🇱", code: "NED" },
    { name: "Alemania", flag: "🇩🇪", code: "GER" },
    { name: "Uruguay", flag: "🇺🇾", code: "URU" },
    { name: "México", flag: "🇲🇽", code: "MEX" },
    { name: "Japón", flag: "🇯🇵", code: "JPN" },
    { name: "EE.UU.", flag: "🇺🇸", code: "USA" },
  ];

  const handleSelectPopular = (f: { name: string; flag: string; code: string }) => {
    setNewTeamId(f.code);
    setNewTeamName(f.name);
    setNewTeamFlag(f.flag);
  };

  // Node Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    // Calculate relative coordinates in SVG viewBox (which is 600x400)
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    // Constrain coordinates within viewBox limits with simple boundaries
    const constrainedX = Math.max(25, Math.min(575, x));
    const constrainedY = Math.max(25, Math.min(375, y));

    onUpdateTeams(
      teams.map((t) => (t.id === draggingNodeId ? { ...t, x: constrainedX, y: constrainedY } : t))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // SVG touch support for mobile compatibility
  const handleTouchStart = (e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingNodeId || !svgRef.current || e.touches.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 600;
    const y = ((touch.clientY - rect.top) / rect.height) * 400;

    const constrainedX = Math.max(25, Math.min(575, x));
    const constrainedY = Math.max(25, Math.min(375, y));

    onUpdateTeams(
      teams.map((t) => (t.id === draggingNodeId ? { ...t, x: constrainedX, y: constrainedY } : t))
    );
  };

  // Add a new node (Team)
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const idClean = newTeamId.trim().toUpperCase();
    const nameClean = newTeamName.trim();

    if (!idClean || !nameClean) return;
    if (teams.some((t) => t.id === idClean)) {
      alert("Ya existe un equipo con ese código.");
      return;
    }

    // Place randomly in center space
    const newTeam: TeamNode = {
      id: idClean,
      name: nameClean,
      flag: newTeamFlag,
      group: newTeamGroup,
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 100,
    };

    onUpdateTeams([...teams, newTeam]);
    setNewTeamId("");
    setNewTeamName("");
    setNewTeamFlag("🏳️");
  };

  // Add a new edge (Match)
  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchSource || !matchTarget) return;
    if (matchSource === matchTarget) {
      alert("Un equipo no puede jugar un partido contra sí mismo.");
      return;
    }

    // Check if edge already exists
    const matchExists = matches.some(
      (m) =>
        (m.source === matchSource && m.target === matchTarget) ||
        (m.source === matchTarget && m.target === matchSource)
    );

    if (matchExists) {
      alert("Ya hay un enfrentamiento registrado entre estos dos equipos. Haz clic en la arista para editarlo.");
      return;
    }

    const newMatch: MatchEdge = {
      id: `match-${Date.now()}`,
      source: matchSource,
      target: matchTarget,
      scoreA: Number(matchScoreA),
      scoreB: Number(matchScoreB),
      stage: matchStage,
    };

    onUpdateMatches([...matches, newMatch]);
    setMatchScoreA(0);
    setMatchScoreB(0);
  };

  // Delete node and its associated edges
  const handleDeleteTeam = (id: string) => {
    onUpdateTeams(teams.filter((t) => t.id !== id));
    onUpdateMatches(matches.filter((m) => m.source !== id && m.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Delete edge
  const handleDeleteMatch = (id: string) => {
    onUpdateMatches(matches.filter((m) => m.id !== id));
    if (selectedEdgeId === id) setSelectedEdgeId(null);
    if (editingMatchId === id) setEditingMatchId(null);
  };

  // Save edited match score
  const handleSaveMatchEdit = () => {
    if (!editingMatchId) return;
    onUpdateMatches(
      matches.map((m) =>
        m.id === editingMatchId ? { ...m, scoreA: editScoreA, scoreB: editScoreB } : m
      )
    );
    setEditingMatchId(null);
  };

  // Fetch info of selected node (adjacency lists!)
  const selectedNode = teams.find((t) => t.id === selectedNodeId);
  const selectedNodeMatches = selectedNode
    ? matches.filter((m) => m.source === selectedNode.id || m.target === selectedNode.id)
    : [];

  // Graph details
  const totalVertices = teams.length;
  const totalEdges = matches.length;

  // Adjacency Matrix & Lists
  // Calculate average degree of graph
  const averageDegree = totalVertices > 0 ? ((2 * totalEdges) / totalVertices).toFixed(2) : "0";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="graph-panel-layout">
      {/* Visual Canvas Area (2 Columns) */}
      <div className="xl:col-span-2 flex flex-col gap-4" id="graph-canvas-container">
        {/* Graph status bar */}
        <div className="flex items-center justify-between bg-[#0D1117] border border-slate-800 rounded-xl px-4 py-2.5" id="graph-header">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 font-mono tracking-tight">GRAFO_DE_ENFRENTAMIENTOS</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                ESTRUCTURA: <strong className="font-mono font-medium text-sky-400">|V| = {totalVertices}</strong> VÉRTICES,{" "}
                <strong className="font-mono font-medium text-amber-400">|E| = {totalEdges}</strong> ARISTAS (GRADO_PROM: {averageDegree})
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono uppercase px-2 py-1 rounded border border-slate-800 hover:bg-slate-800/40 transition-all cursor-pointer"
            id="btn-toggle-info"
          >
            <Info className="w-3.5 h-3.5" />
            <span>¿QUÉ ES ESTO?</span>
          </button>
        </div>

        {/* Theoretical explanation banner */}
        {showInfo && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs leading-relaxed text-emerald-100/90 shadow-sm" id="graph-explanation-banner">
            <p className="mb-2">
              ⚽ <strong>Teoría de Grafos y el Mundial:</strong> Un <strong>Grafo</strong> es un conjunto de <strong>Vértices (Nodos)</strong> conectados por <strong>Aristas (Enlaces)</strong>. En esta estructura de datos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los <strong>Nodos</strong> representan a los países/selecciones de fútbol.</li>
              <li>Las <strong>Aristas</strong> representan los partidos disputados entre ellos.</li>
              <li>El <strong>Peso/Atributo</strong> de la arista es el marcador o score del partido.</li>
              <li>La <strong>Lista de Adyacencia</strong> de un nodo contiene todos los equipos con los que ha jugado un partido (sus vecinos).</li>
            </ul>
            <p className="mt-2 text-emerald-400 font-mono">💡 ¡Puedes arrastrar los círculos de los países para ordenar el plano como más te guste!</p>
          </div>
        )}

        {/* Interactive Tactical Board (SVG) */}
        <div
          className="relative bg-[#07090E] border border-slate-800 rounded-xl h-[450px] overflow-hidden select-none"
          style={{
            backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          id="tactical-field-svg-wrapper"
        >
          {/* Tactical lines on the field (Soccer theme!) */}
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-800/30 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 -ml-20 -mt-20 border border-slate-800/20 rounded-full pointer-events-none"></div>

          <svg
            ref={svgRef}
            viewBox="0 0 600 400"
            className="w-full h-full cursor-grab active:cursor-grabbing"
            id="svg-graph-canvas"
          >
            {/* Draw ARISAS (Edges/Connections) */}
            {matches.map((edge) => {
              const sourceNode = teams.find((t) => t.id === edge.source);
              const targetNode = teams.find((t) => t.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              const isSelected = selectedEdgeId === edge.id;
              const isSourceSelected = selectedNodeId === edge.source;
              const isTargetSelected = selectedNodeId === edge.target;
              const isHighlight = isSelected || isSourceSelected || isTargetSelected;

              // Calculate midpoint for the score bubble
              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g key={edge.id} className="group/edge cursor-pointer">
                  {/* Outer glowing background line for highlighted connections */}
                  {isHighlight && (
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isSelected ? "#38bdf8" : "#f59e0b"}
                      strokeWidth={isSelected ? 5 : 3}
                      strokeOpacity={0.3}
                    />
                  )}

                  {/* Physical Line representing the connection */}
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isSelected ? "#38bdf8" : isHighlight ? "#f59e0b" : "#334155"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
                    }}
                  />

                  {/* Golden Goal / Score Badge on Center of Line */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
                      setEditingMatchId(edge.id);
                      setEditScoreA(edge.scoreA);
                      setEditScoreB(edge.scoreB);
                    }}
                  >
                    <rect
                      x="-18"
                      y="-8"
                      width="36"
                      height="16"
                      rx="4"
                      fill="#0D1117"
                      stroke={isSelected ? "#38bdf8" : "#1e293b"}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="3"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isSelected ? "#38bdf8" : "#f4f4f5"}
                      className="font-mono select-none"
                    >
                      {edge.scoreA} - {edge.scoreB}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Draw VÉRTICES (Nodos/Teams) */}
            {teams.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isNeighbor = selectedNodeId
                ? matches.some(
                    (m) =>
                      (m.source === selectedNodeId && m.target === node.id) ||
                      (m.source === node.id && m.target === selectedNodeId)
                  )
                : false;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onTouchStart={(e) => handleTouchStart(e, node.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="group/node cursor-grab active:cursor-grabbing"
                >
                  {/* Selection/Neighbor Outer Ring */}
                  {(isSelected || isNeighbor) && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={isSelected ? "#38bdf8" : "#f59e0b"}
                      strokeWidth="2"
                      strokeDasharray={isNeighbor ? "3 1" : "none"}
                      className="animate-pulse"
                    />
                  )}

                  {/* Background Circle */}
                  <circle
                    r="16"
                    fill="#0D1117"
                    stroke={isSelected ? "#38bdf8" : isNeighbor ? "#f59e0b" : "#475569"}
                    strokeWidth="1.5"
                    className="transition-all shadow-md group-hover/node:stroke-sky-400"
                  />

                  {/* Flag Emoji */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="14"
                    className="select-none pointer-events-none"
                  >
                    {node.flag}
                  </text>

                  {/* Badge Name below node */}
                  <text
                    textAnchor="middle"
                    y="26"
                    fontSize="8.5"
                    fontWeight="bold"
                    fill={isSelected ? "#38bdf8" : "#94a3b8"}
                    className="font-mono pointer-events-none drop-shadow-sm"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Helper overlay */}
          <div className="absolute bottom-2.5 left-2.5 bg-[#0D1117]/95 border border-slate-800 rounded-lg px-2.5 py-1.5 flex gap-3 text-[9px] text-zinc-400 font-mono backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
              <span>SELECCIONADO</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full border border-dashed border-amber-500"></div>
              <span>ADYACENTE (VECINO)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-500">CLICK_DRAG_MOVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Controls (1 Column) */}
      <div className="space-y-4" id="graph-controls-sidebar">
        {/* Dynamic Detail Panel for Selected Element */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md">
          {selectedNode ? (
            <div className="space-y-3.5" id="selected-team-panel">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{selectedNode.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 font-mono tracking-tight">{selectedNode.name}</h3>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{selectedNode.group} // {selectedNode.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTeam(selectedNode.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-md transition-colors cursor-pointer"
                  title="Eliminar Selección (Vértice)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Adjacency List & Degree stats */}
              <div className="bg-[#07090E] rounded-lg p-3.5 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Vértice_Grado (Partidos):</span>
                  <span className="font-bold text-sky-400">{selectedNodeMatches.length}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Lista de Adyacencia (Vecinos):</span>
                  {selectedNodeMatches.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic block font-mono">Sin aristas conectadas. Este es un vértice aislado.</span>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedNodeMatches.map((m) => {
                        const isSource = m.source === selectedNode.id;
                        const opponentId = isSource ? m.target : m.source;
                        const opponent = teams.find((t) => t.id === opponentId);
                        if (!opponent) return null;

                        const myScore = isSource ? m.scoreA : m.scoreB;
                        const opScore = isSource ? m.scoreB : m.scoreA;
                        const isWin = myScore > opScore;
                        const isLoss = myScore < opScore;

                        return (
                          <div key={m.id} className="flex justify-between items-center text-[11px] bg-[#0D1117] px-2 py-1.5 rounded border border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span>{opponent.flag}</span>
                              <span className="text-zinc-200 truncate max-w-[70px] font-mono">{opponent.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-mono text-zinc-500">({m.stage})</span>
                              <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${isWin ? "bg-emerald-950/45 text-emerald-400" : isLoss ? "bg-red-950/45 text-red-400" : "bg-zinc-800/40 text-zinc-300"}`}>
                                {myScore} - {opScore}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedEdgeId ? (
            (() => {
              const edge = matches.find((m) => m.id === selectedEdgeId);
              if (!edge) return null;
              const sourceTeam = teams.find((t) => t.id === edge.source);
              const targetTeam = teams.find((t) => t.id === edge.target);
              if (!sourceTeam || !targetTeam) return null;

              return (
                <div className="space-y-3.5" id="selected-match-panel">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">ARISTA_ENLACE // DETALLE</span>
                    <button
                      onClick={() => handleDeleteMatch(edge.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-md transition-colors cursor-pointer"
                      title="Eliminar Partido (Arista)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {editingMatchId === edge.id ? (
                    <div className="space-y-3 bg-[#07090E] p-3.5 rounded-lg border border-slate-800">
                      <span className="text-xs font-mono font-medium text-zinc-400">Modificar Marcador:</span>
                      <div className="flex items-center justify-around gap-2">
                        <div className="text-center">
                          <span className="text-lg block">{sourceTeam.flag}</span>
                          <span className="text-[10px] text-zinc-400 block truncate max-w-[70px] font-mono">{sourceTeam.id}</span>
                          <input
                            type="number"
                            min="0"
                            value={editScoreA}
                            onChange={(e) => setEditScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-10 bg-[#0D1117] border border-slate-700 rounded py-1 text-center font-mono text-zinc-100 font-bold mt-1 text-xs"
                          />
                        </div>
                        <span className="text-zinc-500 font-bold">-</span>
                        <div className="text-center">
                          <span className="text-lg block">{targetTeam.flag}</span>
                          <span className="text-[10px] text-zinc-400 block truncate max-w-[70px] font-mono">{targetTeam.id}</span>
                          <input
                            type="number"
                            min="0"
                            value={editScoreB}
                            onChange={(e) => setEditScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-10 bg-[#0D1117] border border-slate-700 rounded py-1 text-center font-mono text-zinc-100 font-bold mt-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => setEditingMatchId(null)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-zinc-300 font-mono py-1 rounded text-[10px] transition-colors cursor-pointer uppercase"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveMatchEdit}
                          className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold py-1 rounded text-[10px] transition-colors cursor-pointer uppercase"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#07090E] rounded-lg p-3.5 border border-slate-800 text-center space-y-3">
                      <div className="flex items-center justify-around">
                        <div className="text-center">
                          <span className="text-xl block">{sourceTeam.flag}</span>
                          <span className="text-[11px] text-zinc-300 font-mono font-bold mt-1">{sourceTeam.id}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-[#0D1117] border border-slate-800">
                          <span className="text-sm font-mono font-bold text-sky-400">{edge.scoreA} - {edge.scoreB}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-xl block">{targetTeam.flag}</span>
                          <span className="text-[11px] text-zinc-300 font-mono font-bold mt-1">{targetTeam.id}</span>
                        </div>
                      </div>
                      <div className="pt-1.5 flex justify-center items-center gap-2 border-t border-slate-800/40 text-[10px] font-mono text-zinc-400">
                        <span>Fase: <strong className="text-zinc-200">{edge.stage}</strong></span>
                        <span className="text-zinc-600">|</span>
                        <button
                          onClick={() => {
                            setEditingMatchId(edge.id);
                            setEditScoreA(edge.scoreA);
                            setEditScoreB(edge.scoreB);
                          }}
                          className="flex items-center gap-0.5 text-sky-400 hover:text-sky-300 hover:underline transition uppercase"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-5 text-zinc-500 space-y-2" id="nothing-selected-panel">
              <HelpCircle className="w-6 h-6 mx-auto text-zinc-700 animate-pulse" />
              <p className="text-[10px] font-mono leading-relaxed">Selecciona un país (nodo) o un partido (arista) en el campo táctico para inspeccionar la adyacencia.</p>
            </div>
          )}
        </div>

        {/* Form: Add Node (Team) */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-sky-400 text-[10px] font-mono">1.</span>
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">NUEVO_VERTICE (SELECCIÓN)</h3>
          </div>

          <form onSubmit={handleAddTeam} className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">ID (ej. ESP)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={newTeamId}
                  onChange={(e) => setNewTeamId(e.target.value.toUpperCase())}
                  placeholder="ESP"
                  required
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Nombre</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="España"
                  required
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Bandera</label>
                <select
                  value={newTeamFlag}
                  onChange={(e) => setNewTeamFlag(e.target.value)}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-1.5 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                >
                  <option value="🏳️">🏳️ Por defecto</option>
                  <option value="🇦🇷">🇦🇷 Argentina</option>
                  <option value="🇫🇷">🇫🇷 Francia</option>
                  <option value="🇧🇷">🇧🇷 Brasil</option>
                  <option value="🇭🇷">🇭🇷 Croacia</option>
                  <option value="🇲🇦">🇲🇦 Marruecos</option>
                  <option value="🇪🇸">🇪🇸 España</option>
                  <option value="🇵🇹">🇵🇹 Portugal</option>
                  <option value="🏴󠁧󠁢󠁥󠁮󠁧󠁿">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</option>
                  <option value="🇳🇱">🇳🇱 P. Bajos</option>
                  <option value="🇩🇪">🇩🇪 Alemania</option>
                  <option value="🇺🇾">🇺🇾 Uruguay</option>
                  <option value="🇲🇽">🇲🇽 México</option>
                  <option value="🇯🇵">🇯🇵 Japón</option>
                  <option value="🇨🇴">🇨🇴 Colombia</option>
                  <option value="🇮🇹">🇮🇹 Italia</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Grupo</label>
                <input
                  type="text"
                  value={newTeamGroup}
                  onChange={(e) => setNewTeamGroup(e.target.value)}
                  placeholder="Grupo A"
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[9px] font-mono text-zinc-500 block mb-1">SUGERENCIAS:</span>
              <div className="flex flex-wrap gap-1" id="popular-suggestions-list">
                {popularFlags.slice(5, 12).map((pf) => (
                  <button
                    key={pf.code}
                    type="button"
                    onClick={() => handleSelectPopular(pf)}
                    className="bg-slate-800/40 hover:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300 transition cursor-pointer border border-slate-800/60"
                  >
                    {pf.flag} {pf.code}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Vértice</span>
            </button>
          </form>
        </div>

        {/* Form: Add Edge (Match) */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-sky-400 text-[10px] font-mono">2.</span>
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">NUEVA_ARISTA (PARTIDO)</h3>
          </div>

          <form onSubmit={handleAddMatch} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Origen A</label>
                <select
                  value={matchSource}
                  onChange={(e) => setMatchSource(e.target.value)}
                  required
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.flag} {t.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Destino B</label>
                <select
                  value={matchTarget}
                  onChange={(e) => setMatchTarget(e.target.value)}
                  required
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.flag} {t.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#07090E] p-2 rounded border border-slate-800/80">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Score A</label>
                <input
                  type="number"
                  min="0"
                  value={matchScoreA}
                  onChange={(e) => setMatchScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0D1117] border border-slate-800 rounded py-0.5 text-xs text-zinc-100 text-center font-mono focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Score B</label>
                <input
                  type="number"
                  min="0"
                  value={matchScoreB}
                  onChange={(e) => setMatchScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0D1117] border border-slate-800 rounded py-0.5 text-xs text-zinc-100 text-center font-mono focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Etapa / Fase</label>
              <select
                value={matchStage}
                onChange={(e) => setMatchStage(e.target.value)}
                className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
              >
                <option value="Amistoso">Amistoso</option>
                <option value="Fase de Grupos">Fase de Grupos</option>
                <option value="Octavos">Octavos de Final</option>
                <option value="Cuartos">Cuartos de Final</option>
                <option value="Semifinal">Semifinal</option>
                <option value="Final">Gran Final</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer uppercase text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Conectar Vértices</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
