import { useSelector, useDispatch } from 'react-redux';
import { useGetPlayerHistoryQuery } from '../services/monopolyApi';
import { navigateTo } from '../features/gameSlice';

const EVENT_ICONS = {
    JOB_LOSS: '💼❌',
    MEDICAL_EMERGENCY: '🏥',
    FAMILY_EMERGENCY: '👪⚠️',
    FAMILY_SUPPORT: '👪💰',
    GOOD_INVESTMENT: '📈',
    BAD_INVESTMENT: '📉',
};

const HOUSING_LABELS = {
    PARENT_HOUSE: "Parent's House 🏠",
    SHARED_APARTMENT: 'Shared Apartment 🏢',
    SINGLE_APARTMENT: 'Single Apartment 🏬',
    LUXURY_APARTMENT_NINU_LEKKI: 'Luxury Lekki 🏰',
};

export default function PlayerHistoryPage() {
    const dispatch = useDispatch();
    const { currentPlayerId } = useSelector((state) => state.game);

    const { data: historyResult, isLoading } = useGetPlayerHistoryQuery(currentPlayerId, {
        skip: !currentPlayerId,
    });

    const history = historyResult;
    const rounds = history?.rounds || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white/50 gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading logs...</p>
            </div>
        );
    }

    if (!currentPlayerId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6">
                <p className="text-white/40 font-black uppercase tracking-widest italic">Identity Unknown</p>
                <button className="btn btn-primary" onClick={() => dispatch(navigateTo('game'))}>
                    Back to Game
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-6 max-w-5xl mx-auto flex flex-col">
            <div className="flex justify-start mb-8 animate-fade-in-down">
                <button className="btn btn-secondary btn-sm" onClick={() => dispatch(navigateTo('game'))}>
                    ← Back
                </button>
            </div>

            <header className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-6xl font-black uppercase tracking-tighter text-gradient mb-2">Life Log</h1>
                <p className="text-white/60 font-medium tracking-wide uppercase text-sm">Historical records for {history?.playerName}</p>
            </header>

            {/* Snapshot Section */}
            {history && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 animate-fade-in-up stagger-1">
                    {[
                        { l: 'Cash', v: history.currentCashBalance, i: '💰', c: 'glass-red border-red-500/30' },
                        { l: 'Debt', v: history.currentLoanBalance, i: '🏦', c: 'glass' },
                        { l: 'Worth', v: history.currentNetWorth, i: '📊', c: 'glass border-gold/30' },
                        { l: 'Credit', v: history.creditScore, i: '⭐', c: 'glass' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-6 rounded-3xl text-center flex flex-col items-center gap-2 border transition-transform hover:-translate-y-1 ${stat.c}`}>
                            <span className="text-3xl mb-1">{stat.i}</span>
                            <span className="text-xl font-black text-gradient uppercase tracking-tight italic leading-none">{stat.v}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.l}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Timeline View */}
            <div className="flex flex-col gap-0 border-l border-white/5 ml-4 pl-8 pt-4">
                {rounds.map((round, i) => (
                    <div
                        key={round.roundNumber}
                        className="relative mb-12 animate-fade-in-up"
                        style={{ animationDelay: `${(i + 2) * 0.1}s` }}
                    >
                        {/* Timeline Dot */}
                        <div className="absolute top-6 -left-[2.2rem] w-6 h-6 bg-red-600 rounded-full border-4 border-bg-primary shadow-[0_0_15px_rgba(220,38,38,0.5)] z-10" />

                        <div className="glass p-8 rounded-3xl border-white/5 hover:border-red-600/30 hover:bg-white/10 transition-all duration-500 group">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">Round {round.roundNumber}</h3>
                                <span className="px-4 py-1.5 glass rounded-full text-sm font-black text-gradient group-hover:scale-110 transition-transform">
                                    🎲 {round.diceRoll}
                                </span>
                            </div>

                            {/* Event Badge */}
                            <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 mb-6 border border-white/5 group-hover:bg-red-600/10 transition-colors">
                                <span className="text-3xl">{EVENT_ICONS[round.eventType] || '🎲'}</span>
                                <div className="flex-1">
                                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Economic Impact</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black uppercase tracking-tight text-white/80">{round.eventType?.replace(/_/g, ' ')}</span>
                                        {round.eventAmount && <span className="text-sm font-black text-white px-2 py-0.5 bg-white/10 rounded-md">{round.eventAmount}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Finance Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[
                                    { l: '💼 Salary', v: round.salaryReceived, g: true },
                                    { l: (HOUSING_LABELS[round.housingType] || '🏠 Housing').split(' ')[0], v: `-${round.housingCost}`, r: true },
                                    { l: '🛒 Survival', v: `-${round.survivalCost}`, r: true },
                                    { l: '🏦 Debt Paid', v: `-${round.loanPayment}`, r: true },
                                ].map((item, i) => (
                                    <div key={i} className="bg-black/40 p-3 px-4 rounded-xl flex justify-between items-center group-hover:bg-black/60 transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.l}</span>
                                        <span className={`text-xs font-black ${item.g ? 'text-green' : 'text-red-400'}`}>{item.v}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-6 pt-4 border-t border-white/5 text-sm font-black uppercase tracking-tight">
                                <div className="flex items-center gap-2">
                                    <span className="text-white/30">💰 Cash</span> <span>{round.cashBalanceEnd}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white/30">📊 Worth</span> <span>{round.netWorth}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {rounds.length === 0 && (
                <div className="glass p-20 rounded-[40px] flex flex-col items-center gap-6 animate-scale-in text-center">
                    <span className="text-6xl grayscale opacity-20">📜</span>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white/40">Archive Empty</h4>
                        <p className="text-sm text-white/20 font-medium">Complete your first round to begin documentation</p>
                    </div>
                    <button className="btn btn-primary mt-4 px-10" onClick={() => dispatch(navigateTo('game'))}>
                        Enter Arena
                    </button>
                </div>
            )}
        </div>
    );
}
