import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetLeaderboardQuery } from '../services/monopolyApi';
import { navigateTo, setSelectedRound } from '../features/gameSlice';

const RANK_EMOJIS = ['👑', '🥈', '🥉'];

export default function LeaderboardPage() {
    const dispatch = useDispatch();
    const { gameCode, selectedRoundForLeaderboard } = useSelector((state) => state.game);
    const [round, setRound] = useState(selectedRoundForLeaderboard || 1);

    const { data: leaderboardResult, isLoading, isFetching } = useGetLeaderboardQuery(
        { gameCode, roundNumber: round },
        { skip: !gameCode }
    );

    const leaderboard = leaderboardResult;
    const standings = leaderboard?.standings || [];

    const handleRoundChange = (newRound) => {
        const r = Math.max(1, Number(newRound));
        setRound(r);
        dispatch(setSelectedRound(r));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white/50 gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading standings...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-6 max-w-6xl mx-auto flex flex-col">
            <div className="flex justify-start mb-8 animate-fade-in-down">
                <button className="btn btn-secondary btn-sm" onClick={() => dispatch(navigateTo('game'))}>
                    ← Back
                </button>
            </div>

            <header className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-6xl font-black uppercase tracking-tighter text-gradient mb-2">Leaderboard</h1>
                <p className="text-white/60 font-medium tracking-wide uppercase text-sm">Wealth rankings of the elite</p>
            </header>

            {/* Round Selector */}
            <div className="glass p-6 rounded-3xl flex items-center justify-center gap-10 mb-16 border-white/10 animate-scale-in self-center min-w-[320px]">
                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all font-black" onClick={() => handleRoundChange(round - 1)} disabled={round <= 1}>
                    ⟨
                </button>
                <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Round</span>
                    <span className="text-5xl font-black text-gradient">{round}</span>
                </div>
                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-black" onClick={() => handleRoundChange(round + 1)}>
                    ⟩
                </button>
            </div>

            {/* Podium View */}
            {standings.length >= 3 && (
                <div className="flex items-end justify-center gap-4 md:gap-12 mb-20 px-4 animate-fade-in-up stagger-1 h-64">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center gap-3 w-1/4 max-w-[140px]">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white bg-linear-to-br from-slate-400 to-slate-600 shadow-lg mb-2">
                            {standings[1].playerName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-2xl">🥈</span>
                        <div className="text-center">
                            <h4 className="font-black uppercase tracking-tight text-white mb-1 line-clamp-1">{standings[1].playerName}</h4>
                            <span className="text-xs font-bold text-white/50">₦{((standings[1].netWorthKobo || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-linear-to-t from-red-600/20 to-red-600/5 border-x border-t border-red-600/30 rounded-t-2xl animate-[podiumRise_0.8s_ease_forwards]" style={{ height: '80px' }} />
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center gap-3 w-1/3 max-w-[180px]">
                        <div className="text-4xl animate-float mb-[-10px] z-10">👑</div>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white bg-linear-to-br from-gold to-yellow-600 shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-2">
                            {standings[0].playerName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-black uppercase tracking-tight text-white mb-1">{standings[0].playerName}</h4>
                            <span className="text-sm font-black text-gold">₦{((standings[0].netWorthKobo || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-linear-to-t from-gold/30 to-gold/5 border-x border-t border-gold/40 rounded-t-3xl animate-[podiumRise_1s_ease_forwards]" style={{ height: '140px' }} />
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center gap-3 w-1/4 max-w-[140px]">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white bg-linear-to-br from-amber-700 to-amber-900 shadow-lg mb-2">
                            {standings[2].playerName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-2xl">🥉</span>
                        <div className="text-center">
                            <h4 className="font-black uppercase tracking-tight text-white mb-1 line-clamp-1">{standings[2].playerName}</h4>
                            <span className="text-xs font-bold text-white/50">₦{((standings[2].netWorthKobo || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-linear-to-t from-red-600/20 to-red-600/5 border-x border-t border-red-600/30 rounded-t-2xl animate-[podiumRise_0.6s_ease_forwards]" style={{ height: '50px' }} />
                    </div>
                </div>
            )}

            {/* Table View */}
            <div className="glass rounded-[32px] overflow-hidden border-white/5 animate-fade-in-up stagger-2 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Rank</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Investor</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Net Worth</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Cash</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Debt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((player, i) => (
                                <tr key={player.playerId} className="group hover:bg-white/5 transition-colors border-t border-white/5">
                                    <td className="p-6">
                                        <span className="text-xl font-black tracking-tighter opacity-80 italic group-hover:scale-110 inline-block transition-transform">
                                            {i < 3 ? RANK_EMOJIS[i] : `#${i + 1}`}
                                        </span>
                                    </td>
                                    <td className="p-6 font-bold uppercase tracking-tight flex items-center gap-4 text-white/90">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-600/40 to-red-800/40 flex items-center justify-center text-[10px] border border-white/10 group-hover:scale-110 group-hover:bg-red-600 transition-all">
                                            {player.playerName?.charAt(0).toUpperCase()}
                                        </div>
                                        {player.playerName}
                                    </td>
                                    <td className="p-6 font-black text-gold">₦{((player.netWorthKobo || 0) / 100).toLocaleString()}</td>
                                    <td className="p-6 font-bold text-green/70">₦{((player.cashBalanceKobo || 0) / 100).toLocaleString()}</td>
                                    <td className="p-6 font-bold text-red-500/70 text-right italic">₦{((player.loanBalanceKobo || 0) / 100).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isFetching && <div className="text-center p-8 text-[10px] font-black tracking-[0.5em] text-red-500 uppercase animate-pulse">Syncing...</div>}
                {standings.length === 0 && !isFetching && <div className="p-20 text-center text-white/20 font-black uppercase tracking-[0.2em]">Game history empty</div>}
            </div>
        </div>
    );
}
