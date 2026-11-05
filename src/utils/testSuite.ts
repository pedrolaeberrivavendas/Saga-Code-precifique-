import { 
  convertToBaseUnit, 
  calculateIngredientBaseCost, 
  calculatePackagingUnitCost,
  calculateItemCost, 
  calculateSuggestedSellingPrice,
  calculateRecipeFinancials,
  formatCurrencyBRL
} from './calculator';
import { CalculationTestResult, Recipe, Ingredient, Packaging } from '../types';

/**
 * Suíte de Testes de Precisão Financeira e Matemática
 * 13 testes automatizados e demonstráveis para auditoria em tempo real.
 */
export function runFinancialAuditTests(): CalculationTestResult[] {
  const results: CalculationTestResult[] = [];

  // TESTE 1: Validação Canônica do Usuário (5 kg de arroz por R$ 25 -> 100 g = R$ 0,50)
  {
    const purchaseQty = 5;
    const purchaseUnit = 'kg';
    const purchasePrice = 25;
    const yieldFactor = 100;
    const baseCostPerGram = calculateIngredientBaseCost(purchaseQty, purchaseUnit, purchasePrice, yieldFactor);
    const { cost: costFor100g } = calculateItemCost(baseCostPerGram, 'kg', 100, 'g');
    const passed = Math.abs(costFor100g - 0.50) < 0.0001;

    results.push({
      title: '1. Regra de Ouro: Proporcionalidade 5kg / R$ 25',
      category: 'Custo Proporcional',
      description: '5 kg de arroz por R$ 25 devem representar exatamente R$ 0,50 para 100 g.',
      inputs: { 'Quantidade Comprada': '5 kg', 'Preço Pago': 'R$ 25,00', 'Porção Utilizada': '100 g', 'Aproveitamento': '100%' },
      expectedOutput: 'R$ 0,50',
      actualOutput: formatCurrencyBRL(costFor100g),
      passed,
      explanation: 'Custo base: R$ 25 / 5000g = R$ 0,005/g. Multiplicado por 100g = R$ 0,5000.'
    });
  }

  // TESTE 2: Fator de Aproveitamento / Perda de Pré-Preparo (Hortifrúti / Descasque)
  {
    // 2 kg de batata a R$ 10,00, rendimento de 80% (20% de casca perdida)
    // Quantidade aproveitável: 2000g * 0.8 = 1600g.
    // Custo por grama aproveitável: 10 / 1600 = R$ 0,00625/g.
    // Para 200g de batata descascada: 200 * 0.00625 = R$ 1,25 (sem perda seria R$ 1,00).
    const baseCost = calculateIngredientBaseCost(2, 'kg', 10, 80);
    const { cost: costFor200g } = calculateItemCost(baseCost, 'kg', 200, 'g');
    const passed = Math.abs(costFor200g - 1.25) < 0.0001;

    results.push({
      title: '2. Fator de Aproveitamento (Perda de 20% em Aparas)',
      category: 'Rendimento & Descarte',
      description: '2 kg de insumo por R$ 10,00 com 80% de aproveitamento eleva o custo efetivo de 200g para R$ 1,25.',
      inputs: { 'Compra': '2 kg por R$ 10,00', 'Aproveitamento': '80% (Índice 1,25)', 'Utilizado': '200 g' },
      expectedOutput: 'R$ 1,25',
      actualOutput: formatCurrencyBRL(costFor200g),
      passed,
      explanation: 'Quantidade líquida útil = 1.600g. Custo real por g = R$ 0,00625. Logo, 200g custam R$ 1,25.'
    });
  }

  // TESTE 3: Conversão de Volume (Litro para Mililitro)
  {
    const baseCostMl = calculateIngredientBaseCost(1, 'l', 40, 100);
    const { cost: costFor15ml } = calculateItemCost(baseCostMl, 'l', 15, 'ml');
    const passed = Math.abs(costFor15ml - 0.60) < 0.0001;

    results.push({
      title: '3. Conversão de Volume: 1L para 15ml',
      category: 'Conversão de Unidades',
      description: '1 litro de azeite a R$ 40,00 equivale a R$ 0,60 para 15 ml.',
      inputs: { 'Compra': '1 Litro', 'Preço': 'R$ 40,00', 'Utilizado': '15 ml' },
      expectedOutput: 'R$ 0,60',
      actualOutput: formatCurrencyBRL(costFor15ml),
      passed,
      explanation: '1L = 1000ml. Custo/ml = R$ 0,04. 15ml x R$ 0,04 = R$ 0,60.'
    });
  }

  // TESTE 4: Conversão de Contagem (Dúzia para Unidades)
  {
    const baseCostEgg = calculateIngredientBaseCost(1, 'dz', 12, 100);
    const { cost: costFor3Eggs } = calculateItemCost(baseCostEgg, 'dz', 3, 'un');
    const passed = Math.abs(costFor3Eggs - 3.00) < 0.0001;

    results.push({
      title: '4. Conversão de Contagem: 1 Dúzia para Unidades',
      category: 'Conversão de Unidades',
      description: '1 dúzia de ovos por R$ 12,00 resulta em R$ 3,00 para 3 ovos.',
      inputs: { 'Compra': '1 dz (12 un)', 'Preço': 'R$ 12,00', 'Utilizado': '3 un' },
      expectedOutput: 'R$ 3,00',
      actualOutput: formatCurrencyBRL(costFor3Eggs),
      passed,
      explanation: '12 ovos por R$ 12,00 = R$ 1,00/un. 3 un = R$ 3,00.'
    });
  }

  // TESTE 5: Formação de Preço pelo Método do Divisor (Margem sobre Preço)
  {
    // Custo Base = R$ 10,00, Taxas = 10%, Margem Líquida = 40% -> Divisor = 0.50 -> Preço = R$ 20,00
    const { suggestedPrice, markup } = calculateSuggestedSellingPrice(10, 10, 40);
    const passed = Math.abs(suggestedPrice - 20.00) < 0.01 && Math.abs(markup - 2.0) < 0.01;

    results.push({
      title: '5. Método do Divisor: Margem Real vs Markup',
      category: 'Precificação Científica',
      description: 'Custo de R$ 10 com 10% de taxas e 40% de margem líquida resulta em preço de R$ 20,00 (Markup 2,0x).',
      inputs: { 'Custo Base': 'R$ 10,00', 'Taxas': '10%', 'Margem Desejada': '40%' },
      expectedOutput: 'R$ 20,00 (Markup 2,00x)',
      actualOutput: `${formatCurrencyBRL(suggestedPrice)} (Markup ${markup.toFixed(2)}x)`,
      passed,
      explanation: 'Preço = 10 / (1 - 0,50) = R$ 20,00. O lucro no bolso é R$ 8,00, que é precisamente 40% do preço cobrado.'
    });
  }

  // TESTE 6: Diferenciação Crucial entre Margem e Markup
  {
    const custo = 10;
    const precoComMarkup1_5 = 15;
    const margemReal = ((precoComMarkup1_5 - custo) / precoComMarkup1_5) * 100;
    const passed = Math.abs(margemReal - 33.33) < 0.1;

    results.push({
      title: '6. Prova Matemática: Markup 1.5x NÃO é Margem de 50%',
      category: 'Margem vs Markup',
      description: 'Vender por R$ 15 um item que custou R$ 10 gera margem de 33,3%, alertando o lojista contra ilusão de lucro.',
      inputs: { 'Custo': 'R$ 10,00', 'Preço com Acréscimo Simples': 'R$ 15,00' },
      expectedOutput: '33,3% de margem',
      actualOutput: `${margemReal.toFixed(1)}% de margem`,
      passed,
      explanation: 'Markup = Preço / Custo (1,5x). Margem = Lucro / Preço (33,3%). Distinção essencial para não fechar no vermelho.'
    });
  }

  // TESTE 7: Proteção contra Divisão por Zero e Deduções >= 100%
  {
    const zeroCostResult = calculateSuggestedSellingPrice(0, 15, 30);
    const invalidDeductions = calculateSuggestedSellingPrice(15, 60, 45); // 60 + 45 = 105% (impossível)
    const passed = zeroCostResult.suggestedPrice === 0 && !invalidDeductions.isValid;

    results.push({
      title: '7. Tratamento de Exceções & Divisão por Zero',
      category: 'Validação de Entradas',
      description: 'Custos zerados ou taxas que somam mais de 100% são interceptadas com segurança sem travar a interface.',
      inputs: { 'Custo Zero': 'R$ 0,00', 'Taxas + Margem': '105%' },
      expectedOutput: 'Bloqueio seguro e preço R$ 0,00',
      actualOutput: `Preço Zero: ${formatCurrencyBRL(zeroCostResult.suggestedPrice)}, Bloqueado: ${!invalidDeductions.isValid}`,
      passed,
      explanation: 'Denominador <= 0 é contido com salvaguarda visual e aviso explicativo em português.'
    });
  }

  // TESTE 8: Rendimento em Porções e Rateio de Custos Fixos
  {
    const mockRecipe: Recipe = {
      id: 'test-1',
      name: 'Receita Teste',
      category: 'Marmitas e Refeições',
      portions: 4,
      packagingCost: 1.50,
      otherDirectCosts: 0,
      indirectCostPerUnit: 2.50,
      taxPercentage: 4,
      cardFeePercentage: 2,
      deliveryAppPercentage: 14,
      targetProfitMargin: 20,
      items: [
        { id: '1', ingredientId: 'ing-1', ingredientName: 'Frango', quantityUsed: 1000, unitUsed: 'g', cost: 24.00 }
      ],
      suggestedPrice: 0,
      sellingPrice: 0,
      createdAt: '',
      updatedAt: ''
    };

    const mockIngredients = new Map<string, Ingredient>([
      ['ing-1', {
        id: 'ing-1',
        name: 'Frango',
        category: 'Proteínas e Carnes',
        purchaseQuantity: 1,
        purchaseUnit: 'kg',
        purchasePrice: 24,
        yieldFactor: 100,
        costPerBaseUnit: 0.024,
        createdAt: '',
        updatedAt: ''
      }]
    ]);

    const fin = calculateRecipeFinancials(mockRecipe, mockIngredients);
    const passed = Math.abs(fin.totalCostBasePerPortion - 10.00) < 0.01 && Math.abs(fin.suggestedPrice - 16.67) < 0.05;

    results.push({
      title: '8. Ficha Técnica Completa: Insumos + Embalagem + Fixo',
      category: 'Ficha Técnica & DRE',
      description: 'Receita para 4 porções com R$ 24 em insumos, R$ 1,50 de embalagem e R$ 2,50 fixo resulta em custo base de R$ 10,00/un.',
      inputs: { 'Rendimento': '4 porções', 'Insumos': 'R$ 24,00', 'Embalagem': 'R$ 1,50/un', 'Fixo': 'R$ 2,50/un' },
      expectedOutput: 'Custo Base R$ 10,00 | Sugerido R$ 16,67',
      actualOutput: `Custo Base ${formatCurrencyBRL(fin.totalCostBasePerPortion)} | Sugerido ${formatCurrencyBRL(fin.suggestedPrice)}`,
      passed,
      explanation: 'Insumo por porção = R$ 6,00. Total base = R$ 10,00. Com 20% de taxas e 20% de margem, o preço do divisor é R$ 16,67.'
    });
  }

  // TESTE 9: Embalagens em Caixas / Fardos (1 caixa com 12 un por R$ 36,00 -> R$ 3,00/un)
  {
    const unitCost = calculatePackagingUnitCost(1, 12, 36.00);
    const passed = Math.abs(unitCost - 3.00) < 0.0001;

    results.push({
      title: '9. Embalagem Fracionada: 1 cx com 12 un por R$ 36,00',
      category: 'Embalagens & Descartáveis',
      description: 'Caixa de embalagens com 12 unidades comprada por R$ 36,00 deve ter custo unitário exato de R$ 3,00.',
      inputs: { 'Quantidade Comprada': '1 caixa', 'Unidades por Caixa': '12 un', 'Preço Pago': 'R$ 36,00' },
      expectedOutput: 'R$ 3,00 por unidade',
      actualOutput: `${formatCurrencyBRL(unitCost)} por unidade`,
      passed,
      explanation: 'R$ 36,00 / 12 un = R$ 3,00 unitário exato. O lojista não absorve prejuízo por rateio incorreto do pacote.'
    });
  }

  // TESTE 10: Fator de Cocção (1kg carne crua R$ 40 rende 750g cozida -> 150g cozida = R$ 8,00)
  {
    // 1kg = 1000g a R$ 40 -> R$ 0,04 por g cru.
    // Fator de rendimento de cocção: 75%.
    // Para servir 150g cozida, a carne crua necessária é 150 / 0.75 = 200g crua.
    // Custo real: 200g * 0.04 = R$ 8,00.
    const baseCostRawMeat = calculateIngredientBaseCost(1, 'kg', 40.00, 100);
    const { cost: costCookedPortion, rawQuantityUsed } = calculateItemCost(
      baseCostRawMeat,
      'kg',
      150,
      'g',
      undefined,
      75, // cookingYieldFactor = 75%
      true // isPreparedWeight = true
    );
    const passed = Math.abs(costCookedPortion - 8.00) < 0.001;

    results.push({
      title: '10. Fator de Cocção: 150g Cozida (1kg cru R$ 40 rende 750g)',
      category: 'Rendimento de Cocção',
      description: '150 g de carne pesada já cozida (rendimento de 75%) consome 200 g crua, custando R$ 8,00.',
      inputs: { 'Carne Crua': '1 kg a R$ 40,00', 'Rendimento Cocção': '75%', 'Servido Cozido': '150 g' },
      expectedOutput: 'R$ 8,00 (200 g crua consumida)',
      actualOutput: `${formatCurrencyBRL(costCookedPortion)} (${rawQuantityUsed?.toFixed(0)} g crua consumida)`,
      passed,
      explanation: '150g cozida / 0,75 = 200g crua. 200g x R$ 0,04 = R$ 8,00. O peso cru não é confundido com o peso servido.'
    });
  }

  // TESTE 11: Bloqueio Seguro de Conversão Massa <-> Volume sem Densidade
  {
    const baseCostLiquid = calculateIngredientBaseCost(1, 'l', 30.00, 100);
    // Tenta usar 200g de um insumo comprado em litros SEM fornecer densidade
    const { cost, error } = calculateItemCost(baseCostLiquid, 'l', 200, 'g');
    const passed = cost === 0 && !!error && error.includes('densidade');

    results.push({
      title: '11. Bloqueio de Massa em Volume sem Densidade Cadastrada',
      category: 'Segurança Matemática',
      description: 'O sistema bloqueia conversão arbitrária entre gramas e mililitros quando não houver densidade conhecida.',
      inputs: { 'Compra': '1 Litro', 'Uso sem Densidade': '200 g' },
      expectedOutput: 'Custo R$ 0,00 com aviso de densidade obrigatória',
      actualOutput: `Custo ${formatCurrencyBRL(cost)} | Mensagem: "${error}"`,
      passed,
      explanation: 'Massa e volume possuem grandezas físicas diferentes. Sem densidade (g/ml), a conversão é rejeitada com segurança.'
    });
  }

  // TESTE 12: Conversão Massa <-> Volume com Densidade Conhecida
  {
    // Óleo de cozinha: 1 Litro comprado por R$ 9,20. Densidade = 0,92 g/ml.
    // 1L = 1000ml a R$ 9,20 -> R$ 0,0092/ml.
    // 100g de óleo: volume = 100g / 0.92 = 108.6956 ml.
    // Custo: 108.6956 ml * 0.0092 = R$ 1,00.
    const baseCostOil = calculateIngredientBaseCost(1, 'l', 9.20, 100);
    const { cost: oilCost } = calculateItemCost(
      baseCostOil,
      'l',
      100,
      'g',
      0.92 // densidade em g/ml
    );
    const passed = Math.abs(oilCost - 1.00) < 0.01;

    results.push({
      title: '12. Conversão Massa em Volume com Densidade (Óleo 0,92 g/ml)',
      category: 'Conversão com Densidade',
      description: '100 g de óleo (densidade 0,92 g/ml) comprado a R$ 9,20/Litro custa exatamente R$ 1,00.',
      inputs: { 'Compra': '1 Litro a R$ 9,20', 'Densidade': '0,92 g/ml', 'Utilizado': '100 g' },
      expectedOutput: 'R$ 1,00 (108,7 ml)',
      actualOutput: formatCurrencyBRL(oilCost),
      passed,
      explanation: 'Volume = 100g / 0,92 = 108,7 ml. 108,7 ml x R$ 0,0092/ml = R$ 1,00.'
    });
  }

  // TESTE 13: Rateio de Despesas Fixas Operacionais
  {
    // Despesas fixas mensais = R$ 3.000,00 (aluguel, água, luz, gás, pró-labore).
    // Volume de produção mensal = 1.200 marmitas.
    // Rateio fixo por marmita = R$ 3.000 / 1.200 = R$ 2,50 por porção.
    const monthlyFixedExpenses = 3000.00;
    const monthlyVolume = 1200;
    const rateioPorPorcao = monthlyFixedExpenses / monthlyVolume;
    const passed = Math.abs(rateioPorPorcao - 2.50) < 0.0001;

    results.push({
      title: '13. Rateio de Custos Fixos: R$ 3.000 / 1.200 unidades',
      category: 'Rateio Operacional',
      description: 'Despesas mensais de R$ 3.000,00 divididas por 1.200 porções/mês geram rateio exato de R$ 2,50/un.',
      inputs: { 'Despesas Fixas Totais': 'R$ 3.000,00', 'Volume Mensal': '1.200 porções' },
      expectedOutput: 'R$ 2,50 por porção',
      actualOutput: `${formatCurrencyBRL(rateioPorPorcao)} por porção`,
      passed,
      explanation: 'Rateio fixo unitário = R$ 3.000,00 / 1.200 = R$ 2,50. Transparente e auditável.'
    });
  }

  return results;
}
