import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Shield,
  Utensils,
  Bell,
  FileText,
  Brain,
  Cpu,
  ChevronDown,
  PhoneCall,
} from 'lucide-react';
import {
  PetProfile,
  CollarTelemetry,
  HealthRecord,
  Vaccination,
  MealReminder,
  AppAlert,
  AIAnalysisResult,
} from './types';
import {
  INITIAL_PETS,
  INITIAL_TELEMETRY,
  INITIAL_HEALTH_RECORDS,
  INITIAL_VACCINATIONS,
  INITIAL_MEALS,
  INITIAL_ALERTS,
  TELEMETRY_SCENARIOS,
} from './data/mockData';
import { TailKinematicsCard } from './components/TailKinematicsCard';
import { CollarHardwareCard } from './components/CollarHardwareCard';
import { AiBehaviorCard } from './components/AiBehaviorCard';
import { HealthRecordsView } from './components/HealthRecordsView';
import { VaccinationView } from './components/VaccinationView';
import { MealRemindersView } from './components/MealRemindersView';
import { AlertsView } from './components/AlertsView';
import { AiConsultantView } from './components/AiConsultantView';
import { CollarPairingModal } from './components/CollarPairingModal';
import { ThemeSelector } from './components/ThemeSelector';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { playAlertTone, playSuccessChime } from './utils/audio';

type ActiveTab = 'dashboard' | 'records' | 'vaccines' | 'meals' | 'alerts' | 'consultant';

