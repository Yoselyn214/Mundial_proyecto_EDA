import test from "node:test";
import assert from "node:assert/strict";
import { buildHldModelFromBracket } from "./hld";
import type { BracketNode } from "../types";

function makeBracket(): Record<string, BracketNode> {
  return {
    QF1: {
      id: "QF1",
      stageName: "Cuartos de Final",
      teamA: "Alemania",
      teamB: "Francia",
      scoreA: 1,
      scoreB: 0,
      winner: "Alemania",
      leftChildId: null,
      rightChildId: null,
      parentId: "SF1",
    },
    QF2: {
      id: "QF2",
      stageName: "Cuartos de Final",
      teamA: "Brasil",
      teamB: "Colombia",
      scoreA: 2,
      scoreB: 1,
      winner: "Brasil",
      leftChildId: null,
      rightChildId: null,
      parentId: "SF1",
    },
    SF1: {
      id: "SF1",
      stageName: "Semifinal",
      teamA: "Alemania",
      teamB: "Brasil",
      scoreA: 1,
      scoreB: 0,
      winner: "Alemania",
      leftChildId: "QF1",
      rightChildId: "QF2",
      parentId: "F",
    },
    F: {
      id: "F",
      stageName: "Final",
      teamA: "Alemania",
      teamB: "Argentina",
      scoreA: 1,
      scoreB: 0,
      winner: "Alemania",
      leftChildId: "SF1",
      rightChildId: null,
      parentId: null,
    },
  };
}

test("buildHldModelFromBracket computes team path and scenario versions", () => {
  const model = buildHldModelFromBracket(makeBracket());

  const original = model.queryTeamPath("Alemania");
  assert.equal(original.matchesCount, 3);
  assert.equal(original.totalGoals, 3);

  const version = model.createScenario("F", 2, 1, "Alemania");
  const updated = model.queryTeamPath("Alemania", version);

  assert.equal(version, 1);
  assert.equal(updated.totalGoals, 5);
  assert.deepEqual(model.getNodeValue("F", version), { homeScore: 2, awayScore: 1, winner: "Alemania" });
});
