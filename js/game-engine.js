/**
 * Motor puro de regras e estado do Jogo da Velha presencial para 2 jogadores.
 * Módulo independente de DOM para permitir verificação unitária direta.
 */

import { getAvatarById } from "./avatars.js";

export const MAX_NAME_LENGTH = 5;
export const NAME_PATTERN = /^[A-Z]{1,5}$/;

export const WINNING_COMBINATIONS = Object.freeze([
  Object.freeze([0, 1, 2]),
  Object.freeze([3, 4, 5]),
  Object.freeze([6, 7, 8]),
  Object.freeze([0, 3, 6]),
  Object.freeze([1, 4, 7]),
  Object.freeze([2, 5, 8]),
  Object.freeze([0, 4, 8]),
  Object.freeze([2, 4, 6])
]);

const VALID_PHASES = new Set(["setup", "playing", "victory", "draw"]);

/**
 * Cria uma cópia profunda segura do estado da partida.
 * @param {object} state
 * @returns {object}
 */
function cloneState(state) {
  return {
    phase: state.phase,
    players: {
      1: { ...state.players[1] },
      2: { ...state.players[2] }
    },
    board: [...state.board],
    startingPlayer: state.startingPlayer,
    currentTurn: state.currentTurn,
    winner: state.winner,
    winningLine: [...state.winningLine]
  };
}

/**
 * Cria o estado inicial na fase de configuração dos jogadores.
 * @returns {object}
 */
export function createInitialState() {
  return {
    phase: "setup",
    players: {
      1: { number: 1, name: "", avatarId: null, symbol: "X" },
      2: { number: 2, name: "", avatarId: null, symbol: "O" }
    },
    board: Array(9).fill(null),
    startingPlayer: 1,
    currentTurn: 1,
    winner: null,
    winningLine: []
  };
}

/**
 * Higieniza o texto digitado para o nome do jogador:
 * - converte letras minúsculas de a-z em maiúsculas A-Z;
 * - rejeita números, espaços, símbolos ou letras acentuadas;
 * - limita o tamanho a no máximo 5 letras.
 *
 * @param {string} rawInput
 * @returns {{ value: string, rejectedChars: boolean, truncated: boolean }}
 */
export function sanitizePlayerNameInput(rawInput) {
  if (typeof rawInput !== "string") {
    return { value: "", rejectedChars: true, truncated: false };
  }

  let clean = "";
  let rejectedChars = false;
  let truncated = false;

  for (const ch of rawInput) {
    if (/^[a-zA-Z]$/.test(ch)) {
      if (clean.length < MAX_NAME_LENGTH) {
        clean += ch.toUpperCase();
      } else {
        truncated = true;
      }
    } else {
      rejectedChars = true;
    }
  }

  return {
    value: clean,
    rejectedChars,
    truncated
  };
}

/**
 * Atualiza o nome de um jogador durante a etapa de configuração.
 * @param {object} state Estado atual.
 * @param {number} playerNumber 1 ou 2.
 * @param {string} rawInput Entrada informada pelo jogador.
 * @returns {{ ok: boolean, code?: string, message?: string, rejectedChars: boolean, truncated: boolean, state: object }}
 */
