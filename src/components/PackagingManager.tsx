import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Package, 
  AlertCircle,
  X,
  TrendingUp,
  Info,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Packaging, PackagingCategory, MeasurementUnit } from '../types';
import { calculatePackagingUnitCost, formatCurrencyBRL } from '../utils/calculator';

interface PackagingManagerProps {
  packagings: Packaging[];
  onSavePackaging: (packaging: Packaging) => void;
  onDeletePackaging: (id: string) => void;
  recipesCountByPackaging: Record<string, number>;
  onGoToNextStage: () => void;
  onGoToPrevStage: () => void;
  currentUser: any;
}

const CATEGORY_MAP: Record<string, { label: string; filterKey: string }> = {
  'potes': { label: 'Potes & Marmitex', filterKey: 'potes' },
  'caixas': { label: 'Caixas & Bandejas', filterKey: 'caixas' },
  'sacolas': { label: 'Sacolas & Transporte', filterKey: 'sacolas' },
  'higiene': { label: 'Higiene & Talheres', filterKey: 'higiene' },
  'lacres': { label: 'Lacre & Etiquetas', filterKey: 'lacres' },
  'outros': { label: 'Outros', filterKey: 'outros' }
};

export const PackagingManager: React.FC<PackagingManagerProps> = ({
  packagings,
  onSavePackaging,
  onDeletePackaging,
  recipesCountByPackaging,
  onGoToNextStage,
  onGoToPrevStage,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PackagingCategory>('Marmitex e Potes');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [packageUnitsCount, setPackageUnitsCount] = useState<number>(100);
  const [purchaseUnit, setPurchaseUnit] = useState<MeasurementUnit>('pct');
  const [purchasePrice, setPurchasePrice] = useState<number>(145.00);
  const [defaultUsage, setDefaultUsage] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Live real-time fraction calculation
  const liveUnitCost = useMemo(() => {
    return calculatePackagingUnitCost(purchaseQuantity, packageUnitsCount, purchasePrice);
  }, [purchaseQuantity, packageUnitsCount, purchasePrice]);

  const livePortionCost = useMemo(() => {
    return liveUnitCost * defaultUsage;
  }, [liveUnitCost, defaultUsage]);

  // Custo médio por prato entre todas as embalagens cadastradas
  const averagePackagingCostPerPortion = useMemo(() => {
    if (packagings.length === 0) return 0;
    const sum = packagings.reduce((acc, p) => acc + p.costPerUnit, 0);
    return sum / packagings.length;
  }, [packagings]);

  // Filtragem da tabela
  const filteredPackagings = useMemo(() => {
    return packagings.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesCategory = selectedFilter === 'all';
      if (selectedFilter === 'potes') matchesCategory = pkg.category === 'Marmitex e Potes';
      if (selectedFilter === 'caixas') matchesCategory = pkg.category === 'Caixas e Bandejas';
      if (selectedFilter === 'sacolas') matchesCategory = pkg.category === 'Sacolas e Transporte';
      if (selectedFilter === 'higiene') matchesCategory = pkg.category === 'Higiene e Talheres';
      if (selectedFilter === 'lacres') matchesCategory = pkg.category === 'Lacre e Etiquetas';
      if (selectedFilter === 'outros') matchesCategory = pkg.category === 'Outros';

      return matchesSearch && matchesCategory;
    });
  }, [packagings, searchTerm, selectedFilter]);

  // Contagem por categoria para as pílulas
  const categoryCounts = useMemo(() => {
    return {
      all: packagings.length,
      potes: packagings.filter(p => p.category === 'Marmitex e Potes').length,
      caixas: packagings.filter(p => p.category === 'Caixas e Bandejas').length,
      sacolas: packagings.filter(p => p.category === 'Sacolas e Transporte').length,
      higiene: packagings.filter(p => p.category === 'Higiene e Talheres').length,
      lacres: packagings.filter(p => p.category === 'Lacre e Etiquetas').length,
    };
  }, [packagings]);

  const handleEdit = (pkg: Packaging) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setCategory(pkg.category);
    setPurchaseQuantity(pkg.purchaseQuantity || 1);
    setPackageUnitsCount(pkg.packageUnitsCount || 50);
    setPurchaseUnit(pkg.purchaseUnit || 'pct');
    setPurchasePrice(pkg.purchasePrice || 0);
    setFormError('');
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    nameInputRef.current?.focus();
  };

  const handleDuplicate = (pkg: Packaging) => {
    const duplicated: Packaging = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      name: `${pkg.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSavePackaging(duplicated);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Marmitex e Potes');
    setPurchaseQuantity(1);
    setPackageUnitsCount(100);
    setPurchaseUnit('pct');
    setPurchasePrice(145.00);
    setDefaultUsage(1);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Informe o nome do material ou descartável.');
      return;
    }
    if (purchaseQuantity <= 0) {
      setFormError('A quantidade no fardo/pacote deve ser maior que zero.');
      return;
    }
    if (packageUnitsCount <= 0) {
      setFormError('O número de unidades por lote deve ser maior que zero.');
      return;
    }
    if (purchasePrice <= 0) {
      setFormError('O preço da nota fiscal deve ser maior que zero.');
      return;
    }

    const calculatedCost = calculatePackagingUnitCost(purchaseQuantity, packageUnitsCount, purchasePrice);

    const packagingToSave: Packaging = {
      id: editingId ? editingId : `pkg-${Date.now()}`,
      name: name.trim(),
      category,
      purchaseQuantity: Number(purchaseQuantity),
      packageUnitsCount: Number(packageUnitsCount),
      purchaseUnit,
      purchasePrice: Number(purchasePrice),
      costPerUnit: calculatedCost,
      createdAt: editingId 
        ? (packagings.find(p => p.id === editingId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSavePackaging(packagingToSave);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
    handleResetForm();
  };

  // Ícone por categoria
  const getCategoryIcon = (cat: PackagingCategory) => {
    switch (cat) {
      case 'Marmitex e Potes':
        return <span className="material-symbols-outlined text-lg">soup_kitchen</span>;
      case 'Sacolas e Transporte':
        return <span className="material-symbols-outlined text-lg">shopping_bag</span>;
      case 'Lacre e Etiquetas':
        return <span className="material-symbols-outlined text-lg">verified_user</span>;
      case 'Higiene e Talheres':
        return <span className="material-symbols-outlined text-lg">flatware</span>;
      case 'Caixas e Bandejas':
        return <span className="material-symbols-outlined text-lg">local_pizza</span>;
      default:
        return <span className="material-symbols-outlined text-lg">package_2</span>;
    }
  };

  return (
    <div className="flex flex-col w-full gap-8">
      
      {/* Header Banner & Strategic Key Performance Indicators (Bento Grid do Stitch) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        
        {/* Title & Operational Narrative */}
        <div className="xl:col-span-7 bg-[#1a1c1f] p-6 md:p-8 rounded-xl shadow-md flex flex-col justify-between gap-6 relative overflow-hidden border border-[#2D333F]">
          <div className="absolute -right-12 -top-12 w-52 h-52 bg-[#FF4319]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#1e2023] font-mono text-[11px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                Pipeline • Etapa 02/06
              </span>
              <span className="inline-flex items-center gap-1 text-[#10B981] text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">sync</span>
                Cálculo em Tempo Real
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Gestão de Embalagens &amp; Descartáveis
            </h1>
            
            <p className="text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
              Cadastre caixas, potes, lacres, sacolas e guardanapos consumidos na venda. O custo unitário é fracionado e calculado automaticamente para a composição exata da sua ficha técnica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 pt-2">
            <button
              type="button"
              onClick={() => {
                handleResetForm();
                nameInputRef.current?.focus();
                nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-5 py-3 rounded-lg bg-[#FF4319] hover:bg-[#EA4E10] text-white text-xs sm:text-sm transition-all shadow-lg shadow-[#FF4319]/20 flex items-center gap-2 font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Nova Embalagem / Descartável
            </button>

            <button
              type="button"
              onClick={onGoToNextStage}
              className="px-4 py-3 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border border-[#2D333F] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#9CA3AF]">inventory_2</span>
              Ver Ficha Técnica com Embalagens →
            </button>
          </div>
        </div>

        {/* Quick Metric Cards Bento (Stitch) */}
        <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          {/* Total Items Registered */}
          <div className="bg-[#1e2023] p-5 rounded-xl shadow-sm flex flex-col justify-between hover:bg-[#282a2d] transition-colors border border-[#2D333F]">
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Total de Itens</span>
              <span className="material-symbols-outlined text-xl text-[#FF4319]">package_2</span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-extrabold text-white font-mono">{packagings.length}</span>
              <span className="text-[#9CA3AF] text-xs block mt-0.5">embalagens ativas</span>
            </div>
            <div className="pt-2 text-xs text-[#10B981] flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              100% categorizadas
            </div>
          </div>

          {/* Average Package Cost Per Meal */}
          <div className="bg-[#1e2023] p-5 rounded-xl shadow-sm flex flex-col justify-between hover:bg-[#282a2d] transition-colors border border-[#2D333F]">
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Custo Médio</span>
              <span className="material-symbols-outlined text-xl text-[#F59E0B]">payments</span>
            </div>
            <div className="my-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {formatCurrencyBRL(averagePackagingCostPerPortion)}
              </span>
              <span className="text-[#9CA3AF] text-xs block mt-0.5">por prato / marmita</span>
            </div>
            <div className="pt-2 text-xs text-[#9CA3AF] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#F59E0B]">info</span>
              Custo direto unitário
            </div>
          </div>

          {/* Sync Status & Engine */}
          <div className="bg-[#1e2023] p-5 rounded-xl shadow-sm flex flex-col justify-between hover:bg-[#282a2d] transition-colors border border-[#2D333F]">
            <div className="flex items-center justify-between text-[#9CA3AF]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Atualização</span>
              <span className="material-symbols-outlined text-xl text-[#4edea3]">update</span>
            </div>
            <div className="my-3">
              <span className="text-xl font-bold text-white">Pronto</span>
              <span className="font-mono text-xs text-[#4edea3] font-semibold block mt-0.5">
                {currentUser ? 'Nuvem Firestore' : 'Armazenado Local'}
              </span>
            </div>
            <div className="pt-2 text-xs text-[#9CA3AF] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">cloud_done</span>
              {currentUser ? 'Sincronizado' : 'Modo Seguro Local'}
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Data Workbench Area (Span 8 + Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Inventory List and Categorization Filter (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Search Bar & Category Pills */}
          <div className="bg-[#1a1c1f] p-4 rounded-xl shadow-md flex flex-col gap-4 border border-[#2D333F]">
            
            {/* Search Input with Clear Action */}
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar embalagem, caixa, lacre, sacola ou fornecedor..."
                className="w-full bg-[#1e2023] text-white placeholder-[#6B7280] pl-11 pr-10 py-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:bg-[#282a2d] transition-colors border border-transparent focus:border-[#FF4319]/40"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills (Interactive Filter from Stitch) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Todos ({categoryCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('potes')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'potes'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Potes &amp; Marmitex ({categoryCounts.potes})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('caixas')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'caixas'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Caixas &amp; Bandejas ({categoryCounts.caixas})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('sacolas')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'sacolas'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Sacolas &amp; Transporte ({categoryCounts.sacolas})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('higiene')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'higiene'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Higiene &amp; Talheres ({categoryCounts.higiene})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('lacres')}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedFilter === 'lacres'
                    ? 'bg-[#FF4319] text-white font-bold shadow-sm'
                    : 'bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Lacre &amp; Etiquetas ({categoryCounts.lacres})
              </button>
            </div>

          </div>

          {/* Packaging Table Workspace */}
          <div className="bg-[#1a1c1f] rounded-xl shadow-md overflow-hidden flex flex-col border border-[#2D333F]">
            
            {/* Table Top Meta bar */}
            <div className="px-5 py-4 bg-[#1e2023] flex items-center justify-between border-b border-[#2D333F]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9CA3AF] text-lg">format_list_bulleted</span>
                <span className="font-bold text-white text-sm sm:text-base">Itens Ativos de Almoxarifado</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#333538] text-[#9CA3AF]">
                  {filteredPackagings.length} {filteredPackagings.length === 1 ? 'visível' : 'visíveis'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]"></span>
                Base pronta para Ficha Técnica
              </div>
            </div>

            {/* Table Responsive Container */}
            <div className="overflow-x-auto w-full">
              {filteredPackagings.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#6B7280]">search_off</span>
                  <p className="font-bold text-white text-base">Nenhum descartável encontrado</p>
                  <p className="text-xs text-[#9CA3AF]">Tente alterar os filtros ou o termo pesquisado.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1a1c1f] text-[#6B7280] font-semibold uppercase tracking-wider border-b border-[#2D333F] text-[10px]">
                      <th className="py-3 px-4">Material / Descrição</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3 text-right">Compra &amp; Qtd.</th>
                      <th className="py-3 px-3 text-right">NF Total</th>
                      <th className="py-3 px-3 text-right text-white">Custo Unitário</th>
                      <th className="py-3 px-3 text-center">Em Receitas</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D333F]/40 font-mono">
                    {filteredPackagings.map((pkg) => {
                      const recipeCount = recipesCountByPackaging[pkg.id] || 0;

                      return (
                        <tr key={pkg.id} className="hover:bg-[#1e2023] transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#333538] flex items-center justify-center text-[#FF4319] shrink-0">
                                {getCategoryIcon(pkg.category)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-sans font-bold text-white truncate text-xs sm:text-sm">
                                  {pkg.name}
                                </p>
                                {pkg.notes && (
                                  <p className="text-[11px] text-[#9CA3AF] truncate max-w-xs font-sans">
                                    {pkg.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap font-sans">
                            <span className="px-2 py-1 rounded bg-[#1e2023] text-[11px] font-semibold text-[#9CA3AF]">
                              {pkg.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right text-xs">
                            <span className="text-white font-semibold">{pkg.packageUnitsCount}</span>
                            <span className="text-[#6B7280]"> un ({pkg.purchaseUnit})</span>
                          </td>

                          <td className="py-3.5 px-3 text-right text-xs text-[#9CA3AF]">
                            {formatCurrencyBRL(pkg.purchasePrice)}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <span className="font-bold text-[#FF4319] bg-[#FF4319]/10 px-2 py-1 rounded border border-[#FF4319]/20">
                              {formatCurrencyBRL(pkg.costPerUnit)} / un
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center font-sans text-xs">
                            {recipeCount > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-semibold text-[11px]">
                                {recipeCount} {recipeCount === 1 ? 'receita' : 'receitas'}
                              </span>
                            ) : (
                              <span className="text-[#6B7280]">Disponível</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(pkg)}
                                className="p-1 rounded hover:bg-[#333538] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                                title="Editar embalagem"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(pkg)}
                                className="p-1 rounded hover:bg-[#333538] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                                title="Duplicar embalagem"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (recipeCount > 0) {
                                    if (!confirm(`Esta embalagem está sendo usada em ${recipeCount} receita(s). Deseja realmente excluir?`)) {
                                      return;
                                    }
                                  } else {
                                    if (!confirm(`Deseja excluir a embalagem "${pkg.name}"?`)) return;
                                  }
                                  onDeletePackaging(pkg.id);
                                }}
                                className="p-1 rounded hover:bg-[#333538] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
                                title="Excluir embalagem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

        {/* Side Panel: Live Dynamic Packaging Calculation & Registration Form (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
          
          {/* Quick Add / Edit Card */}
          <div className="bg-[#1a1c1f] p-6 rounded-xl shadow-md flex flex-col gap-5 border border-[#2D333F]">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#FF4319]/20 text-[#FF4319] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                </span>
                <div>
                  <h2 className="font-bold text-white text-base">
                    {editingId ? 'Editar Embalagem' : 'Cadastrar Embalagem'}
                  </h2>
                  <span className="text-xs text-[#6B7280]">Calculador imediato de fração</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1e2023] text-[#4edea3] font-bold">
                Modo Direto
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {isSuccessToast && (
              <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Embalagem salva com sucesso e integrada às receitas!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              
              {/* Material Name */}
              <div>
                <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputName">
                  Nome do Material / Descartável *
                </label>
                <input
                  ref={nameInputRef}
                  id="inputName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pote Biodegradável c/ Tampa 500ml"
                  className="w-full bg-[#1e2023] text-white px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d] transition-colors border border-transparent focus:border-[#FF4319]/40"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputCategory">
                  Categoria Operacional *
                </label>
                <select
                  id="inputCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PackagingCategory)}
                  className="w-full bg-[#1e2023] text-white px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d] cursor-pointer border border-transparent focus:border-[#FF4319]/40"
                >
                  <option value="Marmitex e Potes">Potes &amp; Marmitex</option>
                  <option value="Caixas e Bandejas">Caixas &amp; Bandejas</option>
                  <option value="Sacolas e Papéis">Sacolas &amp; Transporte</option>
                  <option value="Talheres e Descartáveis">Higiene &amp; Talheres</option>
                  <option value="Etiquetas e Lacres">Lacre &amp; Etiquetas</option>
                  <option value="Copos e Tampas">Copos &amp; Tampas</option>
                  <option value="Outros">Outros Descartáveis</option>
                </select>
              </div>

              {/* Packaging Quantities Dual Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputUnitsCount">
                    Qtd. no Fardo/Pacote *
                  </label>
                  <input
                    id="inputUnitsCount"
                    type="number"
                    min="1"
                    step="1"
                    value={packageUnitsCount}
                    onChange={(e) => setPackageUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#1e2023] text-white font-mono px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputUnit">
                    Unidade Compra
                  </label>
                  <select
                    id="inputUnit"
                    value={purchaseUnit}
                    onChange={(e) => setPurchaseUnit(e.target.value as MeasurementUnit)}
                    className="w-full bg-[#1e2023] text-white px-3 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d] cursor-pointer"
                  >
                    <option value="pct">pacote (pct)</option>
                    <option value="cx">caixa (cx)</option>
                    <option value="fardo">fardo</option>
                    <option value="un">unidade(s)</option>
                    <option value="dz">dúzia (dz)</option>
                  </select>
                </div>
              </div>

              {/* Invoice Price */}
              <div>
                <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputTotalCost">
                  Preço Total Pago na Nota Fiscal (NF) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[#6B7280] text-xs">R$</span>
                  <input
                    id="inputTotalCost"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1e2023] text-white font-mono pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d]"
                  />
                </div>
              </div>

              {/* Default Recipe Allocation (Simulador de uso) */}
              <div>
                <label className="block font-semibold text-[#9CA3AF] mb-1.5" htmlFor="inputUsage">
                  Qtd. Consumida por Marmita/Pedido
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="inputUsage"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={defaultUsage}
                    onChange={(e) => setDefaultUsage(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#1e2023] text-white font-mono px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-[#282a2d]"
                  />
                  <span className="text-[11px] font-semibold text-[#6B7280] px-2.5 py-2.5 rounded bg-[#1e2023] whitespace-nowrap">
                    un / porção
                  </span>
                </div>
              </div>

              {/* Real-Time Automated Output Card (Stitch) */}
              <div className="p-4 rounded-xl bg-[#1e2023] shadow-inner flex flex-col gap-2 border border-[#2D333F]/70">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                  Custo Unitário Calculado:
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl text-[#FF4319] font-extrabold font-mono">
                      {formatCurrencyBRL(liveUnitCost)}
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">por unidade individual</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#4edea3] font-mono">
                      {formatCurrencyBRL(livePortionCost)}
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">impacto na porção</span>
                  </div>
                </div>
              </div>

              {/* Form Action CTA */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-lg bg-[#FF4319] hover:bg-[#EA4E10] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {editingId ? 'Salvar Alterações' : 'Salvar Embalagem'}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="py-3 px-4 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-[#9CA3AF] hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              </div>

            </form>
          </div>

          {/* SAGA Intelligence Insight Box (Stitch) */}
          <div className="p-5 rounded-xl bg-[#1a1c1f] shadow-md relative overflow-hidden flex flex-col gap-2.5 border border-[#2D333F]">
            <div className="flex items-center gap-2 text-[#ffb95f]">
              <span className="material-symbols-outlined text-xl">lightbulb</span>
              <span className="text-xs font-bold uppercase tracking-wider">SAGA Intelligence Gastronômica</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              <strong className="text-white font-semibold">Dica de Compra:</strong> Comprar no atacado acima de 500 unidades reduz o custo unitário em até <span className="text-[#4edea3] font-bold">22%</span>, liberando em média <span className="text-[#10B981] font-bold">R$ 0,32 de margem limpa</span> por marmita vendida no mês.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Benchmarking: Marmitaria 2025</span>
              <span className="text-[#FF4319] font-semibold hover:underline cursor-pointer">
                Fornecedores Homologados
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Pipeline Stepper Footer Actions */}
      <section className="w-full bg-[#1a1c1f] p-5 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#2D333F]">
        <button
          type="button"
          onClick={onGoToPrevStage}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#2D333F]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Ingredientes (Etapa 1)
        </button>

        <button
          type="button"
          onClick={onGoToNextStage}
          className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#FF4319] hover:bg-[#EA4E10] text-white font-extrabold text-xs shadow-lg shadow-[#FF4319]/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <span>Avançar para Montagem de Ficha Técnica (Etapa 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
