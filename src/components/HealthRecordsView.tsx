import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Building,
  Pill,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import { HealthRecord, PetProfile } from '../types';
import { playSuccessChime } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface HealthRecordsViewProps {
  records: HealthRecord[];
  pet: PetProfile;
  onAddRecord: (record: HealthRecord) => void;
  onGenerateVetReport: () => void;
  vetReportMarkdown: string | null;
  isGeneratingReport: boolean;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  pet,
  onAddRecord,
  onGenerateVetReport,
  vetReportMarkdown,
  isGeneratingReport,
}) => {
  const { themeConfig } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // New Record Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HealthRecord['category']>('Wellness Exam');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClinic, setNewClinic] = useState(pet.emergencyVet.clinic);
  const [newDoctor, setNewDoctor] = useState(pet.emergencyVet.name);
  const [newNotes, setNewNotes] = useState('');
  const [newPrescription, setNewPrescription] = useState('');
  const [newWeight, setNewWeight] = useState(pet.weightKg.toString());

  const categories = ['All', 'Wellness Exam', 'Diagnostics', 'Dental', 'Prescription', 'Surgery / Procedure', 'Emergency'];

  const filteredRecords = records.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vetClinic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const record: HealthRecord = {
      id: `hr-${Date.now()}`,
      petId: pet.id,
      date: newDate,
      title: newTitle.trim(),
      category: newCategory,
      vetClinic: newClinic.trim() || 'Veterinary Clinic',
      vetDoctor: newDoctor.trim() || 'Attending Vet',
      notes: newNotes.trim(),
      prescription: newPrescription.trim() || undefined,
      weightAtTime: parseFloat(newWeight) || pet.weightKg,
    };

    onAddRecord(record);
    playSuccessChime();
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    setNewPrescription('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            Medical History & Records
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Verified veterinary visits, diagnostics, and prescriptions for {pet.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* One-Tap Share Vet Report */}
          <button
            type="button"
            onClick={() => {
              onGenerateVetReport();
              setShowReportModal(true);
            }}
            disabled={isGeneratingReport}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${themeConfig.accentClass.btnPrimary}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGeneratingReport ? 'Compiling Report...' : 'Generate Clinical Report'}
          </button>

          {/* Add New Record Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Visit
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, medications, diagnostics, clinics..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? `${themeConfig.accentClass.activeTab} shadow-xs`
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Record Cards */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-10 border border-stone-200 dark:border-stone-800 text-center transition-colors">
            <FileText className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
              No medical records found
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Try adjusting your search query or log a new health encounter.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {record.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {record.date}
                    </span>
                    {record.weightAtTime && (
                      <>
                        <span>·</span>
                        <span className="font-mono">Weight: {record.weightAtTime} kg</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                    {record.title}
                  </h3>
                </div>

                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                    <Building className="w-3.5 h-3.5 text-stone-400" />
                    {record.vetClinic}
                  </div>
                  <div className="flex items-center gap-1 justify-end text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    <User className="w-3 h-3 text-stone-400" />
                    {record.vetDoctor}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                {record.notes}
              </p>

              {/* Prescription if any */}
              {record.prescription && (
                <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 font-medium">
                  <Pill className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>Prescription: {record.prescription}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Log New Health Record */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Log Medical Encounter
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Encounter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Wellness Examination & Blood Panel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-stone-400/20"
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
                    <option value="Wellness Exam">Wellness Exam</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Dental">Dental</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Surgery / Procedure">Surgery / Procedure</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Veterinary Clinic
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
                    Attending Vet
                  </label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Prescription (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin 250mg"
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Doctor Notes & Observations
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical assessment, observations, next checkup timeline..."
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Comprehensive Vet Clinical Report View */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Veterinary Telemetry & Health Dossier
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
              {isGeneratingReport ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-stone-300 dark:border-stone-600 border-t-stone-800 dark:border-t-white rounded-full animate-spin mx-auto" />
                  <p className="text-stone-500 dark:text-stone-400 font-medium">
                    Compiling collar telemetry, health history, and tail kinematics...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-mono bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200">
                  {vetReportMarkdown || 'No report generated yet.'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 rounded-b-2xl flex justify-between items-center text-xs">
              <span className="text-stone-500 dark:text-stone-400">
                Official clinical export format
              </span>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
