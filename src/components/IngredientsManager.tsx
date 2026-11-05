import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  Scale, 
  Percent, 
  AlertCircle,
  Tag,
  Check,
  Package,
  Flame,
  Droplet,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Ingredient, 
  MeasurementUnit, 
  IngredientCategory 
} from '../types';
import { 
  calculateIngredientBaseCost, 
  formatCurrencyBRL,
  convertToBaseUnit 
} from '../utils/calculator';

interface IngredientsManagerProps {
  ingredients: Ingredient[];
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  recipesCountByIngredient: Record<string, number>;
}

const CATEGORIES: IngredientCategory[] = [
  'Proteínas e Carnes',
  'Grãos e Cereais',
  'Hortifrúti e Vegetais',
  'Laticínios e Frios',
  'Temperos e Molhos',
  'Farinhas e Panificação',
  'Doces e Confeitaria',
  'Embalagens e Descartáveis',
  'Outros Insumos'
];

const UNITS: { value: MeasurementUnit; label: string; group: string }[] = [
  { value: 'kg', label: 'Quilograma (kg)', group: 'Massa' },
  { value: 'g', label: 'Grama (g)', group: 'Massa' },
  { value: 'l', label: 'Litro (L)', group: 'Volume' },
  { value: 'ml', label: 'Mililitro (ml)', group: 'Volume' },
  { value: 'un', label: 'Unidade (un)', group: 'Contagem' },
  { value: 'dz', label: 'Dúzia (12 un)', group: 'Contagem' },
  { value: 'pct', label: 'Pacote (pct)', group: 'Contagem' },
  { value: 'cx', label: 'Caixa (cx)', group: 'Contagem' },
  { value: 'fardo', label: 'Fardo', group: 'Contagem' }
];

