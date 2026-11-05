import { 
  MeasurementUnit, 
  Ingredient, 
  Recipe, 
  Packaging,
  RecipeFinancialSummary 
} from '../types';

/**
 * Converte qualquer unidade suportada para sua unidade base correspondente:
 * - Massa (kg, g) -> 'g'
 * - Volume (l, ml) -> 'ml'
 * - Contagem (un, dz, pct, cx, fardo) -> 'un'
 */
export function convertToBaseUnit(
  quantity: number, 
  unit: MeasurementUnit
): { baseQuantity: number; baseType: 'g' | 'ml' | 'un' } {
  if (isNaN(quantity) || quantity <= 0) {
    return { baseQuantity: 0, baseType: 'un' };
  }

  switch (unit) {
    case 'kg':
      return { baseQuantity: quantity * 1000, baseType: 'g' };
    case 'g':
      return { baseQuantity: quantity, baseType: 'g' };
    case 'l':
      return { baseQuantity: quantity * 1000, baseType: 'ml' };
    case 'ml':
      return { baseQuantity: quantity, baseType: 'ml' };
    case 'dz':
      return { baseQuantity: quantity * 12, baseType: 'un' };
    case 'pct':
    case 'cx':
    case 'fardo':
    case 'un':
    default:
      return { baseQuantity: quantity, baseType: 'un' };
  }
}

/**
 * Verifica se duas unidades são diretamente conversíveis
 */
export function areUnitsCompatible(unitA: MeasurementUnit, unitB: MeasurementUnit): boolean {
  const { baseType: typeA } = convertToBaseUnit(1, unitA);
  const { baseType: typeB } = convertToBaseUnit(1, unitB);
  return typeA === typeB;
}

/**
 * Calcula o custo unitário de uma embalagem a partir de sua compra em fardo/caixa/unidade:
 * Exemplo: 1 caixa com 100 unidades por R$ 45,00 -> R$ 0,45 por unidade.
 * Exemplo: 1 caixa com 12 unidades por R$ 36,00 -> R$ 3,00 por unidade.
 */
export function calculatePackagingUnitCost(
  purchaseQuantity: number,
  packageUnitsCount: number,
  purchasePrice: number
): number {
  if (purchaseQuantity <= 0 || packageUnitsCount <= 0 || purchasePrice <= 0 || isNaN(purchasePrice)) {
    return 0;
  }
  const totalUnits = purchaseQuantity * packageUnitsCount;
  if (totalUnits <= 0) return 0;
  return Number((purchasePrice / totalUnits).toFixed(4));
}

/**
 * Calcula o custo unitário base de um ingrediente (por grama, por ml ou por unidade)
 * considerando o fator de rendimento/aproveitamento (Índice de Aproveitamento / Fator de Correção).
 * 
 * Regra:
 * Se o rendimento for 80% (20% de perda em aparas/cascas), a quantidade aproveitável
 * é menor, logo o custo por grama aproveitável é proporcionalmente maior.
 * 
 * Permite cadastrar conteúdo de caixas, pacotes e fardos (ex: 1 caixa com 12 un por R$ 36,00 -> R$ 3,00/un).
 */
export function calculateIngredientBaseCost(
  purchaseQuantity: number,
  purchaseUnit: MeasurementUnit,
  purchasePrice: number,
  yieldFactorPercent: number = 100,
  packageUnitsCount?: number
): number {
  if (purchaseQuantity <= 0 || purchasePrice <= 0 || isNaN(purchaseQuantity) || isNaN(purchasePrice)) {
    return 0;
  }

  const safeYield = yieldFactorPercent > 0 ? Math.min(Math.max(yieldFactorPercent, 1), 100) : 100;

  // Se for unidade de contagem em pacote/caixa/fardo com unidades informadas
  if ((purchaseUnit === 'cx' || purchaseUnit === 'fardo' || purchaseUnit === 'pct') && packageUnitsCount && packageUnitsCount > 0) {
    const totalCountUnits = purchaseQuantity * packageUnitsCount;
    const usableUnits = totalCountUnits * (safeYield / 100);
    return usableUnits > 0 ? purchasePrice / usableUnits : 0;
  }

  const { baseQuantity } = convertToBaseUnit(purchaseQuantity, purchaseUnit);
  if (baseQuantity <= 0) return 0;

  // Quantidade líquida aproveitável na unidade base
  const usableBaseQuantity = baseQuantity * (safeYield / 100);
  if (usableBaseQuantity <= 0) return 0;

  // Custo por unidade base (R$ por grama, por ml ou por unidade)
  return purchasePrice / usableBaseQuantity;
}

