import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../features/gameSlice';

export default function Toast() {
    const dispatch = useDispatch();
    const toasts = useSelector((state) => state.game.toasts);

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'border-green/30 bg-green/10 text-green';
            case 'error': return 'border-red-600/30 bg-red-600/10 text-red-400';
            case 'warning': return 'border-amber-500/30 bg-amber-500/10 text-amber-500';
            default: return 'border-white/20 bg-white/10 text-white';
        }
    };

    const getProgressStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-green shadow-[0_0_8px_var(--green)]';
            case 'error': return 'bg-red-600 shadow-[0_0_8px_var(--red-600)]';
            case 'warning': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
            default: return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]';
        }
    };

    return (
        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3 min-w-[320px] max-w-sm">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => dispatch(removeToast(toast.id))}
                    typeStyles={getTypeStyles(toast.type)}
                    progressStyles={getProgressStyles(toast.type)}
                />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose, typeStyles, progressStyles }) {
    useEffect(() => {
        const timer = setTimeout(onClose, toast.duration || 5000);
        return () => clearTimeout(timer);
    }, [onClose, toast.duration]);

    return (
        <div className={`
      relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-xl glass border backdrop-blur-2xl
      animate-[toastSlide_0.4s_ease-out] transition-all duration-300
      ${typeStyles}
    `}>
            <div className="flex items-center gap-3">
                <span className="text-xl">
                    {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '🔔'}
                </span>
                <p className="text-sm font-bold tracking-tight">{toast.message}</p>
            </div>
            <button
                onClick={onClose}
                className="opacity-40 hover:opacity-100 transition-opacity p-1"
            >
                ✕
            </button>

            {/* Progress Bar */}
            <div
                className={`
          absolute bottom-0 left-0 h-1 animate-[progressBar_linear_forwards]
          ${progressStyles}
        `}
                style={{ animationDuration: `${toast.duration || 5000}ms` }}
            />
        </div>
    );
}
