export default function PlayerCard({ player, isCurrentPlayer, delay = 0, onClick, onDelete, showDelete }) {
    const {
        id,
        name,
        status,
        housing,
        cashBalance,
        loanBalance,
        netWorth,
        creditScore,
    } = player;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-3 py-1 text-[10px] font-bold rounded-full border border-green/30 bg-green/10 text-green">ACTIVE</span>;
            case 'JOB_LOST':
                return <span className="px-3 py-1 text-[10px] font-bold rounded-full border border-gold/30 bg-gold/10 text-gold">JOB LOST</span>;
            case 'ELIMINATED':
                return <span className="px-3 py-1 text-[10px] font-bold rounded-full border border-red-400/30 bg-red-400/10 text-red-400">ELIMINATED</span>;
            default:
                return <span className="px-3 py-1 text-[10px] font-bold rounded-full border border-white/30 bg-white/10 text-white/70">{status}</span>;
        }
    };

    const getAvatarGradient = () => {
        if (status === 'ELIMINATED') return 'from-gray-700 to-gray-900';
        if (status === 'JOB_LOST') return 'from-amber-600 to-amber-800';
        return 'from-red-600 to-red-800';
    };

    return (
        <div
            className={`
        relative overflow-hidden transition-all duration-300 cursor-pointer p-5 rounded-2xl
        animate-fade-in-up hover:scale-[1.02] active:scale-[0.98]
        ${isCurrentPlayer ? 'glass-red border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'glass hover:border-red-500/50 hover:bg-white/10'}
      `}
            style={{ animationDelay: `${delay * 0.1}s` }}
            onClick={onClick}
        >
            {isCurrentPlayer && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 flex items-center justify-center rounded-bl-xl text-[10px] font-bold animate-pulse">
                    YOU
                </div>
            )}

            {showDelete && (
                <button
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600/20 hover:bg-red-600 flex items-center justify-center rounded-lg text-red-500 hover:text-white transition-all z-20 group-hover:scale-110"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id, name);
                    }}
                >
                    🗑️
                </button>
            )}

            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white bg-linear-to-br shadow-lg ${getAvatarGradient()}`}>
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white leading-tight">{name}</h4>
                    <div className="mt-1">{getStatusBadge(status)}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-2 bg-black/40 rounded-lg">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Cash</span>
                    <span className="text-sm font-bold text-green">{cashBalance}</span>
                </div>
                <div className="flex flex-col p-2 bg-black/40 rounded-lg">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Net Worth</span>
                    <span className="text-sm font-bold text-gold">{netWorth}</span>
                </div>
                <div className="flex flex-col p-2 bg-black/40 rounded-lg col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Status</span>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-white/80">{housing || 'No Housing'}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/40">Credit:</span>
                            <span className="text-xs font-bold text-white">{creditScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            {status === 'ELIMINATED' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-xl font-black italic text-red-500 -rotate-12 border-4 border-red-500 px-4 py-1">OUT</span>
                </div>
            )}
        </div>
    );
}
