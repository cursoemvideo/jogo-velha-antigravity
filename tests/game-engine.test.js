import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { AVATARS, getAvatarById } from "../js/avatars.js";
import {
  MAX_NAME_LENGTH,
  WINNING_COMBINATIONS,
  createInitialState,
  sanitizePlayerNameInput,
  setPlayerName,
  selectPlayerAvatar,
  validatePlayersSetup,
  startMatch,
  makeMove,
  playAgain,
  resetToSetup,
  validateStoredState
} from "../js/game-engine.js";

describe("Catálogo de Avatares (avatars.js)", () => {
  it("disponibiliza 8 avatares de mascotes carismáticos com IDs únicos e SVGs", () => {
    assert.equal(AVATARS.length, 8);

    const expectedIds = [
      "robot",
      "cat",
      "fox",
      "astronaut",
      "dino",
      "unicorn",
      "alien",
      "octopus"
    ];
    assert.deepEqual(
      AVATARS.map((a) => a.id),
      expectedIds
    );

    for (const avatar of AVATARS) {
      assert.ok(typeof avatar.label === "string" && avatar.label.length > 0);
      assert.ok(avatar.svg.startsWith("<svg") && avatar.svg.endsWith("</svg>"));
      assert.deepEqual(getAvatarById(avatar.id), avatar);
    }

    assert.equal(getAvatarById("inexistente"), null);
    assert.equal(getAvatarById(""), null);
  });
});

describe("Validação e Higienização de Nomes dos Jogadores", () => {
  it("converte letras minúsculas de a-z automaticamente para maiúsculas A-Z", () => {
    const res = sanitizePlayerNameInput("maria");
    assert.equal(res.value, "MARIA");
    assert.equal(res.rejectedChars, false);
    assert.equal(res.truncated, false);
  });

  it("limita o nome a no máximo 5 letras", () => {
    const res = sanitizePlayerNameInput("GUSTAVO");
    assert.equal(res.value.length, MAX_NAME_LENGTH);
    assert.equal(res.value, "GUSTA");
    assert.equal(res.truncated, true);
  });

  it("rejeita números, espaços, letras acentuadas e símbolos", () => {
    const res = sanitizePlayerNameInput("Jo 1@ã!");
    assert.equal(res.value, "JO");
    assert.equal(res.rejectedChars, true);

    let state = createInitialState();
    const update = setPlayerName(state, 1, "ana12");
    assert.equal(update.ok, false);
    assert.equal(update.code, "INVALID_CHARS_REJECTED");
    assert.equal(update.state.players[1].name, "ANA");
  });

  it("bloqueia o início da partida se algum nome estiver vazio ou se os nomes forem idênticos", () => {
    let state = createInitialState();
    state = selectPlayerAvatar(state, 1, "robot").state;
    state = selectPlayerAvatar(state, 2, "cat").state;

    // Jogador 1 sem nome
    let attempt = startMatch(state);
    assert.equal(attempt.ok, false);
    assert.equal(attempt.code, "EMPTY_NAME_P1");

    // Jogador 2 sem nome
    state = setPlayerName(state, 1, "ANA").state;
    attempt = startMatch(state);
    assert.equal(attempt.ok, false);
    assert.equal(attempt.code, "EMPTY_NAME_P2");

    // Nomes idênticos
    state = setPlayerName(state, 2, "ana").state;
    attempt = startMatch(state);
    assert.equal(attempt.ok, false);
    assert.equal(attempt.code, "DUPLICATE_NAMES");
  });
});

