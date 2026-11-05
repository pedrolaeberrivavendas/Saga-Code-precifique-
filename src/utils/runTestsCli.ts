import { runFinancialAuditTests } from './testSuite';

console.log('=== SAGA CODE | AUDITORIA DOS CÁLCULOS FINANCEIROS ===\n');

const tests = runFinancialAuditTests();
let passedCount = 0;

tests.forEach((t, i) => {
  const status = t.passed ? '✓ APROVADO' : '✗ FALHOU';
  console.log(`[${status}] Teste ${i + 1}: ${t.title}`);
  console.log(`  Categoria: ${t.category}`);
  console.log(`  Esperado:  ${t.expectedOutput}`);
  console.log(`  Obtido:    ${t.actualOutput}`);
  if (!t.passed) {
    console.log(`  Erro/Detalhe: ${t.explanation}`);
  }
  console.log('');
  if (t.passed) passedCount++;
});

console.log(`-----------------------------------------------------`);
console.log(`Resultado: ${passedCount} de ${tests.length} testes aprovados.`);

if (passedCount === tests.length) {
  console.log('TODOS OS 13 TESTES DE PRECISÃO MATEMÁTICA FORAM APROVADOS COM SUCESSO!\n');
  process.exit(0);
} else {
  console.error('ALERTA: Houve falha em testes de precisão matemática.\n');
  process.exit(1);
}