export interface ItemCostResult {
  cost: number;
  error?: string;
  rawQuantityUsed?: number;
  baseQuantityUsed?: number;
}

/**
 * Calcula o custo do ingrediente utilizado em uma receita com:
 * 1. Conversão rigorosa de unidades compatíveis (kg <-> g, L <-> ml, un <-> un).
 * 2. Bloqueio de conversão automática massa <-> volume sem densidade explícita.
 * 3. Fator de cocção para ingredientes pesados após o preparo (ex: 1kg cru custa R$ 40 e rende 750g cozido -> 150g cozido = R$ 8,00).
 */
export function calculateItemCost(
  costPerBaseUnit: number,
  purchaseUnit: MeasurementUnit,
  quantityUsed: number,
  unitUsed: MeasurementUnit,
  densityGPerMl?: number,
  cookingYieldFactor?: number,
  isPreparedWeight?: boolean
): ItemCostResult {
  if (quantityUsed <= 0 || costPerBaseUnit <= 0 || isNaN(quantityUsed) || isNaN(costPerBaseUnit)) {
    return { cost: 0 };
  }

  // 1. Tratamento do peso preparado (após o cozimento):
  // Se o ingrediente tem rendimento de cocção (ex: 75%) e o usuário informou o peso já cozido:
  // Quantidade crua necessária = peso preparado / (rendimento% / 100)
  let effectiveQuantity = quantityUsed;
  if (isPreparedWeight && cookingYieldFactor && cookingYieldFactor > 0 && cookingYieldFactor <= 100) {
    const cookingYieldFraction = cookingYieldFactor / 100;
    effectiveQuantity = quantityUsed / cookingYieldFraction;
  }

  const itemBase = convertToBaseUnit(effectiveQuantity, unitUsed);
  const ingredientBase = convertToBaseUnit(1, purchaseUnit);

  // 2. Unidades compatíveis de mesma dimensão
  if (itemBase.baseType === ingredientBase.baseType) {
    const rawCost = itemBase.baseQuantity * costPerBaseUnit;
    return {
      cost: Number(rawCost.toFixed(4)),
      rawQuantityUsed: effectiveQuantity,
      baseQuantityUsed: itemBase.baseQuantity
    };
  }

  // 3. Conversões de Massa ('g') <-> Volume ('ml') protegidas por densidade
  if (itemBase.baseType === 'g' && ingredientBase.baseType === 'ml') {
    if (!densityGPerMl || densityGPerMl <= 0) {
      return {
        cost: 0,
        error: 'Conversão entre massa (g) e volume (ml) requer densidade cadastrada no ingrediente (ex: óleo = 0,92 g/ml).'
      };
    }
    const mlQuantity = itemBase.baseQuantity / densityGPerMl;
    const rawCost = mlQuantity * costPerBaseUnit;
    return {
      cost: Number(rawCost.toFixed(4)),
      rawQuantityUsed: effectiveQuantity,
      baseQuantityUsed: mlQuantity
    };
  }

  if (itemBase.baseType === 'ml' && ingredientBase.baseType === 'g') {
    if (!densityGPerMl || densityGPerMl <= 0) {
      return {
        cost: 0,
        error: 'Conversão entre volume (ml) e massa (g) requer densidade cadastrada no ingrediente (ex: mel = 1,4 g/ml).'
      };
    }
    const gQuantity = itemBase.baseQuantity * densityGPerMl;
    const rawCost = gQuantity * costPerBaseUnit;
    return {
      cost: Number(rawCost.toFixed(4)),
      rawQuantityUsed: effectiveQuantity,
      baseQuantityUsed: gQuantity
    };
  }

  // Se forem contagens
  if (itemBase.baseType === 'un' && ingredientBase.baseType === 'un') {
    const rawCost = itemBase.baseQuantity * costPerBaseUnit;
    return {
      cost: Number(rawCost.toFixed(4)),
      rawQuantityUsed: effectiveQuantity,
      baseQuantityUsed: itemBase.baseQuantity
    };
  }

  return {
    cost: 0,
    error: `Incompatibilidade de unidades: não é possível converter ${unitUsed} para ${purchaseUnit}.`
  };
}

/**
 * Formação do Preço de Venda pelo Método do Divisor (Margem sobre o Preço de Venda):
 * 
 * Preço = Custo Base / [ 1 - (Impostos% + Taxas Cartão% + Taxa App% + Margem Líquida%) / 100 ]
 * 
 * Protegido contra divisões por zero ou denominadores nulos/negativos.
 */
