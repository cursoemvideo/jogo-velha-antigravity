/**
 * Camada de renderização e atualização segura da interface DOM.
 * Todas as entradas de jogadores e mensagens são inseridas exclusivamente via textContent
 * e atributos seguros, prevenindo qualquer injeção de marcação.
 */

import { AVATARS, getAvatarById } from "./avatars.js";

const CONFETTI_COLORS = [
  "#22c55e",
  "#38bdf8",
  "#fb923c",
  "#facc15",
  "#f43f5e",
  "#a855f7"
];

const svgCache = new Map();

/**
 * Converte a string SVG constante do catálogo em um elemento DOM clonável.
 * @param {string} avatarId
 * @returns {SVGElement | null}
 */
function createAvatarSvgElement(avatarId) {
  const avatar = getAvatarById(avatarId);
  if (!avatar) {
    return null;
  }

  if (!svgCache.has(avatar.id)) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(avatar.svg, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (svgEl) {
      svgCache.set(avatar.id, svgEl);
    }
  }

  const cached = svgCache.get(avatar.id);
  return cached ? cached.cloneNode(true) : null;
}

/**
 * Substitui o conteúdo de um contêiner pelo SVG do avatar indicado.
 * @param {HTMLElement} container
 * @param {string | null} avatarId
 */
function renderAvatarInto(container, avatarId) {
  container.replaceChildren();
  if (!avatarId) {
    return;
  }
  const svgNode = createAvatarSvgElement(avatarId);
  if (svgNode) {
    container.appendChild(svgNode);
  }
}

/**
 * Coleta e retorna as referências de elementos do DOM utilizadas pela interface.
 * @param {Document} doc
 */
export function getDomElements(doc = document) {
  return {
    setupScreen: doc.getElementById("setup-screen"),
    matchScreen: doc.getElementById("match-screen"),
    setupForm: doc.getElementById("setup-form"),
    player1NameInput: doc.getElementById("player1-name"),
    player2NameInput: doc.getElementById("player2-name"),
    player1CharCount: doc.getElementById("player1-char-count"),
    player2CharCount: doc.getElementById("player2-char-count"),
    player1NameError: doc.getElementById("player1-name-error"),
    player2NameError: doc.getElementById("player2-name-error"),
    player1AvatarGrid: doc.getElementById("player1-avatar-grid"),
    player2AvatarGrid: doc.getElementById("player2-avatar-grid"),
    player1SelectedAvatarName: doc.getElementById("player1-selected-avatar-name"),
    player2SelectedAvatarName: doc.getElementById("player2-selected-avatar-name"),
    player1AvatarError: doc.getElementById("player1-avatar-error"),
    player2AvatarError: doc.getElementById("player2-avatar-error"),
    setupGeneralError: doc.getElementById("setup-general-error"),
    startMatchBtn: doc.getElementById("start-match-btn"),
    player1Badge: doc.getElementById("player1-badge"),
    player2Badge: doc.getElementById("player2-badge"),
    player1BadgeAvatar: doc.getElementById("player1-badge-avatar"),
    player2BadgeAvatar: doc.getElementById("player2-badge-avatar"),
    player1BadgeName: doc.getElementById("player1-badge-name"),
    player2BadgeName: doc.getElementById("player2-badge-name"),
    turnBanner: doc.getElementById("turn-banner"),
    turnAvatar: doc.getElementById("turn-avatar"),
    turnPlayerName: doc.getElementById("turn-player-name"),
    turnPlayerSymbol: doc.getElementById("turn-player-symbol"),
    resultBanner: doc.getElementById("result-banner"),
    confettiContainer: doc.getElementById("confetti-container"),
    resultAvatar: doc.getElementById("result-avatar"),
    resultKicker: doc.getElementById("result-kicker"),
    resultTitle: doc.getElementById("result-title"),
    resultSubtitle: doc.getElementById("result-subtitle"),
    board: doc.getElementById("board"),
    boardCells: Array.from(doc.querySelectorAll(".board-cell")),
    matchFeedback: doc.getElementById("match-feedback"),
    endActions: doc.getElementById("end-actions"),
    playAgainBtn: doc.getElementById("play-again-btn"),
    changePlayersBtn: doc.getElementById("change-players-btn")
  };
}

