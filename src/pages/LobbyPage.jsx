import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    useGetGameQuery,
    useJoinGameMutation,
    useStartGameMutation,
    useDeletePlayerMutation,
    useDeleteAllPlayersInGameMutation
} from '../services/monopolyApi';
import { navigateTo, setCurrentPlayer, addToast, clearGameState } from '../features/gameSlice';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import PlayerCard from '../components/PlayerCard';

const ADMIN_PASSWORD = 'Makaveli@1';

export default function LobbyPage() {
    const dispatch = useDispatch();
    const { gameCode, currentPlayerId } = useSelector((state) => state.game);
    const { data: gameResult, isLoading, refetch } = useGetGameQuery(gameCode, {
        skip: !gameCode,
    });
    const [joinGame, { isLoading: isJoining }] = useJoinGameMutation();
    const [startGame, { isLoading: isStarting }] = useStartGameMutation();
    const [deletePlayer] = useDeletePlayerMutation();
    const [deleteAllPlayers] = useDeleteAllPlayersInGameMutation();

    const [playerName, setPlayerName] = useState('');
    const [copied, setCopied] = useState(false);

    // Admin state for player deletion
    const [showAdminTab, setShowAdminTab] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminMode, setIsAdminMode] = useState(false);

    const game = gameResult;
    const players = game?.players || [];
    const hasJoined = currentPlayerId != null;

    // WebSocket usage
    useGameWebSocket(gameCode, (event) => {
        console.log('Lobby Event:', event);
        switch (event.eventType) {
            case 'PLAYER_JOINED':
                refetch();
                break;
            case 'GAME_STARTED':
                dispatch(navigateTo('game'));
                break;
            default:
                break;
        }
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(gameCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (!playerName.trim()) {
            dispatch(addToast({ message: 'Enter your name to join!', type: 'warning' }));
            return;
        }
        try {
            const result = await joinGame({ gameCode, playerName: playerName.trim() }).unwrap();
            dispatch(setCurrentPlayer({ id: result.id, name: result.name }));
            dispatch(addToast({ message: `Welcome, ${result.name}! 🎉`, type: 'success' }));
        } catch (err) {
            dispatch(addToast({ message: err?.data?.message || 'Failed to join', type: 'error' }));
        }
    };

    const handleStart = async () => {
        try {
            await startGame(gameCode).unwrap();
            dispatch(addToast({ message: 'Game started! Let\'s go! 🎲', type: 'success' }));
            dispatch(navigateTo('game'));
        } catch (err) {
            dispatch(addToast({ message: err?.data?.message || 'Failed to start game', type: 'error' }));
        }
    };

    const handleDeletePlayer = async (playerId, name) => {
        if (!isAdminMode) {
            setShowAdminTab(true);
            return;
        }

        if (!window.confirm(`Delete player ${name}?`)) return;

        try {
            await deletePlayer(playerId).unwrap();
            dispatch(addToast({ message: `Player ${name} removed`, type: 'success' }));

            // If the deleted player was ME, reset my state
            if (playerId === currentPlayerId) {
                dispatch(clearGameState());
                dispatch(navigateTo('landing'));
            }
        } catch (err) {
            dispatch(addToast({ message: 'Failed to delete player', type: 'error' }));
        }
    };

    const handleDeleteAll = async () => {
        if (!isAdminMode) return;
        if (!window.confirm('Delete ALL players in this game?')) return;

        try {
            await deleteAllPlayers(gameCode).unwrap();
            dispatch(addToast({ message: 'All players removed from lobby', type: 'success' }));
            // We don't automatically navigate everyone, the individual players' 
            // polling will eventually fail/update and we handle it there or they'll see an empty lobby.
        } catch (err) {
            dispatch(addToast({ message: 'Failed to delete all players', type: 'error' }));
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAdminMode(true);
            setShowAdminTab(false);
            dispatch(addToast({ message: 'Admin mode active', type: 'success' }));
        } else {
            dispatch(addToast({ message: 'Wrong password', type: 'error' }));
        }
    };

    useEffect(() => {
        if (game?.status === 'IN_PROGRESS') {
            dispatch(navigateTo('game'));
        }
    }, [game?.status, dispatch]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white/50 gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading lobby...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-6 max-w-6xl mx-auto flex flex-col">
            <div className="flex justify-between mb-8 animate-fade-in-down">
                <button className="btn btn-secondary btn-sm" onClick={() => dispatch(navigateTo('landing'))}>
                    ← Back
                </button>
                <div className="flex gap-2">
                    {isAdminMode && (
                        <button className="btn btn-sm bg-red-600/20 text-red-500 border-red-500/40 hover:bg-red-600 hover:text-white" onClick={handleDeleteAll}>
                            🗑️ Delete All Players
                        </button>
                    )}
                    <button
                        className={`btn btn-sm ${isAdminMode ? 'btn-primary' : 'btn-secondary opacity-50'}`}
                        onClick={() => !isAdminMode ? setShowAdminTab(true) : setIsAdminMode(false)}
                    >
                        {isAdminMode ? 'Admin Active' : 'Admin Mode'}
                    </button>
                </div>
            </div>

            {showAdminTab && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass p-8 rounded-3xl max-w-sm w-full animate-scale-in text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                        <h3 className="text-xl font-black uppercase mb-6 tracking-tighter italic">Secure Access</h3>
                        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                            <input
                                type="password"
                                className="input text-center text-xl"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAdminTab(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Authorize</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <header className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-gradient mb-2">Game Lobby</h1>
                <p className="text-white/60 font-medium tracking-wide uppercase text-sm">Session {gameCode}</p>
            </header>

            <div className="glass-red p-10 rounded-3xl text-center mb-12 border-red-600/20 animate-scale-in">
                <div className="flex items-center justify-center gap-6 mb-4 cursor-pointer" onClick={handleCopy}>
                    <span className="text-6xl md:text-8xl font-black tracking-[0.2em] text-gradient">{gameCode}</span>
                </div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{copied ? '✅ Code Copied' : 'Click code to copy'}</p>
            </div>

            {!hasJoined && (
                <div className="glass p-8 rounded-3xl mb-12 animate-fade-in-up">
                    <h3 className="text-xl font-black uppercase mb-6">Enter The Game</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Your Nickname"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button className="btn btn-primary px-10" onClick={handleJoin} disabled={isJoining}>
                            Join Lobby
                        </button>
                    </div>
                </div>
            )}

            <section className="flex-1 mb-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tight">Players</h3>
                    <span className="glass px-4 py-1 rounded-full text-xs font-bold text-red-500">
                        {players.length} / {game?.maxPlayers || 4}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player, i) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            isCurrentPlayer={player.id === currentPlayerId}
                            delay={i}
                            showDelete={isAdminMode}
                            onDelete={handleDeletePlayer}
                        />
                    ))}
                </div>
            </section>

            {hasJoined && (
                <div className="flex flex-col items-center gap-4 pb-10">
                    <button
                        className="btn btn-primary btn-lg min-w-80 animate-pulse-glow"
                        onClick={handleStart}
                        disabled={isStarting || (players.length < 2 && !isAdminMode)}
                    >
                        {isStarting ? 'Starting...' : '🚀 Launch Game'}
                    </button>
                    {players.length < 2 && <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Waiting for players...</p>}
                </div>
            )}
        </div>
    );
}
