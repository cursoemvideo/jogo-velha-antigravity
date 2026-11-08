/**
 * Estratégia pura de decisão de jogada para o oponente automatizado (CPU).
 * Suporta os níveis de dificuldade "facil" (aleatório) e "dificil" (tático).
 */

export const CPU_DIFFICULTIES = Object.freeze({
  EASY: "facil",
  HARD: "dificil"
});

const WINNING_LINES = Object.freeze([
  Object.freeze([0, 1, 2]),
  Object.freeze([3, 4, 5]),
  Object.freeze([6, 7, 8]),
  Object.freeze([0, 3, 6]),
  Object.freeze([1, 4, 7]),
  Object.freeze([2, 5, 8]),
  Object.freeze([0, 4, 8]),
  Object.freeze([2, 4, 6])
]);

const CENTER_INDEX = 4;
const CORNER_INDICES = Object.freeze([0, 2, 6, 8]);
const SIDE_INDICES = Object.freeze([1, 3, 5, 7]);

/**
 * Seleciona um item de uma lista não vazia usando a função geradora de números aleatórios fornecida.
 * @param {number[]} items
 * @param {() => number} randomFn
 * @returns {number}
 */
function pickRandomItem(items, randomFn) {
  const raw = typeof randomFn === "function" ? randomFn() : Math.random();
  const normalized = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.999999) : 0;
  const index = Math.floor(normalized * items.length);
  return items[index];
}

/**
 * Procura uma casa vazia que complete uma linha de 3 símbolos iguais para o símbolo informado.
 * @param {Array<string|null>} board
 * @param {string} targetSymbol
 * @returns {number | null}
 */
function findCompletingMove(board, targetSymbol) {
  for (const [a, b, c] of WINNING_LINES) {
    const lineCells = [board[a], board[b], board[c]];
    const symbolCount = lineCells.filter((cell) => cell === targetSymbol).length;
    const emptyCount = lineCells.filter((cell) => cell === null).length;

    if (symbolCount === 2 && emptyCount === 1) {
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      return c;
    }
  }
  return null;
}

/**
 * Decide a próxima casa (0 a 8) a ser marcada pela CPU.
 *
 * @param {Array<string|null>} board Estado atual das 9 casas do tabuleiro.
 * @param {"facil"|"dificil"} [difficulty="dificil"] Nível de dificuldade selecionado.
 * @param {string} [cpuSymbol="O"] Símbolo da CPU.
 * @param {string} [humanSymbol="X"] Símbolo do oponente humano.
 * @param {() => number} [randomFn=Math.random] Função geradora de número em [0, 1).
 * @returns {number | null} Índice da casa escolhida (0..8) ou null se não houver casas vazias.
 */
export function chooseCpuMove(
  board,
  difficulty = CPU_DIFFICULTIES.HARD,
  cpuSymbol = "O",
  humanSymbol = "X",
  randomFn = Math.random
) {
  if (!Array.isArray(board) || board.length !== 9) {
    return null;
  }

  const emptyIndices = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === null) {
      emptyIndices.push(i);
    }
  }

  if (emptyIndices.length === 0) {
    return null;
  }

  if (difficulty === CPU_DIFFICULTIES.EASY) {
    return pickRandomItem(emptyIndices, randomFn);
  }

  // 1. Vencer imediatamente se houver 2 símbolos da CPU alinhados com 3ª casa vazia
  const winningMove = findCompletingMove(board, cpuSymbol);
  if (winningMove !== null) {
    return winningMove;
  }

  // 2. Bloquear vitória imediata do oponente humano
  const blockingMove = findCompletingMove(board, humanSymbol);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // 3. Priorizar o centro do tabuleiro
  if (board[CENTER_INDEX] === null) {
    return CENTER_INDEX;
  }

  // 4. Priorizar cantos disponíveis
  const availableCorners = CORNER_INDICES.filter((idx) => board[idx] === null);
  if (availableCorners.length > 0) {
    return pickRandomItem(availableCorners, randomFn);
  }

  // 5. Escolher entre as laterais disponíveis
  const availableSides = SIDE_INDICES.filter((idx) => board[idx] === null);
  if (availableSides.length > 0) {
    return pickRandomItem(availableSides, randomFn);
  }

  return pickRandomItem(emptyIndices, randomFn);
}