describe("Escolha de Avatares Distintos", () => {
  it("registra a escolha de avatares diferentes e impede escolha duplicada", () => {
    let state = createInitialState();
    const sel1 = selectPlayerAvatar(state, 1, "fox");
    assert.equal(sel1.ok, true);
    state = sel1.state;
    assert.equal(state.players[1].avatarId, "fox");

    const duplicate = selectPlayerAvatar(state, 2, "fox");
    assert.equal(duplicate.ok, false);
    assert.equal(duplicate.code, "AVATAR_TAKEN");
    assert.equal(duplicate.state.players[2].avatarId, null);

    const sel2 = selectPlayerAvatar(state, 2, "dino");
    assert.equal(sel2.ok, true);
    assert.equal(sel2.state.players[2].avatarId, "dino");
  });

  it("bloqueia o início da partida se ao menos um jogador não escolheu avatar", () => {
    let state = createInitialState();
    state = setPlayerName(state, 1, "LEO").state;
    state = setPlayerName(state, 2, "BIA").state;

    let attempt = startMatch(state);
    assert.equal(attempt.ok, false);
    assert.equal(attempt.code, "MISSING_AVATAR_P1");

    state = selectPlayerAvatar(state, 1, "astronaut").state;
    attempt = startMatch(state);
    assert.equal(attempt.ok, false);
    assert.equal(attempt.code, "MISSING_AVATAR_P2");
  });
});

describe("Partida no Tabuleiro 3x3 e Controle de Turnos", () => {
  function createStartedMatch() {
    let state = createInitialState();
    state = setPlayerName(state, 1, "LUCA").state;
    state = setPlayerName(state, 2, "NINA").state;
    state = selectPlayerAvatar(state, 1, "robot").state;
    state = selectPlayerAvatar(state, 2, "unicorn").state;
    return startMatch(state).state;
  }

  it("inicia a primeira partida com 9 casas vazias e turno do Jogador 1 (X)", () => {
    const state = createStartedMatch();
    assert.equal(state.phase, "playing");
    assert.deepEqual(state.board, Array(9).fill(null));
    assert.equal(state.players[1].symbol, "X");
    assert.equal(state.players[2].symbol, "O");
    assert.equal(state.startingPlayer, 1);
    assert.equal(state.currentTurn, 1);
  });

  it("marca casas vazias alternando turnos entre X e O e ignora jogada em casa já ocupada", () => {
    let state = createStartedMatch();

    const move1 = makeMove(state, 0);
    assert.equal(move1.ok, true);
    state = move1.state;
    assert.equal(state.board[0], "X");
    assert.equal(state.currentTurn, 2);

    // Tentativa de jogar na mesma casa 0 pelo Jogador 2
    const invalidMove = makeMove(state, 0);
    assert.equal(invalidMove.ok, false);
    assert.equal(invalidMove.code, "CELL_OCCUPIED");
    assert.equal(invalidMove.state.board[0], "X");
    assert.equal(invalidMove.state.currentTurn, 2);

    // Jogada válida do Jogador 2 na casa 4
    const move2 = makeMove(state, 4);
    assert.equal(move2.ok, true);
    state = move2.state;
    assert.equal(state.board[4], "O");
    assert.equal(state.currentTurn, 1);
  });
});

describe("Detecção de Vitória e Empate (Deu Velha)", () => {
  function createStartedMatch() {
    let state = createInitialState();
    state = setPlayerName(state, 1, "MAX").state;
    state = setPlayerName(state, 2, "EVA").state;
    state = selectPlayerAvatar(state, 1, "alien").state;
    state = selectPlayerAvatar(state, 2, "octopus").state;
    return startMatch(state).state;
  }

  it("detecta vitória nas 8 combinações possíveis (3 horizontais, 3 verticais e 2 diagonais)", () => {
    for (const winningCombo of WINNING_COMBINATIONS) {
      let state = createStartedMatch();
      const [w1, w2, w3] = winningCombo;
      const otherCells = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
        (idx) => !winningCombo.includes(idx)
      );

      state = makeMove(state, w1).state; // P1
      state = makeMove(state, otherCells[0]).state; // P2
      state = makeMove(state, w2).state; // P1
      state = makeMove(state, otherCells[1]).state; // P2
      state = makeMove(state, w3).state; // P1 vence

      assert.equal(state.phase, "victory");
      assert.equal(state.winner, 1);
      assert.deepEqual(state.winningLine, winningCombo);

      // Tentar jogar em casa vazia após vitória deve ser ignorado
      const postWinMove = makeMove(state, otherCells[2]);
      assert.equal(postWinMove.ok, false);
      assert.equal(postWinMove.code, "MATCH_NOT_ACTIVE");
      assert.equal(postWinMove.state.board[otherCells[2]], null);
    }
  });

  it("detecta empate ('Deu Velha') quando as 9 casas são preenchidas sem linha vencedora", () => {
    let state = createStartedMatch();
    // Sequência sem vencedor:
    // X O X
    // X O O
    // O X X
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const cell of moves) {
      state = makeMove(state, cell).state;
    }

    assert.equal(state.phase, "draw");
    assert.equal(state.winner, null);
    assert.deepEqual(state.winningLine, []);
  });

  it("declara vitória (e não empate) quando a 9ª casa completa uma linha vencedora", () => {
    let state = createStartedMatch();
    // Sequência de 9 jogadas onde nenhuma linha fecha antes da 9ª casa (casa 8):
    // 0(X), 1(O), 2(X), 3(O), 4(X), 6(O), 5(X), 7(O), 8(X)
    const moves = [0, 1, 2, 3, 4, 6, 5, 7, 8];
    for (const cell of moves) {
      state = makeMove(state, cell).state;
    }

    assert.equal(state.phase, "victory");
    assert.equal(state.winner, 1);
    assert.deepEqual(state.winningLine, [2, 5, 8]);
  });
});

