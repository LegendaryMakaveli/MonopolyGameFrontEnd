import { createSlice } from '@reduxjs/toolkit';

export const PERSIST_KEY = 'monopoly_game_state';

const initialState = {
    currentScreen: 'landing',
    gameCode: null,
    currentPlayerId: null,
    currentPlayerName: null,
    isRolling: false,
    diceValue: null,
    lastRoundResult: null,
    showHousingModal: false,
    showLoanModal: false,
    selectedRoundForLeaderboard: 1,
    toasts: [],
};

let toastId = 0;

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        navigateTo: (state, action) => {
            state.currentScreen = action.payload;
        },
        setGameCode: (state, action) => {
            state.gameCode = action.payload;
        },
        setCurrentPlayer: (state, action) => {
            state.currentPlayerId = action.payload.id;
            state.currentPlayerName = action.payload.name;
        },
        clearGameState: (state) => {
            state.gameCode = null;
            state.currentPlayerId = null;
            state.currentPlayerName = null;
            state.currentScreen = 'landing';
            state.lastRoundResult = null;
            state.diceValue = null;
            try { localStorage.removeItem(PERSIST_KEY); } catch (e) { /* ignore */ }
        },
        restoreGameState: (state, action) => {
            const { gameCode, currentPlayerId, currentPlayerName, currentScreen } = action.payload;
            state.gameCode = gameCode;
            state.currentPlayerId = currentPlayerId;
            state.currentPlayerName = currentPlayerName;
            state.currentScreen = currentScreen;
        },

        startDiceRoll: (state) => {
            state.isRolling = true;
            state.diceValue = null;
        },
        finishDiceRoll: (state, action) => {
            state.isRolling = false;
            state.diceValue = action.payload;
        },
        setLastRoundResult: (state, action) => {
            state.lastRoundResult = action.payload;
        },

        toggleHousingModal: (state) => {
            state.showHousingModal = !state.showHousingModal;
        },
        toggleLoanModal: (state) => {
            state.showLoanModal = !state.showLoanModal;
        },

        setSelectedRound: (state, action) => {
            state.selectedRoundForLeaderboard = action.payload;
        },
        addToast: (state, action) => {
            state.toasts.push({
                id: ++toastId,
                message: action.payload.message,
                type: action.payload.type || 'info',
                duration: action.payload.duration || 4000,
            });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const {
    navigateTo,
    setGameCode,
    setCurrentPlayer,
    clearGameState,
    restoreGameState,
    startDiceRoll,
    finishDiceRoll,
    setLastRoundResult,
    toggleHousingModal,
    toggleLoanModal,
    setSelectedRound,
    addToast,
    removeToast,
} = gameSlice.actions;

export default gameSlice.reducer;
