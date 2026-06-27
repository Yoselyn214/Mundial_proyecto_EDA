/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { TimelineNode } from "../types";
import { Plus, Trash2, Play, SkipForward, RotateCcw, Link2, GitCommit, HelpCircle } from "lucide-react";

interface TimelineLinkedListProps {
  timeline: TimelineNode[];
  onUpdateTimeline: (timeline: TimelineNode[]) => void;
}

export default function TimelineLinkedList({ timeline, onUpdateTimeline }: TimelineLinkedListProps) {
  // Navigation playback state
  const [currentNodeId, setCurrentNodeId] = useState<string | null>("ev1");
  const [playedEvents, setPlayedEvents] = useState<string[]>(["ev1"]);

  // Form State
  const [eventMinute, setEventMinute] = useState<number>(45);
  const [eventType, setEventType] = useState<"GOL" | "TARJETA_AMARILLA" | "TARJETA_ROJA" | "PENAL" | "CAMBIO">("GOL");
  const [eventPlayer, setEventPlayer] = useState<string>("");
  const [eventTeam, setEventTeam] = useState<string>("Argentina");
  const [eventDesc, setEventDesc] = useState<string>("");

  const [showExplanation, setShowExplanation] = useState(false);

  // Traverse and sort the timeline from Head (the node that has no other node pointing to it)
  // Since it's a singly linked list, we can sort it chronologically for display,
  // but let's resolve it by following the pointers from the start!
  const sortedList: TimelineNode[] = useMemo(() => {
    if (timeline.length === 0) return [];

    // Find head (an event that isn't any node's nextId)
    const nextIds = new Set(timeline.map((node) => node.nextId).filter(Boolean));
    const headNode = timeline.find((node) => !nextIds.has(node.id));

    if (!headNode) {
      // In case of a perfect circle (unlikely) or single node, fallback to sorting by minute
      return [...timeline].sort((a, b) => a.minute - b.minute);
    }

    const result: TimelineNode[] = [];
    let current: TimelineNode | undefined = headNode;
    const visited = new Set<string>(); // Prevent infinite loop on bad cycles

    while (current && !visited.has(current.id)) {
      result.push(current);
      visited.add(current.id);
      const nextId = current.nextId;
      current = timeline.find((node) => node.id === nextId);
    }

    return result;
  }, [timeline]);

  // Insert a node chronologically into the linked list (by minute)
  const handleInsertEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventPlayer || !eventDesc) return;

    const newId = `ev-${Date.now()}`;
    const newNode: TimelineNode = {
      id: newId,
      minute: Number(eventMinute),
      event: eventType,
      player: eventPlayer,
      team: eventTeam,
      description: eventDesc,
      nextId: null,
    };

    if (timeline.length === 0) {
      onUpdateTimeline([newNode]);
      setCurrentNodeId(newId);
      setPlayedEvents([newId]);
      resetForm();
      return;
    }

    // Traverse sorted list to find correct position to insert
    const list = [...timeline];
    const sorted = [...sortedList];

    // Case 1: Insert at the very beginning (new head)
    if (newNode.minute < sorted[0].minute) {
      newNode.nextId = sorted[0].id;
      onUpdateTimeline([...list, newNode]);
      resetForm();
      return;
    }

    // Case 2: Insert in the middle or end
    let prevIndex = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].minute <= newNode.minute) {
        prevIndex = i;
      } else {
        break;
      }
    }

    const prevNode = sorted[prevIndex];
    const prevNodeInList = list.find((n) => n.id === prevNode.id);

    if (prevNodeInList) {
      // Splice the node
      newNode.nextId = prevNodeInList.nextId;
      prevNodeInList.nextId = newNode.id;
    }

    onUpdateTimeline([...list, newNode]);
    resetForm();
  };

  const resetForm = () => {
    setEventPlayer("");
    setEventDesc("");
    setEventMinute(45);
  };

  // Delete a node and re-link the surrounding nodes to bridge the gap
  const handleDeleteEvent = (idToDelete: string) => {
    const list = [...timeline];
    const sorted = [...sortedList];

    const deleteIndex = sorted.findIndex((n) => n.id === idToDelete);
    if (deleteIndex === -1) return;

    if (deleteIndex === 0) {
      // Deleting head
      const updatedList = list.filter((n) => n.id !== idToDelete);
      onUpdateTimeline(updatedList);
      // Reset navigation if needed
      if (currentNodeId === idToDelete) {
        const nextHead = sorted[1]?.id || null;
        setCurrentNodeId(nextHead);
        setPlayedEvents(nextHead ? [nextHead] : []);
      }
      return;
    }

    // Deleting in the middle or end
    const prevNodeSorted = sorted[deleteIndex - 1];
    const nodeToDelete = sorted[deleteIndex];

    const prevNodeInList = list.find((n) => n.id === prevNodeSorted.id);
    if (prevNodeInList) {
      // Relink
      prevNodeInList.nextId = nodeToDelete.nextId;
    }

    const updatedList = list.filter((n) => n.id !== idToDelete);
    onUpdateTimeline(updatedList);

    // Adjust playback
    if (currentNodeId === idToDelete) {
      const nextNode = nodeToDelete.nextId;
      setCurrentNodeId(nextNode);
      if (nextNode) {
        setPlayedEvents((prev) => [...prev.filter((id) => id !== idToDelete), nextNode]);
      }
    } else {
      setPlayedEvents((prev) => prev.filter((id) => id !== idToDelete));
    }
  };

  // Traversal Playback controls
  const handleNextStep = () => {
    if (!currentNodeId) return;
    const current = timeline.find((n) => n.id === currentNodeId);
    if (current && current.nextId) {
      setCurrentNodeId(current.nextId);
      setPlayedEvents((prev) => [...prev, current.nextId as string]);
    }
  };

  const handleRestartPlayback = () => {
    if (sortedList.length > 0) {
      setCurrentNodeId(sortedList[0].id);
      setPlayedEvents([sortedList[0].id]);
    } else {
      setCurrentNodeId(null);
      setPlayedEvents([]);
    }
  };

  const activeNode = timeline.find((n) => n.id === currentNodeId);

  // Styling helper for events
  const getEventBadge = (type: string) => {
    switch (type) {
      case "GOL":
        return "bg-emerald-950 text-emerald-400 border-emerald-500/30";
      case "TARJETA_AMARILLA":
        return "bg-amber-950 text-amber-300 border-amber-500/30";
      case "TARJETA_ROJA":
        return "bg-red-950 text-red-400 border-red-500/30";
      case "PENAL":
        return "bg-purple-950 text-purple-400 border-purple-500/30";
      case "CAMBIO":
        return "bg-blue-950 text-blue-400 border-blue-500/30";
      case "INICIO":
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
      case "FIN":
        return "bg-yellow-950/50 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" id="linkedlist-panel-layout">
      {/* Playback Simulation Stream (2 Columns) */}
      <div className="xl:col-span-2 space-y-4" id="linkedlist-view-column">
        {/* Playback simulator cards */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md" id="playback-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-tight">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>NARRADOR_TIMELINE_MUNDIAL</span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">Recorriendo paso a paso los punteros enlazados de eventos en memoria</p>
            </div>

            <div className="flex gap-1.5 font-mono text-[10px]">
              <button
                onClick={handleRestartPlayback}
                className="p-1.5 bg-[#07090E] hover:bg-[#161B22] border border-slate-800 rounded text-zinc-300 transition cursor-pointer"
                title="REINICIAR_PLAYBACK"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextStep}
                disabled={!activeNode || !activeNode.nextId}
                className="flex items-center gap-1 px-3 py-1 bg-sky-600 disabled:bg-slate-800 hover:bg-sky-500 disabled:text-zinc-600 text-white font-mono font-bold rounded transition cursor-pointer uppercase text-[9px]"
              >
                <span>SIGUIENTE_NODO</span>
                <SkipForward className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Active play event display */}
          {activeNode ? (
            <div className="bg-[#07090E] rounded-lg p-5 border border-slate-800 text-center relative overflow-hidden" id="active-event-display">
              {/* Field line styling in backdrop */}
              <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-slate-800/10"></div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${getEventBadge(activeNode.event)}`}>
                    {activeNode.event}
                  </span>
                  <span className="font-mono text-sky-400 font-bold text-[10px] px-2 py-0.5 bg-[#0D1117] rounded border border-slate-800">
                    MINUTO: {activeNode.minute}'
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-base font-bold font-mono tracking-tight text-zinc-100" id="current-event-player">{activeNode.player}</h2>
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">{activeNode.team}</span>
                </div>

                <p className="text-zinc-300 text-xs max-w-md mx-auto leading-relaxed font-mono" id="current-event-desc">
                  "{activeNode.description}"
                </p>

                {activeNode.nextId ? (
                  <div className="pt-2 text-[9px] font-mono text-zinc-500 flex items-center justify-center gap-1.5 border-t border-slate-800/20 max-w-xs mx-auto">
                    <Link2 className="w-3 h-3 text-sky-500" />
                    <span>PUNTERO_SIGUIENTE_ID: </span>
                    <span className="bg-[#0D1117] px-1.5 py-0.5 rounded border border-slate-800 text-sky-400 font-bold">{activeNode.nextId}</span>
                  </div>
                ) : (
                  <div className="pt-2 text-[9px] font-mono text-zinc-500 flex items-center justify-center gap-1 border-t border-slate-800/20 max-w-xs mx-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
                    <span>NODO_FINAL_TIMELINE (PUNTERO = NULL)</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 font-mono text-[10px] italic bg-[#07090E] rounded-lg border border-slate-800 uppercase">
              Fin de la lista enlazada o sin eventos en memoria.
            </div>
          )}
        </div>

        {/* Linked list visual node structures */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md space-y-3" id="visual-linkedlist-structure">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">MEMORIA_RAM_STRUCT_NODES</h3>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-mono uppercase border border-slate-800 px-2 py-0.5 rounded hover:bg-slate-800/40 cursor-pointer"
            >
              ¿Cómo funciona?
            </button>
          </div>

          {showExplanation && (
            <div className="bg-[#07090E] border border-slate-800 p-3.5 rounded-lg text-[10px] text-zinc-400 leading-relaxed space-y-2 font-mono">
              <p>
                🔗 Una <strong>Lista Enlazada Simple (Singly LinkedList)</strong> almacena celdas de memoria consecutivas a través de punteros:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-500">
                <li><strong>DATA</strong>: Guarda el minuto, tipo de evento y descripción.</li>
                <li><strong>PUNTERO_NEXT</strong>: Dirección o ID del siguiente nodo (<code>nextId</code>).</li>
              </ul>
              <p>
                Al insertar o borrar un nodo, recalculamos las direcciones físicas y alteramos los punteros de los nodos adyacentes de manera lineal.
              </p>
            </div>
          )}

          {/* Scrolling node visualization cards */}
          <div className="overflow-x-auto py-1 pr-1" id="node-scroller">
            <div className="flex items-center gap-3 min-w-[700px] py-2 px-1" id="nodes-row">
              {sortedList.map((node, index) => {
                const isActive = currentNodeId === node.id;
                const isHead = index === 0;

                return (
                  <React.Fragment key={node.id}>
                    {/* Node block representing the data */}
                    <div
                      className={`relative bg-[#07090E] border ${
                        isActive
                          ? "border-sky-500 shadow-md shadow-sky-500/5 ring-1 ring-sky-500"
                          : "border-slate-800"
                      } rounded-lg p-2.5 w-40 shrink-0 transition-all text-[11px] font-mono hover:border-slate-700`}
                    >
                      {isHead && (
                        <div className="absolute -top-2.5 left-2 bg-sky-500 text-slate-950 text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded border border-slate-950">
                          HEAD
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800/60 text-[8px] font-mono text-zinc-500">
                        <span>NODE_{node.id}</span>
                        <span className="font-bold text-sky-400">{node.minute}'</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col">
                          <span className="font-bold truncate text-zinc-200 text-[10px] uppercase">{node.player}</span>
                          <span className="text-[8px] text-amber-500 font-bold uppercase">{node.event}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 line-clamp-2 italic">"{node.description}"</p>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex justify-between items-center text-[8px] font-mono text-zinc-500">
                        <span>NEXT_PTR:</span>
                        <span className={node.nextId ? "text-sky-400 font-bold" : "text-zinc-600 font-medium"}>
                          {node.nextId ? node.nextId : "NULL"}
                        </span>
                      </div>

                      {/* Floating Trash bin */}
                      <button
                        onClick={() => handleDeleteEvent(node.id)}
                        className="absolute -top-1.5 -right-1.5 bg-red-950/90 border border-red-500/30 text-red-400 p-1 rounded-full hover:bg-red-900 transition-colors cursor-pointer shadow"
                        title="ELIMINAR_NODO"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Edge arrow (Pointer) pointing to next node */}
                    {index < sortedList.length - 1 && (
                      <div className="flex flex-col items-center shrink-0" id={`pointer-line-${index}`}>
                        <div className="flex items-center">
                          <div className="h-[1px] w-6 bg-slate-700"></div>
                          <div className="w-1 h-1 border-t border-r border-slate-500 transform rotate-45 -ml-1"></div>
                        </div>
                        <span className="text-[7px] font-mono text-zinc-600 mt-0.5">nextId</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Insertion Forms (1 Column) */}
      <div className="space-y-4" id="linkedlist-forms-column">
        {/* Form: Insert custom event */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="p-1 rounded bg-sky-500/10 text-sky-400">
              <GitCommit className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">NUEVO_NODO (INSERTAR)</h3>
          </div>

          <form onSubmit={handleInsertEvent} className="space-y-2.5 font-mono text-[11px]">
            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Minuto de Ocurrencia (Clave)</label>
              <input
                type="number"
                min={0}
                max={150}
                value={eventMinute}
                onChange={(e) => setEventMinute(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                required
              />
              <span className="text-[8px] font-mono text-zinc-500 mt-0.5 block">
                Inserción ordenada por valor de clave cronológica.
              </span>
            </div>

            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Tipo de Evento</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 focus:border-sky-500 outline-none"
              >
                <option value="GOL">⚽ Gol</option>
                <option value="TARJETA_AMARILLA">🟨 Tarjeta Amarilla</option>
                <option value="TARJETA_ROJA">🟥 Tarjeta Roja</option>
                <option value="PENAL">🎯 Penal</option>
                <option value="CAMBIO">🔄 Cambio de Jugador</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Jugador</label>
                <input
                  type="text"
                  placeholder="Kylian Mbappé"
                  value={eventPlayer}
                  onChange={(e) => setEventPlayer(e.target.value)}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Selección</label>
                <select
                  value={eventTeam}
                  onChange={(e) => setEventTeam(e.target.value)}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 focus:border-sky-500 outline-none"
                >
                  <option value="Argentina">🇦🇷 Argentina</option>
                  <option value="Francia">🇫🇷 Francia</option>
                  <option value="Croacia">🇭🇷 Croacia</option>
                  <option value="Marruecos">🇲🇦 Marruecos</option>
                  <option value="Brasil">🇧🇷 Brasil</option>
                  <option value="Inglaterra">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</option>
                  <option value="Portugal">🇵🇹 Portugal</option>
                  <option value="Mundial">🌍 Común / Árbitro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">Descripción Suceso</label>
              <textarea
                placeholder="Disparo rasante con la pierna derecha..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#07090E] border border-slate-800 rounded px-2 py-1 text-xs text-zinc-100 focus:border-sky-500 outline-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Nodo</span>
            </button>
          </form>
        </div>

        {/* Delete Quick selection */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 shadow-md space-y-2.5">
          <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-tight">ELIMINAR_NODO</h4>
          <p className="text-[9px] font-mono text-zinc-500 leading-normal">Los punteros se re-enlazan para conservar la estructura lineal (Splicing out).</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 font-mono text-[10px]">
            {sortedList.map((node) => (
              <div key={node.id} className="flex justify-between items-center bg-[#07090E] border border-slate-800 px-2.5 py-1.5 rounded">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sky-400 font-bold">{node.minute}'</span>
                  <span className="text-zinc-200 truncate max-w-[100px] font-medium">{node.player}</span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(node.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