export function setPlayerName(state, playerNumber, rawInput) {
  if (playerNumber !== 1 && playerNumber !== 2) {
    return {
      ok: false,
      code: "INVALID_PLAYER",
      message: "Jogador inválido.",
      rejectedChars: false,
      truncated: false,
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  const { value, rejectedChars, truncated } = sanitizePlayerNameInput(rawInput);
  next.players[playerNumber].name = value;

  if (rejectedChars) {
    return {
      ok: false,
      code: "INVALID_CHARS_REJECTED",
      message: "Use apenas letras de A a Z (sem números, espaços ou acentos).",
      rejectedChars: true,
      truncated,
      state: next
    };
  }

  return {
    ok: true,
    rejectedChars: false,
    truncated,
    state: next
  };
}

/**
 * Seleciona um avatar no catálogo para o jogador indicado, impedindo escolha duplicada.
 * @param {object} state Estado atual.
 * @param {number} playerNumber 1 ou 2.
 * @param {string} avatarId Identificador do avatar no catálogo.
 * @returns {{ ok: boolean, code?: string, message?: string, state: object }}
 */
export function selectPlayerAvatar(state, playerNumber, avatarId) {
  if (playerNumber !== 1 && playerNumber !== 2) {
    return {
      ok: false,
      code: "INVALID_PLAYER",
      message: "Jogador inválido.",
      state: cloneState(state)
    };
  }

  const avatar = getAvatarById(avatarId);
  if (!avatar) {
    return {
      ok: false,
      code: "AVATAR_NOT_FOUND",
      message: "Selecione um avatar válido do catálogo.",
      state: cloneState(state)
    };
  }

  const otherPlayer = playerNumber === 1 ? 2 : 1;
  if (state.players[otherPlayer].avatarId === avatarId) {
    return {
      ok: false,
      code: "AVATAR_TAKEN",
      message: `O avatar ${avatar.label} já foi escolhido pelo Jogador ${otherPlayer}. Escolha outro avatar.`,
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  next.players[playerNumber].avatarId = avatarId;
  return {
    ok: true,
    state: next
  };
}

/**
 * Valida se os dois jogadores estão prontos para iniciar a partida.
 * @param {object} state
 * @returns {{ ok: boolean, code?: string, field?: string, message?: string }}
 */
export function validatePlayersSetup(state) {
  const p1 = state?.players?.[1];
  const p2 = state?.players?.[2];

  if (!p1 || !p2) {
    return {
      ok: false,
      code: "INVALID_STATE",
      field: "general",
      message: "Configuração de jogadores inválida."
    };
  }

  if (!p1.name || p1.name.length === 0) {
    return {
      ok: false,
      code: "EMPTY_NAME_P1",
      field: "player1Name",
      message: "Informe o nome do Jogador 1 (1 a 5 letras de A a Z)."
    };
  }

  if (!NAME_PATTERN.test(p1.name)) {
    return {
      ok: false,
      code: "INVALID_NAME_P1",
      field: "player1Name",
      message: "O nome do Jogador 1 deve ter de 1 a 5 letras maiúsculas (A a Z)."
    };
  }

  if (!p2.name || p2.name.length === 0) {
    return {
      ok: false,
      code: "EMPTY_NAME_P2",
      field: "player2Name",
      message: "Informe o nome do Jogador 2 (1 a 5 letras de A a Z)."
    };
  }

  if (!NAME_PATTERN.test(p2.name)) {
    return {
      ok: false,
      code: "INVALID_NAME_P2",
      field: "player2Name",
      message: "O nome do Jogador 2 deve ter de 1 a 5 letras maiúsculas (A a Z)."
    };
  }

  if (p1.name === p2.name) {
    return {
      ok: false,
      code: "DUPLICATE_NAMES",
      field: "player2Name",
      message: "Os dois jogadores não podem usar o mesmo nome. Escolha nomes diferentes."
    };
  }

  if (!p1.avatarId || !getAvatarById(p1.avatarId)) {
    return {
      ok: false,
      code: "MISSING_AVATAR_P1",
      field: "player1Avatar",
      message: "Selecione um avatar para o Jogador 1."
    };
  }

  if (!p2.avatarId || !getAvatarById(p2.avatarId)) {
    return {
      ok: false,
      code: "MISSING_AVATAR_P2",
      field: "player2Avatar",
      message: "Selecione um avatar para o Jogador 2."
    };
  }

  if (p1.avatarId === p2.avatarId) {
    return {
      ok: false,
      code: "DUPLICATE_AVATARS",
      field: "player2Avatar",
      message: "Cada jogador deve escolher um avatar diferente."
    };
  }

  return { ok: true };
}

/**
 * Inicia a primeira partida após validar nomes e avatares dos dois jogadores.
 * @param {object} state Estado atual.
 * @returns {{ ok: boolean, code?: string, field?: string, message?: string, state: object }}
 */
export function startMatch(state) {
  const validation = validatePlayersSetup(state);
  if (!validation.ok) {
    return {
      ...validation,
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  next.phase = "playing";
  next.board = Array(9).fill(null);
  next.startingPlayer = 1;
  next.currentTurn = 1;
  next.winner = null;
  next.winningLine = [];

  return {
    ok: true,
    state: next
  };
}

/**
 * Verifica se há uma linha vencedora no tabuleiro.
 * @param {Array<string|null>} board
 * @returns {{ symbol: string, line: number[] } | null}
 */
export function checkWinningLine(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return {
        symbol: board[a],
        line: [a, b, c]
      };
    }
  }
  return null;
}

/**
 * Registra uma jogada no tabuleiro 3x3 para o jogador do turno atual.
 * Ignora jogadas fora da fase "playing" ou em casas já ocupadas.
 *
 * @param {object} state Estado atual.
 * @param {number} cellIndex Índice da casa (0 a 8).
 * @returns {{ ok: boolean, code?: string, message?: string, state: object }}
 */
export function makeMove(state, cellIndex) {
  if (state.phase !== "playing") {
    return {
      ok: false,
      code: "MATCH_NOT_ACTIVE",
      message: "A partida não está em andamento.",
      state: cloneState(state)
    };
  }

  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex > 8) {
    return {
      ok: false,
      code: "INVALID_CELL",
      message: "Casa do tabuleiro inválida.",
      state: cloneState(state)
    };
  }

  if (state.board[cellIndex] !== null) {
    return {
      ok: false,
      code: "CELL_OCCUPIED",
      message: "Esta casa já está preenchida. Escolha uma casa vazia.",
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  const currentPlayer = next.players[next.currentTurn];
  next.board[cellIndex] = currentPlayer.symbol;

  const winningResult = checkWinningLine(next.board);
  if (winningResult) {
    next.phase = "victory";
    next.winner = next.currentTurn;
    next.winningLine = winningResult.line;
    return {
      ok: true,
      state: next
    };
  }

  const isBoardFull = next.board.every((cell) => cell !== null);
  if (isBoardFull) {
    next.phase = "draw";
    next.winner = null;
    next.winningLine = [];
    return {
      ok: true,
      state: next
    };
  }

  next.currentTurn = next.currentTurn === 1 ? 2 : 1;
  return {
    ok: true,
    state: next
  };
}

/**
 * Inicia uma revanche ("Jogar Novamente") mantendo os mesmos jogadores,
 * limpando o tabuleiro e alternando quem faz a primeira jogada.
 *
 * @param {object} state Estado atual.
 * @returns {{ ok: boolean, code?: string, message?: string, state: object }}
 */
export function playAgain(state) {
  if (state.phase !== "victory" && state.phase !== "draw") {
    return {
      ok: false,
      code: "MATCH_NOT_FINISHED",
      message: "A revanche só pode ser iniciada após o término da partida.",
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  const nextStarter = next.startingPlayer === 1 ? 2 : 1;

  next.phase = "playing";
  next.board = Array(9).fill(null);
  next.startingPlayer = nextStarter;
  next.currentTurn = nextStarter;
  next.winner = null;
  next.winningLine = [];

  return {
    ok: true,
    state: next
  };
}

/**
 * Retorna para a etapa de configuração inicial ("Trocar Jogadores"),
 * limpando completamente os nomes, avatares e o tabuleiro.
 *
 * @returns {object}
 */
export function resetToSetup() {
  return createInitialState();
}

/**
 * Valida se um objeto recuperado do armazenamento temporário da sessão é íntegro.
 * @param {unknown} candidate
 * @returns {object | null} Estado higienizado e válido ou null se inválido.
 */
export function validateStoredState(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const { phase, players, board, startingPlayer, currentTurn, winner, winningLine } = candidate;
  if (!VALID_PHASES.has(phase)) {
    return null;
  }

  if (!players || typeof players !== "object" || !players[1] || !players[2]) {
    return null;
  }

  const p1NameSanitized = sanitizePlayerNameInput(String(players[1].name ?? ""));
  const p2NameSanitized = sanitizePlayerNameInput(String(players[2].name ?? ""));
  if (p1NameSanitized.rejectedChars || p2NameSanitized.rejectedChars) {
    return null;
  }

  const p1Avatar = players[1].avatarId ? getAvatarById(players[1].avatarId) : null;
  const p2Avatar = players[2].avatarId ? getAvatarById(players[2].avatarId) : null;
  if ((players[1].avatarId && !p1Avatar) || (players[2].avatarId && !p2Avatar)) {
    return null;
  }

  if (!Array.isArray(board) || board.length !== 9) {
    return null;
  }
  if (!board.every((cell) => cell === null || cell === "X" || cell === "O")) {
    return null;
  }

  if (startingPlayer !== 1 && startingPlayer !== 2) {
    return null;
  }
  if (currentTurn !== 1 && currentTurn !== 2) {
    return null;
  }

  const restored = {
    phase,
    players: {
      1: {
        number: 1,
        name: p1NameSanitized.value,
        avatarId: p1Avatar ? p1Avatar.id : null,
        symbol: "X"
      },
      2: {
        number: 2,
        name: p2NameSanitized.value,
        avatarId: p2Avatar ? p2Avatar.id : null,
        symbol: "O"
      }
    },
    board: [...board],
    startingPlayer,
    currentTurn,
    winner: winner === 1 || winner === 2 ? winner : null,
    winningLine: Array.isArray(winningLine) && winningLine.length === 3 ? [...winningLine] : []
  };

  if (phase !== "setup") {
    const setupValidation = validatePlayersSetup(restored);
    if (!setupValidation.ok) {
      return null;
    }
  }

  return restored;
}