function PetConnectApp() {
  const { themeConfig } = useTheme();

  // State
  const [pets, setPets] = useState<PetProfile[]>(() => {
    const saved = localStorage.getItem('petconnect_pets');
    return saved ? JSON.parse(saved) : INITIAL_PETS;
  });
  const [selectedPetId, setSelectedPetId] = useState<string>('pet-1');

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [telemetry, setTelemetry] = useState<CollarTelemetry>(() => {
    const saved = localStorage.getItem('petconnect_telemetry');
    return saved ? JSON.parse(saved) : INITIAL_TELEMETRY;
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem('petconnect_records');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_RECORDS;
  });

  const [vaccinations, setVaccinations] = useState<Vaccination[]>(() => {
    const saved = localStorage.getItem('petconnect_vaccines');
    return saved ? JSON.parse(saved) : INITIAL_VACCINATIONS;
  });

  const [meals, setMeals] = useState<MealReminder[]>(() => {
    const saved = localStorage.getItem('petconnect_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [alerts, setAlerts] = useState<AppAlert[]>(() => {
    const saved = localStorage.getItem('petconnect_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [waterIntakeBowls, setWaterIntakeBowls] = useState<number>(3);
  const [isCollarModalOpen, setIsCollarModalOpen] = useState(false);

  // AI Behavior Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [vetReportMarkdown, setVetReportMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Active Pet
  const currentPet = pets.find((p) => p.id === selectedPetId) || pets[0];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('petconnect_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('petconnect_telemetry', JSON.stringify(telemetry));
  }, [telemetry]);

  useEffect(() => {
    localStorage.setItem('petconnect_records', JSON.stringify(healthRecords));
  }, [healthRecords]);

  useEffect(() => {
    localStorage.setItem('petconnect_vaccines', JSON.stringify(vaccinations));
  }, [vaccinations]);

  useEffect(() => {
    localStorage.setItem('petconnect_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('petconnect_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Real-time AI Analysis Caller
  const runAiAnalysis = useCallback(async (currentData?: CollarTelemetry) => {
    const dataToAnalyze = currentData || telemetry;
    setIsAiAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet: currentPet,
          telemetry: dataToAnalyze,
          recentEvents: alerts.slice(0, 3),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: AIAnalysisResult = {
          ...json.data,
          analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: json.source,
        };
        setAiAnalysis(result);

        if (result.urgentAlert) {
          playAlertTone(true);
          const newAlert: AppAlert = {
            id: `alert-ai-${Date.now()}`,
            petId: currentPet.id,
            timestamp: 'Just now',
            level: 'urgent',
            title: `Behavior Alert: ${result.mood}`,
            message: result.urgentAlertMessage || result.biometricAssessment,
            category: 'tail',
            read: false,
          };
          setAlerts((prev) => [newAlert, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to run analysis:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  }, [currentPet, telemetry, alerts]);

  useEffect(() => {
    runAiAnalysis();
  }, [selectedPetId]);

  const handleApplyScenario = (scenario: (typeof TELEMETRY_SCENARIOS)[0]) => {
    const updated: CollarTelemetry = {
      ...telemetry,
      ...scenario.telemetry,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTelemetry(updated);

    if (scenario.name.includes('Scared')) {
      playAlertTone(true);
      setAlerts((prev) => [
        {
          id: `alert-${Date.now()}`,
          petId: currentPet.id,
          timestamp: 'Just now',
          level: 'urgent',
          title: 'Scared Alert: Rapid Tremor & Tucked Tail',
          message: `${currentPet.name}'s collar registered high-frequency trembling motion, whimpering sounds, and tucked left-biased tail wagging.`,
          category: 'tail',
          read: false,
        },
        ...prev,
      ]);
    } else if (scenario.name.includes('Fever')) {
      playAlertTone(true);
      setAlerts((prev) => [
        {
          id: `alert-${Date.now()}`,
          petId: currentPet.id,
          timestamp: 'Just now',
          level: 'urgent',
          title: `Fever Warning: ${scenario.telemetry.temperature}°C Body Temperature`,
          message: `Body temperature exceeds normal threshold of 39.2°C. Panting detected. Please offer cool water and contact your veterinarian.`,
          category: 'vitals',
          read: false,
        },
        ...prev,
      ]);
    } else {
      playSuccessChime();
    }

    runAiAnalysis(updated);
  };

  const handleSimulateTailBias = (
    bias: CollarTelemetry['tailLateralBias'],
    angle: number,
    freq: number
  ) => {
    const pattern = bias.includes('Right')
      ? 'Rightward sweep (Positive approach)'
      : bias.includes('Left')
      ? 'Leftward wag (Anxiety / Right-brain)'
      : 'Resting drape';

    const updated: CollarTelemetry = {
      ...telemetry,
      tailLateralBias: bias,
      tailAngle: angle,
      tailFrequency: freq,
      tailPattern: pattern,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTelemetry(updated);
    runAiAnalysis(updated);
  };

  const handleUpdateTelemetry = (patch: Partial<CollarTelemetry>) => {
    setTelemetry((prev) => ({
      ...prev,
      ...patch,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }));
  };

  const handleGenerateVetReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/generate-vet-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet: currentPet,
          healthRecords: healthRecords.filter((h) => h.petId === currentPet.id),
          vaccinations: vaccinations.filter((v) => v.petId === currentPet.id),
          mealStats: {
            complianceRate: 95,
            waterIntake: `${waterIntakeBowls} fresh bowls today`,
          },
          telemetrySummary: {
            avgHeartRate: telemetry.heartRate,
            avgTemp: telemetry.temperature,
            tailDominance: telemetry.tailLateralBias,
            activeHours: 3.8,
            restHours: 14.2,
          },
        }),
      });

      const data = await res.json();
      setVetReportMarkdown(data.reportMarkdown);
    } catch (err) {
      console.error('Vet report error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAddHealthRecord = (record: HealthRecord) => {
    setHealthRecords((prev) => [record, ...prev]);
  };

  const handleAddVaccination = (vac: Vaccination) => {
    setVaccinations((prev) => [vac, ...prev]);
  };

  const handleUpdateVaccination = (id: string, patch: Partial<Vaccination>) => {
    setVaccinations((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const handleToggleMealFed = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newState = !m.fedToday;
          return {
            ...m,
            fedToday: newState,
            lastFedTimestamp: newState
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleAddMeal = (meal: MealReminder) => {
    setMeals((prev) => [...prev, meal]);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-stone-100/80 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-16 transition-colors duration-200">
      {/* Top Application Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-stone-900/95 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.primaryHex }}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 tracking-tight text-base">
                Pet Connect
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                Smart Collar Telemetry & Health Companion
              </p>
            </div>
          </div>

          {/* Right Header Controls: Pet Switcher, Collar Link, Theme Selector, Vet Call */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Pet Selector */}
            <div className="relative">
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="appearance-none bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 pl-8 pr-8 py-1.5 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400/20 cursor-pointer shadow-xs transition-colors"
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.breed})
                  </option>
                ))}
              </select>
              <div className="w-4 h-4 rounded-full overflow-hidden absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <img
                  src={currentPet.avatarUrl}
                  alt={currentPet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Collar Link Status Button */}
            <button
              type="button"
              onClick={() => setIsCollarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200 shadow-xs transition-all active:scale-95"
            >
              <Cpu className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span className="hidden md:inline">Collar</span>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">Connected</span>
            </button>

            {/* Theme Selector (Light, Dark, Custom Accents) */}
            <ThemeSelector />

            {/* Emergency Vet Call */}
            <a
              href={`tel:${currentPet.emergencyVet.phone}`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
              title={`Call Emergency Vet: ${currentPet.emergencyVet.name}`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Dr. {currentPet.emergencyVet.name.split(' ')[1]}</span>
            </a>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Collar & Mood Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'records'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Health Records</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vaccines')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'vaccines'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Vaccinations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'meals'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Meal Reminders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all relative ${
              activeTab === 'alerts'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consultant')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'consultant'
                ? `${themeConfig.accentClass.activeTab} shadow-xs font-semibold`
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Care Assistant</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Natural Clean Pet Profile Banner */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                  <img
                    src={currentPet.avatarUrl}
                    alt={currentPet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                      {currentPet.name}
                    </h1>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      · {currentPet.breed} · {currentPet.ageYears} yrs
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    Weight: {currentPet.weightKg} kg · Chip: #{currentPet.microchipId} · Collar: {currentPet.collarSerial}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Primary Vet: {currentPet.emergencyVet.clinic} ({currentPet.emergencyVet.name})
                  </p>
                </div>
              </div>

              {/* Quick Vitals Overview */}
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 p-3.5 rounded-xl flex items-center gap-4 text-xs">
                <div className="text-center px-1">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block uppercase font-mono">Heart Rate</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">{telemetry.heartRate} BPM</span>
                </div>
                <div className="w-px h-7 bg-stone-200 dark:bg-stone-700" />
                <div className="text-center px-1">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block uppercase font-mono">Body Temp</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">{telemetry.temperature.toFixed(1)}°C</span>
                </div>
                <div className="w-px h-7 bg-stone-200 dark:bg-stone-700" />
                <div className="text-center px-1">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block uppercase font-mono">Tail Wag</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">{telemetry.tailFrequency.toFixed(1)} Hz</span>
                </div>
              </div>
            </div>

            {/* Smart Collar Live Biometrics & Scenario Simulator */}
            <CollarHardwareCard
              telemetry={telemetry}
              pet={currentPet}
              onUpdateTelemetry={handleUpdateTelemetry}
              onApplyScenario={handleApplyScenario}
              onRunAiAnalysis={() => runAiAnalysis(telemetry)}
              isAiAnalyzing={isAiAnalyzing}
            />

            {/* Deep Canine Tail Kinematics & Lateralization Decoder */}
            <TailKinematicsCard
              telemetry={telemetry}
              onSimulateBias={handleSimulateTailBias}
            />

            {/* Behavioral Interpretation & Personalized Vet Tips */}
            <AiBehaviorCard
              analysis={aiAnalysis}
              pet={currentPet}
              isLoading={isAiAnalyzing}
              onRefresh={() => runAiAnalysis(telemetry)}
            />
          </div>
        )}

        {activeTab === 'records' && (
          <HealthRecordsView
            records={healthRecords.filter((r) => r.petId === currentPet.id)}
            pet={currentPet}
            onAddRecord={handleAddHealthRecord}
            onGenerateVetReport={handleGenerateVetReport}
            vetReportMarkdown={vetReportMarkdown}
            isGeneratingReport={isGeneratingReport}
          />
        )}

        {activeTab === 'vaccines' && (
          <VaccinationView
            vaccinations={vaccinations.filter((v) => v.petId === currentPet.id)}
            pet={currentPet}
            onAddVaccination={handleAddVaccination}
            onUpdateVaccination={handleUpdateVaccination}
          />
        )}

        {activeTab === 'meals' && (
          <MealRemindersView
            meals={meals.filter((m) => m.petId === currentPet.id)}
            pet={currentPet}
            waterIntakeBowls={waterIntakeBowls}
            onUpdateWaterIntake={(delta) => setWaterIntakeBowls((b) => Math.max(0, b + delta))}
            onToggleMealFed={handleToggleMealFed}
            onAddMeal={handleAddMeal}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts.filter((a) => a.petId === currentPet.id)}
            pet={currentPet}
            onMarkRead={(id) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))}
            onClearAlerts={() => setAlerts([])}
          />
        )}

        {activeTab === 'consultant' && (
          <AiConsultantView pet={currentPet} telemetry={telemetry} />
        )}
      </main>

      {/* Collar Bluetooth/Wi-Fi Pairing & Diagnostics Modal */}
      <CollarPairingModal
        isOpen={isCollarModalOpen}
        onClose={() => setIsCollarModalOpen(false)}
        telemetry={telemetry}
        pet={currentPet}
        onUpdateTelemetry={handleUpdateTelemetry}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PetConnectApp />
    </ThemeProvider>
  );
}
