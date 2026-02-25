import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    useCreateGameMutation,
    useJoinGameMutation,
    useGetAllGamesQuery,
    useGetAllPlayersQuery,
    useDeleteGameMutation,
    useForceEndGameMutation,
    useDeletePlayerMutation
} from '../services/monopolyApi';
import { navigateTo, setGameCode, setCurrentPlayer, addToast, clearGameState, restoreGameState } from '../features/gameSlice';
import { PERSIST_KEY } from '../features/gameSlice';

const FEATURE_CARDS = [
    { icon: '🎲', title: 'Dice Events', desc: 'Random events that can make or break your finances' },
    { icon: '🏠', title: 'Housing Choices', desc: "From parent's house to luxury Lekki apartment" },
    { icon: '📊', title: 'Leaderboard', desc: "Track everyone's net worth round by round" },
];

const ADMIN_PASSWORD = 'Makaveli@1';

export default function LandingPage() {
    const dispatch = useDispatch();
    const [createGame, { isLoading: isCreating }] = useCreateGameMutation();
    const [joinGame, { isLoading: isJoining }] = useJoinGameMutation();
    const { data: adminGamesResult, refetch: refetchAdminGames } = useGetAllGamesQuery();
    const { data: adminPlayersResult, refetch: refetchAdminPlayers } = useGetAllPlayersQuery();
    const [deleteGame] = useDeleteGameMutation();
    const [forceEndGame] = useForceEndGameMutation();
    const [deletePlayer] = useDeletePlayerMutation();

    const [mode, setMode] = useState('landing'); // 'landing' | 'join' | 'admin'
    const [adminTab, setAdminTab] = useState('games'); // 'games' | 'players'
    const [gameJoinCode, setGameJoinCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [savedGame, setSavedGame] = useState(null);

    // Admin state
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminError, setAdminError] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem(PERSIST_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.gameCode && parsed.currentPlayerId) {
                    setSavedGame(parsed);
                }
            }
        } catch (e) { /* ignore */ }
    }, []);

    const handleCreate = async () => {
        try {
            const result = await createGame().unwrap();
            dispatch(setGameCode(result.gameCode));
            dispatch(addToast({ message: 'Game created! Invite your friends 🎲', type: 'success' }));
            dispatch(navigateTo('lobby'));
        } catch (err) {
            dispatch(addToast({ message: 'Failed to create game', type: 'error' }));
        }
    };

    const handleJoin = async () => {
        if (!gameJoinCode || !playerName) {
            dispatch(addToast({ message: 'Please enter code and name', type: 'warning' }));
            return;
        }
        try {
            const result = await joinGame({ gameCode: gameJoinCode, playerName }).unwrap();
            dispatch(setGameCode(gameJoinCode));
            dispatch(setCurrentPlayer({ id: result.id, name: result.name }));
            dispatch(addToast({ message: `Welcome ${playerName}! 🚀`, type: 'success' }));
            dispatch(navigateTo('lobby'));
        } catch (err) {
            dispatch(addToast({ message: err?.data?.message || 'Failed to join game', type: 'error' }));
        }
    };

    const handleResume = () => {
        if (!savedGame) return;
        dispatch(restoreGameState(savedGame));
        const screen = savedGame.currentScreen === 'landing' ? 'lobby' : savedGame.currentScreen;
        dispatch(navigateTo(screen));
        dispatch(addToast({ message: `Welcome back, ${savedGame.currentPlayerName}! 🎲`, type: 'success' }));
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPasswordInput === ADMIN_PASSWORD) {
            setIsAdminAuthenticated(true);
            setAdminError('');
            refetchAdminGames();
            refetchAdminPlayers();
        } else {
            setAdminError('Incorrect Password');
        }
    };

    const handleDeleteGame = async (code) => {
        if (!window.confirm(`Delete game ${code}?`)) return;
        try {
            await deleteGame(code).unwrap();
            dispatch(addToast({ message: `Game ${code} deleted`, type: 'success' }));
        } catch (err) {
            dispatch(addToast({ message: 'Failed to delete game', type: 'error' }));
        }
    };

    const handleDeletePlayer = async (id, name) => {
        if (!window.confirm(`Delete player ${name}?`)) return;
        try {
            await deletePlayer(id).unwrap();
            dispatch(addToast({ message: `Player ${name} deleted`, type: 'success' }));
        } catch (err) {
            dispatch(addToast({ message: 'Failed to delete player', type: 'error' }));
        }
    };

    const handleForceEnd = async (code) => {
        try {
            await forceEndGame(code).unwrap();
            dispatch(addToast({ message: `Game ${code} ended`, type: 'success' }));
        } catch (err) {
            dispatch(addToast({ message: 'Failed to end game', type: 'error' }));
        }
    };

    const handleDeleteAllGames = async () => {
        if (!window.confirm('CRITICAL: Delete ALL games from the backend?')) return;
        const games = adminGamesResult || [];
        for (const g of games) {
            try { await deleteGame(g.gameCode).unwrap(); } catch (e) { }
        }
        dispatch(addToast({ message: 'Attempted to clear all games', type: 'info' }));
    };

    const handleDeleteAllPlayers = async () => {
        if (!window.confirm('CRITICAL: Delete ALL players from the backend?')) return;
        const players = adminPlayersResult || [];
        for (const p of players) {
            try { await deletePlayer(p.id).unwrap(); } catch (e) { }
        }
        dispatch(addToast({ message: 'Attempted to clear all players', type: 'info' }));
    };

    const handleClearLocal = () => {
        if (!window.confirm('Clear your local session data?')) return;
        dispatch(clearGameState());
        setSavedGame(null);
        dispatch(addToast({ message: 'Local storage cleared', type: 'info' }));
    };

    return (
        <div className="relative min-h-screen py-20 px-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none -z-10">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/10 rounded-full animate-[particleFloat_linear_infinite]"
                        style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 10 + 5}s`,
                            animationDelay: `-${Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <header className="text-center mb-16 animate-fade-in-down">
                <div className="text-6xl mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-float">🎲</div>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-gradient mb-2 drop-shadow-2xl">
                    MONOPOLY
                </h1>
                <p className="text-xl md:text-2xl font-light uppercase tracking-[0.3em] text-white/60 mb-8">
                    The Game of Life
                </p>
            </header>

            {/* ── HIGH PRIORITY RESUME BUTTON ── */}
            {savedGame && mode === 'landing' && (
                <div className="w-full max-w-lg mb-12 animate-bounce-subtle">
                    <button
                        className="w-full glass-red p-8 rounded-[2rem] border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.4)] flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all"
                        onClick={handleResume}
                    >
                        <div className="text-5xl group-hover:rotate-12 transition-transform">🎯</div>
                        <div className="text-center">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-gradient">Resume Playing</h2>
                            <p className="text-white/60 font-bold mt-1">
                                {savedGame.currentPlayerName} @ {savedGame.gameCode}
                            </p>
                        </div>
                        <div className="px-6 py-2 bg-red-600 rounded-full text-xs font-black uppercase animate-pulse">
                            Continue Game Now
                        </div>
                    </button>
                    <button
                        className="w-full mt-4 text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white/40"
                        onClick={handleClearLocal}
                    >
                        Forget This Game
                    </button>
                </div>
            )}

            <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                {mode === 'landing' ? (
                    <>
                        <button className="group glass-red p-10 rounded-3xl text-center transition-all duration-500 animate-fade-in-up" onClick={handleCreate}>
                            <div className="text-4xl mb-6 bg-red-600/20 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto group-hover:scale-110">🏠</div>
                            <h3 className="text-2xl font-black uppercase mb-2">Create New</h3>
                            <p className="text-sm text-white/40">Start a fresh session</p>
                        </button>

                        <button className="group glass p-10 rounded-3xl text-center transition-all duration-500 animate-fade-in-up" onClick={() => setMode('join')}>
                            <div className="text-4xl mb-6 bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto group-hover:scale-110">🤝</div>
                            <h3 className="text-2xl font-black uppercase mb-2">Join Others</h3>
                            <p className="text-sm text-white/40">Connect to a live game</p>
                        </button>
                    </>
                ) : mode === 'join' ? (
                    <div className="col-span-1 md:col-span-2 max-w-xl mx-auto w-full glass p-10 rounded-3xl animate-scale-in">
                        <h3 className="text-2xl font-black uppercase mb-8 text-center">Join Existing Game</h3>
                        <div className="flex flex-col gap-5">
                            <input type="text" placeholder="Game Code" className="input text-center text-xl font-black tracking-widest uppercase" value={gameJoinCode} onChange={(e) => setGameJoinCode(e.target.value)} />
                            <input type="text" placeholder="Your Nickname" className="input text-center font-bold" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                            <div className="flex gap-4 mt-2">
                                <button className="btn btn-secondary flex-1" onClick={() => setMode('landing')}>Back</button>
                                <button className="btn btn-primary flex-[2]" onClick={handleJoin} disabled={isJoining}>{isJoining ? 'Joining...' : 'Join Game Now'}</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="col-span-1 md:col-span-2 max-w-4xl mx-auto w-full glass p-10 rounded-3xl animate-scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-gradient">Admin Command Center</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setMode('landing')}>Exit</button>
                        </div>

                        {!isAdminAuthenticated ? (
                            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 max-w-sm mx-auto py-10">
                                <p className="text-sm text-white/40 text-center uppercase font-black tracking-widest">Identify Yourself</p>
                                <input type="password" placeholder="••••••••" className="input text-center text-2xl" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} autoFocus />
                                {adminError && <p className="text-red-500 text-[10px] text-center font-black uppercase animate-pulse">{adminError}</p>}
                                <button type="submit" className="btn btn-primary mt-2">Access Dashboard</button>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {/* Tabs */}
                                <div className="flex gap-2 border-b border-white/5 pb-4">
                                    <button
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'games' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        onClick={() => setAdminTab('games')}
                                    >
                                        Games List
                                    </button>
                                    <button
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'players' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        onClick={() => setAdminTab('players')}
                                    >
                                        Players Registry
                                    </button>
                                </div>

                                {adminTab === 'games' ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{adminGamesResult?.length || 0} Backend Sessions</p>
                                            <button className="text-[10px] font-black uppercase text-red-500 hover:underline" onClick={handleDeleteAllGames}>Destroy All Games</button>
                                        </div>
                                        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {adminGamesResult?.map(game => (
                                                <div key={game.gameCode} className="bg-black/40 p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-2xl font-black tracking-widest italic text-white">{game.gameCode}</span>
                                                        <div className="hidden sm:block h-8 w-px bg-white/5" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase text-white/60">{game.status}</span>
                                                            </div>
                                                            <p className="text-[10px] text-white/30 truncate mt-1">{game.players?.length || 0} User(s) Connected</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-secondary btn-xs py-2 px-4" onClick={() => handleForceEnd(game.gameCode)}>End</button>
                                                        <button className="btn btn-primary btn-xs py-2 px-4 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border-0" onClick={() => handleDeleteGame(game.gameCode)}>Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{adminPlayersResult?.length || 0} Registered Players</p>
                                            <button className="text-[10px] font-black uppercase text-red-500 hover:underline" onClick={handleDeleteAllPlayers}>Purge All Players</button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {adminPlayersResult?.map(player => (
                                                <div key={player.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black">{player.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white leading-none">{player.name}</p>
                                                            <p className="text-[10px] text-white/20 uppercase mt-1">ID: {player.id}</p>
                                                        </div>
                                                    </div>
                                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500/20 group-hover:bg-red-600/10 group-hover:text-red-500 transition-all" onClick={() => handleDeletePlayer(player.id, player.name)}>🗑️</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button className="btn btn-secondary btn-sm" onClick={() => { refetchAdminGames(); refetchAdminPlayers(); }}>Refresh Registry</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16 opacity-40 hover:opacity-100 transition-opacity">
                {FEATURE_CARDS.map((feature, i) => (
                    <div key={i} className="glass-red p-6 rounded-2xl border-white/5 text-center">
                        <div className="text-2xl mb-4">{feature.icon}</div>
                        <h4 className="font-black uppercase tracking-tighter mb-2 text-xs">{feature.title}</h4>
                        <p className="text-[10px] text-white/40 font-medium">{feature.desc}</p>
                    </div>
                ))}
            </footer>

            <button
                className="group flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-all"
                onClick={() => setMode('admin')}
            >
                <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">🛠️</div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Secure Admin Entry</span>
            </button>
        </div>
    );
}
