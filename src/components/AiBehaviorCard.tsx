import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Lightbulb,
  HeartPulse,
  PhoneCall,
} from 'lucide-react';
import { AIAnalysisResult, PetProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AiBehaviorCardProps {
  analysis: AIAnalysisResult | null;
  pet: PetProfile;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AiBehaviorCard: React.FC<AiBehaviorCardProps> = ({
  analysis,
  pet,
  isLoading,
  onRefresh,
}) => {
  const { themeConfig } = useTheme();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[260px] transition-colors">
        <div className="w-10 h-10 border-3 border-stone-300 dark:border-stone-600 border-t-stone-800 dark:border-t-white rounded-full animate-spin" />
        <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
          Analyzing Behavioral & Collar Telemetry
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
          Evaluating {pet.name}'s tail movement kinematics, vocal patterns, and vital signs...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs text-center transition-colors">
        <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
          No Behavioral Assessment Yet
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 mt-1">
          Generate an instant analysis for {pet.name}'s current collar readings.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs ${themeConfig.accentClass.btnPrimary}`}
        >
          Analyze Behavior
        </button>
      </div>
    );
  }

  const stressColorMap: Record<string, string> = {
    low: 'text-emerald-700 dark:text-emerald-400',
    moderate: 'text-amber-700 dark:text-amber-400',
    high: 'text-rose-700 dark:text-rose-400',
    critical: 'text-rose-700 dark:text-rose-400',
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5 transition-colors">
      {/* Top Banner: Real-time Decoded Mood & Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Behavioral State
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            {analysis.mood}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-stone-500 dark:text-stone-400">
            Confidence: <strong className="font-mono text-stone-800 dark:text-stone-200">{analysis.confidence}%</strong>
          </span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-stone-500 dark:text-stone-400">
            Stress Level:{' '}
            <strong className={`capitalize font-semibold ${stressColorMap[analysis.stressLevel] || 'text-stone-800 dark:text-stone-200'}`}>
              {analysis.stressLevel}
            </strong>
          </span>
        </div>
      </div>

      {/* Urgent Warning Callout if Alert is triggered */}
      {analysis.urgentAlert && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-950 dark:text-rose-200">
                Medical Attention Suggested
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                {analysis.urgentAlertMessage || 'Collar signals flag physiological or distress anomaly.'}
              </p>
            </div>
          </div>
          <a
            href={`tel:${pet.emergencyVet.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Call Dr. {pet.emergencyVet.name.split(' ')[1]}
          </a>
        </div>
      )}

      {/* Core Insights: Tail Kinematics & Biometric Synthesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tail Kinematics Scientific Decoding */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-100">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Tail Movement Interpretation
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {analysis.tailPatternInterpretation}
          </p>
        </div>

        {/* Biometrics Alignment */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-100">
            <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Vital Signs Assessment
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {analysis.biometricAssessment}
          </p>
        </div>
      </div>

      {/* Personalized Veterinary Care Tips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-100">
          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Personalized Care Tips for {pet.name}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.actionableTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinician Recommendation */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-start gap-3 text-xs">
        <Stethoscope className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            Veterinary Clinical Guidance:
          </span>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            {analysis.veterinaryRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
