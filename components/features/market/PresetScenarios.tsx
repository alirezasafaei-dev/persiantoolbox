'use client';

import { useState, useCallback, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';

interface Scenario {
  id: string;
  name: string;
  description: string;
  amount: number;
  months: number;
  investmentType: 'savings' | 'gold' | 'dollar' | 'euro';
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'short-term-savings',
    name: 'سرمایه‌گذاری کوتاه‌مدت',
    description: '۶ ماه سپرده بانکی با سود ثابت',
    amount: 50000000,
    months: 6,
    investmentType: 'savings',
  },
  {
    id: 'medium-term-gold',
    name: 'سرمایه‌گذاری میان‌مدت طلا',
    description: '۱۲ ماه سرمایه‌گذاری در طلا',
    amount: 100000000,
    months: 12,
    investmentType: 'gold',
  },
  {
    id: 'long-term-diversified',
    name: 'سرمایه‌گذاری بلندمدت متنوع',
    description: '۲۴ ماه ترکیبی از طلا و دلار',
    amount: 200000000,
    months: 24,
    investmentType: 'gold',
  },
  {
    id: 'retirement-plan',
    name: 'برنامه بازنشستگی',
    description: '۶۰ ماه سپرده بانکی برای بازنشستگی',
    amount: 500000000,
    months: 60,
    investmentType: 'savings',
  },
];

interface SavedScenario extends Scenario {
  savedAt: number;
}

const STORAGE_KEY = 'persian-toolbox-market-scenarios';

function loadSavedScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveScenarios(scenarios: SavedScenario[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // localStorage not available
  }
}

export default function PresetScenarios() {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    setSavedScenarios(loadSavedScenarios());
  }, []);

  const handleSelectPreset = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCustomName(scenario.name);
  }, []);

  const handleSaveCustom = useCallback(() => {
    if (!selectedScenario || !customName.trim()) {
      return;
    }

    const saved: SavedScenario = {
      ...selectedScenario,
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      savedAt: Date.now(),
    };

    const updated = [...savedScenarios, saved];
    setSavedScenarios(updated);
    saveScenarios(updated);
    setSelectedScenario(null);
    setCustomName('');
  }, [selectedScenario, customName, savedScenarios]);

  const handleDeleteSaved = useCallback(
    (id: string) => {
      const updated = savedScenarios.filter((s) => s.id !== id);
      setSavedScenarios(updated);
      saveScenarios(updated);
    },
    [savedScenarios],
  );

  const handleApplyScenario = useCallback((scenario: Scenario) => {
    // Store scenario in URL for the simulator to pick up
    const params = new URLSearchParams({
      amount: String(scenario.amount),
      months: String(scenario.months),
      type: scenario.investmentType,
    });
    window.location.href = `/market?${params.toString()}`;
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)]">سناریوهای آماده</h3>
      <p className="text-sm text-[var(--text-muted)]">
        سناریوهای از پیش تعریف‌شده سرمایه‌گذاری را انتخاب کنید یا سناریوی خود را ذخیره کنید.
      </p>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedScenario?.id === scenario.id
                ? 'border-[var(--color-primary)] bg-[var(--surface-2)]'
                : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
            }`}
            onClick={() => handleSelectPreset(scenario)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSelectPreset(scenario);
              }
            }}
          >
            <div className="font-medium text-[var(--text-primary)]">{scenario.name}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{scenario.description}</div>
            <div className="flex gap-2 mt-2 text-xs text-[var(--text-muted)]">
              <span>{new Intl.NumberFormat('fa-IR').format(scenario.amount)} تومان</span>
              <span>•</span>
              <span>{scenario.months} ماه</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Scenario Actions */}
      {selectedScenario ? (
        <div className="p-4 bg-[var(--surface-2)] rounded-lg space-y-3">
          <div className="font-medium text-[var(--text-primary)]">
            سناریوی انتخاب شده: {selectedScenario.name}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleApplyScenario(selectedScenario)} size="sm">
              اعمال در شبیه‌ساز
            </Button>
            <Button onClick={() => setSelectedScenario(null)} variant="secondary" size="sm">
              لغو
            </Button>
          </div>
        </div>
      ) : null}

      {/* Save Custom Scenario */}
      {selectedScenario ? (
        <div className="p-4 border border-[var(--border-light)] rounded-lg space-y-3">
          <div className="font-medium text-[var(--text-primary)] text-sm">ذخیره سناریوی سفارشی</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="نام سناریو"
              aria-label="نام سناریو"
              className="flex-1 px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]"
            />
            <Button onClick={handleSaveCustom} size="sm" disabled={!customName.trim()}>
              ذخیره
            </Button>
          </div>
        </div>
      ) : null}

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <div className="space-y-3">
          <div className="font-medium text-[var(--text-primary)] text-sm">سناریوهای ذخیره شده</div>
          <div className="space-y-2">
            {savedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 border border-[var(--border-light)] rounded-lg"
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)] text-sm">
                    {scenario.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {new Intl.NumberFormat('fa-IR').format(scenario.amount)} تومان •{' '}
                    {scenario.months} ماه
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApplyScenario(scenario)}
                    size="sm"
                    variant="secondary"
                  >
                    اعمال
                  </Button>
                  <Button
                    onClick={() => handleDeleteSaved(scenario.id)}
                    size="sm"
                    variant="tertiary"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
