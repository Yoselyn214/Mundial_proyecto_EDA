/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { TeamNode, MatchEdge, TeamStats } from "../types";
import { Trophy, Goal, Award, ShieldAlert } from "lucide-react";

interface ScoreChartsProps {
  teams: TeamNode[];
  matches: MatchEdge[];
}

export default function ScoreCharts({ teams, matches }: ScoreChartsProps) {
  const [histTab, setHistTab] = useState<"goals" | "totals" | "champion">("goals");

  const historicalEditions = useMemo(() => [
    { edition: "2014 Brasil", golesTotales: 171, promedioGoles: 2.67, golesCampeon: 18, campeon: "Alemania 🇩🇪" },
    { edition: "2018 Rusia", golesTotales: 169, promedioGoles: 2.64, golesCampeon: 14, campeon: "Francia 🇫🇷" },
    { edition: "2022 Qatar", golesTotales: 172, promedioGoles: 2.69, golesCampeon: 15, campeon: "Argentina 🇦🇷" }
  ], []);

  // Dynamic statistics calculation from the Graph structure
  const stats: TeamStats[] = useMemo(() => {
    return teams.map((team) => {
      const teamStats: TeamStats = {
        teamId: team.id,
        name: team.name,
        flag: team.flag,
        goalsScored: 0,
        goalsConceded: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
      };

      matches.forEach((match) => {
        const isSource = match.source === team.id;
        const isTarget = match.target === team.id;

        if (isSource || isTarget) {
          teamStats.matchesPlayed += 1;
          const myScore = isSource ? match.scoreA : match.scoreB;
          const rivalScore = isSource ? match.scoreB : match.scoreA;

          teamStats.goalsScored += myScore;
          teamStats.goalsConceded += rivalScore;

          if (myScore > rivalScore) {
            teamStats.wins += 1;
            teamStats.points += 3;
          } else if (myScore < rivalScore) {
            teamStats.losses += 1;
          } else {
            teamStats.draws += 1;
            teamStats.points += 1;
          }
        }
      });

      return teamStats;
    });
  }, [teams, matches]);

  // General tournament stats
  const summary = useMemo(() => {
    let totalGoals = 0;
    let totalMatches = matches.length;
    let topScoringTeam = { name: "Ninguno", goals: 0, flag: "" };
    let bestDefenseTeam = { name: "Ninguno", goals: 999, flag: "" };

    stats.forEach((s) => {
      totalGoals += s.goalsScored;
      if (s.goalsScored > topScoringTeam.goals) {
        topScoringTeam = { name: s.name, goals: s.goalsScored, flag: s.flag };
      }
      // Only count teams that played at least one match for defense
      if (s.matchesPlayed > 0 && s.goalsConceded < bestDefenseTeam.goals) {
        bestDefenseTeam = { name: s.name, goals: s.goalsConceded, flag: s.flag };
      }
    });

    return {
      totalGoals: totalGoals / 2, // Each goal is counted twice (once for each team)
      averageGoals: totalMatches > 0 ? ((totalGoals / 2) / totalMatches).toFixed(2) : "0",
      topScorer: topScoringTeam,
      bestDefense: bestDefenseTeam.goals === 999 ? { name: "Ninguno", goals: 0, flag: "" } : bestDefenseTeam,
    };
  }, [stats, matches]);

  // Data for the results pie chart
  const pieData = useMemo(() => {
    let totalWins = 0;
    let totalDraws = 0;

    matches.forEach((match) => {
      if (match.scoreA === match.scoreB) {
        totalDraws += 1;
      } else {
        totalWins += 1;
      }
    });

    return [
      { name: "Partidos con Ganador", value: totalWins, color: "#10B981" }, // Emerald
      { name: "Partidos Empatados", value: totalDraws, color: "#F59E0B" },  // Amber
    ];
  }, [matches]);

  const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

  return (
    <div className="space-y-4" id="scores-dashboard">
      {/* Dynamic Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5" id="stats-cards-grid">
        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-3.5 flex items-center gap-3.5 shadow-sm" id="card-total-matches">
          <div className="p-2.5 rounded bg-sky-500/10 text-sky-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">PARTIDOS_JUGADOS</p>
            <h4 className="text-lg font-bold font-mono text-zinc-100" id="val-total-matches">{matches.length}</h4>
          </div>
        </div>

        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-3.5 flex items-center gap-3.5 shadow-sm" id="card-total-goals">
          <div className="p-2.5 rounded bg-emerald-500/10 text-emerald-400">
            <Goal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">GOLES_REGISTRADOS</p>
            <h4 className="text-lg font-bold font-mono text-zinc-100" id="val-total-goals">{summary.totalGoals}</h4>
            <span className="text-[8px] font-mono text-zinc-500">{summary.averageGoals} por partido</span>
          </div>
        </div>

        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-3.5 flex items-center gap-3.5 shadow-sm" id="card-top-team">
          <div className="p-2.5 rounded bg-amber-500/10 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">MÁS_GOLEADOR</p>
            <h4 className="text-sm font-bold font-mono text-zinc-100 truncate max-w-[120px]" id="val-top-team">
              {summary.topScorer.goals > 0 ? (
                <>
                  <span className="mr-1 select-none">{summary.topScorer.flag}</span>
                  {summary.topScorer.name}
                </>
              ) : (
                "SIN_GOLES"
              )}
            </h4>
            <span className="text-[8px] font-mono text-amber-500">
              {summary.topScorer.goals > 0 ? `${summary.topScorer.goals} goles` : "0 goles"}
            </span>
          </div>
        </div>

        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-3.5 flex items-center gap-3.5 shadow-sm" id="card-best-defense">
          <div className="p-2.5 rounded bg-red-500/10 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">MEJOR_DEFENSA</p>
            <h4 className="text-sm font-bold font-mono text-zinc-100 truncate max-w-[120px]" id="val-best-defense">
              {summary.bestDefense.name !== "Ninguno" ? (
                <>
                  <span className="mr-1 select-none">{summary.bestDefense.flag}</span>
                  {summary.bestDefense.name}
                </>
              ) : (
                "SIN_PARTIDOS"
              )}
            </h4>
            <span className="text-[8px] font-mono text-red-400">
              {summary.bestDefense.name !== "Ninguno" ? `${summary.bestDefense.goals} recibidos` : "0 recibidos"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="charts-main-grid">
        {/* Goals scored and conceded BarChart */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-4 shadow-md" id="goals-chart-card">
          <div className="flex flex-col mb-3 border-b border-slate-800/40 pb-2">
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">GOLES_ANOTADOS_VS_RECIBIDOS</h3>
            <p className="text-[9px] text-zinc-500 font-mono">Efectividad ofensiva y solidez de defensa en nodos</p>
          </div>
          <div className="h-64 w-full" id="bar-chart-container">
            {stats.filter(s => s.matchesPlayed > 0).length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase">
                No hay partidos jugados para graficar estadísticas.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.filter(s => s.matchesPlayed > 0)}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07090E",
                      border: "1px solid #1E293B",
                      borderRadius: "4px",
                      color: "#f4f4f5",
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", paddingTop: 8 }} />
                  <Bar dataKey="goalsScored" name="GF" fill="#10B981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="goalsConceded" name="GC" fill="#EF4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team Performance RadarChart (Points, Wins, etc.) */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-4 shadow-md" id="radar-chart-card">
          <div className="flex flex-col mb-3 border-b border-slate-800/40 pb-2">
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">RENDIMIENTO_INDICE_PUNTOS</h3>
            <p className="text-[9px] text-zinc-500 font-mono">Puntos acumulados en adyacencias y transitividad</p>
          </div>
          <div className="h-64 w-full" id="radar-chart-container">
            {stats.filter(s => s.matchesPlayed > 0).length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase">
                Crea partidos en el grafo para visualizar el radar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={stats.filter(s => s.matchesPlayed > 0)}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis dataKey="name" stroke="#64748B" fontSize={9} />
                  <PolarRadiusAxis stroke="#64748B" fontSize={8} />
                  <Radar
                    name="Puntos"
                    dataKey="points"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Partidos"
                    dataKey="matchesPlayed"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07090E",
                      border: "1px solid #1E293B",
                      borderRadius: "4px",
                      color: "#f4f4f5",
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Results Pie Chart & Table of Stats */}
        <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-4 shadow-md lg:col-span-2" id="stats-table-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2 border-b border-slate-800/40 pb-2">
            <div>
              <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight">TABLA_ADYACENCIA_RENDIMIENTO</h3>
              <p className="text-[9px] text-zinc-500 font-mono">Datos tabulares extraídos de los vértices y aristas del grafo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="pie-and-table-inner-grid">
            {/* Pie Chart of Matches outcome */}
            <div className="flex flex-col items-center justify-center md:border-r md:border-slate-800/60 md:pr-4" id="pie-chart-section">
              <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1">RESULTADOS_ESTADISTICA</span>
              <div className="h-32 w-full" id="pie-chart-container">
                {matches.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-[9px] uppercase">
                    SIN_DATOS
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={48}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#07090E",
                          border: "1px solid #1E293B",
                          borderRadius: "4px",
                          color: "#f4f4f5",
                          fontSize: "9px",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 text-[9px] font-mono mt-1" id="pie-legend">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-zinc-400 font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance table */}
            <div className="col-span-1 md:col-span-2 overflow-x-auto" id="table-section">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-[#07090E] text-zinc-400 uppercase font-mono text-[9px] border border-slate-800">
                  <tr>
                    <th className="py-1.5 px-2">SELECCIÓN</th>
                    <th className="py-1.5 px-1.5 text-center">PJ</th>
                    <th className="py-1.5 px-1.5 text-center">PG</th>
                    <th className="py-1.5 px-1.5 text-center">PE</th>
                    <th className="py-1.5 px-1.5 text-center">PP</th>
                    <th className="py-1.5 px-1.5 text-center text-emerald-400">GF</th>
                    <th className="py-1.5 px-1.5 text-center text-red-400">GC</th>
                    <th className="py-1.5 px-2 text-center text-amber-400">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-zinc-300">
                  {stats.map((s) => (
                    <tr key={s.teamId} className="hover:bg-[#07090E]/60 transition-colors">
                      <td className="py-1.5 px-2 font-medium flex items-center gap-1.5 truncate max-w-[120px]">
                        <span className="text-xs select-none">{s.flag}</span>
                        <span className="truncate">{s.name}</span>
                        <span className="text-[8px] text-zinc-500">({s.teamId})</span>
                      </td>
                      <td className="py-1.5 px-1.5 text-center">{s.matchesPlayed}</td>
                      <td className="py-1.5 px-1.5 text-center text-emerald-500 font-bold">{s.wins}</td>
                      <td className="py-1.5 px-1.5 text-center text-zinc-400">{s.draws}</td>
                      <td className="py-1.5 px-1.5 text-center text-red-400">{s.losses}</td>
                      <td className="py-1.5 px-1.5 text-center text-emerald-400">{s.goalsScored}</td>
                      <td className="py-1.5 px-1.5 text-center text-red-400">{s.goalsConceded}</td>
                      <td className="py-1.5 px-2 text-center font-bold text-amber-400">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Evolution Trends Section */}
      <div className="bg-[#0D1117] border border-slate-800 rounded-lg p-5 shadow-md" id="historical-trends-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>EVOLUCIÓN_HISTÓRICA_INTER_MUNDIALES (2014 - 2022)</span>
            </h3>
            <p className="text-[9px] text-zinc-500 font-mono">Evolución del desempeño, goles y marcas a lo largo de las últimas ediciones del torneo</p>
          </div>
          <div className="flex bg-[#07090E] border border-slate-800 rounded p-0.5" id="historical-chart-tabs">
            <button
              onClick={() => setHistTab("goals")}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded uppercase transition-colors cursor-pointer ${
                histTab === "goals"
                  ? "bg-[#1F2937] text-sky-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Goles Promedio
            </button>
            <button
              onClick={() => setHistTab("totals")}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded uppercase transition-colors cursor-pointer ${
                histTab === "totals"
                  ? "bg-[#1F2937] text-sky-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Goles Totales
            </button>
            <button
              onClick={() => setHistTab("champion")}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded uppercase transition-colors cursor-pointer ${
                histTab === "champion"
                  ? "bg-[#1F2937] text-sky-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Poder Campeón
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="historical-trends-grid">
          {/* Chart column (2 spans) */}
          <div className="lg:col-span-2 h-60 w-full" id="historical-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalEditions} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" />
                <XAxis dataKey="edition" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono, monospace" domain={histTab === "goals" ? [2.5, 2.8] : ["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07090E",
                    border: "1px solid #1E293B",
                    borderRadius: "4px",
                    color: "#f4f4f5",
                    fontSize: "10px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", paddingTop: 5 }} />
                {histTab === "goals" && (
                  <Line
                    type="monotone"
                    dataKey="promedioGoles"
                    name="Promedio de Goles x Partido"
                    stroke="#10B981"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
                {histTab === "totals" && (
                  <Line
                    type="monotone"
                    dataKey="golesTotales"
                    name="Goles Totales del Torneo"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
                {histTab === "champion" && (
                  <Line
                    type="monotone"
                    dataKey="golesCampeon"
                    name="Goles Anotados por el Campeón"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Context Column (1 span) */}
          <div className="bg-[#07090E] border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-3" id="historical-meta-panel">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">HISTORICO_FACTS_ANOTADOS</span>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                <span className="text-[10px] font-mono text-zinc-400 font-bold">2014 Brasil</span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">Alemania 🇩🇪</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                Alemania se consagró tetracampeona. Destaca la histórica semifinal de la goleada 7-1 ante el local Brasil, elevando la media goleadora del torneo.
              </p>

              <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5 pt-1.5">
                <span className="text-[10px] font-mono text-zinc-400 font-bold">2018 Rusia</span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">Francia 🇫🇷</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                La Francia de Mbappé y Griezmann se coronó en una final sumamente abierta frente a Croacia (4-2). Un fútbol rápido y dinámico de contraataques en memoria.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/40 text-[9px] font-mono text-sky-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 animate-pulse" />
              <span>Crecimiento constante del promedio de gol.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
