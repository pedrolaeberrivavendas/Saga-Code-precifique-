import React, { useMemo } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { runFinancialAuditTests } from '../utils/testSuite';
import { SagaLogo } from './SagaLogo';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  const testResults = useMemo(() => runFinancialAuditTests(), [isOpen]);
  const allPassed = testResults.every(t => t.passed);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1c1f] border border-[#2D333F] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D333F] bg-[#111317]">
          <div className="flex items-center gap-4">
            <SagaLogo theme="dark" symbolSize={28} />
            <div className="h-6 w-px bg-[#2D333F]"></div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Auditoria dos 13 Cálculos Financeiros
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  allPassed 
                    ? 'bg-emerald-950/80 text-[#4edea3] border-emerald-500/40' 
                    : 'bg-red-950/80 text-red-400 border-red-500/40'
                }`}>
                  {allPassed ? '13 de 13 Aprovados' : 'Falhas Detectadas'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Verificação rigorosa das fórmulas financeiras, fatores de rendimento e conversão de unidades.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Testes */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/60 text-xs text-neutral-300 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">Metodologia de Cálculo SAGA Code</p>
              <p className="leading-relaxed">
                Todas as regras abaixo são executadas matematicamente pelo motor financeiro. 
                Nenhum valor é estático ou decorativo. A calculadora separa rigorosamente o Custo das Mercadorias Vendidas (CPV), 
                custos diretos de embalagem, rateio de custos fixos, deduções tributárias, taxas de intermediação de delivery e margem líquida real.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.map((test, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {test.category}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold ${
                      test.passed ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {test.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Aprovado
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" /> Reprovado
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1">{test.title}</h3>
                  <p className="text-xs text-neutral-400 mb-3">{test.description}</p>

                  {/* Entradas */}
                  <div className="bg-neutral-900/90 rounded-lg p-2.5 text-xs border border-neutral-800/80 mb-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                      Parâmetros Testados:
                    </span>
                    {Object.entries(test.inputs).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-neutral-300">
                        <span className="text-neutral-400">{k}:</span>
                        <span className="font-mono font-medium text-neutral-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Saída esperada vs obtida */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-2 bg-neutral-900 rounded border border-neutral-800 mb-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Esperado:</span>
                      <span className="font-mono text-neutral-300">{test.expectedOutput}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Calculado:</span>
                      <span className="font-mono font-bold text-orange-400">{test.actualOutput}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 italic">
                    {test.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
          >
            Fechar Auditoria
          </button>
        </div>

      </div>
    </div>
  );
};