describe("Revanche, Troca de Jogadores e Persistência de Sessão", () => {
  it("alterna consistentemente quem começa a partida em múltiplas revanches ('Jogar Novamente')", () => {
    let state = createInitialState();
    state = setPlayerName(state, 1, "SOL").state;
    state = setPlayerName(state, 2, "LUA").state;
    state = selectPlayerAvatar(state, 1, "cat").state;
    state = selectPlayerAvatar(state, 2, "fox").state;
    state = startMatch(state).state;

    assert.equal(state.startingPlayer, 1);
    assert.equal(state.currentTurn, 1);

    // P1 vence na primeira partida
    for (const cell of [0, 3, 1, 4, 2]) {
      state = makeMove(state, cell).state;
    }
    assert.equal(state.phase, "victory");

    // Revanche 1 -> começa Jogador 2 (O)
    state = playAgain(state).state;
    assert.equal(state.phase, "playing");
    assert.deepEqual(state.board, Array(9).fill(null));
    assert.equal(state.startingPlayer, 2);
    assert.equal(state.currentTurn, 2);
    assert.equal(state.players[1].name, "SOL");
    assert.equal(state.players[2].name, "LUA");

    // P2 vence na segunda partida (começando por P2)
    for (const cell of [0, 3, 1, 4, 2]) {
      state = makeMove(state, cell).state;
    }
    assert.equal(state.phase, "victory");
    assert.equal(state.winner, 2);

    // Revanche 2 -> volta a começar Jogador 1 (X)
    state = playAgain(state).state;
    assert.equal(state.startingPlayer, 1);
    assert.equal(state.currentTurn, 1);
  });

  it("limpa completamente nomes, avatares e tabuleiro ao acionar 'Trocar Jogadores'", () => {
    const clean = resetToSetup();
    assert.equal(clean.phase, "setup");
    assert.equal(clean.players[1].name, "");
    assert.equal(clean.players[2].name, "");
    assert.equal(clean.players[1].avatarId, null);
    assert.equal(clean.players[2].avatarId, null);
    assert.deepEqual(clean.board, Array(9).fill(null));
  });

  it("valida estado salvo do sessionStorage e rejeita estado corrompido", () => {
    let state = createInitialState();
    state = setPlayerName(state, 1, "RAY").state;
    state = setPlayerName(state, 2, "KAI").state;
    state = selectPlayerAvatar(state, 1, "dino").state;
    state = selectPlayerAvatar(state, 2, "robot").state;
    state = startMatch(state).state;

    const validRestored = validateStoredState(JSON.parse(JSON.stringify(state)));
    assert.ok(validRestored !== null);
    assert.equal(validRestored.players[1].name, "RAY");
    assert.equal(validRestored.phase, "playing");

    // Corrompendo nomes para iguais em partida ativa
    const corrupted = JSON.parse(JSON.stringify(state));
    corrupted.players[2].name = "RAY";
    assert.equal(validateStoredState(corrupted), null);
    assert.equal(validateStoredState(null), null);
  });
});
