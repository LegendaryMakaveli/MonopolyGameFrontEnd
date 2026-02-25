import { configureStore } from '@reduxjs/toolkit';
import { monopolyApi } from '../services/monopolyApi';
import gameReducer, { PERSIST_KEY } from '../features/gameSlice';

// ── Load persisted state from localStorage ──
const loadPersistedState = () => {
    try {
        const raw = localStorage.getItem(PERSIST_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            return {
                game: {
                    currentScreen: saved.currentScreen || 'landing',
                    gameCode: saved.gameCode || null,
                    currentPlayerId: saved.currentPlayerId || null,
                    currentPlayerName: saved.currentPlayerName || null,
                    isRolling: false,
                    diceValue: null,
                    lastRoundResult: null,
                    showHousingModal: false,
                    showLoanModal: false,
                    selectedRoundForLeaderboard: 1,
                    toasts: [],
                },
            };
        }
    } catch (e) {
        // Ignore corrupt data
    }
    return undefined;
};

// ── Middleware: persist key game fields to localStorage ──
const persistMiddleware = (storeAPI) => (next) => (action) => {
    const result = next(action);
    const { game } = storeAPI.getState();
    try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
            gameCode: game.gameCode,
            currentPlayerId: game.currentPlayerId,
            currentPlayerName: game.currentPlayerName,
            currentScreen: game.currentScreen,
        }));
    } catch (e) {
        // Ignore quota errors
    }
    return result;
};

export const store = configureStore({
    reducer: {
        [monopolyApi.reducerPath]: monopolyApi.reducer,
        game: gameReducer,
    },
    preloadedState: loadPersistedState(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(monopolyApi.middleware, persistMiddleware),
});
