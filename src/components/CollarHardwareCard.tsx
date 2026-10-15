import React, { useState } from 'react';
import {
  Heart,
  Thermometer,
  Activity,
  Mic,
  Battery,
  BatteryCharging,
  Volume2,
  Home,
  MapPin,
  Cpu,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { CollarTelemetry, PetProfile } from '../types';
import { TELEMETRY_SCENARIOS } from '../data/mockData';
import { playCollarBuzzerTone } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface CollarHardwareCardProps {
  telemetry: CollarTelemetry;
  pet: PetProfile;
  onUpdateTelemetry: (patch: Partial<CollarTelemetry>) => void;
  onApplyScenario: (scenario: (typeof TELEMETRY_SCENARIOS)[0]) => void;
  onRunAiAnalysis: () => void;
  isAiAnalyzing: boolean;
}

export const CollarHardwareCard: React.FC<CollarHardwareCardProps> = ({
  telemetry,
  pet,
  onUpdateTelemetry,
  onApplyScenario,
  onRunAiAnalysis,
  isAiAnalyzing,
}) => {
  const { themeConfig } = useTheme();
  const [buzzerPlaying, setBuzzerPlaying] = useState(false);
  const [showHardwareSpecs, setShowHardwareSpecs] = useState(false);

  const handleTriggerBuzzer = () => {
    setBuzzerPlaying(true);
    playCollarBuzzerTone();
    onUpdateTelemetry({ buzzerActive: true });
    setTimeout(() => {
      setBuzzerPlaying(false);
      onUpdateTelemetry({ buzzerActive: false });
    }, 1200);
  };

  const tempFahrenheit = (telemetry.temperature * 9) / 5 + 32;
  const isFever = telemetry.temperature > 39.2;
  const isHypothermia = telemetry.temperature < 38.0;
  const isElevatedHeartRate = telemetry.heartRate > 120;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
      {/* Header: Collar Connection & Device Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                Smart Collar Telemetry
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                · {telemetry.connected ? 'Active Link' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Serial: {pet.collarSerial} · Signal: {telemetry.signalStrength} dBm · Synced: {telemetry.lastSyncTime}
            </p>
          </div>
        </div>

        {/* Collar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Collar Buzzer Trigger */}
          <button
            type="button"
            onClick={handleTriggerBuzzer}
            disabled={buzzerPlaying}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              buzzerPlaying
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
            title="Sends recall or locator signal to collar piezo buzzer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {buzzerPlaying ? 'Sounding Buzzer...' : 'Collar Buzzer'}
          </button>

          {/* Alone-at-Home Mode Toggle */}
          <button
            type="button"
            onClick={() => onUpdateTelemetry({ aloneAtHome: !telemetry.aloneAtHome })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              telemetry.aloneAtHome
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            {telemetry.aloneAtHome ? 'Alone Mode: Active' : 'Alone Mode: Off'}
          </button>

          {/* Battery Saver */}
          <button
            type="button"
            onClick={() => onUpdateTelemetry({ isBatterySaver: !telemetry.isBatterySaver })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              telemetry.isBatterySaver
                ? `${themeConfig.accentClass.btnPrimary}`
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            {telemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5" />
            )}
            {telemetry.batteryLevel}% {telemetry.isBatterySaver ? '(Eco)' : ''}
          </button>

          <button
            type="button"
            onClick={() => setShowHardwareSpecs(!showHardwareSpecs)}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline px-1"
          >
            {showHardwareSpecs ? 'Hide Hardware' : 'Hardware'}
          </button>
        </div>
      </div>

      {/* Hardware Architecture Accordion */}
      {showHardwareSpecs && (
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-300">
          <div className="font-semibold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            Pet Connect Hardware Architecture:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>• ESP32 Dev Board (Dual Core BLE/Wi-Fi)</div>
            <div>• MPU6050 6-Axis Accelerometer/Gyro</div>
            <div>• NEO-6M GPS Positioning Module</div>
            <div>• Optical PPG Heart Rate Sensor</div>
            <div>• Digital Contact Thermistor Sensor</div>
            <div>• High-Sensitivity Vocal Mic</div>
            <div>• TP4056 Li-ion Charging Module</div>
            <div>• 18650 Li-ion 2600mAh Battery + Buzzer</div>
          </div>
        </div>
      )}

      {/* Real-time 4-Sensor Biometric Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sensor 1: Heart Rate */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isElevatedHeartRate
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
              : 'bg-stone-50/80 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Heart
                className={`w-4 h-4 ${isElevatedHeartRate ? 'text-rose-600' : 'text-rose-500'}`}
              />
              Heart Rate
            </span>
            <span className="text-[11px] font-mono">PPG</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                isElevatedHeartRate
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {telemetry.heartRate}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">BPM</span>
          </div>
          {/* Animated Mini Heart Rhythm */}
          <div className="mt-2 h-5 flex items-center gap-0.5 overflow-hidden">
            {[4, 6, 8, 16, 4, 3, 5, 20, 8, 4, 5, 6, 18, 5, 4, 7].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${
                  isElevatedHeartRate ? 'bg-rose-400' : 'bg-rose-300 dark:bg-rose-800'
                }`}
                style={{
                  height: `${height}px`,
                  opacity: (i + 1) / 16,
                }}
              />
            ))}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {isElevatedHeartRate ? 'Elevated Arousal' : 'Resting Baseline (60-120)'}
          </div>
        </div>

        {/* Sensor 2: Body Temperature */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isFever
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
              : 'bg-stone-50/80 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Thermometer
                className={`w-4 h-4 ${isFever ? 'text-amber-600' : 'text-amber-500'}`}
              />
              Temperature
            </span>
            <span className="text-[11px] font-mono">NTC</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                isFever
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {telemetry.temperature.toFixed(1)}°C
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              ({tempFahrenheit.toFixed(1)}°F)
            </span>
          </div>
          {/* Temperature Range Gauge */}
          <div className="mt-2 w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isFever ? 'bg-amber-500' : isHypothermia ? 'bg-sky-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(10, ((telemetry.temperature - 36) / 5) * 100))}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {isFever
              ? 'Fever Alert (>39.2°C)'
              : isHypothermia
              ? 'Hypothermia Warning'
              : 'Normal Range (38.3 - 39.2°C)'}
          </div>
        </div>

        {/* Sensor 3: MPU6050 Motion & Acceleration */}
        <div className="p-4 rounded-xl border bg-stone-50/80 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700/60 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Motion & Gait
            </span>
            <span className="text-[11px] font-mono">MPU6050</span>
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
            {telemetry.motionState}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Accel: {telemetry.acceleration}g
            </span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {telemetry.motionState.includes('Shivering')
              ? 'Tremor Detected'
              : 'Gait symmetry verified'}
          </div>
        </div>

        {/* Sensor 4: Acoustic Vocal & Sound Level */}
        <div className="p-4 rounded-xl border bg-stone-50/80 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700/60 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Acoustic Sounds
            </span>
            <span className="text-[11px] font-mono">Mic</span>
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
            {telemetry.vocalPattern}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              {telemetry.soundLevel} dB
            </span>
            <div className="flex-1 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (telemetry.soundLevel / 90) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {telemetry.vocalPattern.includes('Whimper')
              ? 'Whimper vocalization'
              : telemetry.vocalPattern.includes('Bark')
              ? 'Vocal acoustic event'
              : 'Ambient silence'}
          </div>
        </div>
      </div>

      {/* GPS & Safe Zone Geofence status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/80 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          <span className="font-medium text-stone-800 dark:text-stone-200">GPS Location:</span>
          <span className="font-mono text-stone-600 dark:text-stone-300">
            {telemetry.gpsLat.toFixed(4)}° N, {telemetry.gpsLng.toFixed(4)}° E
          </span>
          <span className="text-stone-400 dark:text-stone-500">·</span>
          <span
            className={`font-medium ${
              telemetry.inSafeZone
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {telemetry.inSafeZone ? 'Inside Home Safe-Zone' : 'Safe-Zone Breached'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateTelemetry({ inSafeZone: !telemetry.inSafeZone })}
            className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-medium underline"
          >
            Toggle Boundary
          </button>
        </div>
      </div>

      {/* Interactive Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Simulate Collar Activity & Biometrics
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500">
            Instant scenario test
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TELEMETRY_SCENARIOS.map((scenario) => (
            <button
              key={scenario.name}
              type="button"
              onClick={() => onApplyScenario(scenario)}
              className="text-left p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-all group"
            >
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white line-clamp-1">
                {scenario.name}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                {scenario.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Behavioral Deep Analysis Trigger Banner */}
      <div className="bg-stone-50 dark:bg-stone-800/70 p-4 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Pet Behavioral & Health Analysis
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Analyzes tail kinematics, vocal patterns, and vital signs to detect mood changes and early distress.
          </p>
        </div>
        <button
          type="button"
          onClick={onRunAiAnalysis}
          disabled={isAiAnalyzing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 ${themeConfig.accentClass.btnPrimary}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
          {isAiAnalyzing ? 'Analyzing Signals...' : 'Analyze Behavior'}
        </button>
      </div>
    </div>
  );
};