/**
 * Exibe uma mensagem de erro acessível em um elemento de alerta.
 * @param {HTMLElement} errorEl
 * @param {string} message
 * @param {HTMLElement} [inputEl]
 */
export function showFieldError(errorEl, message, inputEl) {
  if (!errorEl) {
    return;
  }
  errorEl.textContent = message;
  errorEl.hidden = false;
  if (inputEl) {
    inputEl.classList.add("name-input--invalid");
    inputEl.setAttribute("aria-invalid", "true");
  }
}

/**
 * Oculta e limpa a mensagem de erro de um campo.
 * @param {HTMLElement} errorEl
 * @param {HTMLElement} [inputEl]
 */
export function clearFieldError(errorEl, inputEl) {
  if (!errorEl) {
    return;
  }
  errorEl.textContent = "";
  errorEl.hidden = true;
  if (inputEl) {
    inputEl.classList.remove("name-input--invalid");
    inputEl.removeAttribute("aria-invalid");
  }
}

/**
 * Limpa todos os alertas de validação da tela de configuração.
 * @param {object} elements
 */
export function clearAllSetupErrors(elements) {
  clearFieldError(elements.player1NameError, elements.player1NameInput);
  clearFieldError(elements.player2NameError, elements.player2NameInput);
  clearFieldError(elements.player1AvatarError);
  clearFieldError(elements.player2AvatarError);
  clearFieldError(elements.setupGeneralError);
}

/**
 * Exibe ou oculta mensagem rápida de feedback na tela da partida.
 * @param {object} elements
 * @param {string} message
 */
export function showMatchFeedback(elements, message) {
  if (!elements.matchFeedback) {
    return;
  }
  if (!message) {
    elements.matchFeedback.textContent = "";
    elements.matchFeedback.hidden = true;
    return;
  }
  elements.matchFeedback.textContent = message;
  elements.matchFeedback.hidden = false;
}

/**
 * Constrói os botões do catálogo de avatares para um jogador.
 * @param {HTMLElement} gridEl
 * @param {number} playerNumber
 * @param {(playerNumber: number, avatarId: string) => void} onSelectAvatar
 */
