import { Ingredient, Recipe, Packaging } from '../types';
import { calculateIngredientBaseCost, calculatePackagingUnitCost } from '../utils/calculator';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-arroz-5kg',
    name: 'Arroz Tipo 1 Longo Fino',
    category: 'Grãos e Cereais',
    purchaseQuantity: 5,
    purchaseUnit: 'kg',
    purchasePrice: 25.00,
    yieldFactor: 100, // Sem perdas no pacote
    costPerBaseUnit: calculateIngredientBaseCost(5, 'kg', 25.00, 100), // R$ 0,005 por grama
    notes: 'Base do teste padrão: 5kg a R$ 25 resulta em R$ 0,50 por 100g.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-frango-file',
    name: 'Filé de Peito de Frango Limpo',
    category: 'Proteínas e Carnes',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 22.00,
    yieldFactor: 95, // 5% de apara de gordura
    costPerBaseUnit: calculateIngredientBaseCost(1, 'kg', 22.00, 95),
    notes: 'Aproveitamento de 95% após limpeza leve.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-brocolis',
    name: 'Brócolis Fresco Ninja',
    category: 'Hortifrúti e Vegetais',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 7.50,
    yieldFactor: 75, // 25% de perda em talos duros
    costPerBaseUnit: calculateIngredientBaseCost(500, 'g', 7.50, 75),
    notes: 'Talos grossos descartados no pré-preparo.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-azeite-extra-virgem',
    name: 'Azeite de Oliva Extra Virgem',
    category: 'Temperos e Molhos',
    purchaseQuantity: 500,
    purchaseUnit: 'ml',
    purchasePrice: 38.00,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(500, 'ml', 38.00, 100),
    notes: 'Garrafa de vidro 500ml.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-alho-triturado',
    name: 'Alho Roxo Descascado',
    category: 'Temperos e Molhos',
    purchaseQuantity: 200,
    purchaseUnit: 'g',
    purchasePrice: 6.00,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(200, 'g', 6.00, 100),
    notes: 'Comprado já descascado.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-carne-blend',
    name: 'Blend Bovino (Fraldinha + Acém)',
    category: 'Proteínas e Carnes',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 35.00,
    yieldFactor: 95,
    costPerBaseUnit: calculateIngredientBaseCost(1, 'kg', 35.00, 95),
    notes: 'Moído duas vezes com 18% de gordura de peito.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-pao-brioche',
    name: 'Pão de Brioche Artesanal com Gergelim',
    category: 'Farinhas e Panificação',
    purchaseQuantity: 6,
    purchaseUnit: 'un',
    purchasePrice: 15.00,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(6, 'un', 15.00, 100), // R$ 2,50/un
    notes: 'Pacote com 6 pães de 80g selados.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-queijo-cheddar',
    name: 'Queijo Cheddar Fatiado Especial',
    category: 'Laticínios e Frios',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 24.00,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(500, 'g', 24.00, 100),
    notes: 'Cerca de 25 fatias de 20g.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-bacon-fatiado',
    name: 'Bacon Defumado em Fatias',
    category: 'Proteínas e Carnes',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 19.00,
    yieldFactor: 90, // Perda de gordura ao fritar crocante
    costPerBaseUnit: calculateIngredientBaseCost(500, 'g', 19.00, 90),
    notes: 'Fatias finas prontas para grelha.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-cenoura',
    name: 'Cenoura Fresca',
    category: 'Hortifrúti e Vegetais',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 6.00,
    yieldFactor: 85, // 15% de perda no descasque
    costPerBaseUnit: calculateIngredientBaseCost(1, 'kg', 6.00, 85),
    notes: 'Descascada e ralada para massas.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-farinha-trigo',
    name: 'Farinha de Trigo Especial',
    category: 'Farinhas e Panificação',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 5.50,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(1, 'kg', 5.50, 100),
    notes: 'Tipo 1 enriquecida.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-ovos-dz',
    name: 'Ovos Brancos Médios',
    category: 'Laticínios e Frios',
    purchaseQuantity: 1,
    purchaseUnit: 'dz',
    purchasePrice: 12.00,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(1, 'dz', 12.00, 100), // R$ 1,00/un
    notes: 'Cartela com 12 unidades.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-leite-condensado',
    name: 'Leite Condensado Integral 395g',
    category: 'Laticínios e Frios',
    purchaseQuantity: 1,
    purchaseUnit: 'un',
    purchasePrice: 6.80,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(1, 'un', 6.80, 100),
    notes: 'Lata/caixinha tradicional.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-cacau-po',
    name: 'Cacau em Pó 50% Solúvel',
    category: 'Doces e Confeitaria',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 18.50,
    yieldFactor: 100,
    costPerBaseUnit: calculateIngredientBaseCost(500, 'g', 18.50, 100),
    notes: 'Para caldas e brigadeiros gourmet.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-marmita-fit',
    name: 'Marmita Fit: Frango Grelhado, Arroz e Brócolis',
    category: 'Marmitas e Refeições',
    portions: 4,
    rawWeightGrams: 1600,
    cookedWeightGrams: 1520, // Rende 4 potes de 380g
    packagingCost: 1.60, // Pote PP 500ml com tampa hermética + selo inviolável
    otherDirectCosts: 0.40, // Etiqueta térmica de data/tabela nutricional
    indirectCostPerUnit: 2.50, // Rateio de água, luz, gás, aluguel e pró-labore
    taxPercentage: 4.0, // Simples Nacional Comércio/Alimentação
    cardFeePercentage: 2.5, // Média débito/crédito
    deliveryAppPercentage: 14.0, // Taxa média app delivery
    targetProfitMargin: 25.0, // 25% de margem líquida real sobre o preço de venda
    items: [
      {
        id: 'item-1',
        ingredientId: 'ing-frango-file',
        ingredientName: 'Filé de Peito de Frango Limpo',
        quantityUsed: 800,
        unitUsed: 'g',
        cost: 18.52
      },
      {
        id: 'item-2',
        ingredientId: 'ing-arroz-5kg',
        ingredientName: 'Arroz Tipo 1 Longo Fino',
        quantityUsed: 400,
        unitUsed: 'g',
        cost: 2.00 // 400g * 0.005 = R$ 2,00 (rende ~1kg cozido)
      },
      {
        id: 'item-3',
        ingredientId: 'ing-brocolis',
        ingredientName: 'Brócolis Fresco Ninja',
        quantityUsed: 300,
        unitUsed: 'g',
        cost: 6.00
      },
      {
        id: 'item-4',
        ingredientId: 'ing-azeite-extra-virgem',
        ingredientName: 'Azeite de Oliva Extra Virgem',
        quantityUsed: 40,
        unitUsed: 'ml',
        cost: 3.04
      },
      {
        id: 'item-5',
        ingredientId: 'ing-alho-triturado',
        ingredientName: 'Alho Roxo Descascado',
        quantityUsed: 20,
        unitUsed: 'g',
        cost: 0.60
      }
    ],
    suggestedPrice: 20.90,
    sellingPrice: 21.90, // Preço praticado sugerido
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-smash-burger',
    name: 'Smash Burger Artesanal Duplo com Bacon',
    category: 'Hambúrgueres e Lanches',
    portions: 1,
    rawWeightGrams: 280,
    cookedWeightGrams: 240,
    packagingCost: 1.80, // Caixa kraft térmica + papel acoplado anti-gordura + lacre
    otherDirectCosts: 0.50, // Guardanapos premium e sachê de maionese artesanal
    indirectCostPerUnit: 3.20, // Rateio chapa, exaustão, energia, aluguel
    taxPercentage: 5.5,
    cardFeePercentage: 2.8,
    deliveryAppPercentage: 20.0, // iFood Entrega Parceira
    targetProfitMargin: 22.0, // 22% de margem líquida
    items: [
      {
        id: 'item-b1',
        ingredientId: 'ing-carne-blend',
        ingredientName: 'Blend Bovino (Fraldinha + Acém)',
        quantityUsed: 160, // 2 smash de 80g
        unitUsed: 'g',
        cost: 5.89
      },
      {
        id: 'item-b2',
        ingredientId: 'ing-pao-brioche',
        ingredientName: 'Pão de Brioche Artesanal com Gergelim',
        quantityUsed: 1,
        unitUsed: 'un',
        cost: 2.50
      },
      {
        id: 'item-b3',
        ingredientId: 'ing-queijo-cheddar',
        ingredientName: 'Queijo Cheddar Fatiado Especial',
        quantityUsed: 40, // 2 fatias
        unitUsed: 'g',
        cost: 1.92
      },
      {
        id: 'item-b4',
        ingredientId: 'ing-bacon-fatiado',
        ingredientName: 'Bacon Defumado em Fatias',
        quantityUsed: 50,
        unitUsed: 'g',
        cost: 2.11
      }
    ],
    suggestedPrice: 35.80,
    sellingPrice: 36.90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-bolo-cenoura',
    name: 'Bolo Vulcão de Cenoura com Brigadeiro',
    category: 'Confeitaria e Sobremesas',
    portions: 8, // 8 fatias generosas
    rawWeightGrams: 1400,
    cookedWeightGrams: 1350,
    packagingCost: 3.50, // Cinta kraft, prato boleiro com cúpula cristal e fita
    otherDirectCosts: 0.80, // Adesivo personalizado SAGA Code Confeitaria
    indirectCostPerUnit: 1.80, // Forno a gás, batedeira, refrigeração
    taxPercentage: 4.0,
    cardFeePercentage: 2.5,
    deliveryAppPercentage: 0.0, // Venda direta balcão / encomenda
    targetProfitMargin: 35.0, // 35% de margem em confeitaria
    items: [
      {
        id: 'item-c1',
        ingredientId: 'ing-cenoura',
        ingredientName: 'Cenoura Fresca',
        quantityUsed: 350,
        unitUsed: 'g',
        cost: 2.47
      },
      {
        id: 'item-c2',
        ingredientId: 'ing-farinha-trigo',
        ingredientName: 'Farinha de Trigo Especial',
        quantityUsed: 300,
        unitUsed: 'g',
        cost: 1.65
      },
      {
        id: 'item-c3',
        ingredientId: 'ing-ovos-dz',
        ingredientName: 'Ovos Brancos Médios',
        quantityUsed: 4,
        unitUsed: 'un',
        cost: 4.00
      },
      {
        id: 'item-c4',
        ingredientId: 'ing-leite-condensado',
        ingredientName: 'Leite Condensado Integral 395g',
        quantityUsed: 2,
        unitUsed: 'un',
        cost: 13.60
      },
      {
        id: 'item-c5',
        ingredientId: 'ing-cacau-po',
        ingredientName: 'Cacau em Pó 50% Solúvel',
        quantityUsed: 80,
        unitUsed: 'g',
        cost: 2.96
      }
    ],
    suggestedPrice: 58.00,
    sellingPrice: 60.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PACKAGINGS: Packaging[] = [
  {
    id: 'pkg-pote-kraft-750',
    name: 'Pote Marmitex Kraft 750ml c/ Tampa Hermética',
    category: 'Marmitex e Potes',
    purchaseQuantity: 1,
    packageUnitsCount: 100,
    purchaseUnit: 'cx',
    purchasePrice: 85.00,
    costPerUnit: calculatePackagingUnitCost(1, 100, 85.00), // R$ 0,85
    notes: 'Caixa com 100 potes kraft impermeabilizados para delivery quente.',
    supplier: 'Embalagens Brasil',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pkg-cx-burger-kraft',
    name: 'Caixa de Hambúrguer Kraft Anti-Gordura',
    category: 'Caixas e Bandejas',
    purchaseQuantity: 1,
    packageUnitsCount: 100,
    purchaseUnit: 'cx',
    purchasePrice: 65.00,
    costPerUnit: calculatePackagingUnitCost(1, 100, 65.00), // R$ 0,65
    notes: 'Com respiro de vapor para batatas e burgers artesanais.',
    supplier: 'Distribuidora SAGA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pkg-prato-bolo-cupula',
    name: 'Prato Boleiro c/ Cúpula Cristal 24cm',
    category: 'Caixas e Bandejas',
    purchaseQuantity: 1,
    packageUnitsCount: 20,
    purchaseUnit: 'cx',
    purchasePrice: 48.00,
    costPerUnit: calculatePackagingUnitCost(1, 20, 48.00), // R$ 2,40
    notes: 'Ideal para bolos caseiros e tortas inteiras.',
    supplier: 'Plasfood',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pkg-sacola-kraft-g',
    name: 'Sacola Kraft Delivery G c/ Alça Torcida',
    category: 'Sacolas e Transporte',
    purchaseQuantity: 1,
    packageUnitsCount: 100,
    purchaseUnit: 'fardo',
    purchasePrice: 75.00,
    costPerUnit: calculatePackagingUnitCost(1, 100, 75.00), // R$ 0,75
    notes: 'Capacidade para até 3 marmitas empilhadas.',
    supplier: 'Papel & Arte Embalagens',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pkg-lacre-seguranca',
    name: 'Lacre de Segurança Adesivo Inviolável',
    category: 'Lacre e Etiquetas',
    purchaseQuantity: 1,
    packageUnitsCount: 1000,
    purchaseUnit: 'pct',
    purchasePrice: 40.00,
    costPerUnit: calculatePackagingUnitCost(1, 1000, 40.00), // R$ 0,04
    notes: 'Rolo com 1.000 etiquetas com corte de segurança.',
    supplier: 'Etiquetas Express',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pkg-kit-talher-madeira',
    name: 'Kit Talher de Madeira Reflorestada + Guardanapo',
    category: 'Higiene e Talheres',
    purchaseQuantity: 1,
    packageUnitsCount: 50,
    purchaseUnit: 'pct',
    purchasePrice: 35.00,
    costPerUnit: calculatePackagingUnitCost(1, 50, 35.00), // R$ 0,70
    notes: 'Garfo, faca e guardanapo biodegradável selado individualmente.',
    supplier: 'EcoFood Utensils',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