export function calculateSuggestedSellingPrice(
  costBase: number,
  taxesAndFeesPercent: number,
  targetMarginPercent: number
): { suggestedPrice: number; markup: number; isValid: boolean; warning?: string } {
  if (costBase <= 0) {
    return { suggestedPrice: 0, markup: 0, isValid: true };
  }

  const totalDeductionsPercent = taxesAndFeesPercent + targetMarginPercent;

  if (totalDeductionsPercent >= 100) {
    return {
      suggestedPrice: 0,
      markup: 0,
      isValid: false,
      warning: `A soma de impostos/taxas (${taxesAndFeesPercent.toFixed(1)}%) e margem desejada (${targetMarginPercent.toFixed(1)}%) atinge ${totalDeductionsPercent.toFixed(1)}%, tornando impossível o cálculo do divisor.`
    };
  }

  const divisor = 1 - (totalDeductionsPercent / 100);
  const suggestedPrice = costBase / divisor;
  const markup = suggestedPrice / costBase;

  return {
    suggestedPrice: Number(suggestedPrice.toFixed(2)),
    markup: Number(markup.toFixed(2)),
    isValid: true
  };
}

/**
 * Arredondamento comercial para cardápio (ex: R$ 20,90 ou R$ 21,00)
 */
export function roundCommercialPrice(price: number, type: 'ceil' | '90' | '99' | '50'): number {
  if (price <= 0) return 0;
  switch (type) {
    case 'ceil':
      return Math.ceil(price);
    case '90': {
      const base = Math.floor(price);
      return Number((base + 0.90).toFixed(2));
    }
    case '99': {
      const base = Math.floor(price);
      return Number((base + 0.99).toFixed(2));
    }
    case '50': {
      const base = Math.floor(price);
      return Number((base + 0.50).toFixed(2));
    }
    default:
      return price;
  }
}

/**
 * Consolida todo o demonstrativo financeiro e DRE da receita
 */
