import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { CPU_DIFFICULTIES, chooseCpuMove } from "../js/cpu-ai.js";

describe("Estratégia do Oponente Automatizado (cpu-ai.js)", () => {
  it("retorna null quando o tabuleiro está completamente cheio ou é inválido", () => {
    const fullBoard = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    assert.equal(chooseCpuMove(fullBoard, CPU_DIFFICULTIES.HARD), null);
    assert.equal(chooseCpuMove(fullBoard, CPU_DIFFICULTIES.EASY), null);
    assert.equal(chooseCpuMove(null, CPU_DIFFICULTIES.HARD), null);
    assert.equal(chooseCpuMove([null, null], CPU_DIFFICULTIES.HARD), null);
  });

  it("no nível Fácil ('facil') escolhe aleatoriamente entre as casas vazias disponíveis", () => {
    const board = ["X", null, "O", null, "X", null, "O", "X", null];
    // Casas vazias: 1, 3, 5, 8
    assert.equal(chooseCpuMove(board, CPU_DIFFICULTIES.EASY, "O", "X", () => 0.0), 1);
    assert.equal(chooseCpuMove(board, CPU_DIFFICULTIES.EASY, "O", "X", () => 0.3), 3);
    assert.equal(chooseCpuMove(board, CPU_DIFFICULTIES.EASY, "O", "X", () => 0.6), 5);
    assert.equal(chooseCpuMove(board, CPU_DIFFICULTIES.EASY, "O", "X", () => 0.99), 8);
  });

  it("no nível Difícil ('dificil') marca a 3ª casa para vencer imediatamente quando possui 2 símbolos alinhados", () => {
    // Linha horizontal: O em 0 e 1, casa 2 vazia (mesmo com X ameaçando na linha de baixo)
    const boardHorizontal = ["O", "O", null, "X", "X", null, null, null, null];
    assert.equal(chooseCpuMove(boardHorizontal, CPU_DIFFICULTIES.HARD), 2);

    // Coluna vertical: O em 1 e 7, casa 4 vazia
    const boardVertical = ["X", "O", null, null, null, "X", null, "O", null];
    assert.equal(chooseCpuMove(boardVertical, CPU_DIFFICULTIES.HARD), 4);

    // Diagonal: O em 2 e 4, casa 6 vazia
    const boardDiagonal = ["X", null, "O", null, "O", "X", null, null, null];
    assert.equal(chooseCpuMove(boardDiagonal, CPU_DIFFICULTIES.HARD), 6);
  });

  it("no nível Difícil ('dificil') bloqueia a vitória imediata do oponente quando não pode vencer na jogada atual", () => {
    // Humano (X) tem 0 e 2, ameaçando vencer na casa 1
    const boardBlockTop = ["X", null, "X", null, "O", null, null, null, null];
    assert.equal(chooseCpuMove(boardBlockTop, CPU_DIFFICULTIES.HARD), 1);

    // Humano (X) tem 0 e 4, ameaçando vencer na diagonal (casa 8)
    const boardBlockDiag = ["X", null, null, null, "X", "O", null, null, null];
    assert.equal(chooseCpuMove(boardBlockDiag, CPU_DIFFICULTIES.HARD), 8);
  });

  it("no nível Difícil ('dificil') prioriza centro, depois cantos e por fim laterais quando não há vitória nem bloqueio imediatos", () => {
    // 1. Centro vazio -> escolhe 4
    const boardCenterFree = ["X", null, null, null, null, null, null, null, null];
    assert.equal(chooseCpuMove(boardCenterFree, CPU_DIFFICULTIES.HARD), 4);

    // 2. Centro ocupado, cantos disponíveis (0, 2, 6, 8) -> escolhe canto
    const boardCenterTaken = [null, null, null, null, "X", null, null, null, null];
    assert.equal(chooseCpuMove(boardCenterTaken, CPU_DIFFICULTIES.HARD, "O", "X", () => 0.0), 0);
    assert.equal(chooseCpuMove(boardCenterTaken, CPU_DIFFICULTIES.HARD, "O", "X", () => 0.99), 8);

    // 3. Centro e todos os cantos ocupados sem linha de 2 vazia -> escolhe lateral (1, 3, 5 ou 7)
    const boardOnlySides = ["X", null, "O", null, "X", null, "O", null, "O"];
    // Atenção: em boardOnlySides acima, 2,6,8 têm O (6 e 8 teriam 7 vazia!). Ajustando para sem ameaça:
    const boardNeutralSides = ["X", null, "O", null, "O", null, "O", null, "X"];
    const move = chooseCpuMove(boardNeutralSides, CPU_DIFFICULTIES.HARD, "O", "X", () => 0.0);
    assert.equal(move, 1);
  });
});
