/**
 * Tipos e interfaces da Calculadora de Custos e Precificação - SAGA Code
 */

export type WeightUnit = 'kg' | 'g';
export type VolumeUnit = 'l' | 'ml';
export type CountUnit = 'un' | 'dz' | 'pct' | 'cx' | 'fardo';

export type MeasurementUnit = WeightUnit | VolumeUnit | CountUnit;

export type IngredientCategory = 
  | 'Proteínas e Carnes'
  | 'Grãos e Cereais'
  | 'Hortifrúti e Vegetais'
  | 'Laticínios e Frios'
  | 'Temperos e Molhos'
  | 'Farinhas e Panificação'
  | 'Doces e Confeitaria'
  | 'Embalagens e Descartáveis'
  | 'Outros Insumos';

export interface Ingredient {
  id: string;
  userId?: string;
  name: string;
  category: IngredientCategory;
  purchaseQuantity: number;
  purchaseUnit: MeasurementUnit;
  packageUnitsCount?: number; // Para caixas/fardos/pacotes (ex: 12 unidades por caixa)
  purchasePrice: number; // Preço total pago pelo pacote/fardo/quantidade comprada
  yieldFactor: number; // Índice de aproveitamento em % (100 = sem perdas, 80 = 20% de perda de casca/apara)
  cookingYieldFactor?: number; // Rendimento de cocção em % (ex: 75% -> 1000g cru rende 750g cozido)
  densityGPerMl?: number; // Densidade em g/ml para conversões seguras de massa <-> volume (ex: leite 1.03, óleo 0.92)
  costPerBaseUnit: number; // Custo efetivo por grama (g), mililitro (ml) ou unidade (un)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PackagingCategory = 
  | 'Marmitex e Potes'
  | 'Caixas e Bandejas'
  | 'Sacolas e Transporte'
  | 'Higiene e Talheres'
  | 'Lacre e Etiquetas'
  | 'Outros';

export interface Packaging {
  id: string;
  userId?: string;
  name: string;
  category: PackagingCategory;
  purchaseQuantity: number; // Ex: 1 (caixa)
  packageUnitsCount: number; // Ex: 100 (unidades dentro da caixa)
  purchaseUnit: MeasurementUnit; // 'un' | 'cx' | 'pct'
  purchasePrice: number; // Ex: R$ 45,00
  costPerUnit: number; // Preço unitário real (ex: R$ 0,45)
  notes?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipePackagingItem {
  id: string;
  packagingId: string;
  packagingName: string;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
}

export interface RecipeItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantityUsed: number;
  unitUsed: MeasurementUnit;
  isPreparedWeight?: boolean; // Se a quantidade informada refere-se ao peso já pronto/cozido
  // Valores calculados em tempo real com base no custo atual do ingrediente:
  cost: number;
}

export type RecipeCategory =
  | 'Marmitas e Refeições'
  | 'Pizzas e Massas'
  | 'Hambúrgueres e Lanches'
  | 'Confeitaria e Sobremesas'
  | 'Pães e Salgados'
  | 'Bebidas e Sucos'
  | 'Outros';

export interface Recipe {
  id: string;
  userId?: string;
  name: string;
  category: RecipeCategory;
  portions: number; // Rendimento em porções ou unidades produzidas
  rawWeightGrams?: number; // Peso cru total
  cookedWeightGrams?: number; // Peso final após cozimento/assar
  packagingCost: number; // Custo da embalagem por porção (pote, tampa, lacre, etiqueta)
  packagingItems?: RecipePackagingItem[]; // Embalagens detalhadas selecionadas do inventário
  otherDirectCosts: number; // Outros custos diretos por porção (guardanapo, talher, sachês)
  
  // Rateio e parâmetros de precificação
  indirectCostPerUnit: number; // Rateio de custos fixos por porção (aluguel, água, luz, gás, pró-labore)
  taxPercentage: number; // Impostos sobre a venda (ex: Simples Nacional 4% a 8%)
  cardFeePercentage: number; // Taxa média de cartão / maquininha (ex: 2.5%)
  deliveryAppPercentage: number; // Comissão de aplicativo (ex: iFood 12% a 23% ou 0% balcão)
  targetProfitMargin: number; // Margem líquida desejada sobre o preço de venda (%)
  
  items: RecipeItem[];
  
  // Preços
  suggestedPrice: number; // Preço calculado pelo método do divisor
  sellingPrice: number; // Preço real praticado / simulado pelo empreendedor
  
  createdAt: string;
  updatedAt: string;
}

export type PipelineStage = 
  | 'ingredients' 
  | 'packagings' 
  | 'recipe' 
  | 'fixed-expenses' 
  | 'pricing' 
  | 'results' 
  | 'saved';

export type BusinessSegment = 
  | 'marmitaria' 
  | 'pizzaria' 
  | 'hamburgueria' 
  | 'padaria' 
  | 'confeitaria' 
  | 'restaurante';

export interface RecipeFinancialSummary {
  totalIngredientsCost: number;
  ingredientsCostPerPortion: number;
  packagingCostPerPortion: number;
  otherDirectCostPerPortion: number;
  totalDirectCostPerPortion: number;
  indirectCostPerPortion: number;
  totalCostBasePerPortion: number; // Custo Total (Direto + Indireto)
  
  totalTaxesAndFeesPercentage: number;
  
  suggestedPrice: number;
  suggestedMarkup: number; // Preço / Custo Base
  suggestedNetProfit: number;
  suggestedNetMargin: number;
  
  // Métricas do Preço Praticado (Simulado)
  actualSellingPrice: number;
  actualTaxesValue: number;
  actualCardFeeValue: number;
  actualDeliveryAppValue: number;
  actualTotalVariableDeductions: number;
  actualGrossProfit: number; // Preço - Custos Diretos
  actualGrossMargin: number; // Lucro Bruto / Preço
  actualNetProfit: number; // Sobra líquida real após custos diretos, indiretos e taxas
  actualNetMargin: number; // Lucro Líquido / Preço
  actualMarkup: number; // Preço Praticado / Custo Base
  
  cookingYieldFactor?: number; // Fator de cocção (Peso cozido / Peso cru)
}

export interface CalculationTestResult {
  title: string;
  category: string;
  description: string;
  inputs: Record<string, any>;
  expectedOutput: string | number;
  actualOutput: string | number;
  passed: boolean;
  explanation: string;
}
