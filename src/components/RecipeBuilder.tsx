import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ChefHat, 
  Scale, 
  Flame, 
  Package, 
  ArrowRight, 
  ArrowLeft,
  Save, 
  FileText, 
  Sparkles,
  Info,
  Layers,
  Percent,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  Recipe, 
  Ingredient, 
  Packaging,
  RecipeItem, 
  RecipePackagingItem,
  MeasurementUnit, 
  RecipeCategory 
} from '../types';
import { 
  calculateItemCost, 
  formatCurrencyBRL, 
  calculateRecipeFinancials,
  convertToBaseUnit
} from '../utils/calculator';

interface RecipeBuilderProps {
  recipe: Recipe;
  onChangeRecipe: (updated: Recipe) => void;
  ingredients: Ingredient[];
  packagings: Packaging[];
  onSaveRecipe: () => void;
  onGoToNextStage: () => void;
  onGoToPrevStage: () => void;
  onLoadExample: (exampleId: string) => void;
  onOpenNewIngredientModal: () => void;
  onPrint: () => void;
}

const RECIPE_CATEGORIES: RecipeCategory[] = [
  'Marmitas e Refeições',
  'Pizzas e Massas',
  'Hambúrgueres e Lanches',
  'Confeitaria e Sobremesas',
  'Pães e Salgados',
  'Bebidas e Sucos',
  'Outros'
];

const COMPATIBLE_UNITS: MeasurementUnit[] = ['g', 'kg', 'ml', 'l', 'un', 'dz', 'pct', 'cx'];

