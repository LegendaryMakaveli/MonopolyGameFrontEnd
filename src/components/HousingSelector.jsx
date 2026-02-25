import { useDispatch } from 'react-redux';
import { usePickHousingMutation } from '../services/monopolyApi';
import { addToast } from '../features/gameSlice';

const HOUSING_OPTIONS = [
    {
        type: 'PARENT_HOUSE',
        label: "Parent's House",
        icon: '🏠',
        description: 'No monthly cost, but zero privacy. Best for saving money.',
        cost: '₦0',
        color: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500 hover:bg-blue-500/10',
    },
    {
        type: 'SHARED_APARTMENT',
        label: 'Shared Apartment',
        icon: '🏢',
        description: 'Split bills with flatmates. Affordable and social.',
        cost: '₦200,000',
        color: 'border-green/30 bg-green/5 hover:border-green hover:bg-green/10',
    },
    {
        type: 'SINGLE_APARTMENT',
        label: 'Single Apartment',
        icon: '🏬',
        description: 'Your own space. Fairly expensive but peaceful.',
        cost: '₦500,000',
        color: 'border-gold/30 bg-gold/5 hover:border-gold hover:bg-gold/10',
    },
    {
        type: 'LUXURY_APARTMENT_NINU_LEKKI',
        label: 'Luxury Lekki',
        icon: '🏰',
        description: 'The peak of Lagos living. Extremely expensive.',
        cost: '₦1,500,000',
        color: 'border-red-600/30 bg-red-600/5 hover:border-red-600 hover:bg-red-600/10',
    },
];

export default function HousingSelector({ playerId, onClose }) {
    const dispatch = useDispatch();
    const [pickHousing, { isLoading }] = usePickHousingMutation();

    const handleSelect = async (housingType) => {
        try {
            await pickHousing({ playerId, housingType }).unwrap();
            dispatch(addToast({ message: 'Housing updated successfully! 🏠', type: 'success' }));
            onClose();
        } catch (err) {
            dispatch(addToast({ message: err?.data?.message || 'Failed to pick housing', type: 'error' }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <div
                className="relative w-full max-w-3xl glass-strong p-8 rounded-3xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-600/20 text-white transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>

                <header className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-gradient uppercase tracking-tight">Pick Your Housing</h2>
                    <p className="text-white/60 mt-2 font-medium">Your monthly survival depends on where you live.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HOUSING_OPTIONS.map((option) => (
                        <button
                            key={option.type}
                            className={`
                flex items-start gap-4 p-5 text-left border rounded-2xl transition-all duration-300 group
                ${option.color}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                            onClick={() => handleSelect(option.type)}
                            disabled={isLoading}
                        >
                            <div className="w-14 h-14 flex items-center justify-center text-3xl bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                                {option.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">{option.label}</h4>
                                    <span className="text-sm font-black text-white/50">{option.cost}</span>
                                </div>
                                <p className="text-xs text-white/40 leading-relaxed font-medium">
                                    {option.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-white/30 font-semibold italic uppercase tracking-widest">
                        Choose wisely — you pay for this every round.
                    </p>
                </div>
            </div>
        </div>
    );
}
