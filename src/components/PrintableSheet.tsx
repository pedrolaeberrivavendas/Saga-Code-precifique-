import React, { useMemo } from 'react';
import { Printer, ArrowLeft, ChefHat, CheckSquare } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { calculateRecipeFinancials, formatCurrencyBRL, formatPercent } from '../utils/calculator';
import { SagaLogo } from './SagaLogo';

interface PrintableSheetProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  onClose: () => void;
}

export const PrintableSheet: React.FC<PrintableSheetProps> = ({
  recipe,
  ingredients,
  onClose,
}) => {
  const ingredientsMap = useMemo(() => {
    return new Map<string, Ingredient>(ingredients.map(i => [i.id, i]));
  }, [ingredients]);

  const fin = useMemo(() => {
    return calculateRecipeFinancials(recipe, ingredientsMap);
  }, [recipe, ingredientsMap]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      
      {/* Barra de Ação Superior (não impressa) */}
      <div className="no-print w-full max-w-4xl flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Aplicativo
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir Ficha Técnica
        </button>
      </div>

      {/* Conteúdo Imprimível */}
      <div className="w-full max-w-4xl bg-white text-neutral-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-neutral-200 print:shadow-none print:border-none print:p-0">
        
        {/* Cabeçalho Oficial */}
        <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SagaLogo theme="light" symbolSize={26} />
              <span className="text-xs uppercase font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Ficha Técnica Operacional &amp; Gerencial
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
              {recipe.name}
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Categoria: <strong>{recipe.category}</strong> • Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Rendimento do Lote:</span>
            <span className="text-xl font-extrabold text-neutral-900">
              {recipe.portions} {recipe.portions === 1 ? 'porção' : 'porções'}
            </span>
          </div>
        </div>

        {/* Informações de Pesos e Rendimento */}
        <div className="grid grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-6 text-xs">
          <div>
            <span className="text-neutral-500 block">Peso Cru Total:</span>
            <span className="font-bold font-mono text-neutral-900 text-sm">
              {recipe.rawWeightGrams ? `${recipe.rawWeightGrams} g` : 'Não informado'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block">Peso Cozido / Final:</span>
            <span className="font-bold font-mono text-neutral-900 text-sm">
              {recipe.cookedWeightGrams ? `${recipe.cookedWeightGrams} g` : 'Não informado'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block">Fator de Cocção:</span>
            <span className="font-bold font-mono text-neutral-900 text-sm">
              {fin.cookingYieldFactor ? `${fin.cookingYieldFactor}x` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Tabela de Ingredientes */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-2">
            Ingredientes do Lote
          </h2>
          <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 text-neutral-700 uppercase text-[10px] font-bold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Insumo</th>
                <th className="py-2.5 px-3 text-center">Quantidade Utilizada</th>
                <th className="py-2.5 px-3 text-center">Aproveitamento</th>
                <th className="py-2.5 px-3 text-right">Custo no Lote</th>
                <th className="py-2.5 px-3 text-right">Custo / Porção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono">
              {recipe.items.map((item) => {
                const ing = ingredientsMap.get(item.ingredientId);
                const portionCost = item.cost / Math.max(recipe.portions, 1);

                return (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-sans font-medium text-neutral-900">
                      {item.ingredientName}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {item.quantityUsed} {item.unitUsed}
                    </td>
                    <td className="py-2 px-3 text-center text-neutral-600">
                      {ing ? `${ing.yieldFactor}%` : '100%'}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-900">
                      {formatCurrencyBRL(item.cost)}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-900 font-bold">
                      {formatCurrencyBRL(portionCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-neutral-100 font-bold border-t border-neutral-200 text-neutral-900">
              <tr>
                <td colSpan={3} className="py-2 px-3 font-sans">
                  Total de Ingredientes:
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {formatCurrencyBRL(fin.totalIngredientsCost)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-orange-600">
                  {formatCurrencyBRL(fin.ingredientsCostPerPortion)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Custos Complementares e Embalagem */}
        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-6 text-xs">
          <div>
            <span className="text-neutral-500 block">Embalagem por Porção:</span>
            <span className="font-mono font-bold text-neutral-900 text-sm">
              {formatCurrencyBRL(recipe.packagingCost)}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">Outros Custos Diretos:</span>
            <span className="font-mono font-bold text-neutral-900 text-sm">
              {formatCurrencyBRL(recipe.otherDirectCosts)}
            </span>
          </div>
        </div>

        {/* Resumo Gerencial de Formação de Preço */}
        <div className="border-t-2 border-neutral-900 pt-5 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-3">
            Demonstrativo Financeiro por Porção
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <span className="text-neutral-500 block text-[10px]">Custo Direto / Porção:</span>
              <span className="font-mono font-bold text-neutral-900 text-base">
                {formatCurrencyBRL(fin.totalDirectCostPerPortion)}
              </span>
            </div>

            <div className="p-3 bg-neutral-100 rounded-lg">
              <span className="text-neutral-500 block text-[10px]">Custo Base (com Fixo):</span>
              <span className="font-mono font-bold text-neutral-900 text-base">
                {formatCurrencyBRL(fin.totalCostBasePerPortion)}
              </span>
            </div>

            <div className="p-3 bg-neutral-100 rounded-lg">
              <span className="text-neutral-500 block text-[10px]">Preço Sugerido:</span>
              <span className="font-mono font-bold text-neutral-900 text-base">
                {formatCurrencyBRL(fin.suggestedPrice)}
              </span>
            </div>

            <div className="p-3 bg-orange-100 text-orange-950 rounded-lg border border-orange-200">
              <span className="block text-[10px] font-bold">Preço de Venda Praticado:</span>
              <span className="font-mono font-extrabold text-orange-700 text-base">
                {formatCurrencyBRL(fin.actualSellingPrice)}
              </span>
              <span className="block text-[10px] text-orange-800 mt-0.5">
                Lucro Líquido: {formatCurrencyBRL(fin.actualNetProfit)} ({formatPercent(fin.actualNetMargin)})
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé da Ficha Técnica */}
        <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-500">
          <span>SAGA Code | Calculadora de Custos e Precificação</span>
          <span>Documento gerado para controle interno de produção e padronização</span>
        </div>

      </div>
    </div>
  );
};