export const RecipeBuilder: React.FC<RecipeBuilderProps> = ({
  recipe,
  onChangeRecipe,
  ingredients,
  packagings,
  onSaveRecipe,
  onGoToNextStage,
  onGoToPrevStage,
  onLoadExample,
  onOpenNewIngredientModal,
  onPrint
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(100);
  const [itemUnit, setItemUnit] = useState<MeasurementUnit>('g');
  const [isPreparedWeight, setIsPreparedWeight] = useState<boolean>(false);
  const [itemError, setItemError] = useState<string>('');

  // Embalagens form inside recipe
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('');
  const [packagingUsageQty, setPackagingUsageQty] = useState<number>(1);

  const ingredientsMap = useMemo(() => {
    return new Map<string, Ingredient>(ingredients.map(i => [i.id, i]));
  }, [ingredients]);

  const packagingsMap = useMemo(() => {
    return new Map<string, Packaging>(packagings.map(p => [p.id, p]));
  }, [packagings]);

  // Finanças consolidadas da receita
  const financials = useMemo(() => {
    return calculateRecipeFinancials(recipe, ingredientsMap, packagingsMap);
  }, [recipe, ingredientsMap, packagingsMap]);

  // Ao selecionar um ingrediente para adicionar, predefinir a unidade mais prática
  const handleSelectIngredient = (ingId: string) => {
    setSelectedIngredientId(ingId);
    setItemError('');
    const ing = ingredientsMap.get(ingId);
    if (ing) {
      const { baseType } = convertToBaseUnit(1, ing.purchaseUnit);
      if (baseType === 'g') {
        setItemUnit('g');
        setItemQuantity(100);
      } else if (baseType === 'ml') {
        setItemUnit('ml');
        setItemQuantity(50);
      } else {
        setItemUnit('un');
        setItemQuantity(1);
      }
      setIsPreparedWeight(false);
    }
  };

  // Adicionar ingrediente à receita
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId) return;

    const ing = ingredientsMap.get(selectedIngredientId);
    if (!ing) return;

    const { cost, error } = calculateItemCost(
      ing.costPerBaseUnit,
      ing.purchaseUnit,
      itemQuantity,
      itemUnit,
      ing.densityGPerMl,
      ing.cookingYieldFactor,
      isPreparedWeight
    );

    if (error) {
      setItemError(error);
      return;
    }

    const newItem: RecipeItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantityUsed: Number(itemQuantity),
      unitUsed: itemUnit,
      isPreparedWeight,
      cost
    };

    const updatedItems = [...recipe.items, newItem];
    onChangeRecipe({
      ...recipe,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    });

    setSelectedIngredientId('');
    setItemError('');
  };

  // Atualizar quantidade de um item existente
  const handleUpdateItemQuantity = (index: number, newQty: number, newUnit: MeasurementUnit, isPrep?: boolean) => {
    const updatedItems = [...recipe.items];
    const target = updatedItems[index];
    const ing = ingredientsMap.get(target.ingredientId);

    const { cost } = ing 
      ? calculateItemCost(
          ing.costPerBaseUnit,
          ing.purchaseUnit,
          newQty,
          newUnit,
          ing.densityGPerMl,
          ing.cookingYieldFactor,
          isPrep !== undefined ? isPrep : target.isPreparedWeight
        )
      : { cost: target.cost };

    updatedItems[index] = {
      ...target,
      quantityUsed: newQty,
      unitUsed: newUnit,
      isPreparedWeight: isPrep !== undefined ? isPrep : target.isPreparedWeight,
      cost
    };

    onChangeRecipe({
      ...recipe,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    });
  };

  // Remover ingrediente
  const handleRemoveItem = (index: number) => {
    const updatedItems = recipe.items.filter((_, i) => i !== index);
    onChangeRecipe({
      ...recipe,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    });
  };

  // Adicionar embalagem cadastrada à receita
  const handleAddPackaging = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackagingId) return;

    const pkg = packagingsMap.get(selectedPackagingId);
    if (!pkg) return;

    const currentPackagingItems = recipe.packagingItems || [];
    
    // Evitar duplicações: se já existir, apenas soma a quantidade
    const existingIndex = currentPackagingItems.findIndex(p => p.packagingId === pkg.id);
    let updatedPackagingItems: RecipePackagingItem[];

    if (existingIndex >= 0) {
      updatedPackagingItems = [...currentPackagingItems];
      const existing = updatedPackagingItems[existingIndex];
      const newQty = existing.quantityUsed + packagingUsageQty;
      updatedPackagingItems[existingIndex] = {
        ...existing,
        quantityUsed: newQty,
        totalCost: Number((newQty * pkg.costPerUnit).toFixed(4))
      };
    } else {
      const newItem: RecipePackagingItem = {
        id: `rec-pkg-${Date.now()}`,
        packagingId: pkg.id,
        packagingName: pkg.name,
        quantityUsed: packagingUsageQty,
        unitCost: pkg.costPerUnit,
        totalCost: Number((packagingUsageQty * pkg.costPerUnit).toFixed(4))
      };
      updatedPackagingItems = [...currentPackagingItems, newItem];
    }

    // Calcula novo packagingCost total por porção
    const newTotalPackagingCost = updatedPackagingItems.reduce((acc, p) => acc + p.totalCost, 0);

    onChangeRecipe({
      ...recipe,
      packagingItems: updatedPackagingItems,
      packagingCost: Number(newTotalPackagingCost.toFixed(2)),
      updatedAt: new Date().toISOString()
    });

    setSelectedPackagingId('');
    setPackagingUsageQty(1);
  };

  // Remover embalagem da receita
  const handleRemovePackaging = (index: number) => {
    const current = recipe.packagingItems || [];
    const updated = current.filter((_, i) => i !== index);
    const newTotal = updated.reduce((acc, p) => acc + p.totalCost, 0);

    onChangeRecipe({
      ...recipe,
      packagingItems: updated,
      packagingCost: Number(newTotal.toFixed(2)),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Modelos Prontos & Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#1a1c1f] p-4 rounded-xl border border-[#2D333F]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF4319]" />
          <span className="text-xs font-bold text-white">Carregar Modelo Demonstrativo:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onLoadExample('rec-marmita-fit')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white border border-[#2D333F] transition-colors cursor-pointer"
            >
              🥗 Marmita Fit (4 porções)
            </button>
            <button
              onClick={() => onLoadExample('rec-smash-burger')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white border border-[#2D333F] transition-colors cursor-pointer"
            >
              🍔 Smash Burger
            </button>
            <button
              onClick={() => onLoadExample('rec-bolo-cenoura')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white border border-[#2D333F] transition-colors cursor-pointer"
            >
              🍰 Bolo Vulcão (8 fatias)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-white text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
            title="Imprimir Ficha Técnica para a cozinha"
          >
            <FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Imprimir Ficha</span>
          </button>

          <button
            onClick={onSaveRecipe}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF4319] hover:bg-[#EA4E10] text-white text-xs font-bold shadow-md shadow-[#FF4319]/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Ficha</span>
          </button>
        </div>
      </div>

      {/* 1. Identificação & Rendimento da Receita */}
      <div className="bg-[#1a1c1f] rounded-xl p-5 border border-[#2D333F] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-[#FF4319]" />
          1. Identificação &amp; Rendimento da Receita
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
              Nome do Produto / Prato / Receita *
            </label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => onChangeRecipe({ ...recipe, name: e.target.value })}
              placeholder="Ex: Marmita de Frango Grelhado com Legumes ao Vapor"
              className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF4319]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
              Categoria
            </label>
            <select
              value={recipe.category}
              onChange={(e) => onChangeRecipe({ ...recipe, category: e.target.value as RecipeCategory })}
              className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF4319] cursor-pointer"
            >
              {RECIPE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rendimento e Pesos Cru vs Cozido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
              Rendimento em Porções *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={recipe.portions}
                onChange={(e) => onChangeRecipe({ ...recipe, portions: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#FF4319]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#6B7280]">
                {recipe.portions === 1 ? 'porção' : 'porções'}
              </span>
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">
              Quantas marmitas, lanches ou fatias este lote rende.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
              Peso Cru Total (g)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={recipe.rawWeightGrams || ''}
                onChange={(e) => onChangeRecipe({ ...recipe, rawWeightGrams: parseFloat(e.target.value) || undefined })}
                placeholder="Ex: 1600"
                className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#FF4319]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#6B7280]">gramas</span>
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">
              Soma do peso de todos os insumos antes do fogo/forno.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
              Peso Cozido / Final (g)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={recipe.cookedWeightGrams || ''}
                onChange={(e) => onChangeRecipe({ ...recipe, cookedWeightGrams: parseFloat(e.target.value) || undefined })}
                placeholder="Ex: 1400"
                className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#FF4319]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#6B7280]">gramas</span>
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">
              {financials.cookingYieldFactor ? (
                <span className="text-[#FF4319] font-medium">
                  Fator de Cocção: {financials.cookingYieldFactor}x ({Math.round(financials.cookingYieldFactor * 100)}% do peso cru)
                </span>
              ) : (
                'Peso do lote pronto para servir.'
              )}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Ingredientes Utilizados */}
      <div className="bg-[#1a1c1f] rounded-xl p-5 border border-[#2D333F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FF4319]" />
              2. Ingredientes Utilizados no Lote
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Selecione o insumo cadastrado e a quantidade. Se usar carne ou arroz cozido, ative a opção "Alimento já Cozido" para aplicar o rendimento de cocção.
            </p>
          </div>
          <button
            onClick={onOpenNewIngredientModal}
            className="text-xs text-[#FF4319] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Insumo Ausente
          </button>
        </div>

        {itemError && (
          <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{itemError}</span>
          </div>
        )}

        {/* Form para adicionar ingrediente */}
        <form onSubmit={handleAddItem} className="p-3.5 rounded-lg bg-[#1e2023] border border-[#2D333F] flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">
              Selecionar Insumo
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => handleSelectIngredient(e.target.value)}
              className="w-full bg-[#111317] border border-[#2D333F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4319] cursor-pointer"
            >
              <option value="">-- Escolha um ingrediente cadastrado --</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.purchaseQuantity} {ing.purchaseUnit} por {formatCurrencyBRL(ing.purchasePrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-28">
            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">
              Qtd. Utilizada
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#111317] border border-[#2D333F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF4319]"
            />
          </div>

          <div className="w-full sm:w-24">
            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">
              Unidade
            </label>
            <select
              value={itemUnit}
              onChange={(e) => setItemUnit(e.target.value as MeasurementUnit)}
              className="w-full bg-[#111317] border border-[#2D333F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4319] cursor-pointer"
            >
              {COMPATIBLE_UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Opção se é peso preparado/cozido */}
          <div className="flex items-center gap-1.5 pb-2.5 px-1 whitespace-nowrap">
            <input
              id="checkPrepared"
              type="checkbox"
              checked={isPreparedWeight}
              onChange={(e) => setIsPreparedWeight(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF4319] focus:ring-[#FF4319] cursor-pointer"
            />
            <label htmlFor="checkPrepared" className="text-[11px] text-[#9CA3AF] cursor-pointer" title="Calcula o custo da carne ou alimento já grelhado/cozido sem duplicar custos">
              Já Cozido?
            </label>
          </div>

          <button
            type="submit"
            disabled={!selectedIngredientId}
            className="w-full md:w-auto px-5 py-2 bg-[#FF4319] hover:bg-[#EA4E10] disabled:bg-[#333538] disabled:text-[#6B7280] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar Insumo
          </button>
        </form>

        {/* Tabela de Ingredientes Adicionados */}
        {recipe.items.length === 0 ? (
          <div className="text-center py-6 px-4 bg-[#1e2023]/60 rounded-lg border border-[#2D333F]">
            <ChefHat className="w-7 h-7 text-[#6B7280] mx-auto mb-1.5" />
            <p className="text-xs text-[#9CA3AF]">Nenhum ingrediente adicionado nesta ficha técnica ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1e2023] text-[#6B7280] uppercase text-[10px] tracking-wider border-b border-[#2D333F]">
                <tr>
                  <th className="py-2.5 px-3">Ingrediente</th>
                  <th className="py-2.5 px-3 text-center">Quantidade Utilizada</th>
                  <th className="py-2.5 px-3 text-center">Modo</th>
                  <th className="py-2.5 px-3 text-right">Custo no Lote</th>
                  <th className="py-2.5 px-3 text-right">Porção ({recipe.portions}x)</th>
                  <th className="py-2.5 px-2 text-center w-10">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D333F]/50 font-mono">
                {recipe.items.map((item, idx) => {
                  const ing = ingredientsMap.get(item.ingredientId);
                  const portionCost = item.cost / Math.max(recipe.portions, 1);

                  return (
                    <tr key={item.id} className="hover:bg-[#1e2023] transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        {item.ingredientName}
                        {ing && ing.yieldFactor < 100 && (
                          <span className="text-[10px] text-[#F59E0B] block font-normal">
                            Aproveitamento: {ing.yieldFactor}%
                          </span>
                        )}
                      </td>
                      
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={item.quantityUsed}
                            onChange={(e) => handleUpdateItemQuantity(idx, parseFloat(e.target.value) || 0, item.unitUsed)}
                            className="w-20 bg-[#111317] border border-[#2D333F] rounded px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-[#FF4319]"
                          />
                          <select
                            value={item.unitUsed}
                            onChange={(e) => handleUpdateItemQuantity(idx, item.quantityUsed, e.target.value as MeasurementUnit)}
                            className="bg-[#111317] border border-[#2D333F] rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-[#FF4319]"
                          >
                            {COMPATIBLE_UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(idx, item.quantityUsed, item.unitUsed, !item.isPreparedWeight)}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold cursor-pointer ${
                            item.isPreparedWeight
                              ? 'bg-[#FF4319]/20 text-[#FF4319] border border-[#FF4319]/30'
                              : 'bg-[#282a2d] text-[#9CA3AF]'
                          }`}
                          title="Alternar entre peso cru e peso após preparo"
                        >
                          {item.isPreparedWeight ? '🔥 Cozido/Pronto' : 'Cru'}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCurrencyBRL(item.cost)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-[#FF4319] font-bold">
                        {formatCurrencyBRL(portionCost)}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
                          title="Remover ingrediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 3. Embalagens e Descartáveis Utilizados (Integrado com o Catálogo de Embalagens do Stitch) */}
      <div className="bg-[#1a1c1f] rounded-xl p-5 border border-[#2D333F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF4319]" />
              3. Embalagens &amp; Descartáveis do Produto
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Selecione as embalagens cadastradas no seu almoxarifado (marmitex, caixas, sacolas, lacres e talheres) consumidas por porção ou pedido.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#FF4319] bg-[#FF4319]/10 px-2.5 py-1 rounded border border-[#FF4319]/20">
            Total Embalagens: {formatCurrencyBRL(financials.packagingCostPerPortion)} / un
          </span>
        </div>

        {/* Form para adicionar embalagem cadastrada à receita */}
        <form onSubmit={handleAddPackaging} className="p-3.5 rounded-lg bg-[#1e2023] border border-[#2D333F] flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">
              Selecionar Embalagem Cadastrada
            </label>
            <select
              value={selectedPackagingId}
              onChange={(e) => setSelectedPackagingId(e.target.value)}
              className="w-full bg-[#111317] border border-[#2D333F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4319] cursor-pointer"
            >
              <option value="">-- Escolha uma embalagem cadastrada --</option>
              {packagings.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — ({formatCurrencyBRL(pkg.costPerUnit)} / un)
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-32">
            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">
              Qtd. Consumida
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              value={packagingUsageQty}
              onChange={(e) => setPackagingUsageQty(parseFloat(e.target.value) || 1)}
              className="w-full bg-[#111317] border border-[#2D333F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF4319]"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedPackagingId}
            className="w-full sm:w-auto px-5 py-2 bg-[#FF4319] hover:bg-[#EA4E10] disabled:bg-[#333538] disabled:text-[#6B7280] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar Embalagem
          </button>
        </form>

        {/* Lista de Embalagens Selecionadas */}
        {recipe.packagingItems && recipe.packagingItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1e2023] text-[#6B7280] uppercase text-[10px] tracking-wider border-b border-[#2D333F]">
                <tr>
                  <th className="py-2 px-3">Item de Embalagem</th>
                  <th className="py-2 px-3 text-center">Qtd. por Porção</th>
                  <th className="py-2 px-3 text-right">Custo Unitário</th>
                  <th className="py-2 px-3 text-right">Custo na Porção</th>
                  <th className="py-2 px-2 text-center w-10">Remover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D333F]/50 font-mono">
                {recipe.packagingItems.map((pkgItem, pIdx) => (
                  <tr key={pkgItem.id} className="hover:bg-[#1e2023]">
                    <td className="py-2 px-3 font-sans text-white">{pkgItem.packagingName}</td>
                    <td className="py-2 px-3 text-center">{pkgItem.quantityUsed} un</td>
                    <td className="py-2 px-3 text-right text-[#9CA3AF]">{formatCurrencyBRL(pkgItem.unitCost)}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#FF4319]">{formatCurrencyBRL(pkgItem.totalCost)}</td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePackaging(pIdx)}
                        className="p-1 rounded text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 bg-[#1e2023]/60 rounded-lg border border-[#2D333F] text-xs text-[#9CA3AF] flex items-center justify-between">
            <span>Nenhuma embalagem cadastrada vinculada a esta receita ainda.</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Valor avulso manual: R$</span>
              <input
                type="number"
                step="0.05"
                min="0"
                value={recipe.packagingCost}
                onChange={(e) => onChangeRecipe({ ...recipe, packagingCost: parseFloat(e.target.value) || 0 })}
                className="w-20 bg-[#111317] border border-[#2D333F] rounded px-2 py-1 text-white font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Outros Custos Diretos (Guardanapos, Sachês, Descartáveis não listados) */}
        <div className="pt-2 border-t border-[#2D333F]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-white block">
                Outros Custos Diretos / Consumíveis por Porção (R$)
              </label>
              <span className="text-[11px] text-[#9CA3AF]">
                Talheres descartáveis avulsos, guardanapos extras, sachês de condimento etc.
              </span>
            </div>
            <div className="relative w-36">
              <span className="absolute left-3 top-2 text-xs text-[#6B7280] font-mono">R$</span>
              <input
                type="number"
                step="0.05"
                min="0"
                value={recipe.otherDirectCosts}
                onChange={(e) => onChangeRecipe({ ...recipe, otherDirectCosts: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full bg-[#1e2023] border border-[#2D333F] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF4319]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Cartão de Resumo Financeiro da Ficha Técnica & Próximo Passo */}
      <div className="p-5 rounded-xl bg-[#1a1c1f] border border-[#FF4319]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF4319]">
            Resumo dos Custos Diretos de Produção
          </span>
          <div className="flex flex-wrap items-baseline gap-3 text-white">
            <div>
              <span className="text-xs text-[#9CA3AF]">Total do Lote: </span>
              <span className="font-mono font-bold text-white text-base">
                {formatCurrencyBRL(financials.totalIngredientsCost + (financials.packagingCostPerPortion + financials.otherDirectCostPerPortion) * recipe.portions)}
              </span>
            </div>
            <span className="text-[#3F4756] hidden sm:inline">•</span>
            <div>
              <span className="text-xs text-[#9CA3AF]">Custo Direto por Porção: </span>
              <span className="font-mono font-extrabold text-[#FF4319] text-lg">
                {formatCurrencyBRL(financials.totalDirectCostPerPortion)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            Insumos ({formatCurrencyBRL(financials.ingredientsCostPerPortion)}) + Embalagens ({formatCurrencyBRL(financials.packagingCostPerPortion)}) + Outros Diretos ({formatCurrencyBRL(financials.otherDirectCostPerPortion)})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onGoToPrevStage}
            className="px-4 py-3 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-white text-xs font-semibold border border-[#2D333F] cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Embalagens</span>
          </button>

          <button
            type="button"
            onClick={onGoToNextStage}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-[#FF4319] hover:bg-[#EA4E10] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF4319]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Avançar para Despesas Fixas (Etapa 4)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
};
