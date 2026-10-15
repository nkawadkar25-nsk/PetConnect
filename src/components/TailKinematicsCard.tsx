import React, { useMemo } from 'react';
import { Activity, Compass, Info, Zap } from 'lucide-react';
import { CollarTelemetry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TailKinematicsCardProps {
  telemetry: CollarTelemetry;
  onSimulateBias?: (bias: CollarTelemetry['tailLateralBias'], angle: number, freq: number) => void;
}

export const TailKinematicsCard: React.FC<TailKinematicsCardProps> = ({ telemetry, onSimulateBias }) => {
  const { themeConfig } = useTheme();
  const { tailFrequency, tailAngle, tailLateralBias, tailPattern } = telemetry;

  const animationDuration = useMemo(() => {
    if (tailFrequency <= 0.2) return 0;
    return Math.max(0.2, 1 / tailFrequency);
  }, [tailFrequency]);

  const biasStats = useMemo(() => {
    if (tailLateralBias.includes('Right')) {
      return { right: 78, left: 22, label: 'Right-Dominant (Approach / Dopaminergic)' };
    }
    if (tailLateralBias.includes('Left')) {
      return { right: 26, left: 74, label: 'Left-Dominant (Anxiety / Right-Hemisphere Stress)' };
    }
    if (tailLateralBias.includes('Neutral')) {
      return { right: 50, left: 50, label: 'Resting Baseline (Symmetric / Low Arousal)' };
    }
    return { right: 52, left: 48, label: 'Symmetric (High Intensity Arousal)' };
  }, [tailLateralBias]);

  const angleDescriptor = useMemo(() => {
    if (tailAngle > 30) return { title: 'High Flag (+30° to +90°)', desc: 'Heightened arousal, excitement, or dominance display' };
    if (tailAngle >= -15) return { title: 'Horizontal Natural (-15° to +30°)', desc: 'Relaxed, friendly baseline exploration' };
    return { title: 'Low Tucked (-90° to -15°)', desc: 'Fear, submission, apprehension, or abdominal discomfort' };
  }, [tailAngle]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                Tail Movement Pattern & Mood Decoder
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                · IMU Kinematics
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Real-time canine lateralization & oscillation analysis
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-300">
            {tailFrequency.toFixed(1)} Hz · {tailAngle > 0 ? `+${tailAngle}` : tailAngle}° Elevation
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Animation of Canine Tail Movement */}
        <div className="md:col-span-5 bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-stone-200/80 dark:border-stone-700/80 relative overflow-hidden">
          <div className="w-48 h-48 relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              <circle cx="100" cy="110" r="70" fill="none" stroke="currentColor" className="text-stone-200 dark:text-stone-700" strokeDasharray="3 3" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" className="text-stone-200 dark:text-stone-700" strokeDasharray="2 2" />
              <line x1="20" y1="110" x2="180" y2="110" stroke="currentColor" className="text-stone-200 dark:text-stone-700" strokeDasharray="2 2" />

              <text x="100" y="28" textAnchor="middle" className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono">+90° Flag</text>
              <text x="180" y="113" textAnchor="end" className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono">Right (Positive)</text>
              <text x="20" y="113" textAnchor="start" className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono">Left (Anxious)</text>
              <text x="100" y="194" textAnchor="middle" className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono">-90° Tucked</text>

              {/* Dog Body Pelvis */}
              <ellipse cx="100" cy="130" rx="38" ry="32" fill="#d97706" opacity="0.15" />
              <path
                d="M 68 150 C 65 170 72 180 78 180 C 84 180 86 165 88 150 Z"
                fill="#b45309"
                opacity="0.8"
              />
              <path
                d="M 132 150 C 135 170 128 180 122 180 C 116 180 114 165 112 150 Z"
                fill="#b45309"
                opacity="0.8"
              />
              <circle cx="100" cy="125" r="28" fill="#d97706" />
              <ellipse cx="100" cy="120" rx="20" ry="15" fill="#f59e0b" />

              {/* Tail Base Joint */}
              <circle cx="100" cy="108" r="5" fill="#78350f" />

              {/* Dynamic Animated Tail Group */}
              <g
                style={{
                  transformOrigin: '100px 108px',
                  transform: `rotate(${
                    tailLateralBias.includes('Right') ? 22 : tailLateralBias.includes('Left') ? -22 : 0
                  }deg)`,
                  transition: 'transform 0.4s ease',
                }}
              >
                <g
                  style={{
                    transformOrigin: '100px 108px',
                    animation:
                      tailFrequency > 0.2
                        ? `tailWag ${animationDuration}s ease-in-out infinite alternate`
                        : 'none',
                  }}
                >
                  <path
                    d={`M 100 108 Q ${100 + (tailLateralBias.includes('Right') ? 14 : -14)} ${70 - tailAngle * 0.4} ${
                      100 + (tailLateralBias.includes('Right') ? 25 : -25)
                    } ${40 - tailAngle * 0.5}`}
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={100 + (tailLateralBias.includes('Right') ? 25 : -25)}
                    cy={40 - tailAngle * 0.5}
                    r="8"
                    fill="#fbbf24"
                  />
                </g>
              </g>

              <circle cx="100" cy="108" r="14" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" from="6" to="24" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
              {tailPattern}
            </span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              {biasStats.label}
            </span>
          </div>
        </div>

        {/* Kinematics Telemetry Breakdown */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Lateral Asymmetry Ratio Bar */}
          <div>
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-1">
              <span className="font-semibold text-rose-700 dark:text-rose-400">Left Bias ({biasStats.left}%)</span>
              <span className="font-medium text-stone-500 dark:text-stone-400">Hemispheric Bias</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Right Bias ({biasStats.right}%)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex border border-stone-200 dark:border-stone-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-l-full transition-all duration-500"
                style={{ width: `${biasStats.left}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-r-full transition-all duration-500"
                style={{ width: `${biasStats.right}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              Canine behavioral research: Left-brain activation triggers right-biased wags during positive social approach.
            </p>
          </div>

          {/* Elevation Angle & Frequency Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs mb-1">
                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Elevation Angle</span>
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {angleDescriptor.title}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                {angleDescriptor.desc}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Wag Frequency</span>
              </div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {tailFrequency} Hz Oscillations
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {tailFrequency > 2.5 ? 'High enthusiasm' : tailFrequency > 0.8 ? 'Moderate pace' : 'Minimal / static drape'}
              </p>
            </div>
          </div>

          {/* Interactive Bias Quick Simulator */}
          {onSimulateBias && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
                Simulate Tail Pattern:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSimulateBias('Right-biased (Positive / Approach)', 30, 3.2)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    tailLateralBias.includes('Right')
                      ? `${themeConfig.accentClass.btnPrimary} font-medium shadow-xs`
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  Right Wag (3.2 Hz, +30°)
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateBias('Left-biased (Anxious / Withdrawal)', -35, 1.4)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    tailLateralBias.includes('Left')
                      ? 'bg-rose-600 text-white border-rose-600 font-medium shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-400'
                  }`}
                >
                  Left Wag (1.4 Hz, -35°)
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateBias('Neutral / Relaxed', 0, 0.2)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    tailLateralBias.includes('Neutral')
                      ? 'bg-stone-800 dark:bg-stone-600 text-white font-medium shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  Resting Drape (0.2 Hz, 0°)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tailWag {
          0% {
            transform: rotate(-24deg);
          }
          100% {
            transform: rotate(24deg);
          }
        }
      `}</style>
    </div>
  );
};
