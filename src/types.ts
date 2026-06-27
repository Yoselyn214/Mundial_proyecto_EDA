/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamNode {
  id: string; // ISO country code or short id (e.g. "ARG", "FRA")
  name: string;
  flag: string; // Emoji flag (e.g. "🇦🇷", "🇫🇷")
  group: string; // e.g. "Grupo A"
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface MatchEdge {
  id: string;
  source: string; // Team ID A
  target: string; // Team ID B
  scoreA: number;
  scoreB: number;
  stage: string; // e.g. "Fase de Grupos", "Amistoso", "Eliminatorias"
}

export interface BracketNode {
  id: string; // e.g. "F", "SF1", "SF2", "QF1", "QF2", "QF3", "QF4"
  stageName: string; // "Final", "Semifinal", "Cuartos"
  teamA: string | null; // Team ID or Name
  teamB: string | null; // Team ID or Name
  scoreA: number | null;
  scoreB: number | null;
  winner: string | null;
  leftChildId: string | null;
  rightChildId: string | null;
  parentId: string | null;
}

export interface TimelineNode {
  id: string;
  minute: number;
  event: "GOL" | "TARJETA_AMARILLA" | "TARJETA_ROJA" | "PENAL" | "CAMBIO" | "INICIO" | "FIN";
  player: string;
  team: string; // e.g., "Argentina"
  description: string;
  nextId: string | null;
}

export interface TeamStats {
  teamId: string;
  name: string;
  flag: string;
  goalsScored: number;
  goalsConceded: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}
