/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamNode, MatchEdge, BracketNode, TimelineNode } from "../types";

// ==========================================
// DATASET COPA DEL MUNDO QATAR 2022
// ==========================================

export const teams2022: TeamNode[] = [
  { id: "ARG", name: "Argentina", flag: "🇦🇷", group: "Grupo C", x: 150, y: 120 },
  { id: "FRA", name: "Francia", flag: "🇫🇷", group: "Grupo D", x: 450, y: 120 },
  { id: "CRO", name: "Croacia", flag: "🇭🇷", group: "Grupo F", x: 150, y: 280 },
  { id: "MAR", name: "Marruecos", flag: "🇲🇦", group: "Grupo F", x: 450, y: 280 },
  { id: "BRA", name: "Brasil", flag: "🇧🇷", group: "Grupo G", x: 300, y: 70 },
  { id: "NED", name: "Países Bajos", flag: "🇳🇱", group: "Grupo A", x: 300, y: 330 },
  { id: "ENG", name: "Inglaterra", flag: "🏴\u200D󠁢󠁥󠁮󠁧󠁿", group: "Grupo B", x: 80, y: 200 },
  { id: "POR", name: "Portugal", flag: "🇵🇹", group: "Grupo H", x: 520, y: 200 }
];

export const matches2022: MatchEdge[] = [
  { id: "m1", source: "ARG", target: "FRA", scoreA: 3, scoreB: 3, stage: "Final" },
  { id: "m2", source: "ARG", target: "CRO", scoreA: 3, scoreB: 0, stage: "Semifinal" },
  { id: "m3", source: "FRA", target: "MAR", scoreA: 2, scoreB: 0, stage: "Semifinal" },
  { id: "m4", source: "NED", target: "ARG", scoreA: 2, scoreB: 2, stage: "Cuartos" },
  { id: "m5", source: "CRO", target: "BRA", scoreA: 1, scoreB: 1, stage: "Cuartos" },
  { id: "m6", source: "ENG", target: "FRA", scoreA: 1, scoreB: 2, stage: "Cuartos" },
  { id: "m7", source: "MAR", target: "POR", scoreA: 1, scoreB: 0, stage: "Cuartos" },
  { id: "m8", source: "ARG", target: "NED", scoreA: 1, scoreB: 2, stage: "Amistoso" }
];