export function calculateRecipeFinancials(
  recipe: Recipe,
  ingredientsMap: Map<string, Ingredient>,
  packagingsMap?: Map<string, Packaging>
): RecipeFinancialSummary {
  const portions = Math.max(recipe.portions || 1, 1);
  
  // 1. Custo total dos ingredientes atualizado em tempo real
  let totalIngredientsCost = 0;
  for (const item of recipe.items || []) {
    const ing = ingredientsMap.get(item.ingredientId);
    if (ing) {
      const { cost: itemCost } = calculateItemCost(
        ing.costPerBaseUnit,
        ing.purchaseUnit,
        item.quantityUsed,
        item.unitUsed,
        ing.densityGPerMl,
        ing.cookingYieldFactor,
        item.isPreparedWeight
      );
      totalIngredientsCost += itemCost;
    } else {
      totalIngredientsCost += item.cost || 0;
    }
  }

  // 2. Custos por porção
  const ingredientsCostPerPortion = totalIngredientsCost / portions;

  // Se houver lista de embalagens vinculadas, somamos seu custo total (com custo atualizado pelo packagingsMap se disponível)
  let detailedPackagingCost = 0;
  if (recipe.packagingItems && recipe.packagingItems.length > 0) {
    detailedPackagingCost = recipe.packagingItems.reduce((acc, p) => {
      const currentPkg = packagingsMap?.get(p.packagingId);
      const unitCost = currentPkg ? currentPkg.costPerUnit : p.unitCost;
      return acc + (unitCost * p.quantityUsed);
    }, 0);
  }
  const packagingCostPerPortion = detailedPackagingCost > 0 ? detailedPackagingCost : (recipe.packagingCost || 0);

  const otherDirectCostPerPortion = recipe.otherDirectCosts || 0;
  const totalDirectCostPerPortion = ingredientsCostPerPortion + packagingCostPerPortion + otherDirectCostPerPortion;
  
  const indirectCostPerPortion = recipe.indirectCostPerUnit || 0;
  const totalCostBasePerPortion = totalDirectCostPerPortion + indirectCostPerPortion;

  // 3. Taxas sobre a venda
  const taxPercentage = Math.max(recipe.taxPercentage || 0, 0);
  const cardFeePercentage = Math.max(recipe.cardFeePercentage || 0, 0);
  const deliveryAppPercentage = Math.max(recipe.deliveryAppPercentage || 0, 0);
  const totalTaxesAndFeesPercentage = taxPercentage + cardFeePercentage + deliveryAppPercentage;

  // 4. Preço de Venda Sugerido
  const targetProfitMargin = Math.max(recipe.targetProfitMargin || 0, 0);
  const { suggestedPrice, markup: suggestedMarkup } = calculateSuggestedSellingPrice(
    totalCostBasePerPortion,
    totalTaxesAndFeesPercentage,
    targetProfitMargin
  );

  const suggestedNetProfit = suggestedPrice > 0 
    ? suggestedPrice * (targetProfitMargin / 100) 
    : 0;
  const suggestedNetMargin = targetProfitMargin;

  // 5. Preço Praticado / Simulado (se o usuário alterar ou usar o sugerido)
  const actualSellingPrice = recipe.sellingPrice > 0 ? recipe.sellingPrice : suggestedPrice;

  // Deduções proporcionais sobre o preço praticado
  const actualTaxesValue = actualSellingPrice * (taxPercentage / 100);
  const actualCardFeeValue = actualSellingPrice * (cardFeePercentage / 100);
  const actualDeliveryAppValue = actualSellingPrice * (deliveryAppPercentage / 100);
  const actualTotalVariableDeductions = actualTaxesValue + actualCardFeeValue + actualDeliveryAppValue;

  // Lucro Bruto / Margem de Contribuição após custos diretos e deduções de venda
  const actualGrossProfit = actualSellingPrice - actualTotalVariableDeductions - totalDirectCostPerPortion;
  const actualGrossMargin = actualSellingPrice > 0 ? (actualGrossProfit / actualSellingPrice) * 100 : 0;

  // Lucro Líquido Real (após custos diretos, indiretos e todas as taxas)
  const actualNetProfit = actualSellingPrice - (totalCostBasePerPortion + actualTotalVariableDeductions);
  const actualNetMargin = actualSellingPrice > 0 ? (actualNetProfit / actualSellingPrice) * 100 : 0;
  const actualMarkup = totalCostBasePerPortion > 0 ? actualSellingPrice / totalCostBasePerPortion : 0;

  // Fator de cocção
  const cookingYieldFactor = (recipe.rawWeightGrams && recipe.rawWeightGrams > 0 && recipe.cookedWeightGrams && recipe.cookedWeightGrams > 0)
    ? recipe.cookedWeightGrams / recipe.rawWeightGrams
    : undefined;

  return {
    totalIngredientsCost: Number(totalIngredientsCost.toFixed(2)),
    ingredientsCostPerPortion: Number(ingredientsCostPerPortion.toFixed(2)),
    packagingCostPerPortion: Number(packagingCostPerPortion.toFixed(2)),
    otherDirectCostPerPortion: Number(otherDirectCostPerPortion.toFixed(2)),
    totalDirectCostPerPortion: Number(totalDirectCostPerPortion.toFixed(2)),
    indirectCostPerPortion: Number(indirectCostPerPortion.toFixed(2)),
    totalCostBasePerPortion: Number(totalCostBasePerPortion.toFixed(2)),
    totalTaxesAndFeesPercentage: Number(totalTaxesAndFeesPercentage.toFixed(2)),

    suggestedPrice: Number(suggestedPrice.toFixed(2)),
    suggestedMarkup: Number(suggestedMarkup.toFixed(2)),
    suggestedNetProfit: Number(suggestedNetProfit.toFixed(2)),
    suggestedNetMargin: Number(suggestedNetMargin.toFixed(1)),

    actualSellingPrice: Number(actualSellingPrice.toFixed(2)),
    actualTaxesValue: Number(actualTaxesValue.toFixed(2)),
    actualCardFeeValue: Number(actualCardFeeValue.toFixed(2)),
    actualDeliveryAppValue: Number(actualDeliveryAppValue.toFixed(2)),
    actualTotalVariableDeductions: Number(actualTotalVariableDeductions.toFixed(2)),
    actualGrossProfit: Number(actualGrossProfit.toFixed(2)),
    actualGrossMargin: Number(actualGrossMargin.toFixed(1)),
    actualNetProfit: Number(actualNetProfit.toFixed(2)),
    actualNetMargin: Number(actualNetMargin.toFixed(1)),
    actualMarkup: Number(actualMarkup.toFixed(2)),

    cookingYieldFactor: cookingYieldFactor ? Number(cookingYieldFactor.toFixed(2)) : undefined
  };
}

/**
 * Formatadores monetários e de porcentagem em padrão pt-BR
 */
export function formatCurrencyBRL(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}