export function initAvatarGrid(gridEl, playerNumber, onSelectAvatar) {
  gridEl.replaceChildren();

  for (const avatar of AVATARS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option";
    button.dataset.avatarId = avatar.id;
    button.dataset.playerNumber = String(playerNumber);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Avatar ${avatar.label} para Jogador ${playerNumber}`);

    const iconSpan = document.createElement("span");
    iconSpan.className = "avatar-option__icon";
    iconSpan.setAttribute("aria-hidden", "true");
    const svgEl = createAvatarSvgElement(avatar.id);
    if (svgEl) {
      iconSpan.appendChild(svgEl);
    }

    const labelSpan = document.createElement("span");
    labelSpan.className = "avatar-option__label";
    labelSpan.textContent = avatar.label;

    button.append(iconSpan, labelSpan);
    button.addEventListener("click", () => {
      onSelectAvatar(playerNumber, avatar.id);
    });

    gridEl.appendChild(button);
  }
}

/**
 * Atualiza o estado visual dos botões de avatar de um jogador.
 * @param {HTMLElement} gridEl
 * @param {HTMLElement} selectedTagEl
 * @param {number} playerNumber
 * @param {object} state
 */
function updateAvatarGridState(gridEl, selectedTagEl, playerNumber, state) {
  const otherPlayer = playerNumber === 1 ? 2 : 1;
  const selectedId = state.players[playerNumber].avatarId;
  const takenByOtherId = state.players[otherPlayer].avatarId;
  const selectedClass = playerNumber === 1 ? "avatar-option--selected-p1" : "avatar-option--selected-p2";

  const buttons = gridEl.querySelectorAll(".avatar-option");
  for (const button of buttons) {
    const avatarId = button.dataset.avatarId;
    const avatar = getAvatarById(avatarId);
    const isSelected = avatarId === selectedId;
    const isTaken = avatarId === takenByOtherId;

    button.classList.toggle(selectedClass, isSelected);
    button.classList.toggle("avatar-option--taken", isTaken);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.setAttribute("aria-disabled", isTaken ? "true" : "false");

    if (avatar) {
      if (isSelected) {
        button.setAttribute("aria-label", `Avatar ${avatar.label} selecionado para Jogador ${playerNumber}`);
      } else if (isTaken) {
        button.setAttribute(
          "aria-label",
          `Avatar ${avatar.label} (em uso pelo Jogador ${otherPlayer})`
        );
      } else {
        button.setAttribute("aria-label", `Avatar ${avatar.label} para Jogador ${playerNumber}`);
      }
    }
  }

  const chosenAvatar = selectedId ? getAvatarById(selectedId) : null;
  if (chosenAvatar) {
    selectedTagEl.textContent = `Escolhido: ${chosenAvatar.label}`;
    selectedTagEl.classList.add("selected-avatar-tag--active");
  } else {
    selectedTagEl.textContent = "Nenhum escolhido";
    selectedTagEl.classList.remove("selected-avatar-tag--active");
  }
}

/**
 * Cria partículas decorativas de confete no banner de vitória.
 * @param {HTMLElement} container
 */
function renderConfetti(container) {
  container.replaceChildren();
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.round((i / count) * 100)}%`;
    piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${(i % 6) * 0.18}s`;
    piece.style.animationDuration = `${1.4 + (i % 4) * 0.25}s`;
    container.appendChild(piece);
  }
}

/**
 * Atualiza a tela de configuração conforme o estado atual.
 * @param {object} elements
 * @param {object} state
 */
export function renderSetupScreen(elements, state) {
  const p1Name = state.players[1].name;
  const p2Name = state.players[2].name;

  if (elements.player1NameInput.value !== p1Name) {
    elements.player1NameInput.value = p1Name;
  }
  if (elements.player2NameInput.value !== p2Name) {
    elements.player2NameInput.value = p2Name;
  }

  elements.player1CharCount.textContent = `${p1Name.length}/5`;
  elements.player2CharCount.textContent = `${p2Name.length}/5`;

  updateAvatarGridState(
    elements.player1AvatarGrid,
    elements.player1SelectedAvatarName,
    1,
    state
  );
  updateAvatarGridState(
    elements.player2AvatarGrid,
    elements.player2SelectedAvatarName,
    2,
    state
  );
}

/**
 * Atualiza a tela da partida (painel de jogadores, turno, tabuleiro, celebração e botões finais).
 * @param {object} elements
 * @param {object} state
 */
export function renderMatchScreen(elements, state) {
  const p1 = state.players[1];
  const p2 = state.players[2];

  // Painel superior dos jogadores
  elements.player1BadgeName.textContent = p1.name;
  elements.player2BadgeName.textContent = p2.name;
  renderAvatarInto(elements.player1BadgeAvatar, p1.avatarId);
  renderAvatarInto(elements.player2BadgeAvatar, p2.avatarId);

  const isPlaying = state.phase === "playing";
  elements.player1Badge.classList.toggle("player-badge--active", isPlaying && state.currentTurn === 1);
  elements.player2Badge.classList.toggle("player-badge--active", isPlaying && state.currentTurn === 2);

  if (isPlaying) {
    const activePlayer = state.players[state.currentTurn];
    elements.turnBanner.hidden = false;
    elements.turnBanner.classList.toggle("turn-banner--p1", state.currentTurn === 1);
    elements.turnBanner.classList.toggle("turn-banner--p2", state.currentTurn === 2);
    elements.turnPlayerName.textContent = activePlayer.name;
    elements.turnPlayerSymbol.textContent = activePlayer.symbol;
    renderAvatarInto(elements.turnAvatar, activePlayer.avatarId);

    elements.resultBanner.hidden = true;
    elements.confettiContainer.replaceChildren();
    elements.endActions.hidden = true;
  } else if (state.phase === "victory") {
    const winnerPlayer = state.players[state.winner];
    const winnerAvatar = getAvatarById(winnerPlayer.avatarId);

    elements.turnBanner.hidden = true;
    elements.resultBanner.hidden = false;
    elements.resultBanner.classList.add("celebration-banner--victory");
    elements.resultBanner.classList.remove("celebration-banner--draw");

    elements.resultAvatar.hidden = false;
    renderAvatarInto(elements.resultAvatar, winnerPlayer.avatarId);
    renderConfetti(elements.confettiContainer);

    elements.resultKicker.textContent = "Vitória na Partida!";
    elements.resultTitle.textContent = `${winnerPlayer.name} venceu!`;
    elements.resultSubtitle.textContent = winnerAvatar
      ? `Celebração de ${winnerPlayer.name} (${winnerAvatar.label}) com uma linha de ${winnerPlayer.symbol}!`
      : `${winnerPlayer.name} completou uma linha de ${winnerPlayer.symbol}!`;

    elements.endActions.hidden = false;
  } else if (state.phase === "draw") {
    elements.turnBanner.hidden = true;
    elements.resultBanner.hidden = false;
    elements.resultBanner.classList.add("celebration-banner--draw");
    elements.resultBanner.classList.remove("celebration-banner--victory");

    elements.resultAvatar.hidden = true;
    elements.resultAvatar.replaceChildren();
    elements.confettiContainer.replaceChildren();

    elements.resultKicker.textContent = "Empate";
    elements.resultTitle.textContent = "Deu Velha!";
    elements.resultSubtitle.textContent = "Todas as 9 casas foram preenchidas e ninguém formou linha.";

    elements.endActions.hidden = false;
  }

  // Atualização das 9 casas do tabuleiro 3x3
  const winningSet = new Set(state.winningLine);
  for (let idx = 0; idx < elements.boardCells.length; idx += 1) {
    const cellBtn = elements.boardCells[idx];
    const value = state.board[idx];
    const row = Math.floor(idx / 3) + 1;
    const col = (idx % 3) + 1;
    const isWinningCell = winningSet.has(idx);

    cellBtn.textContent = value ?? "";
    cellBtn.classList.toggle("board-cell--x", value === "X");
    cellBtn.classList.toggle("board-cell--o", value === "O");
    cellBtn.classList.toggle("board-cell--filled", value !== null);
    cellBtn.classList.toggle("board-cell--locked", !isPlaying);
    cellBtn.classList.toggle("board-cell--winning", isWinningCell);
    cellBtn.setAttribute("aria-disabled", !isPlaying || value !== null ? "true" : "false");

    let label = `Casa ${idx + 1} (linha ${row}, coluna ${col}): `;
    if (value === null) {
      label += "vazia";
    } else {
      label += `marcada com ${value}`;
      if (isWinningCell) {
        label += ", parte da linha vencedora";
      }
    }
    cellBtn.setAttribute("aria-label", label);
  }
}

/**
 * Sincroniza a interface inteira de acordo com a fase do estado atual.
 * @param {object} elements
 * @param {object} state
 */
export function renderApp(elements, state) {
  const isSetup = state.phase === "setup";
  elements.setupScreen.hidden = !isSetup;
  elements.matchScreen.hidden = isSetup;

  if (isSetup) {
    renderSetupScreen(elements, state);
  } else {
    renderMatchScreen(elements, state);
  }
}
