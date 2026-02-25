import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startDiceRoll, finishDiceRoll } from '../features/gameSlice';

export default function DiceRoller({ onRollComplete, disabled, targetValue }) {
    const dispatch = useDispatch();
    const { isRolling, diceValue } = useSelector((state) => state.game);
    const [phase, setPhase] = useState('idle'); // 'idle' | 'shaking' | 'spinning' | 'landing'

    const rollDice = () => {
        if (disabled || isRolling) return;

        dispatch(startDiceRoll());
        setPhase('shaking');

        setTimeout(() => {
            setPhase('spinning');

            setTimeout(() => {
                setPhase('landing');

                setTimeout(() => {
                    setPhase('idle');
                    if (onRollComplete) onRollComplete();
                }, 800);
            }, 1000);
        }, 600);
    };

    const renderDots = (value) => {
        const dotPositions = {
            1: ['center'],
            2: ['top-right', 'bottom-left'],
            3: ['top-right', 'center', 'bottom-left'],
            4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
            6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
        };

        return dotPositions[value]?.map((pos, i) => (
            <span key={i} className={`absolute w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)] ${getDotClass(pos)}`} />
        ));
    };

    const getDotClass = (pos) => {
        switch (pos) {
            case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            case 'top-left': return 'top-3 left-3';
            case 'top-right': return 'top-3 right-3';
            case 'bottom-left': return 'bottom-3 left-3';
            case 'bottom-right': return 'bottom-3 right-3';
            case 'middle-left': return 'top-1/2 left-3 -translate-y-1/2';
            case 'middle-right': return 'top-1/2 right-3 -translate-y-1/2';
            default: return '';
        }
    };

    const valueToRotation = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(-90deg) rotateY(0deg)',
        3: 'rotateX(0deg) rotateY(-90deg)',
        4: 'rotateX(0deg) rotateY(90deg)',
        5: 'rotateX(90deg) rotateY(0deg)',
        6: 'rotateX(180deg) rotateY(0deg)',
    };

    const currentRotation = (phase === 'idle' || phase === 'landing') && diceValue
        ? valueToRotation[diceValue]
        : '';

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            <div className="perspective-[1000px] w-24 h-24">
                <div
                    className={`
                        relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700
                        ${phase === 'shaking' ? 'animate-dice-shake' : ''}
                        ${phase === 'spinning' ? 'animate-spin-3d' : ''}
                        ${phase === 'landing' ? 'animate-dice-land' : ''}
                    `}
                    style={{ transform: currentRotation }}
                >

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:translateZ(48px)]">
                        {renderDots(1)}
                    </div>

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(48px)]">
                        {renderDots(6)}
                    </div>

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:rotateY(90deg)_translateZ(48px)]">
                        {renderDots(3)}
                    </div>

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:rotateY(-90deg)_translateZ(48px)]">
                        {renderDots(4)}
                    </div>

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:rotateX(90deg)_translateZ(48px)]">
                        {renderDots(2)}
                    </div>

                    <div className="absolute inset-0 bg-white border-2 border-red-500/20 rounded-xl shadow-inner [backface-visibility:hidden] [transform:rotateX(-90deg)_translateZ(48px)]">
                        {renderDots(5)}
                    </div>
                </div>
            </div>

            <button
                className="btn btn-primary btn-lg min-w-48 animate-pulse-glow"
                onClick={rollDice}
                disabled={disabled || isRolling}
            >
                {isRolling ? (
                    <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Rolling...
                    </span>
                ) : '🎲 Roll Dice'}
            </button>

            {diceValue && phase === 'idle' && (
                <div className="text-2xl font-bold text-gradient animate-scale-in">
                    You rolled a {diceValue}!
                </div>
            )}
        </div>
    );
}
