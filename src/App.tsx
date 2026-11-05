import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  saveIngredientToFirestore, 
  deleteIngredientFromFirestore, 
  savePackagingToFirestore,
  deletePackagingFromFirestore,
  subscribeUserPackagings,
  saveRecipeToFirestore, 
  deleteRecipeFromFirestore, 
  subscribeUserIngredients, 
  subscribeUserRecipes,
  testConnection
} from './services/firebase';
import { 
  Ingredient, 
  Recipe, 
  Packaging,
  MeasurementUnit,
  PipelineStage
} from './types';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_RECIPES,
  INITIAL_PACKAGINGS
} from './data/defaultData';
import { 
  calculateIngredientBaseCost, 
  calculateItemCost, 
  calculateRecipeFinancials, 
  formatCurrencyBRL 
} from './utils/calculator';
import { Header } from './components/Header';
import { PipelineStepper } from './components/PipelineStepper';
import { RecipeBuilder } from './components/RecipeBuilder';
import { PackagingManager } from './components/PackagingManager';
import { FixedExpensesManager } from './components/FixedExpensesManager';
import { PricingAnalysis } from './components/PricingAnalysis';
import { IngredientsManager } from './components/IngredientsManager';
import { SavedRecipesList } from './components/SavedRecipesList';
import { AuditModal } from './components/AuditModal';
import { PrintableSheet } from './components/PrintableSheet';
import { SagaLogo } from './components/SagaLogo';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const LOCAL_STORAGE_INGREDIENTS = 'saga_code_calc_ingredients_v1';
const LOCAL_STORAGE_PACKAGINGS = 'saga_code_calc_packagings_v1';
const LOCAL_STORAGE_RECIPES = 'saga_code_calc_recipes_v1';
const LOCAL_STORAGE_ACTIVE_RECIPE = 'saga_code_calc_active_recipe_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStage, setActiveStage] = useState<PipelineStage>('recipe');
  const [businessSegment, setBusinessSegment] = useState<string>('marmitaria');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [printableRecipe, setPrintableRecipe] = useState<Recipe | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Quick ingredient modal trigger from recipe builder
  const [isQuickIngredientModalOpen, setIsQuickIngredientModalOpen] = useState(false);
  const [quickIngName, setQuickIngName] = useState('');
  const [quickIngQty, setQuickIngQty] = useState(1);
  const [quickIngUnit, setQuickIngUnit] = useState<MeasurementUnit>('kg');
  const [quickIngPrice, setQuickIngPrice] = useState(10);
  const [quickIngYield, setQuickIngYield] = useState(100);

  // Estados principais
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_INGREDIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao ler localStorage de ingredientes:', e);
    }
    return INITIAL_INGREDIENTS;
  });

  const [packagings, setPackagings] = useState<Packaging[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PACKAGINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao ler localStorage de embalagens:', e);
    }
    return INITIAL_PACKAGINGS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECIPES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao ler localStorage de receitas:', e);
    }
    return INITIAL_RECIPES;
  });

  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_RECIPE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao ler localStorage de receita ativa:', e);
    }
    return INITIAL_RECIPES[0] || {
      id: `rec-${Date.now()}`,
      name: 'Minha Nova Receita',
      category: 'Marmitas e Refeições',
      portions: 1,
      packagingCost: 1.50,
      packagingItems: [],
      otherDirectCosts: 0,
      indirectCostPerUnit: 2.00,
      taxPercentage: 4.0,
      cardFeePercentage: 2.5,
      deliveryAppPercentage: 0,
      targetProfitMargin: 25.0,
      items: [],
      suggestedPrice: 0,
      sellingPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Persistência local sempre ativa
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_INGREDIENTS, JSON.stringify(ingredients));
    } catch (e) {
      console.error('Falha ao salvar ingredientes no localStorage:', e);
    }
  }, [ingredients]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PACKAGINGS, JSON.stringify(packagings));
    } catch (e) {
      console.error('Falha ao salvar embalagens no localStorage:', e);
    }
  }, [packagings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('Falha ao salvar receitas no localStorage:', e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_RECIPE, JSON.stringify(currentRecipe));
    } catch (e) {
      console.error('Falha ao salvar receita ativa no localStorage:', e);
    }
  }, [currentRecipe]);

  // Firebase Auth e sincronização em tempo real
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        showNotification(`Bem-vindo, ${user.displayName || user.email}! Sincronização na nuvem ativada.`, 'info');

        // Escuta ingredientes no Firestore
        const unsubIngs = subscribeUserIngredients(user.uid, (cloudIngs) => {
          if (cloudIngs && cloudIngs.length > 0) {
            setIngredients(cloudIngs);
          } else {
            ingredients.forEach((ing) => {
              saveIngredientToFirestore(user.uid, ing);
            });
          }
        });

        // Escuta embalagens no Firestore
        const unsubPkgs = subscribeUserPackagings(user.uid, (cloudPkgs) => {
          if (cloudPkgs && cloudPkgs.length > 0) {
            setPackagings(cloudPkgs);
          } else {
            packagings.forEach((pkg) => {
              savePackagingToFirestore(user.uid, pkg);
            });
          }
        });

        // Escuta receitas no Firestore
        const unsubRecs = subscribeUserRecipes(user.uid, (cloudRecs) => {
          if (cloudRecs && cloudRecs.length > 0) {
            setRecipes(cloudRecs);
            const match = cloudRecs.find((r) => r.id === currentRecipe.id);
            if (match) setCurrentRecipe(match);
          } else {
            recipes.forEach((rec) => {
              saveRecipeToFirestore(user.uid, rec);
            });
          }
        });

        return () => {
          unsubIngs();
          unsubPkgs();
          unsubRecs();
        };
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

  // Mapas para cálculos
  const ingredientsMap = useMemo(() => {
    return new Map<string, Ingredient>(ingredients.map(i => [i.id, i]));
  }, [ingredients]);

  const packagingsMap = useMemo(() => {
    return new Map<string, Packaging>(packagings.map(p => [p.id, p]));
  }, [packagings]);

  // Contagem de quantas receitas usam cada ingrediente
  const recipesCountByIngredient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of recipes) {
      for (const item of r.items) {
        counts[item.ingredientId] = (counts[item.ingredientId] || 0) + 1;
      }
    }
    return counts;
  }, [recipes]);

  // Contagem de quantas receitas usam cada embalagem
  const recipesCountByPackaging = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of recipes) {
      for (const p of r.packagingItems || []) {
        counts[p.packagingId] = (counts[p.packagingId] || 0) + 1;
      }
    }
    return counts;
  }, [recipes]);

  // Handler de login com Google
  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } catch (error: any) {
      console.error(error);
      showNotification('Não foi possível completar o login com Google no momento.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showNotification('Você saiu da sua conta Google. Os dados continuam salvos no navegador.', 'info');
    } catch (error) {
      console.error(error);
    }
  };

  // Salvar ou atualizar ingrediente (Propaga custos para todas as receitas!)
  const handleSaveIngredient = (updatedIng: Ingredient) => {
    const exists = ingredients.some(i => i.id === updatedIng.id);
    const newIngredientsList = exists
      ? ingredients.map(i => i.id === updatedIng.id ? updatedIng : i)
      : [updatedIng, ...ingredients];

    setIngredients(newIngredientsList);

    if (currentUser) {
      saveIngredientToFirestore(currentUser.uid, updatedIng);
    }

    // Atualiza receita ativa
    const updatedCurrentItems = currentRecipe.items.map(item => {
      if (item.ingredientId === updatedIng.id) {
        const { cost: newCost } = calculateItemCost(
          updatedIng.costPerBaseUnit,
          updatedIng.purchaseUnit,
          item.quantityUsed,
          item.unitUsed,
          updatedIng.densityGPerMl,
          updatedIng.cookingYieldFactor,
          item.isPreparedWeight
        );
        return { ...item, cost: newCost, ingredientName: updatedIng.name };
      }
      return item;
    });
    setCurrentRecipe({ ...currentRecipe, items: updatedCurrentItems });

    // Atualiza todas as receitas salvas
    const updatedRecipesList = recipes.map(rec => {
      let changed = false;
      const recItems = rec.items.map(item => {
        if (item.ingredientId === updatedIng.id) {
          changed = true;
          const { cost: newCost } = calculateItemCost(
            updatedIng.costPerBaseUnit,
            updatedIng.purchaseUnit,
            item.quantityUsed,
            item.unitUsed,
            updatedIng.densityGPerMl,
            updatedIng.cookingYieldFactor,
            item.isPreparedWeight
          );
          return { ...item, cost: newCost, ingredientName: updatedIng.name };
        }
        return item;
      });

      if (changed) {
        const updatedRec = { ...rec, items: recItems, updatedAt: new Date().toISOString() };
        if (currentUser) {
          saveRecipeToFirestore(currentUser.uid, updatedRec);
        }
        return updatedRec;
      }
      return rec;
    });

    setRecipes(updatedRecipesList);
    showNotification(`Insumo "${updatedIng.name}" salvo! Todas as receitas vinculadas foram recalculadas.`, 'success');
  };

  // Excluir ingrediente
  const handleDeleteIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(i => i.id !== ingredientId));
    if (currentUser) {
      deleteIngredientFromFirestore(currentUser.uid, ingredientId);
    }
    showNotification('Insumo removido com sucesso.', 'info');
  };

  // Salvar ou atualizar embalagem
  const handleSavePackaging = (updatedPkg: Packaging) => {
    const exists = packagings.some(p => p.id === updatedPkg.id);
    const newPackagingsList = exists
      ? packagings.map(p => p.id === updatedPkg.id ? updatedPkg : p)
      : [updatedPkg, ...packagings];

    setPackagings(newPackagingsList);

    if (currentUser) {
      savePackagingToFirestore(currentUser.uid, updatedPkg);
    }

    // Propaga novo custo para itens da embalagem na receita ativa
    if (currentRecipe.packagingItems && currentRecipe.packagingItems.length > 0) {
      let changed = false;
      const updatedPkgItems = currentRecipe.packagingItems.map(p => {
        if (p.packagingId === updatedPkg.id) {
          changed = true;
          const totalCost = Number((p.quantityUsed * updatedPkg.costPerUnit).toFixed(4));
          return { ...p, unitCost: updatedPkg.costPerUnit, totalCost, packagingName: updatedPkg.name };
        }
        return p;
      });

      if (changed) {
        const newTotalPackagingCost = updatedPkgItems.reduce((acc, p) => acc + p.totalCost, 0);
        setCurrentRecipe({
          ...currentRecipe,
          packagingItems: updatedPkgItems,
          packagingCost: Number(newTotalPackagingCost.toFixed(2)),
          updatedAt: new Date().toISOString()
        });
      }
    }

    showNotification(`Embalagem "${updatedPkg.name}" salva com sucesso!`, 'success');
  };

  // Excluir embalagem
  const handleDeletePackaging = (packagingId: string) => {
    setPackagings(prev => prev.filter(p => p.id !== packagingId));
    if (currentUser) {
      deletePackagingFromFirestore(currentUser.uid, packagingId);
    }
    showNotification('Embalagem removida com sucesso.', 'info');
  };

  // Salvar receita ativa
  const handleSaveCurrentRecipe = () => {
    if (!currentRecipe.name.trim()) {
      showNotification('Dê um nome para a receita antes de salvar.', 'error');
      return;
    }

    const fin = calculateRecipeFinancials(currentRecipe, ingredientsMap, packagingsMap);
    const recipeToSave: Recipe = {
      ...currentRecipe,
      suggestedPrice: fin.suggestedPrice,
      sellingPrice: currentRecipe.sellingPrice > 0 ? currentRecipe.sellingPrice : fin.suggestedPrice,
      updatedAt: new Date().toISOString()
    };

    setCurrentRecipe(recipeToSave);

    setRecipes(prev => {
      const index = prev.findIndex(r => r.id === recipeToSave.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = recipeToSave;
        return copy;
      } else {
        return [recipeToSave, ...prev];
      }
    });

    if (currentUser) {
      saveRecipeToFirestore(currentUser.uid, recipeToSave);
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showNotification(`Ficha técnica "${recipeToSave.name}" salva com sucesso!`, 'success');
  };

  // Nova ficha técnica em branco
  const handleNewRecipe = () => {
    const newRecipe: Recipe = {
      id: `rec-${Date.now()}`,
      name: 'Novo Produto Gastronômico',
      category: 'Marmitas e Refeições',
      portions: 1,
      packagingCost: 1.50,
      packagingItems: [],
      otherDirectCosts: 0.50,
      indirectCostPerUnit: 2.00,
      taxPercentage: 4.0,
      cardFeePercentage: 2.5,
      deliveryAppPercentage: 0,
      targetProfitMargin: 25.0,
      items: [],
      suggestedPrice: 0,
      sellingPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentRecipe(newRecipe);
    setActiveStage('recipe');
    showNotification('Nova ficha técnica iniciada.', 'info');
  };

  // Duplicar receita
  const handleDuplicateRecipe = (recipeToDuplicate: Recipe) => {
    const duplicated: Recipe = {
      ...recipeToDuplicate,
      id: `rec-${Date.now()}`,
      name: `${recipeToDuplicate.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecipes(prev => [duplicated, ...prev]);
    setCurrentRecipe(duplicated);
    setActiveStage('recipe');
    if (currentUser) {
      saveRecipeToFirestore(currentUser.uid, duplicated);
    }
    showNotification(`Ficha técnica duplicada como "${duplicated.name}".`, 'success');
  };

  // Excluir receita
  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    if (currentUser) {
      deleteRecipeFromFirestore(currentUser.uid, recipeId);
    }
    if (currentRecipe.id === recipeId) {
      handleNewRecipe();
    }
    showNotification('Ficha técnica excluída.', 'info');
  };

  // Carregar modelo demonstrativo
  const handleLoadExample = (exampleId: string) => {
    const found = INITIAL_RECIPES.find(r => r.id === exampleId);
    if (found) {
      const cloned: Recipe = {
        ...found,
        id: `rec-demo-${Date.now()}`,
        name: found.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentRecipe(cloned);
      showNotification(`Modelo demonstrativo "${found.name}" carregado para simulação.`, 'info');
    }
  };

  // Exportar Backup JSON
  const handleExportJSON = () => {
    const data = {
      app: 'SAGA Code | Calculadora de Custos e Precificação',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      ingredients,
      packagings,
      recipes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saga-code-precificacao-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup completo exportado com sucesso!', 'success');
  };

  // Importar Backup JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
          setIngredients(parsed.ingredients);
        }
        if (parsed.packagings && Array.isArray(parsed.packagings)) {
          setPackagings(parsed.packagings);
        }
        if (parsed.recipes && Array.isArray(parsed.recipes)) {
          setRecipes(parsed.recipes);
          if (parsed.recipes.length > 0) {
            setCurrentRecipe(parsed.recipes[0]);
          }
        }
        showNotification('Dados importados com sucesso!', 'success');
      } catch (err) {
        showNotification('Arquivo JSON inválido ou corrompido.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Salvar insumo rápido do modal popup
  const handleSaveQuickIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIngName.trim()) return;

    const baseCost = calculateIngredientBaseCost(quickIngQty, quickIngUnit, quickIngPrice, quickIngYield);
    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: quickIngName.trim(),
      category: 'Outros Insumos',
      purchaseQuantity: quickIngQty,
      purchaseUnit: quickIngUnit,
      purchasePrice: quickIngPrice,
      yieldFactor: quickIngYield,
      costPerBaseUnit: baseCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    handleSaveIngredient(newIng);
    setIsQuickIngredientModalOpen(false);
    setQuickIngName('');
  };

  return (
    <div className="min-h-screen bg-[#111317] text-[#D1D5DB] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {notification && (
        <div className="no-print fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
              : notification.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-500/40'
              : 'bg-[#1a1c1f] text-neutral-200 border-[#FF4319]/40'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-[#4edea3] shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-[#FF4319] shrink-0" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white p-1 ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header com Marca Oficial SAGA Code & Logotipo Vetorial */}
      <Header
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        ingredientsCount={ingredients.length}
        packagingsCount={packagings.length}
        recipesCount={recipes.length}
        businessSegment={businessSegment}
        setBusinessSegment={setBusinessSegment}
      />

      {/* Conteúdo Principal com Stepper do Pipeline */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Banner Informativo caso offline/sem login */}
        {!currentUser && (
          <div className="no-print p-3.5 rounded-xl bg-[#1a1c1f] border border-[#FF4319]/25 text-xs text-[#D1D5DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4319] animate-pulse"></span>
              <span>
                <strong>Modo Local Offline Ativo:</strong> Todos os cálculos e fichas técnicas funcionam livremente sem login no seu navegador.
              </span>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="text-[#FF4319] hover:text-[#ff5c38] font-bold underline underline-offset-4 self-start sm:self-auto cursor-pointer"
            >
              Fazer login com Google para sincronizar na nuvem →
            </button>
          </div>
        )}

        {/* Stepper de 6 Etapas do Google Stitch */}
        <PipelineStepper
          currentStage={activeStage}
          onSelectStage={setActiveStage}
          ingredientsCount={ingredients.length}
          packagingsCount={packagings.length}
          hasRecipeItems={currentRecipe.items.length > 0}
        />

        {/* ETAPA 1: INGREDIENTES */}
        {activeStage === 'ingredients' && (
          <IngredientsManager
            ingredients={ingredients}
            onSaveIngredient={handleSaveIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            recipesCountByIngredient={recipesCountByIngredient}
          />
        )}

        {/* ETAPA 2: EMBALAGENS & DESCARTÁVEIS (GOOGLE STITCH) */}
        {activeStage === 'packagings' && (
          <PackagingManager
            packagings={packagings}
            onSavePackaging={handleSavePackaging}
            onDeletePackaging={handleDeletePackaging}
            recipesCountByPackaging={recipesCountByPackaging}
            onGoToNextStage={() => setActiveStage('recipe')}
            onGoToPrevStage={() => setActiveStage('ingredients')}
            currentUser={currentUser}
          />
        )}

        {/* ETAPA 3: FICHA TÉCNICA (RECEITA) */}
        {activeStage === 'recipe' && (
          <RecipeBuilder
            recipe={currentRecipe}
            onChangeRecipe={setCurrentRecipe}
            ingredients={ingredients}
            packagings={packagings}
            onSaveRecipe={handleSaveCurrentRecipe}
            onGoToNextStage={() => setActiveStage('fixed-expenses')}
            onGoToPrevStage={() => setActiveStage('packagings')}
            onLoadExample={handleLoadExample}
            onOpenNewIngredientModal={() => setIsQuickIngredientModalOpen(true)}
            onPrint={() => setPrintableRecipe(currentRecipe)}
          />
        )}

        {/* ETAPA 4: DESPESAS FIXAS & RATEIO OPERACIONAL */}
        {activeStage === 'fixed-expenses' && (
          <FixedExpensesManager
            recipe={currentRecipe}
            onChangeRecipe={setCurrentRecipe}
            onGoToNextStage={() => setActiveStage('pricing')}
            onGoToPrevStage={() => setActiveStage('recipe')}
          />
        )}

        {/* ETAPA 5: CALCULADORA DE PREÇO (MÉTODO DO DIVISOR) */}
        {activeStage === 'pricing' && (
          <PricingAnalysis
            recipe={currentRecipe}
            onChangeRecipe={setCurrentRecipe}
            ingredients={ingredients}
            packagings={packagings}
            activeStage="pricing"
            onNavigateStage={setActiveStage}
            onSaveRecipe={handleSaveCurrentRecipe}
            onPrint={() => setPrintableRecipe(currentRecipe)}
          />
        )}

        {/* ETAPA 6: RESULTADOS & DRE DEMONSTRATIVO */}
        {activeStage === 'results' && (
          <PricingAnalysis
            recipe={currentRecipe}
            onChangeRecipe={setCurrentRecipe}
            ingredients={ingredients}
            packagings={packagings}
            activeStage="results"
            onNavigateStage={setActiveStage}
            onSaveRecipe={handleSaveCurrentRecipe}
            onPrint={() => setPrintableRecipe(currentRecipe)}
          />
        )}

        {/* CATÁLOGO DE RECEITAS SALVAS */}
        {activeStage === 'saved' && (
          <SavedRecipesList
            recipes={recipes}
            ingredients={ingredients}
            onSelectRecipe={(selected) => {
              setCurrentRecipe(selected);
              setActiveStage('recipe');
              showNotification(`Ficha "${selected.name}" carregada para edição.`, 'info');
            }}
            onNewRecipe={handleNewRecipe}
            onDuplicateRecipe={handleDuplicateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onPrintRecipe={(selected) => setPrintableRecipe(selected)}
          />
        )}

      </main>

      {/* Modal de Auditoria dos Cálculos */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Visualização Imprimível de Ficha Técnica */}
      {printableRecipe && (
        <PrintableSheet
          recipe={printableRecipe}
          ingredients={ingredients}
          onClose={() => setPrintableRecipe(null)}
        />
      )}

      {/* Modal Rápido de Insumo Ausente */}
      {isQuickIngredientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1c1f] border border-[#2D333F] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Cadastrar Insumo Rápido</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Adicione o produto comprado para utilizá-lo imediatamente nesta ficha técnica.</p>

            <form onSubmit={handleSaveQuickIngredient} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#D1D5DB] mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  placeholder="Ex: Queijo Parmesão Ralado"
                  value={quickIngName}
                  onChange={(e) => setQuickIngName(e.target.value)}
                  className="w-full bg-[#111317] border border-[#2D333F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4319]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-1">Qtd. Comprada</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={quickIngQty}
                    onChange={(e) => setQuickIngQty(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#111317] border border-[#2D333F] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-1">Unidade</label>
                  <select
                    value={quickIngUnit}
                    onChange={(e) => setQuickIngUnit(e.target.value as MeasurementUnit)}
                    className="w-full bg-[#111317] border border-[#2D333F] rounded-xl px-3 py-2 text-xs text-[#D1D5DB]"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="ml">ml</option>
                    <option value="un">un</option>
                    <option value="dz">dz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-1">Preço Pago (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quickIngPrice}
                    onChange={(e) => setQuickIngPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#111317] border border-[#2D333F] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-1">Aproveitamento (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quickIngYield}
                    onChange={(e) => setQuickIngYield(Math.min(100, Math.max(1, parseFloat(e.target.value) || 100)))}
                    className="w-full bg-[#111317] border border-[#2D333F] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2D333F]">
                <button
                  type="button"
                  onClick={() => setIsQuickIngredientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1e2023] text-[#D1D5DB] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4319] hover:bg-[#e03710] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Cadastrar e Usar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé Institucional SAGA Code */}
      <footer className="no-print border-t border-[#2D333F] bg-[#111317] py-6 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SagaLogo theme="dark" symbolSize={24} />
            <span className="text-[#6B7280] hidden sm:inline">•</span>
            <span className="text-xs text-[#9CA3AF]">Calculadora de Custos &amp; Precificação para Negócios de Alimentação</span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            Ferramenta gratuita para marmitarias, hamburguerias, pizzarias, confeitarias e produtores artesanais.
          </p>
        </div>
      </footer>

    </div>
  );
}
