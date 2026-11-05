import React from 'react';
import { 
  CheckCircle2, 
  LogIn, 
  LogOut,
  ShieldCheck,
  BookmarkCheck,
  ChefHat,
  Package,
  Layers,
  Building2,
  DollarSign,
  TrendingUp,
  UtensilsCrossed
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SagaLogo } from './SagaLogo';

export type PipelineStage = 
  | 'ingredients' 
  | 'packagings' 
  | 'recipe' 
  | 'fixed-expenses' 
  | 'pricing' 
  | 'results' 
  | 'saved';

interface HeaderProps {
  activeStage: PipelineStage;
  setActiveStage: (stage: PipelineStage) => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAudit: () => void;
  ingredientsCount: number;
  packagingsCount: number;
  recipesCount: number;
  businessSegment: string;
  setBusinessSegment: (segment: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStage,
  setActiveStage,
  currentUser,
  onLogin,
  onLogout,
  onOpenAudit,
  ingredientsCount,
  packagingsCount,
  recipesCount,
  businessSegment,
  setBusinessSegment
}) => {
  return (
    <header className="no-print sticky top-0 left-0 right-0 w-full z-50 bg-[#111317]/95 backdrop-blur-md border-b border-[#2D333F] shadow-sm">
      <div className="h-16 w-full px-4 md:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        
        {/* Marca Oficial SAGA Code & Logotipo Vetorial do Google Stitch */}
        <div className="flex items-center gap-6 xl:gap-8 min-w-0">
          <button 
            onClick={() => setActiveStage('ingredients')}
            className="flex items-center gap-2 shrink-0 group focus:outline-none cursor-pointer" 
            title="SAGA Code • Início do Pipeline"
          >
            <SagaLogo theme="dark" symbolSize={32} />
          </button>

          {/* Navegação Sequencial das Etapas do Pipeline (Google Stitch) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] overflow-x-auto py-1">
            <button
              onClick={() => setActiveStage('ingredients')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'ingredients'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              1. Ingredientes ({ingredientsCount})
            </button>

            <button
              onClick={() => setActiveStage('packagings')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'packagings'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              2. Embalagens ({packagingsCount})
            </button>

            <button
              onClick={() => setActiveStage('recipe')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'recipe'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              3. Ficha Técnica
            </button>

            <button
              onClick={() => setActiveStage('fixed-expenses')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'fixed-expenses'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              4. Despesas Fixas
            </button>

            <button
              onClick={() => setActiveStage('pricing')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'pricing'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              5. Calculadora
            </button>

            <button
              onClick={() => setActiveStage('results')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeStage === 'results'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              6. Resultados &amp; DRE
            </button>

            <span className="text-[#3F4756] mx-1">|</span>

            <button
              onClick={() => setActiveStage('saved')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeStage === 'saved'
                  ? 'bg-[#FF4319]/15 text-[#FF4319] border border-[#FF4319]/40 shadow-sm font-bold'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Receitas ({recipesCount})
            </button>
          </nav>
        </div>

        {/* Lado Direito: Segmento, Auditoria Matemática e Auth Firebase */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Seletor de Segmento do Comércio (Marmitaria, Pizzaria, Hamburgueria...) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#282a2d] border border-[#2D333F] text-xs shadow-inner">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF4319]" />
            <span className="text-[#9CA3AF] uppercase tracking-wider font-semibold text-[10px]">Segmento:</span>
            <select
              value={businessSegment}
              onChange={(e) => setBusinessSegment(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="Marmitaria" className="bg-[#1e2023] text-white">Marmitaria</option>
              <option value="Hamburgueria" className="bg-[#1e2023] text-white">Hamburgueria</option>
              <option value="Pizzaria" className="bg-[#1e2023] text-white">Pizzaria</option>
              <option value="Confeitaria" className="bg-[#1e2023] text-white">Confeitaria</option>
              <option value="Restaurante" className="bg-[#1e2023] text-white">Restaurante</option>
              <option value="Padaria & Salgados" className="bg-[#1e2023] text-white">Padaria &amp; Salgados</option>
            </select>
          </div>

          {/* Botão de Auditoria Matemática */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2023] hover:bg-[#282a2d] text-[#F8F9FA] text-xs font-semibold border border-[#2D333F] transition-colors cursor-pointer"
            title="Auditar regras matemáticas e testes financeiros da Etapa 2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden md:inline">Auditoria (13 Testes)</span>
            <span className="md:hidden">Testes</span>
          </button>

          {/* Status Nuvem / Firebase Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-lg">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'Usuário'} 
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-[#10B981]/50" 
                />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
              )}
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="text-white font-semibold truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-[#10B981]">Nuvem Conectada</p>
              </div>
              <button
                onClick={onLogout}
                className="text-[#9CA3AF] hover:text-[#EF4444] p-1 transition-colors cursor-pointer"
                title="Desconectar do Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-[#FF4319] hover:bg-[#EA4E10] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-[#FF4319]/20 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salvar na Nuvem</span>
              <span className="sm:hidden">Entrar</span>
            </button>
          )}

        </div>
      </div>

      {/* Navegação Mobile do Pipeline */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-[#2D333F]/70 text-xs no-scrollbar bg-[#111317]">
        <button
          onClick={() => setActiveStage('ingredients')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'ingredients' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          1. Insumos
        </button>
        <button
          onClick={() => setActiveStage('packagings')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'packagings' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          2. Embalagens
        </button>
        <button
          onClick={() => setActiveStage('recipe')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'recipe' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          3. Ficha
        </button>
        <button
          onClick={() => setActiveStage('fixed-expenses')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'fixed-expenses' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          4. Fixo
        </button>
        <button
          onClick={() => setActiveStage('pricing')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'pricing' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          5. Preço
        </button>
        <button
          onClick={() => setActiveStage('results')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'results' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          6. DRE
        </button>
        <button
          onClick={() => setActiveStage('saved')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
            activeStage === 'saved' ? 'bg-[#FF4319] text-white font-bold' : 'text-[#9CA3AF]'
          }`}
        >
          Salvas
        </button>
      </div>
    </header>
  );
};
