import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetGameQuery, usePlayRoundMutation, usePreviewLoanMutation } from '../services/monopolyApi';
import {
    navigateTo, addToast, toggleHousingModal, toggleLoanModal,
    startDiceRoll, finishDiceRoll, setLastRoundResult,
} from '../features/gameSlice';
import DiceRoller from '../components/DiceRoller';
import PlayerCard from '../components/PlayerCard';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import HousingSelector from '../components/HousingSelector';

const EVENT_ICONS = {
    JOB_LOSS: '💼❌',
    MEDICAL_EMERGENCY: '🏥',
    FAMILY_EMERGENCY: '👪⚠️',
    FAMILY_SUPPORT: '👪💰',
    GOOD_INVESTMENT: '📈',
    BAD_INVESTMENT: '📉',
};

export default function GameBoard() {
    const dispatch = useDispatch();
    const { gameCode, currentPlayerId, showHousingModal, lastRoundResult } = useSelector((state) => state.game);
    const { data: gameResult, isLoading, refetch } = useGetGameQuery(gameCode, {
        skip: !gameCode,
    });
    const [playRound, { isLoading: isPlaying }] = usePlayRoundMutation();
    const [previewLoan] = usePreviewLoanMutation();

    const [loanPayment, setLoanPayment] = useState(0);
    const [loanPreview, setLoanPreview] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const game = gameResult;
    const players = game?.players || [];
    const currentPlayer = players.find((p) => p.id === currentPlayerId);

    // WebSocket usage
    useGameWebSocket(gameCode, (event) => {
        console.log('Game Event:', event);
        switch (event.eventType) {
            case 'ROUND_COMPLETED':
                // Refetch game state to update balances, etc.
                // Note: The player who rolled already gets the result via the mutation response.
                // This refetch helps OTHER players see the result.
                refetch();
                break;
            case 'ALL_PLAYERS_DONE':
                refetch();
                dispatch(addToast({ message: 'Everyone has played! Ready for next round.', type: 'info' }));
                break;
            case 'GAME_FINISHED':
                refetch();
                dispatch(addToast({ message: 'The game has finished! 🏁', type: 'success' }));
                dispatch(navigateTo('leaderboard'));
                break;
            default:
                break;
        }
    });

    const handleDiceRollComplete = async () => {
        try {
            const result = await playRound({
                playerId: currentPlayerId,
                loanPaymentNaira: Number(loanPayment) || 0,
            }).unwrap();

            const roundData = result;
            dispatch(finishDiceRoll(roundData.diceRoll));
            dispatch(setLastRoundResult(roundData));
            setShowResult(true);
            dispatch(addToast({
                message: `Round ${roundData.roundNumber} complete! ${EVENT_ICONS[roundData.eventType] || '🎲'} ${roundData.eventDescription}`,
                type: roundData.eventType === 'GOOD_INVESTMENT' || roundData.eventType === 'FAMILY_SUPPORT' ? 'success' : 'warning',
                duration: 6000,
            }));
        } catch (err) {
            dispatch(finishDiceRoll(null));
            dispatch(addToast({ message: err?.data?.message || 'Failed to play round', type: 'error' }));
        }
    };

    const handlePreviewLoan = async () => {
        if (!currentPlayerId) return;
        try {
            const result = await previewLoan({
                playerId: currentPlayerId,
                proposedPaymentNaira: Number(loanPayment) || 0,
            }).unwrap();
            setLoanPreview(result);
        } catch (err) {
            dispatch(addToast({ message: 'Failed to preview loan', type: 'error' }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white/50 gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading game board...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 px-6 max-w-7xl mx-auto flex flex-col gap-6">
            {/* Top Bar */}
            <nav className="glass p-3 md:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in-down border-white/10">
                <div className="flex items-center gap-2 md:gap-4 order-1">
                    <button className="btn btn-secondary btn-sm px-3 md:px-5" onClick={() => dispatch(navigateTo('landing'))}>
                        ← Exit
                    </button>
                    <span className="text-[10px] md:text-sm font-bold text-white/60 tracking-widest uppercase px-2 md:px-3 py-1 bg-white/5 rounded-full">
                        🎮 {gameCode}
                    </span>
                </div>
                <div className="bg-linear-to-r from-red-700 to-red-600 px-4 md:px-6 py-1 md:py-1.5 rounded-full shadow-lg shadow-red-600/20 order-3 sm:order-2 w-full sm:w-auto text-center">
                    <span className="text-[10px] md:text-sm font-black tracking-tight uppercase">
                        Round {game?.currentRound || 1} / {game?.totalRounds || 10}
                    </span>
                </div>
                <button className="btn btn-secondary btn-sm px-3 md:px-5 order-2 sm:order-3" onClick={() => dispatch(navigateTo('leaderboard'))}>
                    🏆 Standings
                </button>
            </nav>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                {/* Sidebar - Players */}
                <aside className="flex flex-col gap-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-2">Player Standings</h3>
                    <div className="flex flex-col gap-3">
                        {players.map((player, i) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                isCurrentPlayer={player.id === currentPlayerId}
                                delay={i}
                                onClick={() => dispatch(navigateTo('history'))}
                            />
                        ))}
                    </div>
                </aside>

                {/* Center - Gameplay */}
                <main className="flex flex-col items-center gap-8">
                    {/* Current Player Banner */}
                    {currentPlayer && (
                        <div className="w-full glass-red p-4 md:p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 md:gap-6 animate-fade-in-up border-red-600/20 shadow-xl shadow-red-600/5">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-3xl font-black text-white bg-linear-to-br from-red-600 to-red-800 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex-shrink-0 animate-float">
                                {currentPlayer.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{currentPlayer.name}</h2>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 md:gap-x-6 gap-y-1 md:gap-y-2 mt-1 md:mt-2">
                                    <span className="text-xs md:text-sm font-bold text-green">💰 {currentPlayer.cashBalance}</span>
                                    <span className="text-xs md:text-sm font-bold text-red-400">🏦 {currentPlayer.loanBalance}</span>
                                    <span className="text-xs md:text-sm font-bold text-gold">📊 {currentPlayer.netWorth}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dice & Loans Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Dice Section */}
                        <div className="glass p-8 rounded-3xl border-white/5 bg-red-600/5 flex items-center justify-center min-h-[320px] animate-scale-in">
                            <DiceRoller
                                onRollComplete={handleDiceRollComplete}
                                disabled={isPlaying || !currentPlayerId || currentPlayer?.status === 'ELIMINATED'}
                            />
                        </div>

                        {/* Loan Panel */}
                        <div className="glass p-8 rounded-3xl border-white/5 animate-fade-in-up stagger-2">
                            <h4 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight mb-6">
                                <span className="text-2xl">💳</span> Loan Management
                            </h4>
                            <div className="flex gap-3 mb-6">
                                <input
                                    type="number"
                                    className="input flex-1 font-bold text-xl h-14"
                                    placeholder="₦ Payment"
                                    value={loanPayment}
                                    onChange={(e) => setLoanPayment(e.target.value)}
                                    min="0"
                                />
                                <button className="btn btn-secondary h-14 px-8" onClick={handlePreviewLoan}>
                                    Preview
                                </button>
                            </div>

                            {loanPreview && (
                                <div className="bg-black/60 p-6 rounded-2xl flex flex-col gap-3 animate-fade-in-up border border-white/5">
                                    {[
                                        { l: 'Current Balance', v: loanPreview.currentLoanBalance },
                                        { l: 'Your Payment', v: loanPreview.proposedPayment },
                                        { l: 'Remaining', v: loanPreview.balanceAfterPayment },
                                        { l: 'Interest', v: loanPreview.interestIfNotFullyPaid },
                                        { l: 'NEXT ROUND', v: loanPreview.newBalanceNextRound, h: true },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex justify-between text-sm ${item.h ? 'text-gold font-black mt-2 pt-2 border-t border-white/10' : 'text-white/60 font-semibold'}`}>
                                            <span>{item.l}</span>
                                            <span>{item.v}</span>
                                        </div>
                                    ))}
                                    {loanPreview.tip && (
                                        <p className="text-[10px] text-white/30 italic mt-3 font-medium uppercase tracking-wider leading-relaxed">
                                            💡 {loanPreview.tip}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                        <button className="btn btn-secondary" onClick={() => dispatch(toggleHousingModal())}>
                            🏠 Change Housing
                        </button>
                        <button className="btn btn-secondary" onClick={() => dispatch(navigateTo('history'))}>
                            📜 Personal History
                        </button>
                    </div>
                </main>
            </div>

            {/* Result Modal */}
            {showResult && lastRoundResult && (
                <div
                    className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in"
                    onClick={() => setShowResult(false)}
                >
                    <div
                        className="w-full max-w-lg glass-strong p-6 md:p-10 rounded-[30px] md:rounded-[40px] flex flex-col items-center gap-4 md:gap-8 animate-scale-in overflow-y-auto max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gradient text-center">
                            Round {lastRoundResult.roundNumber} Result
                        </h2>

                        <div className="flex flex-col items-center">
                            <span className="text-8xl font-black text-gradient leading-none">{lastRoundResult.diceRoll}</span>
                            <span className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase mt-2">Dice Impact</span>
                        </div>

                        <div className="w-full bg-white/5 p-6 rounded-3xl text-center border border-white/5">
                            <span className="text-4xl block mb-2">{EVENT_ICONS[lastRoundResult.eventType] || '🎲'}</span>
                            <span className="text-xs font-black tracking-widest text-white/40 uppercase">
                                {lastRoundResult.eventType?.replace(/_/g, ' ')}
                            </span>
                            <p className="text-lg font-bold text-white/90 mt-2 leading-tight">
                                {lastRoundResult.eventDescription}
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-2 bg-black/40 p-6 rounded-3xl">
                            {[
                                { l: '💼 Salary', v: lastRoundResult.salaryReceived, g: true },
                                { l: '🏠 Housing', v: -lastRoundResult.housingCost, r: true },
                                { l: '🛒 Survival', v: -lastRoundResult.survivalCost, r: true },
                                { l: '🏦 Loan Pay', v: -lastRoundResult.loanPayment, r: true },
                                { l: '🎲 Event', v: lastRoundResult.eventAmount, r: lastRoundResult.eventAmount < 0, g: lastRoundResult.eventAmount > 0 },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between text-sm font-semibold">
                                    <span className="text-white/40">{item.l}</span>
                                    <span className={item.g ? 'text-green' : item.r ? 'text-red-400' : ''}>
                                        {item.v < 0 ? '-' : '+'} ₦{(Math.abs(item.v)).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <hr className="my-2 border-white/5" />
                            <div className="flex justify-between text-lg font-black uppercase tracking-tight italic">
                                <span>💰 Balance</span>
                                <span>₦{((lastRoundResult.cashBalanceEnd || 0)).toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-lg w-full" onClick={() => setShowResult(false)}>
                            Back to Game
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showHousingModal && (
                <HousingSelector
                    playerId={currentPlayerId}
                    onClose={() => dispatch(toggleHousingModal())}
                />
            )}
        </div>
    );
}
