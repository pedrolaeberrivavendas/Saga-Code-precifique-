import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  FileText, 
  ChefHat, 
  DollarSign, 
  Sparkles, 
  ArrowRight,
  Download,
  Upload,
  Layers,
  Printer
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { calculateRecipeFinancials, formatCurrencyBRL, formatPercent } from '../utils/calculator';
import { SagaSymbol } from './SagaLogo';

interface SavedRecipesListProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onSelectRecipe: (recipe: Recipe) => void;
  onNewRecipe: () => void;
  onDuplicateRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrintRecipe: (recipe: Recipe) => void;
}

export const SavedRecipesList: React.FC<SavedRecipesListProps> = ({
  recipes,
  ingredients,
  onSelectRecipe,
  onNewRecipe,
  onDuplicateRecipe,
  onDeleteRecipe,
  onExportJSON,
  onImportJSON,
  onPrintRecipe
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const ingredientsMap = useMemo(() => {
    return new Map<string, Ingredient>(ingredients.map(i => [i.id, i]));
  }, [ingredients]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || r.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [recipes, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      
      {/* Topo com título e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1a1c1f] p-5 rounded-2xl border border-[#2D333F]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4319] bg-[#FF4319]/10 px-2 py-0.5 rounded-full border border-[#FF4319]/25">
              Catálogo de Produtos
            </span>
            <span className="text-xs text-[#9CA3AF]">{recipes.length} produtos cadastrados</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#FF4319]" />
            Fichas Técnicas &amp; Receitas Salvas
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Histórico completo de produtos. Quando o preço de um insumo compartilhado é alterado, todos os custos são recalculados em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exportar / Importar */}
          <button
            type="button"
            onClick={onExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111317] hover:bg-[#1e2023] text-[#D1D5DB] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
            title="Exportar backup completo em JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="hidden sm:inline">Exportar Backup</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111317] hover:bg-[#1e2023] text-[#D1D5DB] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="hidden sm:inline">Importar</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={onImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            type="button"
            onClick={onNewRecipe}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF4319] hover:bg-[#e03710] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#FF4319]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Ficha Técnica
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar receita ou produto por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1c1f] border border-[#2D333F] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FF4319] transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#1a1c1f] border border-[#2D333F] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#D1D5DB] focus:outline-none focus:border-[#FF4319] transition-colors"
        >
          <option value="Todas">Todas as Categorias</option>
          <option value="Marmitas e Refeições">Marmitas e Refeições</option>
          <option value="Pizzas e Massas">Pizzas e Massas</option>
          <option value="Hambúrgueres e Lanches">Hambúrgueres e Lanches</option>
          <option value="Confeitaria e Sobremesas">Confeitaria e Sobremesas</option>
          <option value="Pães e Salgados">Pães e Salgados</option>
          <option value="Bebidas e Sucos">Bebidas e Sucos</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      {/* Cards de Receitas */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#1a1c1f] rounded-2xl border border-[#2D333F]">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center opacity-40">
            <SagaSymbol theme="dark" size={40} />
          </div>
          <h3 className="text-sm font-bold text-white">Nenhuma ficha técnica encontrada</h3>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Clique em "Nova Ficha Técnica" para criar uma receita ou ajuste os termos de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((rec) => {
            const fin = calculateRecipeFinancials(rec, ingredientsMap);

            return (
              <div
                key={rec.id}
                className="bg-[#1a1c1f] rounded-2xl p-5 border border-[#2D333F] hover:border-[#FF4319]/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#111317] text-[#9CA3AF] border border-[#2D333F]">
                      {rec.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#9CA3AF]">
                      Rende {rec.portions} {rec.portions === 1 ? 'porção' : 'porções'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-[#FF4319] transition-colors line-clamp-2">
                    {rec.name}
                  </h3>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {rec.items.length} {rec.items.length === 1 ? 'ingrediente' : 'ingredientes'} na ficha técnica
                  </p>

                  {/* Resumo de Custos e Preço */}
                  <div className="mt-4 pt-4 border-t border-[#2D333F] space-y-2 text-xs">
                    <div className="flex justify-between text-[#9CA3AF]">
                      <span>Custo Direto / Porção:</span>
                      <span className="font-mono font-medium text-white">
                        {formatCurrencyBRL(fin.totalDirectCostPerPortion)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#9CA3AF]">
                      <span>Preço Sugerido (Divisor):</span>
                      <span className="font-mono font-bold text-[#FF4319]">
                        {formatCurrencyBRL(fin.suggestedPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#2D333F]">
                      <span className="text-[#9CA3AF]">Preço no Cardápio:</span>
                      <span className="font-mono font-black text-white text-sm bg-[#111317] px-2.5 py-0.5 rounded-lg border border-[#2D333F]">
                        {formatCurrencyBRL(fin.actualSellingPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#9CA3AF] pt-0.5">
                      <span>Lucro Líquido Real:</span>
                      <span className={`font-mono font-bold ${
                        fin.actualNetProfit > 0 ? 'text-[#4edea3]' : 'text-red-400'
                      }`}>
                        {formatCurrencyBRL(fin.actualNetProfit)} ({formatPercent(fin.actualNetMargin)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[#2D333F]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicateRecipe(rec)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#111317] transition-colors cursor-pointer"
                      title="Duplicar ficha técnica"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintRecipe(rec)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#111317] transition-colors cursor-pointer"
                      title="Imprimir ficha técnica para cozinha"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FF4319]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a ficha técnica "${rec.name}"?`)) {
                          onDeleteRecipe(rec.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-[#111317] transition-colors cursor-pointer"
                      title="Excluir ficha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectRecipe(rec)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4319]/15 hover:bg-[#FF4319] text-[#FF4319] hover:text-white rounded-lg text-xs font-bold transition-all border border-[#FF4319]/30 cursor-pointer"
                  >
                    <span>Editar Ficha</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
