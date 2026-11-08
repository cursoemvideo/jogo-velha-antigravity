/**
 * Motor puro de regras e estado do Jogo da Velha (modos 2 Jogadores e Contra o Computador).
 * Módulo independente de DOM para permitir verificação unitária direta.
 */

import { getAvatarById } from "./avatars.js";
import { CPU_DIFFICULTIES, chooseCpuMove } from "./cpu-ai.js";

export { CPU_DIFFICULTIES };

export const MAX_NAME_LENGTH = 5;
export const NAME_PATTERN = /^[A-Z]{1,5}$/;

export const GAME_MODES = Object.freeze({
  CPU: "cpu",
  TWO_PLAYERS: "2p"
});

export const CPU_NAME = "CPU";
export const DEFAULT_CPU_AVATAR_ID = "robot";
export const FALLBACK_CPU_AVATAR_ID = "alien";

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
const VALID_MODES = new Set([GAME_MODES.CPU, GAME_MODES.TWO_PLAYERS]);
const VALID_DIFFICULTIES = new Set([CPU_DIFFICULTIES.EASY, CPU_DIFFICULTIES.HARD]);

/**
 * Determina o avatar automático da CPU garantindo que seja sempre distinto do Jogador 1.
 * Prefere "robot" por padrão e usa "alien" caso o Jogador 1 escolha "robot".
 *
 * @param {string|null} player1AvatarId
 * @returns {string}
 */
export function resolveCpuAvatarId(player1AvatarId) {
  return player1AvatarId === DEFAULT_CPU_AVATAR_ID
    ? FALLBACK_CPU_AVATAR_ID
    : DEFAULT_CPU_AVATAR_ID;
}

/**
 * Cria uma cópia profunda segura do estado da partida.
 * @param {object} state
 * @returns {object}
 */
