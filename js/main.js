/**
 * Controlador principal da aplicação.
 * Conecta eventos de interface (clique, toque e teclado) ao motor de regras
 * e gerencia a persistência temporária na sessão do navegador.
 */

import {
  createInitialState,
  setPlayerName,
  selectPlayerAvatar,
  startMatch,
  makeMove,
  playAgain,
  resetToSetup,
  validateStoredState
} from "./game-engine.js";

import {
  getDomElements,
  initAvatarGrid,
  renderApp,
  showFieldError,
  clearFieldError,
  clearAllSetupErrors,
  showMatchFeedback
} from "./ui.js";

export const SESSION_STORAGE_KEY = "tictactoe_session_v1";

/**
 * Lê e valida o estado salvo no sessionStorage da aba.
 * @returns {object | null}
 */
export function loadStateFromStorage() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return null;
    }
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return validateStoredState(parsed);
  } catch (err) {
    console.warn("Não foi possível restaurar o estado da sessão:", err);
    return null;
  }
}

/**
 * Salva o estado atual no sessionStorage da aba.
 * @param {object} state
 */
export function saveStateToStorage(state) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Não foi possível salvar o estado na sessão:", err);
  }
}

/**
 * Remove o estado salvo no sessionStorage da aba.
 */
export function clearStateFromStorage() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn("Não foi possível limpar o estado da sessão:", err);
  }
}

/**
 * Inicializa a aplicação no navegador.
 */
