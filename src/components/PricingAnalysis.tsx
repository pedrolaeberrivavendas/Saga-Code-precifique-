import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sliders, 
  Building2, 
  CreditCard, 
  Bike, 
  Receipt,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Printer,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { 
  Recipe, 
  Ingredient,
  Packaging,
  PipelineStage
} from '../types';
import { 
  calculateRecipeFinancials, 
  formatCurrencyBRL, 
  formatPercent,
  roundCommercialPrice 
} from '../utils/calculator';

interface PricingAnalysisProps {
  recipe: Recipe;
  onChangeRecipe: (updated: Recipe) => void;
  ingredients: Ingredient[];
  packagings?: Packaging[];
  activeStage?: 'pricing' | 'results' | 'all';
  onNavigateStage?: (stage: PipelineStage) => void;
  onSaveRecipe: () => void;
  onPrint?: () => void;
}

export const PricingAnalysis: React.FC<PricingAnalysisProps> = ({
  recipe,
  onChangeRecipe,
  ingredients,
  packagings = [],
  activeStage = 'pricing',
  onNavigateStage,
  onSaveRecipe,
  onPrint
}) => {
  const [simulatedMonthlyVolume, setSimulatedMonthlyVolume] = useState<number>(500);
  const [activeChannelPreset, setActiveChannelPreset] = useState<'custom' | 'balcao' | 'proprio' | 'ifood'>('custom');

  const ingredientsMap = useMemo(() => {
    return new Map<string, Ingredient>(ingredients.map(i => [i.id, i]));
  }, [ingredients]);

  const packagingsMap = useMemo(() => {
    return new Map<string, Packaging>(packagings.map(p => [p.id, p]));
  }, [packagings]);

  const fin = useMemo(() => {
    return calculateRecipeFinancials(recipe, ingredientsMap, packagingsMap);
  }, [recipe, ingredientsMap, packagingsMap]);

  // Aplicar presets rápidos de canais de venda
  const handleApplyChannelPreset = (preset: 'balcao' | 'proprio' | 'ifood') => {
    setActiveChannelPreset(preset);
    if (preset === 'balcao') {
      onChangeRecipe({
        ...recipe,
        deliveryAppPercentage: 0,
        cardFeePercentage: 2.0,
        updatedAt: new Date().toISOString()
      });
    } else if (preset === 'proprio') {
      onChangeRecipe({
        ...recipe,
        deliveryAppPercentage: 4.0, // Taxa de gateway / motoboy rateado
        cardFeePercentage: 2.5,
        updatedAt: new Date().toISOString()
      });
    } else if (preset === 'ifood') {
      onChangeRecipe({
        ...recipe,
        deliveryAppPercentage: 20.0, // iFood Entrega Parceira
        cardFeePercentage: 2.8,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Premissas inválidas guard
  const totalDeductionsPercent = fin.totalTaxesAndFeesPercentage + (recipe.targetProfitMargin || 0);
  const isDeductionTooHigh = totalDeductionsPercent >= 100;

  // Cálculos do simulador de volume mensal
  const monthlyRevenue = fin.actualSellingPrice * simulatedMonthlyVolume;
  const monthlyDirectCosts = (fin.ingredientsCostPerPortion + fin.packagingCostPerPortion + fin.otherDirectCostPerPortion) * simulatedMonthlyVolume;
  const monthlyTaxesAndFees = fin.actualTotalVariableDeductions * simulatedMonthlyVolume;
  const monthlyIndirectCosts = fin.indirectCostPerPortion * simulatedMonthlyVolume;
  const monthlyNetProfit = fin.actualNetProfit * simulatedMonthlyVolume;

  // Botões de arredondamento comercial
  const handleRound = (type: 'ceil' | '90' | '99' | '50') => {
    const rounded = roundCommercialPrice(fin.suggestedPrice, type);
    onChangeRecipe({
      ...recipe,
      sellingPrice: rounded,
      updatedAt: new Date().toISOString()
    });
  };

  const isPricingView = activeStage === 'pricing' || activeStage === 'all';
  const isResultsView = activeStage === 'results' || activeStage === 'all';

  return (
    <div className="space-y-6">
      
      {/* Topo Informativo & Navegação de Etapa */}
      <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4319] bg-[#FF4319]/10 px-2 py-0.5 rounded-full border border-[#FF4319]/25">
              {isPricingView && !isResultsView && 'Etapa 5 de 6: Formação de Preço'}
              {isResultsView && !isPricingView && 'Etapa 6 de 6: Resultados & DRE'}
              {activeStage === 'all' && 'Precificação & DRE Demonstrativo'}
            </span>
            <span className="text-xs text-[#9CA3AF]">{recipe.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#FF4319]" />
            {recipe.name || 'Ficha Técnica Ativa'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Método do divisor com segregação de insumos, embalagens, despesas fixas, taxas de canais e margem líquida real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateStage && isPricingView && !isResultsView && (
            <button
              type="button"
              onClick={() => onNavigateStage('fixed-expenses')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e2023] hover:bg-[#282a2d] text-[#D1D5DB] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#9CA3AF]" />
              Despesas Fixas
            </button>
          )}

          {onNavigateStage && isResultsView && !isPricingView && (
            <button
              type="button"
              onClick={() => onNavigateStage('pricing')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e2023] hover:bg-[#282a2d] text-[#D1D5DB] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#9CA3AF]" />
              Voltar à Calculadora
            </button>
          )}

          {onNavigateStage && isPricingView && !isResultsView && (
            <button
              type="button"
              onClick={() => onNavigateStage('results')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4319] hover:bg-[#e03710] text-white text-xs font-bold shadow-lg shadow-[#FF4319]/20 transition-all cursor-pointer"
            >
              Ver Resultados &amp; DRE
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isResultsView && onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e2023] hover:bg-[#282a2d] text-white text-xs font-bold border border-[#2D333F] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FF4319]" />
              Imprimir Ficha
            </button>
          )}

          <button
            type="button"
            onClick={onSaveRecipe}
            className="px-4 py-2 rounded-xl bg-[#111317] hover:bg-[#1a1c1f] text-[#4edea3] text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
            Salvar Receita
          </button>
        </div>
      </div>

      {/* Alerta de Deduções Impossíveis (>= 100%) */}
      {isDeductionTooHigh && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-red-300 text-sm">Premissas Inviáveis (Deduções &ge; 100%)</h4>
            <p className="leading-relaxed">
              A soma de impostos ({fin.totalTaxesAndFeesPercentage.toFixed(1)}%) com a margem líquida desejada ({(recipe.targetProfitMargin || 0).toFixed(1)}%) é de <strong>{totalDeductionsPercent.toFixed(1)}%</strong>.
              No método do divisor, é impossível cobrir os custos quando as taxas absorvem 100% ou mais da receita. Reduza a margem ou as taxas do canal para calcular o preço viável.
            </p>
          </div>
        </div>
      )}

      {/* SEÇÃO 1: CALCULADORA DE PREÇO (ETAPA 5) */}
      {isPricingView && (
        <>
          {/* Premissas e Canais de Venda */}
          <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF4319]" />
                  Premissas de Venda &amp; Canais de Distribuição
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Taxas percentuais que incidem diretamente sobre o preço cobrado do cliente.
                </p>
              </div>

              {/* Atalhos Rápidos de Canais */}
              <div className="flex items-center gap-1.5 bg-[#111317] p-1 rounded-xl border border-[#2D333F] self-start sm:self-auto flex-wrap">
                <span className="text-[10px] text-[#9CA3AF] px-2 font-medium">Canal:</span>
                <button
                  type="button"
                  onClick={() => handleApplyChannelPreset('balcao')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeChannelPreset === 'balcao'
                      ? 'bg-[#FF4319] text-white shadow'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Balcão (0% App)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyChannelPreset('proprio')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeChannelPreset === 'proprio'
                      ? 'bg-[#FF4319] text-white shadow'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  WhatsApp / Próprio (4%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyChannelPreset('ifood')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeChannelPreset === 'ifood'
                      ? 'bg-[#FF4319] text-white shadow'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  iFood Entrega (20%)
                </button>
              </div>
            </div>

            {/* Inputs de Premissas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              
              {/* Impostos (Simples Nacional) */}
              <div className="p-3.5 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
                <label className="text-xs font-semibold text-[#D1D5DB] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-orange-400" />
                    Impostos (DAS / Simples)
                  </span>
                  <span className="font-mono text-[11px] text-[#9CA3AF]">
                    {formatPercent(recipe.taxPercentage || 0)}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={recipe.taxPercentage}
                  onChange={(e) => onChangeRecipe({
                    ...recipe,
                    taxPercentage: parseFloat(e.target.value) || 0,
                    updatedAt: new Date().toISOString()
                  })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
                <span className="text-[10px] text-[#6B7280] block">Ex: MEI = 0%, Simples = 4% a 8%</span>
              </div>

              {/* Taxa de Maquininha / Cartão */}
              <div className="p-3.5 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
                <label className="text-xs font-semibold text-[#D1D5DB] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    Taxa Cartão / Maquininha
                  </span>
                  <span className="font-mono text-[11px] text-[#9CA3AF]">
                    {formatPercent(recipe.cardFeePercentage || 0)}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={recipe.cardFeePercentage}
                  onChange={(e) => onChangeRecipe({
                    ...recipe,
                    cardFeePercentage: parseFloat(e.target.value) || 0,
                    updatedAt: new Date().toISOString()
                  })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
                <span className="text-[10px] text-[#6B7280] block">Débito 1.5%, Crédito 2.5% a 4%</span>
              </div>

              {/* Comissão de Aplicativo / Delivery */}
              <div className="p-3.5 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
                <label className="text-xs font-semibold text-[#D1D5DB] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-red-400" />
                    Comissão Delivery / App
                  </span>
                  <span className="font-mono text-[11px] text-[#9CA3AF]">
                    {formatPercent(recipe.deliveryAppPercentage || 0)}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={recipe.deliveryAppPercentage}
                  onChange={(e) => onChangeRecipe({
                    ...recipe,
                    deliveryAppPercentage: parseFloat(e.target.value) || 0,
                    updatedAt: new Date().toISOString()
                  })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                />
                <span className="text-[10px] text-[#6B7280] block">iFood 12% a 23%, Balcão 0%</span>
              </div>

              {/* Rateio Fixo Operacional */}
              <div className="p-3.5 rounded-xl bg-[#111317] border border-[#2D333F] space-y-1">
                <label className="text-xs font-semibold text-[#D1D5DB] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    Rateio Fixo / Porção
                  </span>
                  {onNavigateStage && (
                    <button
                      type="button"
                      onClick={() => onNavigateStage('fixed-expenses')}
                      className="text-[10px] text-[#FF4319] hover:underline cursor-pointer"
                    >
                      Calcular na Etapa 4 →
                    </button>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-[#6B7280]">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={recipe.indirectCostPerUnit}
                    onChange={(e) => onChangeRecipe({
                      ...recipe,
                      indirectCostPerUnit: parseFloat(e.target.value) || 0,
                      updatedAt: new Date().toISOString()
                    })}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1a1c1f] border border-[#2D333F] font-mono text-sm text-white focus:outline-none focus:border-[#FF4319]"
                  />
                </div>
                <span className="text-[10px] text-[#6B7280] block">Aluguel, luz, gás, pró-labore</span>
              </div>

            </div>
          </div>

          {/* Formação do Preço: Sugerido vs Praticado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Coluna 1: Preço Sugerido Científico (Método do Divisor) */}
            <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#FF4319]/10 text-[#FF4319]">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Preço de Venda Sugerido</h3>
                      <p className="text-xs text-[#9CA3AF]">Formado pelo Método do Divisor de Margem</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#4edea3] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    Markup {fin.suggestedMarkup.toFixed(2)}x
                  </span>
                </div>

                {/* Slider de Margem Líquida Desejada */}
                <div className="p-4 rounded-xl bg-[#111317] border border-[#2D333F] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#D1D5DB] flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#FF4319]" />
                      Margem Líquida Desejada no Bolso:
                    </span>
                    <span className="font-mono text-lg font-black text-[#FF4319]">
                      {formatPercent(recipe.targetProfitMargin || 0)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="65"
                    step="1"
                    value={recipe.targetProfitMargin || 25}
                    onChange={(e) => onChangeRecipe({
                      ...recipe,
                      targetProfitMargin: parseFloat(e.target.value) || 25,
                      updatedAt: new Date().toISOString()
                    })}
                    className="w-full accent-[#FF4319] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-[#6B7280]">
                    <span>10% (Baixa)</span>
                    <span>25% (Equilibrada)</span>
                    <span>40% (Alta)</span>
                    <span>55%+ (Gourmet)</span>
                  </div>
                </div>

                {/* Valor do Preço Sugerido */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#111317] to-[#FF4319]/10 border border-[#FF4319]/30">
                  <span className="text-[11px] text-[#9CA3AF] uppercase tracking-wider font-semibold block mb-1">
                    Preço de Venda Recomendado
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-white">
                    {formatCurrencyBRL(fin.suggestedPrice)}
                  </div>
                  <div className="mt-2 text-xs text-[#9CA3AF] flex items-center justify-between border-t border-[#2D333F] pt-2">
                    <span>Lucro Líquido Estimado:</span>
                    <span className="font-mono font-bold text-[#4edea3]">
                      +{formatCurrencyBRL(fin.suggestedNetProfit)} / porção
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão para aplicar Preço Sugerido ao Praticado */}
              <button
                type="button"
                onClick={() => onChangeRecipe({
                  ...recipe,
                  sellingPrice: fin.suggestedPrice,
                  updatedAt: new Date().toISOString()
                })}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1e2023] hover:bg-[#282a2d] text-white text-xs font-bold border border-[#2D333F] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Adotar Preço Sugerido Exato ({formatCurrencyBRL(fin.suggestedPrice)})
              </button>
            </div>

            {/* Coluna 2: Preço Praticado / Simulado & Arredondamentos */}
            <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Preço Real Praticado no Cardápio</h3>
                      <p className="text-xs text-[#9CA3AF]">Ajuste conforme mercado, concorrência e psicologia de preços</p>
                    </div>
                  </div>
                </div>

                {/* Input do Preço Real */}
                <div className="p-4 rounded-xl bg-[#111317] border border-[#2D333F] space-y-2">
                  <label className="text-xs font-semibold text-[#D1D5DB] block">
                    Preço Final Cobrado do Cliente:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base font-mono text-[#6B7280]">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={recipe.sellingPrice > 0 ? recipe.sellingPrice : fin.suggestedPrice}
                      onChange={(e) => onChangeRecipe({
                        ...recipe,
                        sellingPrice: parseFloat(e.target.value) || 0,
                        updatedAt: new Date().toISOString()
                      })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a1c1f] border border-[#2D333F] font-mono text-2xl font-black text-white focus:outline-none focus:border-[#FF4319]"
                    />
                  </div>
                </div>

                {/* Arredondamento Comercial */}
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-[#9CA3AF] block">
                    Arredondamentos Comerciais Rápidos:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRound('90')}
                      className="py-1.5 px-2 rounded-lg bg-[#111317] hover:bg-[#282a2d] text-white text-xs font-mono font-semibold border border-[#2D333F] transition-colors cursor-pointer text-center"
                    >
                      {formatCurrencyBRL(roundCommercialPrice(fin.suggestedPrice, '90'))}
                      <span className="block text-[9px] text-[#6B7280]">,90</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRound('99')}
                      className="py-1.5 px-2 rounded-lg bg-[#111317] hover:bg-[#282a2d] text-white text-xs font-mono font-semibold border border-[#2D333F] transition-colors cursor-pointer text-center"
                    >
                      {formatCurrencyBRL(roundCommercialPrice(fin.suggestedPrice, '99'))}
                      <span className="block text-[9px] text-[#6B7280]">,99</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRound('50')}
                      className="py-1.5 px-2 rounded-lg bg-[#111317] hover:bg-[#282a2d] text-white text-xs font-mono font-semibold border border-[#2D333F] transition-colors cursor-pointer text-center"
                    >
                      {formatCurrencyBRL(roundCommercialPrice(fin.suggestedPrice, '50'))}
                      <span className="block text-[9px] text-[#6B7280]">,50</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRound('ceil')}
                      className="py-1.5 px-2 rounded-lg bg-[#111317] hover:bg-[#282a2d] text-white text-xs font-mono font-semibold border border-[#2D333F] transition-colors cursor-pointer text-center"
                    >
                      {formatCurrencyBRL(roundCommercialPrice(fin.suggestedPrice, 'ceil'))}
                      <span className="block text-[9px] text-[#6B7280]">Inteiro</span>
                    </button>
                  </div>
                </div>

                {/* Diagnóstico da Rentabilidade Real do Preço Praticado */}
                <div className="mt-4 p-4 rounded-xl bg-[#111317] border border-[#2D333F] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Margem Líquida Real:</span>
                    <span className={`font-mono font-bold ${fin.actualNetMargin >= 15 ? 'text-[#4edea3]' : fin.actualNetMargin > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                      {formatPercent(fin.actualNetMargin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Lucro Líquido no Bolso:</span>
                    <span className={`font-mono font-bold ${fin.actualNetProfit >= 0 ? 'text-[#4edea3]' : 'text-red-400'}`}>
                      {formatCurrencyBRL(fin.actualNetProfit)} / porção
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Margem de Contribuição (Bruta):</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrencyBRL(fin.actualGrossProfit)} ({formatPercent(fin.actualGrossMargin)})
                    </span>
                  </div>
                </div>

              </div>

              {onNavigateStage && (
                <button
                  type="button"
                  onClick={() => onNavigateStage('results')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FF4319] hover:bg-[#e03710] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Ver Resultados &amp; DRE Completo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </>
      )}

      {/* SEÇÃO 2: RESULTADOS, DRE & SIMULAÇÃO MENSAL (ETAPA 6) */}
      {isResultsView && (
        <>
          {/* Bento Grid: 4 Indicadores Chave de Resultados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-[#1a1c1f] p-4 rounded-2xl border border-[#2D333F]">
              <span className="text-[11px] text-[#9CA3AF] block font-medium">Preço Praticado</span>
              <div className="font-mono text-2xl font-black text-white mt-1">
                {formatCurrencyBRL(fin.actualSellingPrice)}
              </div>
              <span className="text-[10px] text-[#6B7280] block mt-1">Markup {fin.actualMarkup.toFixed(2)}x</span>
            </div>

            <div className="bg-[#1a1c1f] p-4 rounded-2xl border border-[#2D333F]">
              <span className="text-[11px] text-[#9CA3AF] block font-medium">Custo Total / Porção</span>
              <div className="font-mono text-2xl font-bold text-neutral-300 mt-1">
                {formatCurrencyBRL(fin.totalCostBasePerPortion)}
              </div>
              <span className="text-[10px] text-[#6B7280] block mt-1">Direto + Fixo</span>
            </div>

            <div className="bg-[#1a1c1f] p-4 rounded-2xl border border-[#2D333F]">
              <span className="text-[11px] text-[#9CA3AF] block font-medium">Margem de Contribuição</span>
              <div className="font-mono text-2xl font-bold text-blue-400 mt-1">
                {formatCurrencyBRL(fin.actualGrossProfit)}
              </div>
              <span className="text-[10px] text-[#6B7280] block mt-1">{formatPercent(fin.actualGrossMargin)} do preço</span>
            </div>

            <div className={`p-4 rounded-2xl border ${fin.actualNetProfit >= 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
              <span className={`text-[11px] block font-bold ${fin.actualNetProfit >= 0 ? 'text-[#4edea3]' : 'text-red-400'}`}>
                Lucro Líquido Real
              </span>
              <div className={`font-mono text-2xl font-black mt-1 ${fin.actualNetProfit >= 0 ? 'text-[#4edea3]' : 'text-red-400'}`}>
                {formatCurrencyBRL(fin.actualNetProfit)}
              </div>
              <span className={`text-[10px] block mt-1 ${fin.actualNetProfit >= 0 ? 'text-[#4edea3]/80' : 'text-red-400/80'}`}>
                {formatPercent(fin.actualNetMargin)} de margem real
              </span>
            </div>

          </div>

          {/* Gráfico Visual de Composição do Preço de Venda */}
          <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF4319]" />
                Composição do Preço de Venda ({formatCurrencyBRL(fin.actualSellingPrice)})
              </h3>
              <span className="text-xs text-[#9CA3AF]">Para onde vai cada centavo cobrado</span>
            </div>

            {fin.actualSellingPrice > 0 && (
              <div className="space-y-2">
                <div className="w-full h-7 rounded-xl overflow-hidden flex text-[10px] font-mono font-bold text-white shadow-inner">
                  {/* Insumos */}
                  <div
                    style={{ width: `${Math.max(1, (fin.ingredientsCostPerPortion / fin.actualSellingPrice) * 100)}%` }}
                    className="bg-orange-600 flex items-center justify-center px-1 overflow-hidden"
                    title={`Insumos: ${formatCurrencyBRL(fin.ingredientsCostPerPortion)}`}
                  >
                    Insumos
                  </div>
                  {/* Embalagens */}
                  <div
                    style={{ width: `${Math.max(1, (fin.packagingCostPerPortion / fin.actualSellingPrice) * 100)}%` }}
                    className="bg-amber-600 flex items-center justify-center px-1 overflow-hidden"
                    title={`Embalagens: ${formatCurrencyBRL(fin.packagingCostPerPortion)}`}
                  >
                    Emb.
                  </div>
                  {/* Despesas Fixas */}
                  <div
                    style={{ width: `${Math.max(1, (fin.indirectCostPerPortion / fin.actualSellingPrice) * 100)}%` }}
                    className="bg-purple-600 flex items-center justify-center px-1 overflow-hidden"
                    title={`Fixo: ${formatCurrencyBRL(fin.indirectCostPerPortion)}`}
                  >
                    Fixo
                  </div>
                  {/* Taxas & Impostos */}
                  <div
                    style={{ width: `${Math.max(1, (fin.actualTotalVariableDeductions / fin.actualSellingPrice) * 100)}%` }}
                    className="bg-red-600 flex items-center justify-center px-1 overflow-hidden"
                    title={`Taxas: ${formatCurrencyBRL(fin.actualTotalVariableDeductions)}`}
                  >
                    Taxas
                  </div>
                  {/* Lucro Líquido */}
                  <div
                    style={{ width: `${Math.max(1, (Math.max(0, fin.actualNetProfit) / fin.actualSellingPrice) * 100)}%` }}
                    className="bg-emerald-600 flex items-center justify-center px-1 overflow-hidden"
                    title={`Lucro Líquido: ${formatCurrencyBRL(fin.actualNetProfit)}`}
                  >
                    Lucro
                  </div>
                </div>

                {/* Legenda com Valores */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 text-[#D1D5DB]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                    <span>Insumos: <strong>{formatCurrencyBRL(fin.ingredientsCostPerPortion)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>Embalagens: <strong>{formatCurrencyBRL(fin.packagingCostPerPortion)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>Rateio Fixo: <strong>{formatCurrencyBRL(fin.indirectCostPerPortion)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span>Taxas &amp; Impostos: <strong>{formatCurrencyBRL(fin.actualTotalVariableDeductions)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Lucro Líquido: <strong>{formatCurrencyBRL(fin.actualNetProfit)}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DRE Completo & Transparente */}
          <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#FF4319]" />
                  Demonstrativo de Resultado do Exercício (DRE) Unitário
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Metodologia contábil padrão: Receita Bruta &minus; Deduções &minus; Custos Diretos = Margem de Contribuição &minus; Custos Fixos = Lucro Líquido Real.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2D333F] text-[#9CA3AF]">
                    <th className="py-2.5 px-3 font-semibold">Linha do Demonstrativo</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Valor Unitário</th>
                    <th className="py-2.5 px-3 text-right font-semibold">% s/ Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D333F]/50 font-mono">
                  
                  <tr className="bg-[#111317]/50 font-bold text-white">
                    <td className="py-3 px-3">(=) Receita Bruta (Preço Praticado)</td>
                    <td className="py-3 px-3 text-right">{formatCurrencyBRL(fin.actualSellingPrice)}</td>
                    <td className="py-3 px-3 text-right">100,0%</td>
                  </tr>

                  {/* Deduções Variáveis */}
                  <tr className="text-red-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Impostos sobre a Venda</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.actualTaxesValue)}</td>
                    <td className="py-2 px-3 text-right">{formatPercent(recipe.taxPercentage || 0)}</td>
                  </tr>
                  <tr className="text-red-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Taxas de Cartão / Maquininha</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.actualCardFeeValue)}</td>
                    <td className="py-2 px-3 text-right">{formatPercent(recipe.cardFeePercentage || 0)}</td>
                  </tr>
                  <tr className="text-red-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Comissão de Aplicativo / Delivery</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.actualDeliveryAppValue)}</td>
                    <td className="py-2 px-3 text-right">{formatPercent(recipe.deliveryAppPercentage || 0)}</td>
                  </tr>

                  {/* Custos Diretos de Produção */}
                  <tr className="text-orange-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Custo de Insumos &amp; Ingredientes</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.ingredientsCostPerPortion)}</td>
                    <td className="py-2 px-3 text-right">
                      {fin.actualSellingPrice > 0 ? formatPercent((fin.ingredientsCostPerPortion / fin.actualSellingPrice) * 100) : '0%'}
                    </td>
                  </tr>
                  <tr className="text-amber-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Custo de Embalagens &amp; Descartáveis</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.packagingCostPerPortion)}</td>
                    <td className="py-2 px-3 text-right">
                      {fin.actualSellingPrice > 0 ? formatPercent((fin.packagingCostPerPortion / fin.actualSellingPrice) * 100) : '0%'}
                    </td>
                  </tr>

                  {/* Margem de Contribuição */}
                  <tr className="bg-[#111317] font-bold text-blue-400">
                    <td className="py-3 px-3">(=) Margem de Contribuição Bruta</td>
                    <td className="py-3 px-3 text-right">{formatCurrencyBRL(fin.actualGrossProfit)}</td>
                    <td className="py-3 px-3 text-right">{formatPercent(fin.actualGrossMargin)}</td>
                  </tr>

                  {/* Despesas Fixas */}
                  <tr className="text-purple-400">
                    <td className="py-2 px-3 pl-6">(&minus;) Rateio de Despesas Fixas Operacionais</td>
                    <td className="py-2 px-3 text-right">&minus;{formatCurrencyBRL(fin.indirectCostPerPortion)}</td>
                    <td className="py-2 px-3 text-right">
                      {fin.actualSellingPrice > 0 ? formatPercent((fin.indirectCostPerPortion / fin.actualSellingPrice) * 100) : '0%'}
                    </td>
                  </tr>

                  {/* Lucro Líquido Real */}
                  <tr className={`font-black ${fin.actualNetProfit >= 0 ? 'bg-emerald-950/40 text-[#4edea3]' : 'bg-red-950/40 text-red-400'}`}>
                    <td className="py-3.5 px-3 text-sm">(=) Lucro Líquido Real no Bolso</td>
                    <td className="py-3.5 px-3 text-right text-sm">{formatCurrencyBRL(fin.actualNetProfit)}</td>
                    <td className="py-3.5 px-3 text-right text-sm">{formatPercent(fin.actualNetMargin)}</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Simulador de Faturamento e Lucro Mensal */}
          <div className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF4319]" />
                  Simulação de Impacto Mensal deste Produto
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Quantas porções você estima vender por mês no seu negócio?
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-[#9CA3AF]">Meta mensal:</span>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={simulatedMonthlyVolume}
                  onChange={(e) => setSimulatedMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-[#111317] border border-[#2D333F] rounded-lg px-2.5 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-[#FF4319]"
                />
                <span className="text-xs text-[#9CA3AF]">un / mês</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-[#111317] p-3.5 rounded-xl border border-[#2D333F]">
                <span className="text-[#9CA3AF] block text-[10px]">Faturamento Bruto:</span>
                <span className="font-mono font-bold text-white text-base">
                  {formatCurrencyBRL(monthlyRevenue)}
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">{simulatedMonthlyVolume} vendas</span>
              </div>

              <div className="bg-[#111317] p-3.5 rounded-xl border border-[#2D333F]">
                <span className="text-[#9CA3AF] block text-[10px]">Custos de Produção:</span>
                <span className="font-mono font-bold text-neutral-300 text-base">
                  {formatCurrencyBRL(monthlyDirectCosts)}
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Insumos + Embalagens</span>
              </div>

              <div className="bg-[#111317] p-3.5 rounded-xl border border-[#2D333F]">
                <span className="text-[#9CA3AF] block text-[10px]">Taxas &amp; Despesas Fixas:</span>
                <span className="font-mono font-bold text-red-400 text-base">
                  {formatCurrencyBRL(monthlyTaxesAndFees + monthlyIndirectCosts)}
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Deduções operacionais</span>
              </div>

              <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/30">
                <span className="text-[#4edea3] block text-[10px] font-bold">Lucro Líquido Mensal:</span>
                <span className="font-mono font-black text-[#4edea3] text-base">
                  {formatCurrencyBRL(monthlyNetProfit)}
                </span>
                <span className="text-[10px] text-[#4edea3]/80 block mt-0.5">Sobra líquida no bolso</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