export const bracket2022: Record<string, BracketNode> = {
  "QF1": {
    id: "QF1",
    stageName: "Cuartos de Final",
    teamA: "Países Bajos",
    teamB: "Argentina",
    scoreA: 2,
    scoreB: 2,
    winner: "Argentina",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF2": {
    id: "QF2",
    stageName: "Cuartos de Final",
    teamA: "Croacia",
    teamB: "Brasil",
    scoreA: 1,
    scoreB: 1,
    winner: "Croacia",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF3": {
    id: "QF3",
    stageName: "Cuartos de Final",
    teamA: "Inglaterra",
    teamB: "Francia",
    scoreA: 1,
    scoreB: 2,
    winner: "Francia",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "QF4": {
    id: "QF4",
    stageName: "Cuartos de Final",
    teamA: "Marruecos",
    teamB: "Portugal",
    scoreA: 1,
    scoreB: 0,
    winner: "Marruecos",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "SF1": {
    id: "SF1",
    stageName: "Semifinal",
    teamA: "Argentina",
    teamB: "Croacia",
    scoreA: 3,
    scoreB: 0,
    winner: "Argentina",
    leftChildId: "QF1",
    rightChildId: "QF2",
    parentId: "F"
  },
  "SF2": {
    id: "SF2",
    stageName: "Semifinal",
    teamA: "Francia",
    teamB: "Marruecos",
    scoreA: 2,
    scoreB: 0,
    winner: "Francia",
    leftChildId: "QF3",
    rightChildId: "QF4",
    parentId: "F"
  },
  "F": {
    id: "F",
    stageName: "Final del Mundial",
    teamA: "Argentina",
    teamB: "Francia",
    scoreA: 3,
    scoreB: 3,
    winner: "Argentina",
    leftChildId: "SF1",
    rightChildId: "SF2",
    parentId: null
  }
};

export const timeline2022: TimelineNode[] = [
  {
    id: "ev1",
    minute: 0,
    event: "INICIO",
    player: "Árbitro",
    team: "Mundial",
    description: "¡Inicia la gran final del mundial de Qatar en el Estadio de Lusail!",
    nextId: "ev2"
  },
  {
    id: "ev2",
    minute: 23,
    event: "GOL",
    player: "Lionel Messi",
    team: "Argentina",
    description: "Messi anota de penal tras falta cometida sobre Di María.",
    nextId: "ev3"
  },
  {
    id: "ev3",
    minute: 36,
    event: "GOL",
    player: "Ángel Di María",
    team: "Argentina",
    description: "¡Golazo de Di María coronando un contragolpe perfecto asistido por Mac Allister!",
    nextId: "ev4"
  },
  {
    id: "ev4",
    minute: 80,
    event: "GOL",
    player: "Kylian Mbappé",
    team: "Francia",
    description: "Mbappé descuenta de penal tras falta sobre Kolo Muani.",
    nextId: "ev5"
  },
  {
    id: "ev5",
    minute: 81,
    event: "GOL",
    player: "Kylian Mbappé",
    team: "Francia",
    description: "¡Increíble! Un minuto después, Mbappé empata el partido con una volea espectacular.",
    nextId: "ev6"
  },
  {
    id: "ev6",
    minute: 108,
    event: "GOL",
    player: "Lionel Messi",
    team: "Argentina",
    description: "¡Messi empuja el balón tras rebote de Lloris! Un defensor la saca de adentro.",
    nextId: "ev7"
  },
  {
    id: "ev7",
    minute: 118,
    event: "GOL",
    player: "Kylian Mbappé",
    team: "Francia",
    description: "Mbappé sella su Hat-trick empatando de penal tras una mano en el área.",
    nextId: "ev8"
  },
  {
    id: "ev8",
    minute: 120,
    event: "PENAL",
    player: "Emiliano Martínez",
    team: "Argentina",
    description: "¡Dibu Martínez ataja un mano a mano milagroso a Kolo Muani en la última jugada!",
    nextId: "ev9"
  },
  {
    id: "ev9",
    minute: 121,
    event: "FIN",
    player: "Árbitro",
    team: "Mundial",
    description: "Termina la prórroga 3-3. En penales, Argentina vence 4-2 y es Campeón del Mundo.",
    nextId: null
  }
];


// ==========================================
// DATASET COPA DEL MUNDO RUSIA 2018
// ==========================================

export const teams2018: TeamNode[] = [
  { id: "FRA", name: "Francia", flag: "🇫🇷", group: "Grupo C", x: 450, y: 120 },
  { id: "CRO", name: "Croacia", flag: "🇭🇷", group: "Grupo D", x: 150, y: 120 },
  { id: "BEL", name: "Bélgica", flag: "🇧🇪", group: "Grupo G", x: 300, y: 70 },
  { id: "ENG", name: "Inglaterra", flag: "🏴\u200D󠁢󠁥󠁮󠁧󠁿", group: "Grupo G", x: 80, y: 200 },
  { id: "BRA", name: "Brasil", flag: "🇧🇷", group: "Grupo E", x: 300, y: 330 },
  { id: "URU", name: "Uruguay", flag: "🇺🇾", group: "Grupo A", x: 150, y: 280 },
  { id: "SWE", name: "Suecia", flag: "🇸🇪", group: "Grupo F", x: 450, y: 280 },
  { id: "RUS", name: "Rusia", flag: "🇷🇺", group: "Grupo A", x: 520, y: 200 }
];

export const matches2018: MatchEdge[] = [
  { id: "r1", source: "FRA", target: "CRO", scoreA: 4, scoreB: 2, stage: "Final" },
  { id: "r2", source: "FRA", target: "BEL", scoreA: 1, scoreB: 0, stage: "Semifinal" },
  { id: "r3", source: "CRO", target: "ENG", scoreA: 2, scoreB: 1, stage: "Semifinal" },
  { id: "r4", source: "URU", target: "FRA", scoreA: 0, scoreB: 2, stage: "Cuartos" },
  { id: "r5", source: "BRA", target: "BEL", scoreA: 1, scoreB: 2, stage: "Cuartos" },
  { id: "r6", source: "SWE", target: "ENG", scoreA: 0, scoreB: 2, stage: "Cuartos" },
  { id: "r7", source: "RUS", target: "CRO", scoreA: 2, scoreB: 2, stage: "Cuartos" }
];

export const bracket2018: Record<string, BracketNode> = {
  "QF1": {
    id: "QF1",
    stageName: "Cuartos de Final",
    teamA: "Uruguay",
    teamB: "Francia",
    scoreA: 0,
    scoreB: 2,
    winner: "Francia",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF2": {
    id: "QF2",
    stageName: "Cuartos de Final",
    teamA: "Brasil",
    teamB: "Bélgica",
    scoreA: 1,
    scoreB: 2,
    winner: "Bélgica",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF3": {
    id: "QF3",
    stageName: "Cuartos de Final",
    teamA: "Suecia",
    teamB: "Inglaterra",
    scoreA: 0,
    scoreB: 2,
    winner: "Inglaterra",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "QF4": {
    id: "QF4",
    stageName: "Cuartos de Final",
    teamA: "Rusia",
    teamB: "Croacia",
    scoreA: 2,
    scoreB: 2,
    winner: "Croacia",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "SF1": {
    id: "SF1",
    stageName: "Semifinal",
    teamA: "Francia",
    teamB: "Bélgica",
    scoreA: 1,
    scoreB: 0,
    winner: "Francia",
    leftChildId: "QF1",
    rightChildId: "QF2",
    parentId: "F"
  },
  "SF2": {
    id: "SF2",
    stageName: "Semifinal",
    teamA: "Croacia",
    teamB: "Inglaterra",
    scoreA: 2,
    scoreB: 1,
    winner: "Croacia",
    leftChildId: "QF3",
    rightChildId: "QF4",
    parentId: "F"
  },
  "F": {
    id: "F",
    stageName: "Final del Mundial",
    teamA: "Francia",
    teamB: "Croacia",
    scoreA: 4,
    scoreB: 2,
    winner: "Francia",
    leftChildId: "SF1",
    rightChildId: "SF2",
    parentId: null
  }
};

export const timeline2018: TimelineNode[] = [
  {
    id: "ev1",
    minute: 0,
    event: "INICIO",
    player: "Árbitro",
    team: "Mundial",
    description: "¡Comienza la gran final de Rusia 2018 en el Estadio Luzhnikí de Moscú!",
    nextId: "ev2"
  },
  {
    id: "ev2",
    minute: 18,
    event: "GOL",
    player: "Mario Mandžukić (AG)",
    team: "Francia",
    description: "Mandžukić desvía de cabeza involuntariamente un tiro libre de Griezmann hacia su propio arco.",
    nextId: "ev3"
  },
  {
    id: "ev3",
    minute: 28,
    event: "GOL",
    player: "Ivan Perišić",
    team: "Croacia",
    description: "¡Golazo de Croacia! Perišić controla al borde del área y clava un zurdazo imparable cruzado.",
    nextId: "ev4"
  },
  {
    id: "ev4",
    minute: 38,
    event: "GOL",
    player: "Antoine Griezmann",
    team: "Francia",
    description: "Griezmann engaña al arquero y anota con un penal pitado tras una mano de Perišić revisada en el VAR.",
    nextId: "ev5"
  },
  {
    id: "ev5",
    minute: 59,
    event: "GOL",
    player: "Paul Pogba",
    team: "Francia",
    description: "Pogba dispara al borde del área, la zaga bloquea, pero pesca el rebote y anota de zurda.",
    nextId: "ev6"
  },
  {
    id: "ev6",
    minute: 65,
    event: "GOL",
    player: "Kylian Mbappé",
    team: "Francia",
    description: "¡Mbappé liquida el encuentro con un tiro raso ajustado de media distancia! Francia se escapa 4-1.",
    nextId: "ev7"
  },
  {
    id: "ev7",
    minute: 69,
    event: "GOL",
    player: "Mario Mandžukić",
    team: "Croacia",
    description: "¡Error insólito de Lloris! Intenta eludir a Mandžukić, quien le bloquea el pase y empuja el balón.",
    nextId: "ev8"
  },
  {
    id: "ev8",
    minute: 90,
    event: "FIN",
    player: "Árbitro",
    team: "Mundial",
    description: "¡Termina el partido! Francia derrota 4-2 a Croacia en una final histórica y es campeona mundial.",
    nextId: null
  }
];


// ==========================================
// DATASET COPA DEL MUNDO BRASIL 2014
// ==========================================

export const teams2014: TeamNode[] = [
  { id: "GER", name: "Alemania", flag: "🇩🇪", group: "Grupo G", x: 450, y: 120 },
  { id: "ARG", name: "Argentina", flag: "🇦🇷", group: "Grupo F", x: 150, y: 120 },
  { id: "NED", name: "Países Bajos", flag: "🇳🇱", group: "Grupo B", x: 300, y: 70 },
  { id: "BRA", name: "Brasil", flag: "🇧🇷", group: "Grupo A", x: 300, y: 330 },
  { id: "FRA", name: "Francia", flag: "🇫🇷", group: "Grupo E", x: 150, y: 280 },
  { id: "COL", name: "Colombia", flag: "🇨🇴", group: "Grupo C", x: 450, y: 280 },
  { id: "BEL", name: "Bélgica", flag: "🇧🇪", group: "Grupo H", x: 80, y: 200 },
  { id: "CRC", name: "Costa Rica", flag: "🇨🇷", group: "Grupo D", x: 520, y: 200 }
];

export const matches2014: MatchEdge[] = [
  { id: "b1", source: "GER", target: "ARG", scoreA: 1, scoreB: 0, stage: "Final" },
  { id: "b2", source: "BRA", target: "GER", scoreA: 1, scoreB: 7, stage: "Semifinal" },
  { id: "b3", source: "NED", target: "ARG", scoreA: 0, scoreB: 0, stage: "Semifinal" },
  { id: "b4", source: "FRA", target: "GER", scoreA: 0, scoreB: 1, stage: "Cuartos" },
  { id: "b5", source: "BRA", target: "COL", scoreA: 2, scoreB: 1, stage: "Cuartos" },
  { id: "b6", source: "ARG", target: "BEL", scoreA: 1, scoreB: 0, stage: "Cuartos" },
  { id: "b7", source: "NED", target: "CRC", scoreA: 0, scoreB: 0, stage: "Cuartos" }
];

export const bracket2014: Record<string, BracketNode> = {
  "QF1": {
    id: "QF1",
    stageName: "Cuartos de Final",
    teamA: "Francia",
    teamB: "Alemania",
    scoreA: 0,
    scoreB: 1,
    winner: "Alemania",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF2": {
    id: "QF2",
    stageName: "Cuartos de Final",
    teamA: "Brasil",
    teamB: "Colombia",
    scoreA: 2,
    scoreB: 1,
    winner: "Brasil",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF1"
  },
  "QF3": {
    id: "QF3",
    stageName: "Cuartos de Final",
    teamA: "Argentina",
    teamB: "Bélgica",
    scoreA: 1,
    scoreB: 0,
    winner: "Argentina",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "QF4": {
    id: "QF4",
    stageName: "Cuartos de Final",
    teamA: "Países Bajos",
    teamB: "Costa Rica",
    scoreA: 0,
    scoreB: 0,
    winner: "Países Bajos",
    leftChildId: null,
    rightChildId: null,
    parentId: "SF2"
  },
  "SF1": {
    id: "SF1",
    stageName: "Semifinal",
    teamA: "Brasil",
    teamB: "Alemania",
    scoreA: 1,
    scoreB: 7,
    winner: "Alemania",
    leftChildId: "QF1",
    rightChildId: "QF2",
    parentId: "F"
  },
  "SF2": {
    id: "SF2",
    stageName: "Semifinal",
    teamA: "Países Bajos",
    teamB: "Argentina",
    scoreA: 0,
    scoreB: 0,
    winner: "Argentina",
    leftChildId: "QF3",
    rightChildId: "QF4",
    parentId: "F"
  },
  "F": {
    id: "F",
    stageName: "Final del Mundial",
    teamA: "Alemania",
    teamB: "Argentina",
    scoreA: 1,
    scoreB: 0,
    winner: "Alemania",
    leftChildId: "SF1",
    rightChildId: "SF2",
    parentId: null
  }
};

export const timeline2014: TimelineNode[] = [
  {
    id: "ev1",
    minute: 0,
    event: "INICIO",
    player: "Árbitro",
    team: "Mundial",
    description: "¡Inicia la final de Brasil 2014 en el legendario Estadio Maracaná de Río de Janeiro!",
    nextId: "ev2"
  },
  {
    id: "ev2",
    minute: 21,
    event: "PENAL",
    player: "Gonzalo Higuaín",
    team: "Argentina",
    description: "¡Error grosero! Higuaín queda solo ante Neuer tras pase defectuoso de Kroos, pero saca un remate desviado.",
    nextId: "ev3"
  },
  {
    id: "ev3",
    minute: 30,
    event: "GOL",
    player: "Gonzalo Higuaín",
    team: "Argentina",
    description: "Higuaín empuja el balón a la red tras centro de Lavezzi, pero el gol es anulado por fuera de juego milimétrico.",
    nextId: "ev4"
  },
  {
    id: "ev4",
    minute: 45,
    event: "TARJETA_AMARILLA",
    player: "Benedikt Höwedes",
    team: "Alemania",
    description: "¡Höwedes estrella un remate en el palo! Cabezazo brutal tras tiro de esquina en la última del primer tiempo.",
    nextId: "ev5"
  },
  {
    id: "ev5",
    minute: 97,
    event: "PENAL",
    player: "Rodrigo Palacio",
    team: "Argentina",
    description: "¡La tuvo Palacio! Baja el balón con el pecho en el área e intenta un globito ante Neuer que se va desviado.",
    nextId: "ev6"
  },
  {
    id: "ev6",
    minute: 113,
    event: "GOL",
    player: "Mario Götze",
    team: "Alemania",
    description: "¡GOOOOL DE ALEMANIA! Götze la duerme de pecho tras centro de Schürrle y fusila a Romero con un zurdazo cruzado.",
    nextId: "ev7"
  },
  {
    id: "ev7",
    minute: 120,
    event: "FIN",
    player: "Árbitro",
    team: "Mundial",
    description: "Termina el partido. ¡Alemania se consagra tetracampeón del mundo venciendo 1-0 a Argentina en la prórroga!",
    nextId: null
  }
];


// ==========================================
// DEFAULT LEGACY IMPORTS (Qatar 2022 by default)
// ==========================================

export const initialTeams = teams2022;
export const initialMatches = matches2022;
export const initialBracket = bracket2022;
export const initialTimeline = timeline2022;
