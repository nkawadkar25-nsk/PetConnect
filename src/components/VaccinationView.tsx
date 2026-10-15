import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  X,
} from 'lucide-react';
import { Vaccination, PetProfile, VaccineStatus } from '../types';
import { playSuccessChime } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface VaccinationViewProps {
  vaccinations: Vaccination[];
  pet: PetProfile;
  onAddVaccination: (vac: Vaccination) => void;
  onUpdateVaccination: (id: string, patch: Partial<Vaccination>) => void;
}

export const VaccinationView: React.FC<VaccinationViewProps> = ({
  vaccinations,
  pet,
  onAddVaccination,
  onUpdateVaccination,
}) => {
  const { themeConfig } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVacName, setNewVacName] = useState('');
  const [newCategory, setNewCategory] = useState<Vaccination['category']>('Core');
  const [newAdminDate, setNewAdminDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [newClinic, setNewClinic] = useState(pet.emergencyVet.clinic);
  const [newNotes, setNewNotes] = useState('');

  const statusBadges: Record<VaccineStatus, { text: string; icon: any }> = {
    'Up to Date': { text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
    'Due Soon': { text: 'text-amber-700 dark:text-amber-400', icon: Clock },
    'Overdue': { text: 'text-rose-700 dark:text-rose-400', icon: AlertCircle },
    'Scheduled': { text: 'text-stone-700 dark:text-stone-300', icon: Calendar },
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVacName.trim() || !newDueDate) return;

    const newVac: Vaccination = {
      id: `vac-${Date.now()}`,
      petId: pet.id,
      name: newVacName.trim(),
      category: newCategory,
      status: 'Up to Date',
      dateAdministered: newAdminDate || undefined,
      nextDueDate: newDueDate,
      batchNumber: newBatch.trim() || undefined,
      clinic: newClinic.trim() || undefined,
      notes: newNotes.trim() || undefined,
    };

    onAddVaccination(newVac);
    playSuccessChime();
    setIsAddModalOpen(false);
    setNewVacName('');
    setNewDueDate('');
    setNewBatch('');
    setNewNotes('');
  };

  const handleMarkBoosterAdministered = (vac: Vaccination) => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    onUpdateVaccination(vac.id, {
      status: 'Up to Date',
      dateAdministered: today.toISOString().split('T')[0],
      nextDueDate: nextYear.toISOString().split('T')[0],
    });
    playSuccessChime();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            Vaccination & Immunization Schedule
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Core & non-core immunization tracking with proactive booster reminders for {pet.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Vaccine
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-center transition-colors">
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {vaccinations.filter((v) => v.status === 'Up to Date').length}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Up to Date</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-center transition-colors">
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {vaccinations.filter((v) => v.status === 'Due Soon').length}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Due Soon</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-center transition-colors">
          <div className="text-2xl font-bold font-mono text-stone-700 dark:text-stone-300">
            {vaccinations.filter((v) => v.status === 'Scheduled').length}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Scheduled</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-center transition-colors">
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {vaccinations.filter((v) => v.status === 'Overdue').length}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Overdue</div>
        </div>
      </div>

      {/* Vaccination List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaccinations.map((vac) => {
          const badge = statusBadges[vac.status];
          const Icon = badge.icon;

          return (
            <div
              key={vac.id}
              className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {vac.category}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      {vac.name}
                    </h3>
                  </div>

                  <span className={`flex items-center gap-1 text-xs font-semibold ${badge.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {vac.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400 py-2 border-y border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Last Administered:</span>
                    <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
                      {vac.dateAdministered || 'None on record'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Next Due Date:</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {vac.nextDueDate}
                    </span>
                  </div>
                </div>

                {vac.clinic && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-2">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{vac.clinic}</span>
                    {vac.batchNumber && (
                      <span className="font-mono text-[10px] text-stone-400">· {vac.batchNumber}</span>
                    )}
                  </div>
                )}

                {vac.notes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 italic">{vac.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                {vac.status !== 'Up to Date' && (
                  <button
                    type="button"
                    onClick={() => handleMarkBoosterAdministered(vac)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${themeConfig.accentClass.btnPrimary}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Administered
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Vaccination */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Schedule Vaccine
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bordetella or Leptospirosis"
                  value={newVacName}
                  onChange={(e) => setNewVacName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  >
                    <option value="Core">Core</option>
                    <option value="Non-Core">Non-Core</option>
                    <option value="Travel / Special">Travel / Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Date Administered
                  </label>
                  <input
                    type="date"
                    value={newAdminDate}
                    onChange={(e) => setNewAdminDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Batch / Serial
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-9821"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Clinic
                </label>
                <input
                  type="text"
                  value={newClinic}
                  onChange={(e) => setNewClinic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Veterinary guidance, booster cycle..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-semibold shadow-xs ${themeConfig.accentClass.btnPrimary}`}
                >
                  Save Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