export function initApp() {
  const elements = getDomElements(document);
  let currentState = loadStateFromStorage() || createInitialState();

  function updateState(nextState, { persist = true } = {}) {
    currentState = nextState;
    if (persist) {
      saveStateToStorage(currentState);
    }
    renderApp(elements, currentState);
  }

  function handleNameInput(playerNumber, inputEl, errorEl) {
    clearFieldError(elements.setupGeneralError);
    const result = setPlayerName(currentState, playerNumber, inputEl.value);
    inputEl.value = result.state.players[playerNumber].name;

    if (!result.ok && result.message) {
      showFieldError(errorEl, result.message, inputEl);
    } else {
      clearFieldError(errorEl, inputEl);
    }

    // Se o outro campo tinha erro de nome duplicado e os nomes mudaram, limpa o alerta
    if (
      currentState.players[1].name !== result.state.players[1].name ||
      currentState.players[2].name !== result.state.players[2].name
    ) {
      const otherErrorEl = playerNumber === 1 ? elements.player2NameError : elements.player1NameError;
      const otherInputEl = playerNumber === 1 ? elements.player2NameInput : elements.player1NameInput;
      if (otherErrorEl && !otherErrorEl.hidden && otherErrorEl.textContent.includes("mesmo nome")) {
        clearFieldError(otherErrorEl, otherInputEl);
      }
    }

    updateState(result.state);
  }

  function handleNameKeydown(event, inputEl, errorEl) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.key && event.key.length === 1 && !/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      showFieldError(
        errorEl,
        "Use apenas letras de A a Z (sem números, espaços ou acentos).",
        inputEl
      );
    }
  }

  function handleSelectAvatar(playerNumber, avatarId) {
    clearFieldError(elements.setupGeneralError);
    const errorEl = playerNumber === 1 ? elements.player1AvatarError : elements.player2AvatarError;
    const result = selectPlayerAvatar(currentState, playerNumber, avatarId);

    if (!result.ok) {
      showFieldError(errorEl, result.message);
      return;
    }

    clearFieldError(elements.player1AvatarError);
    clearFieldError(elements.player2AvatarError);
    updateState(result.state);
  }

  function handleStartMatch(event) {
    event.preventDefault();
    clearAllSetupErrors(elements);

    const result = startMatch(currentState);
    if (!result.ok) {
      switch (result.field) {
        case "player1Name":
          showFieldError(elements.player1NameError, result.message, elements.player1NameInput);
          elements.player1NameInput.focus();
          break;
        case "player2Name":
          showFieldError(elements.player2NameError, result.message, elements.player2NameInput);
          elements.player2NameInput.focus();
          break;
        case "player1Avatar":
          showFieldError(elements.player1AvatarError, result.message);
          elements.player1AvatarGrid.querySelector(".avatar-option")?.focus();
          break;
        case "player2Avatar":
          showFieldError(elements.player2AvatarError, result.message);
          elements.player2AvatarGrid.querySelector(".avatar-option")?.focus();
          break;
        default:
          showFieldError(elements.setupGeneralError, result.message);
          break;
      }
      return;
    }

    showMatchFeedback(elements, "");
    updateState(result.state);
    elements.boardCells[0]?.focus();
  }

  function handleCellAction(cellIndex) {
    const result = makeMove(currentState, cellIndex);
    if (!result.ok) {
      if (result.code === "CELL_OCCUPIED") {
        showMatchFeedback(elements, result.message);
      }
      return;
    }

    showMatchFeedback(elements, "");
    updateState(result.state);

    if (result.state.phase === "victory" || result.state.phase === "draw") {
      elements.playAgainBtn?.focus();
    }
  }

  function handleBoardKeydown(event, currentIndex) {
    const row = Math.floor(currentIndex / 3);
    const col = currentIndex % 3;
    let targetIndex = null;

    switch (event.key) {
      case "ArrowRight":
        targetIndex = row * 3 + ((col + 1) % 3);
        break;
      case "ArrowLeft":
        targetIndex = row * 3 + ((col + 2) % 3);
        break;
      case "ArrowDown":
        targetIndex = ((row + 1) % 3) * 3 + col;
        break;
      case "ArrowUp":
        targetIndex = ((row + 2) % 3) * 3 + col;
        break;
      default:
        return;
    }

    event.preventDefault();
    elements.boardCells[targetIndex]?.focus();
  }

  function handlePlayAgain() {
    const result = playAgain(currentState);
    if (!result.ok) {
      return;
    }
    showMatchFeedback(elements, "");
    updateState(result.state);
    elements.boardCells[0]?.focus();
  }

  function handleChangePlayers() {
    clearAllSetupErrors(elements);
    showMatchFeedback(elements, "");
    clearStateFromStorage();
    const freshState = resetToSetup();
    updateState(freshState, { persist: false });
    elements.player1NameInput?.focus();
  }

  // Inicializa grades de avatares
  initAvatarGrid(elements.player1AvatarGrid, 1, handleSelectAvatar);
  initAvatarGrid(elements.player2AvatarGrid, 2, handleSelectAvatar);

  // Eventos dos campos de nome
  elements.player1NameInput.addEventListener("keydown", (event) =>
    handleNameKeydown(event, elements.player1NameInput, elements.player1NameError)
  );
  elements.player2NameInput.addEventListener("keydown", (event) =>
    handleNameKeydown(event, elements.player2NameInput, elements.player2NameError)
  );
  elements.player1NameInput.addEventListener("input", () =>
    handleNameInput(1, elements.player1NameInput, elements.player1NameError)
  );
  elements.player2NameInput.addEventListener("input", () =>
    handleNameInput(2, elements.player2NameInput, elements.player2NameError)
  );

  // Submissão da configuração
  elements.setupForm.addEventListener("submit", handleStartMatch);

  // Eventos das 9 casas do tabuleiro (clique/toque e navegação por setas/teclado)
  elements.boardCells.forEach((cellBtn, index) => {
    cellBtn.addEventListener("click", () => handleCellAction(index));
    cellBtn.addEventListener("keydown", (event) => handleBoardKeydown(event, index));
  });

  // Botões finais da partida
  elements.playAgainBtn.addEventListener("click", handlePlayAgain);
  elements.changePlayersBtn.addEventListener("click", handleChangePlayers);

  // Renderização inicial
  renderApp(elements, currentState);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
}
