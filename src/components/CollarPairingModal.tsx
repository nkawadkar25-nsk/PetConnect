import React, { useState } from 'react';
import {
  Cpu,
  Bluetooth,
  Wifi,
  RefreshCw,
  X,
  Check,
  Radio,
  Sliders,
} from 'lucide-react';
import { CollarTelemetry, PetProfile } from '../types';
import { playCollarBuzzerTone, playSuccessChime } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface CollarPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: CollarTelemetry;
  pet: PetProfile;
  onUpdateTelemetry: (patch: Partial<CollarTelemetry>) => void;
}

export const CollarPairingModal: React.FC<CollarPairingModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  pet,
  onUpdateTelemetry,
}) => {
  const { themeConfig } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibratedSuccess, setCalibratedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onUpdateTelemetry({
        connected: true,
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      playSuccessChime();
    }, 1500);
  };

  const handleCalibrateSensors = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibratedSuccess(true);
      playSuccessChime();
      setTimeout(() => setCalibratedSuccess(false), 3000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Smart Collar Configuration
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">Node: {pet.collarSerial}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status Box */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {telemetry.connected ? 'Active Collar Link' : 'Disconnected'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              RSSI: {telemetry.signalStrength} dBm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-[10px] block">Transmission:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">BLE 5.2</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-stone-600 dark:text-stone-400 shrink-0" />
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-[10px] block">Backhaul:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Wi-Fi 2.4GHz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Onboard Hardware Modules Table */}
        <div className="space-y-2 text-xs">
          <span className="font-semibold text-stone-700 dark:text-stone-300 block">Hardware Modules:</span>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>MPU6050 6-Axis IMU</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>NEO-6M GPS Tracker</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Optical Pulse PPG</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Digital Thermistor</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Acoustic Vocal Mic</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>TP4056 + 18650 Battery</span>
            </div>
          </div>
        </div>

        {/* Sensor Calibration & Testing Actions */}
        <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Diagnostic Utilities:</span>
            {calibratedSuccess && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Offsets calibrated
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleCalibrateSensors}
              disabled={isCalibrating}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sliders className="w-3.5 h-3.5" />
              {isCalibrating ? 'Calibrating...' : 'Zero-G Calibrate'}
            </button>

            <button
              type="button"
              onClick={() => playCollarBuzzerTone()}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              Test 2.4kHz Buzzer
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <button
            type="button"
            onClick={handleRescan}
            disabled={isScanning}
            className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning BLE Link...' : 'Re-sync Link'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-semibold shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
