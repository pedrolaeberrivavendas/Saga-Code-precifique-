import React from 'react';
import { PipelineStage } from './Header';
import { Check } from 'lucide-react';

interface PipelineStepperProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  ingredientsCount: number;
  packagingsCount: number;
  hasRecipeItems: boolean;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStage,
  onSelectStage,
  ingredientsCount,
  packagingsCount,
  hasRecipeItems
}) => {
  if (currentStage === 'saved') {
    return null;
  }

  const steps: { stage: PipelineStage; stepNum: number; label: string; isReady: boolean }[] = [
    { stage: 'ingredients', stepNum: 1, label: '1. Ingredientes', isReady: ingredientsCount > 0 },
    { stage: 'packagings', stepNum: 2, label: '2. Embalagens', isReady: packagingsCount > 0 },
    { stage: 'recipe', stepNum: 3, label: '3. Ficha Técnica', isReady: hasRecipeItems },
    { stage: 'fixed-expenses', stepNum: 4, label: '4. Despesas Fixas', isReady: true },
    { stage: 'pricing', stepNum: 5, label: '5. Calculadora', isReady: true },
    { stage: 'results', stepNum: 6, label: '6. Resultados', isReady: true },
  ];

  return (
    <section className="w-full bg-[#1a1c1f] p-3 sm:p-4 rounded-xl shadow-md border border-[#2D333F]">
      <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold no-scrollbar">
        {steps.map((step, idx) => {
          const isActive = currentStage === step.stage;

          return (
            <React.Fragment key={step.stage}>
              {idx > 0 && (
                <span className="text-[#6B7280] select-none font-bold text-xs shrink-0">→</span>
              )}

              <button
                type="button"
                onClick={() => onSelectStage(step.stage)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FF4319]/15 text-white border border-[#FF4319]/40 shadow-sm font-bold'
                    : step.isReady
                    ? 'bg-[#1e2023] text-[#4edea3] hover:bg-[#282a2d] hover:text-white'
                    : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1e2023]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  isActive
                    ? 'bg-[#FF4319] text-white'
                    : step.isReady
                    ? 'bg-[#4edea3]/15 text-[#4edea3]'
                    : 'bg-[#333538] text-[#6B7280]'
                }`}>
                  {step.isReady && !isActive ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    step.stepNum
                  )}
                </span>
                
                <span className={isActive ? 'text-white font-bold' : 'text-[#F8F9FA]'}>
                  {step.label}
                </span>

                {isActive && (
                  <span className="text-[#FF4319] text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#FF4319]/20 rounded hidden sm:inline">
                    Etapa Atual
                  </span>
                )}
                {!isActive && step.isReady && (
                  <span className="text-[#4edea3] text-[10px] uppercase tracking-wider hidden md:inline font-bold">
                    (Pronto)
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