export const IngredientsManager: React.FC<IngredientsManagerProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  recipesCountByIngredient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Proteínas e Carnes');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [purchaseUnit, setPurchaseUnit] = useState<MeasurementUnit>('kg');
  const [packageUnitsCount, setPackageUnitsCount] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(10);
  const [yieldFactor, setYieldFactor] = useState<number>(100);
  const [cookingYieldFactor, setCookingYieldFactor] = useState<number | undefined>(undefined);
  const [densityGPerMl, setDensityGPerMl] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const isPackagedCountUnit = purchaseUnit === 'cx' || purchaseUnit === 'pct' || purchaseUnit === 'fardo';

  // Live calculation of cost per base unit in form
  const liveBaseCost = useMemo(() => {
    return calculateIngredientBaseCost(
      purchaseQuantity,
      purchaseUnit,
      purchasePrice,
      yieldFactor,
      isPackagedCountUnit ? packageUnitsCount : undefined
    );
  }, [purchaseQuantity, purchaseUnit, purchasePrice, yieldFactor, isPackagedCountUnit, packageUnitsCount]);

  // Derived display strings for base unit preview
  const livePreviewDetails = useMemo(() => {
    const { baseType } = convertToBaseUnit(1, purchaseUnit);
    if (baseType === 'g') {
      const cost100g = liveBaseCost * 100;
      const cost1kg = liveBaseCost * 1000;
      return {
        unitLabel: 'grama (g)',
        samples: `100g = ${formatCurrencyBRL(cost100g)} • 1kg = ${formatCurrencyBRL(cost1kg)}`
      };
    } else if (baseType === 'ml') {
      const cost100ml = liveBaseCost * 100;
      const cost1l = liveBaseCost * 1000;
      return {
        unitLabel: 'mililitro (ml)',
        samples: `100ml = ${formatCurrencyBRL(cost100ml)} • 1L = ${formatCurrencyBRL(cost1l)}`
      };
    } else {
      return {
        unitLabel: 'unidade (un)',
        samples: `1 un = ${formatCurrencyBRL(liveBaseCost)}`
      };
    }
  }, [liveBaseCost, purchaseUnit]);

  // Filtragem
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || ing.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [ingredients, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setName('');
    setCategory('Proteínas e Carnes');
    setPurchaseQuantity(1);
    setPurchaseUnit('kg');
    setPackageUnitsCount(1);
    setPurchasePrice(20);
    setYieldFactor(100);
    setCookingYieldFactor(undefined);
    setDensityGPerMl(undefined);
    setNotes('');
    setFormError('');
    setShowAdvanced(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setCategory(ing.category);
    setPurchaseQuantity(ing.purchaseQuantity);
    setPurchaseUnit(ing.purchaseUnit);
    setPackageUnitsCount(ing.packageUnitsCount || 1);
    setPurchasePrice(ing.purchasePrice);
    setYieldFactor(ing.yieldFactor);
    setCookingYieldFactor(ing.cookingYieldFactor);
    setDensityGPerMl(ing.densityGPerMl);
    setNotes(ing.notes || '');
    setFormError('');
    setShowAdvanced(!!(ing.cookingYieldFactor || ing.densityGPerMl || ing.packageUnitsCount));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Informe o nome do insumo.');
      return;
    }
    if (purchaseQuantity <= 0) {
      setFormError('A quantidade comprada deve ser maior que zero.');
      return;
    }
    if (purchasePrice <= 0) {
      setFormError('O preço de compra deve ser maior que zero.');
      return;
    }
    if (isPackagedCountUnit && packageUnitsCount <= 0) {
      setFormError('Informe quantas unidades vêm na caixa/pacote.');
      return;
    }

    const calculatedCost = calculateIngredientBaseCost(
      purchaseQuantity,
      purchaseUnit,
      purchasePrice,
      yieldFactor,
      isPackagedCountUnit ? packageUnitsCount : undefined
    );

    const ingredientToSave: Ingredient = {
      id: editingIngredient ? editingIngredient.id : `ing-${Date.now()}`,
      name: name.trim(),
      category,
      purchaseQuantity: Number(purchaseQuantity),
      purchaseUnit,
      packageUnitsCount: isPackagedCountUnit ? Number(packageUnitsCount) : undefined,
      purchasePrice: Number(purchasePrice),
      yieldFactor: Number(yieldFactor) || 100,
      cookingYieldFactor: cookingYieldFactor && cookingYieldFactor > 0 ? Number(cookingYieldFactor) : undefined,
      densityGPerMl: densityGPerMl && densityGPerMl > 0 ? Number(densityGPerMl) : undefined,
      costPerBaseUnit: calculatedCost,
      notes: notes.trim() || undefined,
      createdAt: editingIngredient ? editingIngredient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveIngredient(ingredientToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Topo com título e ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Banco de Insumos &amp; Ingredientes
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {ingredients.length} cadastrados
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Cadastre os produtos comprados no atacado/varejo. O sistema calcula o custo exato por grama, mililitro ou unidade considerando o rendimento.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Insumo
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar ingrediente por nome ou anotação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-orange-500 transition-colors"
        >
          <option value="Todas">Todas as Categorias</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grid de Insumos */}
      {filteredIngredients.length === 0 ? (
        <div className="text-center py-12 px-4 bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
          <Package className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-300">Nenhum ingrediente encontrado</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'Todas'
              ? 'Tente alterar os termos da busca ou a categoria selecionada.'
              : 'Comece adicionando seu primeiro insumo para compor as fichas técnicas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ing) => {
            const recipesCount = recipesCountByIngredient[ing.id] || 0;
            const { baseType } = convertToBaseUnit(1, ing.purchaseUnit);

            let previewText = '';
            if (baseType === 'g') {
              previewText = `100g = ${formatCurrencyBRL(ing.costPerBaseUnit * 100)}`;
            } else if (baseType === 'ml') {
              previewText = `100ml = ${formatCurrencyBRL(ing.costPerBaseUnit * 100)}`;
            } else {
              previewText = `1 un = ${formatCurrencyBRL(ing.costPerBaseUnit)}`;
            }

            return (
              <div 
                key={ing.id}
                className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {ing.category}
                    </span>
                    {recipesCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Em {recipesCount} {recipesCount === 1 ? 'receita' : 'receitas'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors">
                    {ing.name}
                  </h3>

                  {ing.notes && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1 italic">
                      {ing.notes}
                    </p>
                  )}

                  {/* Detalhes de Compra e Rendimento */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Compra Original:</span>
                      <span className="text-neutral-200 font-mono font-medium">
                        {ing.purchaseQuantity} {ing.purchaseUnit}
                        {ing.packageUnitsCount && ing.packageUnitsCount > 1 ? ` (${ing.packageUnitsCount} un)` : ''} por {formatCurrencyBRL(ing.purchasePrice)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Aproveitamento (Aparas):</span>
                      <span className={`font-mono font-medium ${ing.yieldFactor < 100 ? 'text-amber-400' : 'text-neutral-200'}`}>
                        {ing.yieldFactor}% {ing.yieldFactor < 100 ? `(${100 - ing.yieldFactor}% perda)` : '(sem perda)'}
                      </span>
                    </div>

                    {ing.cookingYieldFactor && (
                      <div className="flex justify-between text-neutral-400">
                        <span>Rendimento Cocção:</span>
                        <span className="font-mono text-orange-300 font-medium flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {ing.cookingYieldFactor}% (rende {ing.cookingYieldFactor}g a cada 100g)
                        </span>
                      </div>
                    )}

                    {ing.densityGPerMl && (
                      <div className="flex justify-between text-neutral-400">
                        <span>Densidade Cadastrada:</span>
                        <span className="font-mono text-cyan-400 font-medium flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {ing.densityGPerMl} g/ml
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <span className="text-neutral-400 font-medium">Custo Base:</span>
                      <span className="font-mono font-bold text-orange-400 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-500/20">
                        {previewText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-800/60">
                  <button
                    onClick={() => handleOpenEdit(ing)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
                    title="Editar insumo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (recipesCount > 0) {
                        if (!confirm(`Este insumo é usado em ${recipesCount} receita(s). Deseja realmente excluir?`)) {
                          return;
                        }
                      }
                      onDeleteIngredient(ing.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
                    title="Excluir insumo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
              <h3 className="font-bold text-base text-white">
                {editingIngredient ? 'Editar Insumo' : 'Novo Insumo / Ingrediente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-semibold px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nome do Insumo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Arroz Longo Fino, Carne Bovina, Azeite Extra Virgem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Quantidade comprada e Unidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Qtd. Comprada *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Unidade de Compra *
                  </label>
                  <select
                    value={purchaseUnit}
                    onChange={(e) => setPurchaseUnit(e.target.value as MeasurementUnit)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Se for caixa/pacote/fardo, permitir informar unidades contidas */}
              {isPackagedCountUnit && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Conteúdo da Embalagem (Quantas unidades contêm no pacote/caixa?) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={packageUnitsCount}
                      onChange={(e) => setPackageUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-xs text-neutral-400">
                      unidades (Ex: 1 caixa com 12 unidades)
                    </span>
                  </div>
                </div>
              )}

              {/* Preço de compra e Rendimento aproveitável */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Preço Total Pago (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-neutral-400 font-mono">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-100 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-300">
                      Aproveitamento (%)
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {yieldFactor}%
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={yieldFactor}
                    onChange={(e) => setYieldFactor(Math.min(100, Math.max(1, parseFloat(e.target.value) || 100)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    100% = sem perda. 80% = 20% perda no descasque.
                  </span>
                </div>
              </div>

              {/* Preview Dinâmico do Custo Base */}
              <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs">
                <div className="flex justify-between items-center text-orange-300 font-semibold mb-1">
                  <span>Custo Efetivo Calculado:</span>
                  <span className="font-mono text-sm font-bold text-orange-400">
                    R$ {liveBaseCost.toFixed(4)} / {livePreviewDetails.unitLabel}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {livePreviewDetails.samples}
                </p>
              </div>

              {/* Seção Expansível de Configurações Avançadas (Densidade e Cocção) */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-3 bg-neutral-950 hover:bg-neutral-800/60 text-xs font-semibold text-neutral-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-orange-400" />
                    Opções Avançadas (Densidade &amp; Rendimento de Cocção)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-3 bg-neutral-950/60 border-t border-neutral-800 text-xs">
                    
                    {/* Densidade */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                        Densidade Conhecida (g/ml)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        placeholder="Ex: 0.92 para azeite, 1.03 para leite"
                        value={densityGPerMl ?? ''}
                        onChange={(e) => setDensityGPerMl(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        Obrigatória para permitir conversão entre gramas (massa) e mililitros (volume). Sem ela, a conversão é bloqueada para evitar erros.
                      </span>
                    </div>

                    {/* Fator de Cocção */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        Rendimento de Cocção deste Ingrediente (%)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="Ex: 75 para carnes (1kg cru rende 750g), 240 para arroz"
                        value={cookingYieldFactor ?? ''}
                        onChange={(e) => setCookingYieldFactor(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        Utilizado quando a receita especificar a quantidade de carne/alimento já cozido pronto para servir.
                      </span>
                    </div>

                  </div>
                )}
              </div>

              {/* Anotações */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Anotações / Marca / Fornecedor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marca X, Atacadão, Caixa com 12 potes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
