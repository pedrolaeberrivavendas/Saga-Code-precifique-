import React from 'react';

interface SagaSymbolProps {
  className?: string;
  theme?: 'dark' | 'light' | 'mono';
  size?: number | string;
}

/**
 * Símbolo Vetorial Oficial SAGA Code
 * Extraído diretamente do manual de identidade visual:
 * - Upper chevron: #efe9dd (no escuro) ou #16130f (no claro)
 * - Lower chevron: #ff4d1a (Laranja Oficial SAGA)
 */
export const SagaSymbol: React.FC<SagaSymbolProps> = ({
  className = 'w-8 h-8',
  theme = 'dark',
  size
}) => {
  const upperFill = theme === 'dark' ? '#efe9dd' : theme === 'mono' ? '#16130f' : '#16130f';
  const lowerFill = theme === 'mono' ? '#16130f' : '#ff4d1a';

  return (
    <svg
      viewBox="0 0 204 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Upper Chevron / Interlocking Top */}
      <path
        d="M102 0 L182 47 L146 69 L102 43 L47 76 L124 120 L84 142 L0 95 L0 58 Z"
        fill={upperFill}
      />
      {/* Lower Chevron / Interlocking Bottom */}
      <path
        d="M120 62 L204 109 L204 146 L102 204 L22 157 L58 135 L102 160 L157 127 L80 84 Z"
        fill={lowerFill}
      />
    </svg>
  );
};

interface SagaLogoProps {
  theme?: 'dark' | 'light' | 'mono';
  showSubtitle?: boolean;
  className?: string;
  symbolSize?: number | string;
}

/**
 * Assinatura Horizontal Oficial SAGA Code (01 / Website e Documentos)
 * - Símbolo isométrico
 * - Tipografia serifada "Saga" (Georgia)
 * - Tipografia "CODE" em caixa alta laranja
 */
export const SagaLogo: React.FC<SagaLogoProps> = ({
  theme = 'dark',
  showSubtitle = false,
  className = '',
  symbolSize = 34
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#16130f]';
  const codeColor = theme === 'mono' ? 'text-[#16130f]' : 'text-[#ff4d1a]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0 flex items-center justify-center">
        <SagaSymbol theme={theme} size={symbolSize} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`font-['Georgia',serif] font-normal text-2xl tracking-normal ${textColor}`}>
            Saga
          </span>
          <span className={`font-sans font-bold text-xs tracking-wider uppercase ${codeColor}`}>
            CODE
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[10px] text-[#9CA3AF] tracking-tight mt-0.5 font-medium">
            Calculadora de Custos &amp; Precificação
          </span>
        )}
      </div>
    </div>
  );
};

interface SagaAppIconProps {
  size?: number | string;
  className?: string;
}

/**
 * Ícone Oficial de Aplicativo SAGA Code (03 / Aplicativos)
 * Squircle escuro #16130f com o monograma isométrico centralizado
 */
export const SagaAppIcon: React.FC<SagaAppIconProps> = ({
  size = 40,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
    >
      {/* Squircle Background #16130f */}
      <rect
        x="0"
        y="0"
        width="280"
        height="280"
        rx="59"
        fill="#16130f"
      />
      {/* Central Symbol */}
      <g transform="translate(38, 38)">
        <path
          d="M102 0 L182 47 L146 69 L102 43 L47 76 L124 120 L84 142 L0 95 L0 58 Z"
          fill="#efe9dd"
        />
        <path
          d="M120 62 L204 109 L204 146 L102 204 L22 157 L58 135 L102 160 L157 127 L80 84 Z"
          fill="#ff4d1a"
        />
      </g>
    </svg>
  );
};

interface SagaSealProps {
  size?: number | string;
  className?: string;
}

/**
 * Selo Circular Oficial SAGA Code (04 / Selo e Brindes)
 */
export const SagaSeal: React.FC<SagaSealProps> = ({
  size = 120,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
    >
      <circle cx="160" cy="160" r="155" fill="#f2ede4" stroke="#16130f" strokeWidth="5" />
      <circle cx="160" cy="160" r="144" fill="none" stroke="#ff4d1a" strokeWidth="2" />
      <g transform="translate(100, 60) scale(0.6)">
        <path
          d="M102 0 L182 47 L146 69 L102 43 L47 76 L124 120 L84 142 L0 95 L0 58 Z"
          fill="#16130f"
        />
        <path
          d="M120 62 L204 109 L204 146 L102 204 L22 157 L58 135 L102 160 L157 127 L80 84 Z"
          fill="#ff4d1a"
        />
      </g>
      <text x="160" y="248" fontFamily="Georgia, serif" fontSize="34" fill="#16130f" textAnchor="middle">
        SAGA
      </text>
      <text x="160" y="278" fontFamily="Arial, sans-serif" fontSize="16" fill="#16130f" textAnchor="middle" letterSpacing="2">
        CODE
      </text>
    </svg>
  );
};