function cloneState(state) {
  return {
    mode: state.mode,
    difficulty: state.difficulty,
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
 * Por padrão inicia no modo "Contra o Computador" ("cpu") e dificuldade "Difícil" ("dificil").
 *
 * @param {{ mode?: "cpu"|"2p", difficulty?: "facil"|"dificil" }} [options]
 * @returns {object}
 */
export function createInitialState(options = {}) {
  const mode = VALID_MODES.has(options?.mode) ? options.mode : GAME_MODES.CPU;
  const difficulty = VALID_DIFFICULTIES.has(options?.difficulty)
    ? options.difficulty
    : CPU_DIFFICULTIES.HARD;

  const isCpuMode = mode === GAME_MODES.CPU;

  return {
    mode,
    difficulty,
    phase: "setup",
    players: {
      1: { number: 1, name: "", avatarId: null, symbol: "X", isCpu: false },
      2: isCpuMode
        ? {
            number: 2,
            name: CPU_NAME,
            avatarId: DEFAULT_CPU_AVATAR_ID,
            symbol: "O",
            isCpu: true
          }
        : {
            number: 2,
            name: "",
            avatarId: null,
            symbol: "O",
            isCpu: false
          }
    },
    board: Array(9).fill(null),
    startingPlayer: 1,
    currentTurn: 1,
    winner: null,
    winningLine: []
  };
}

/**
 * Alterna o modo de jogo ("cpu" ou "2p") durante a configuração inicial.
 * @param {object} state Estado atual.
 * @param {"cpu"|"2p"} mode Novo modo de jogo.
 * @returns {{ ok: boolean, code?: string, message?: string, state: object }}
 */
export function setGameMode(state, mode) {
  if (!VALID_MODES.has(mode)) {
    return {
      ok: false,
      code: "INVALID_MODE",
      message: "Modo de jogo inválido.",
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  next.mode = mode;

  if (mode === GAME_MODES.CPU) {
    next.players[2] = {
      number: 2,
      name: CPU_NAME,
      avatarId: resolveCpuAvatarId(next.players[1].avatarId),
      symbol: "O",
      isCpu: true
    };
  } else {
    next.players[2] = {
      number: 2,
      name: "",
      avatarId: null,
      symbol: "O",
      isCpu: false
    };
  }

  return {
    ok: true,
    state: next
  };
}

/**
 * Define o nível de dificuldade da CPU ("facil" ou "dificil").
 * @param {object} state Estado atual.
 * @param {"facil"|"dificil"} difficulty
 * @returns {{ ok: boolean, code?: string, message?: string, state: object }}
 */
export function setCpuDifficulty(state, difficulty) {
  if (!VALID_DIFFICULTIES.has(difficulty)) {
    return {
      ok: false,
      code: "INVALID_DIFFICULTY",
      message: "Nível de dificuldade inválido.",
      state: cloneState(state)
    };
  }

  const next = cloneState(state);
  next.difficulty = difficulty;
  return {
    ok: true,
    state: next
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

  if (playerNumber === 2 && state.mode === GAME_MODES.CPU) {
    return {
      ok: false,
      code: "CANNOT_EDIT_CPU",
      message: "O nome da CPU é definido automaticamente no modo Contra o Computador.",
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
 * Seleciona um avatar no catálogo para o jogador indicado, impedindo escolha duplicada
 * no modo 2 Jogadores e realocando automaticamente o avatar da CPU no modo Contra o Computador.
 *
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

  if (playerNumber === 2 && state.mode === GAME_MODES.CPU) {
    return {
      ok: false,
      code: "CANNOT_EDIT_CPU",
      message: "O avatar da CPU é definido automaticamente no modo Contra o Computador.",
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

  const next = cloneState(state);

  if (state.mode === GAME_MODES.CPU && playerNumber === 1) {
    next.players[1].avatarId = avatarId;
    next.players[2].avatarId = resolveCpuAvatarId(avatarId);
    return {
      ok: true,
      state: next
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

  if (state.mode === GAME_MODES.CPU && p1.name === CPU_NAME) {
    return {
      ok: false,
      code: "RESERVED_CPU_NAME",
      field: "player1Name",
      message: "O nome CPU é reservado para o computador. Escolha outro nome."
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
 * Inicia a primeira partida após validar nomes e avatares dos jogadores.
 * @param {object} state Estado atual.
 * @returns {{ ok: boolean, code?: string, field?: string, message?: string, state: object }}
 */
export function startMatch(state) {
  const next = cloneState(state);
  if (next.mode === GAME_MODES.CPU) {
    next.players[2] = {
      number: 2,
      name: CPU_NAME,
      avatarId: resolveCpuAvatarId(next.players[1].avatarId),
      symbol: "O",
      isCpu: true
    };
  }

  const validation = validatePlayersSetup(next);
  if (!validation.ok) {
    return {
      ...validation,
      state: cloneState(state)
    };
  }

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
 * Indica se a partida está em andamento e o turno atual pertence à CPU.
 * @param {object} state
 * @returns {boolean}
 */
export function isCpuTurn(state) {
  return Boolean(
    state &&
      state.phase === "playing" &&
      state.mode === GAME_MODES.CPU &&
      state.currentTurn === 2
  );
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
 * Executa automaticamente a jogada da CPU quando o turno atual pertence a ela.
 *
 * @param {object} state Estado atual.
 * @param {() => number} [randomFn=Math.random] Função geradora aleatória opcional para testes.
 * @returns {{ ok: boolean, code?: string, message?: string, cellIndex?: number, state: object }}
 */
export function makeCpuMove(state, randomFn = Math.random) {
  if (!isCpuTurn(state)) {
    return {
      ok: false,
      code: "NOT_CPU_TURN",
      message: "Não é o turno do computador.",
      state: cloneState(state)
    };
  }

  const chosenCell = chooseCpuMove(
    state.board,
    state.difficulty,
    state.players[2].symbol,
    state.players[1].symbol,
    randomFn
  );

  if (chosenCell === null) {
    return {
      ok: false,
      code: "NO_AVAILABLE_MOVES",
      message: "Não há casas vazias disponíveis.",
      state: cloneState(state)
    };
  }

  const result = makeMove(state, chosenCell);
  return {
    ...result,
    cellIndex: chosenCell
  };
}

/**
 * Inicia uma revanche ("Jogar Novamente") mantendo os mesmos jogadores, modo e dificuldade,
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
 * restaurando os padrões iniciais (modo "Contra o Computador" e dificuldade "Difícil").
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

  const {
    mode: rawMode,
    difficulty: rawDifficulty,
    phase,
    players,
    board,
    startingPlayer,
    currentTurn,
    winner,
    winningLine
  } = candidate;

  if (!VALID_PHASES.has(phase)) {
    return null;
  }

  const mode = rawMode === undefined ? GAME_MODES.TWO_PLAYERS : rawMode;
  if (!VALID_MODES.has(mode)) {
    return null;
  }

  const difficulty =
    rawDifficulty === undefined ? CPU_DIFFICULTIES.HARD : rawDifficulty;
  if (!VALID_DIFFICULTIES.has(difficulty)) {
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

  const isCpuMode = mode === GAME_MODES.CPU;
  const restoredP1AvatarId = p1Avatar ? p1Avatar.id : null;

  const restored = {
    mode,
    difficulty,
    phase,
    players: {
      1: {
        number: 1,
        name: p1NameSanitized.value,
        avatarId: restoredP1AvatarId,
        symbol: "X",
        isCpu: false
      },
      2: isCpuMode
        ? {
            number: 2,
            name: CPU_NAME,
            avatarId: resolveCpuAvatarId(restoredP1AvatarId),
            symbol: "O",
            isCpu: true
          }
        : {
            number: 2,
            name: p2NameSanitized.value,
            avatarId: p2Avatar ? p2Avatar.id : null,
            symbol: "O",
            isCpu: false
          }
    },
    board: [...board],
    startingPlayer,
    currentTurn,
    winner: winner === 1 || winner === 2 ? winner : null,
    winningLine:
      Array.isArray(winningLine) && winningLine.length === 3
        ? [...winningLine]
        : []
  };

  if (phase !== "setup") {
    const setupValidation = validatePlayersSetup(restored);
    if (!setupValidation.ok) {
      return null;
    }
  }

  return restored;
}
