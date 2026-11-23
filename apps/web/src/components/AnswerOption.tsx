import { ReactNode } from 'react';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

const STATE: Record<OptionState, string> = {
  idle: 'border-transparent bg-white text-eel',
  selected: 'border-accent bg-accent-soft text-accent-dark',
  correct: 'animate-pop border-grass bg-grass-soft text-grass-dark',
  wrong: 'animate-shake border-cardinal bg-cardinal-soft text-cardinal-dark',
};

/**
 * Uma alternativa de multipla escolha.
 *
 * Estava copiada byte a byte em quatro runners, com divergencias que so
 * apareciam no uso (um tinha duas colunas no `sm`, outro nao). Aqui tambem
 * saiu o cracha numerado que cada opcao exibia: ele prometia atalho de teclado
 * `1..4` que nunca existiu, e no celular ocupava largura util sem fazer nada.
 *
 * A altura minima e 44px porque esta e, junto com as pecas de montagem, a coisa
 * mais tocada do app.
 */
export function AnswerOption({
  children,
  state = 'idle',
  onClick,
  disabled,
  lang,
}: {
  children: ReactNode;
  state?: OptionState;
  onClick?: () => void;
  disabled?: boolean;
  /** Idioma do texto da alternativa, para a leitura por voz do sistema. */
  lang?: string;
}) {
  return (
    <button
      type="button"
      lang={lang}
      onClick={onClick}
      disabled={disabled}
      className={`press flex min-h-12 w-full items-center rounded-xl border-[1.5px] px-4 py-3 text-left text-base
                  transition-[background-color,border-color,color,transform] duration-200 disabled:cursor-default ${STATE[state]}`}
    >
      {children}
    </button>
  );
}
