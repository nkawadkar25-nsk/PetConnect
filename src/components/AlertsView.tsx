import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle,
  Trash2,
  PhoneCall,
} from 'lucide-react';
import { AppAlert, AlertLevel, PetProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AlertsViewProps {
  alerts: AppAlert[];
  pet: PetProfile;
  onMarkRead: (id: string) => void;
  onClearAlerts: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  pet,
  onMarkRead,
  onClearAlerts,
}) => {
  const { themeConfig } = useTheme();
  const [filterLevel, setFilterLevel] = useState<string>('All');

  const filtered = alerts.filter((a) => {
    if (filterLevel === 'All') return true;
    return a.level === filterLevel.toLowerCase();
  });

  const getAlertBadge = (level: AlertLevel) => {
    switch (level) {
      case 'urgent':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          border: 'border-rose-200 dark:border-rose-900/60',
          text: 'text-rose-700 dark:text-rose-400',
          badgeBg: 'bg-rose-600 text-white',
          icon: ShieldAlert,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-900/60',
          text: 'text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-500 text-white',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-stone-50 dark:bg-stone-800/50',
          border: 'border-stone-200 dark:border-stone-700/80',
          text: 'text-stone-700 dark:text-stone-300',
          badgeBg: 'bg-stone-700 text-white dark:bg-stone-600',
          icon: Info,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            Alerts & Health Notifications
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time biometric warnings, tail movement indicators, and care reminders for {pet.name}
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            type="button"
            onClick={onClearAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:border-rose-200 text-xs font-medium transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Alerts
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['All', 'Urgent', 'Warning', 'Info'].map((level) => {
          const count =
            level === 'All'
              ? alerts.length
              : alerts.filter((a) => a.level === level.toLowerCase()).length;

          return (
            <button
              key={level}
              type="button"
              onClick={() => setFilterLevel(level)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterLevel === level
                  ? `${themeConfig.accentClass.activeTab} shadow-xs`
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span>{level}</span>
              <span className="text-[10px] opacity-80 font-mono">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-10 border border-stone-200 dark:border-stone-800 text-center transition-colors">
            <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
            <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
              All Systems Normal
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              No alerts in this category. {pet.name} is resting safely.
            </p>
          </div>
        ) : (
          filtered.map((alert) => {
            const badge = getAlertBadge(alert.level);
            const Icon = badge.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  alert.read
                    ? 'bg-white dark:bg-stone-900 opacity-80 border-stone-200 dark:border-stone-800'
                    : `${badge.bg} ${badge.border} shadow-xs`
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${badge.badgeBg}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-bold uppercase tracking-wider font-mono text-[10px]">
                        {alert.level}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{alert.timestamp}</span>
                      <span>·</span>
                      <span className="capitalize">{alert.category}</span>
                    </div>

                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.level === 'urgent' && (
                    <a
                      href={`tel:${pet.emergencyVet.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Vet
                    </a>
                  )}

                  {!alert.read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(alert.id)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
