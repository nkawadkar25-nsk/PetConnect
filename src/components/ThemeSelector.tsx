import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme, ACCENT_PALETTES, AccentColor } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { mode, accent, setMode, setAccent, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
        {/* Quick Mode Toggle */}
        <button
          type="button"
          onClick={toggleMode}
          className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
          title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
        >
          {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>

        {/* Palette Selector Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Customize Theme Colors"
          aria-label="Customize accent colors"
        >
          <Palette className="w-4 h-4" />
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/20"
            style={{ backgroundColor: ACCENT_PALETTES[accent].primaryHex }}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700/80 p-3 z-50 animate-scale-up space-y-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500 block mb-2 px-1">
              Appearance Mode
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  mode === 'light'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  mode === 'dark'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500 block mb-2 px-1">
              Accent Palette
            </span>
            <div className="space-y-1">
              {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((paletteKey) => {
                const p = ACCENT_PALETTES[paletteKey];
                const isSelected = accent === paletteKey;

                return (
                  <button
                    key={paletteKey}
                    type="button"
                    onClick={() => {
                      setAccent(paletteKey);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-white'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                        style={{ backgroundColor: p.primaryHex }}
                      />
                      <span>{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 dark:text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
