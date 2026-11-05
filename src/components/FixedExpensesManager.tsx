import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Flame, 
  Zap, 
  Droplets, 
  UserCheck, 
  Wifi, 
  FileText, 
  Wrench, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Recipe } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';

interface FixedExpensesManagerProps {
  recipe: Recipe;
  onChangeRecipe: (recipe: Recipe) => void;
  onGoToNextStage: () => void;
  onGoToPrevStage: () => void;
}

export const FixedExpensesManager: React.FC<FixedExpensesManagerProps> = ({
  recipe,
  onChangeRecipe,
  onGoToNextStage,
  onGoToPrevStage
}) => {
  // Despesas Fixas Mensais Detalhadas
  const [rent, setRent] = useState<number>(1200);
  const [electricity, setElectricity] = useState<number>(380);
  const [water, setWater] = useState<number>(120);
  const [gas, setGas] = useState<number>(260);
  const [labor, setLabor] = useState<number>(2200); // Pró-labore ou ajudante
  const [internet, setInternet] = useState<number>(120);
  const [accounting, setAccounting] = useState<number>(150); // DAS MEI ou contador
  const [maintenance, setMaintenance] = useState<number>(170);

  // Volume Mensal Estimado
  const [monthlyVolume, setMonthlyVolume] = useState<number>(1200); // Ex: 1.200 marmitas ou pratos/mês

  // Soma de todas as despesas fixas
  const totalMonthlyExpenses = useMemo(() => {
    return (
      (rent || 0) +
      (electricity || 0) +
      (water || 0) +
      (gas || 0) +
      (labor || 0) +
      (internet || 0) +
      (accounting || 0) +
      (maintenance || 0)
    );
  }, [rent, electricity, water, gas, labor, internet, accounting, maintenance]);

  // Rateio unitário calculado
  const calculatedApportionment = useMemo(() => {
    if (monthlyVolume <= 0) return 0;
    return Number((totalMonthlyExpenses / monthlyVolume).toFixed(2));
  }, [totalMonthlyExpenses, monthlyVolume]);

  const isAppliedToRecipe = Math.abs((recipe.indirectCostPerUnit || 0) - calculatedApportionment) < 0.02;

  const handleApplyToRecipe = () => {
    onChangeRecipe({
      ...recipe,
      indirectCostPerUnit: calculatedApportionment,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header da Etapa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1a1c1f] border border-[#2D333F]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4319] bg-[#FF4319]/10 px-2 py-0.5 rounded-full border border-[#FF4319]/25">
              Etapa 4 de 6
            </span>
            <span className="text-xs text-[#9CA3AF]">Rateio Científico Operacional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#FF4319]" />
            Despesas Fixas &amp; Rateio de Produção
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Descubra quanto cada marmita ou porção vendida precisa pagar do aluguel, luz, gás e pró-labore para seu negócio nunca fechar no vermelho.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToPrevStage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e2023] hover:bg-[#282a2d] text-[#D1D5DB] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#9CA3AF]" />
            Ficha Técnica
          </button>
          <button
            type="button"
            onClick={onGoToNextStage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4319] hover:bg-[#e03710] text-white text-xs font-bold shadow-lg shadow-[#FF4319]/20 transition-all cursor-pointer"
          >
            Calculadora de Preço
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid: 3 Cartões de Resumo Operacional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Despesas Mensais */}
        <div className="bg-[#1a1c1f] p-5 rounded-2xl border border-[#2D333F] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9CA3AF]">Total Despesas Fixas / Mês</span>
            <span className="p-2 rounded-lg bg-[#FF4319]/10 text-[#FF4319]">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrencyBRL(totalMonthlyExpenses)}
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Custos para manter as portas abertas todo mês
            </p>
          </div>
        </div>

        {/* Card 2: Volume de Produção */}
        <div className="bg-[#1a1c1f] p-5 rounded-2xl border border-[#2D333F] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9CA3AF]">Volume Mensal Estimado</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min="1"
                step="50"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 font-mono text-2xl sm:text-3xl font-extrabold text-white bg-[#111317] border border-[#2D333F] rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#FF4319]"
              />
              <span className="text-xs font-semibold text-[#9CA3AF]">porções / mês</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Capacidade produtiva real estimada
            </p>
          </div>
        </div>

        {/* Card 3: Rateio Unitário por Porção */}
        <div className="bg-[#1a1c1f] p-5 rounded-2xl border border-[#FF4319]/40 bg-gradient-to-br from-[#1a1c1f] to-[#FF4319]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#FF4319]">Rateio Fixo por Porção</span>
            <span className="p-2 rounded-lg bg-[#FF4319] text-white">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-white">
              {formatCurrencyBRL(calculatedApportionment)}
              <span className="text-xs font-normal text-[#9CA3AF] ml-1">/ porção</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleApplyToRecipe}
                disabled={isAppliedToRecipe}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAppliedToRecipe
                    ? 'bg-emerald-500/15 text-[#4edea3] border border-emerald-500/30'
                    : 'bg-[#FF4319] hover:bg-[#e03710] text-white shadow'
                }`}
              >
                {isAppliedToRecipe ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aplicado à Receita
                  </>
                ) : (
                  <>
                    Aplicar à Receita ({recipe.name})
                  </>
                )}
              </button>
              <span className="text-[10px] text-[#9CA3AF]">
                Atual na receita: {formatCurrencyBRL(recipe.indirectCostPerUnit || 0)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid de Edição das Despesas Fixas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Custos Mensais (Span 2) */}
        <div className="lg:col-span-2 bg-[#1a1c1f] p-5 rounded-2xl border border-[#2D333F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FF4319]" />
              Detalhamento dos Gastos Operacionais Mensais
            </h3>
            <span className="text-xs text-[#9CA3AF]">Valores em R$ / mês</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Aluguel */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-orange-400" />
                Aluguel do Espaço / Cozinha
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={rent}
                  onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Energia Elétrica */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Energia Elétrica (Freezers, Fornos, Luz)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="20"
                  value={electricity}
                  onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Água e Esgoto */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Água &amp; Saneamento
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={water}
                  onChange={(e) => setWater(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Gás de Cozinha */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#FF4319]" />
                Gás de Cozinha (Botijões / Encanado)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="20"
                  value={gas}
                  onChange={(e) => setGas(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Pró-labore e Mão de Obra */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pró-labore do Empreendedor &amp; Equipe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={labor}
                  onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Internet & Sistemas */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                Internet, Celular &amp; Softwares
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={internet}
                  onChange={(e) => setInternet(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Contabilidade & Impostos Fixos */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Contabilidade &amp; Taxas Fixas (MEI / DAS)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={accounting}
                  onChange={(e) => setAccounting(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

            {/* Manutenção e Reservas */}
            <div className="p-3 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
              <label className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-pink-400" />
                Manutenção de Equipamentos &amp; Reserva
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                <input
                  type="number"
                  min="0"
                  step="20"
                  value={maintenance}
                  onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Painel Lateral: Inteligência SAGA Code & Alertas */}
        <div className="bg-[#1a1c1f] p-5 rounded-2xl border border-[#2D333F] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF4319]/15 flex items-center justify-center text-[#FF4319]">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Inteligência SAGA Code
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111317] border border-[#2D333F] text-xs text-[#D1D5DB] space-y-2">
              <p className="font-semibold text-white">
                Como funciona o rateio de custos fixos?
              </p>
              <p className="text-[#9CA3AF] leading-relaxed">
                As despesas fixas existem mesmo se você não vender nada. Para não ter prejuízo, dividimos esse total pela sua estimativa de porções vendidas no mês.
              </p>
              <div className="pt-2 border-t border-[#2D333F] font-mono text-[11px] text-[#4edea3]">
                Rateio = R$ {totalMonthlyExpenses.toLocaleString('pt-BR')} / {monthlyVolume} un = R$ {calculatedApportionment.toFixed(2)}/un
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Cuidado com Custos Duplicados
              </div>
              <p className="text-[11px] leading-relaxed text-amber-300/80">
                Se você já incluiu o custo de gás ou energia como item direto na Ficha Técnica da receita, zere o valor correspondente aqui para não inflacionar o preço de venda.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2D333F]">
            <button
              type="button"
              onClick={handleApplyToRecipe}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF4319] hover:bg-[#e03710] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aplicar {formatCurrencyBRL(calculatedApportionment)} na Receita
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
