import { InputHTMLAttributes, ReactNode, useState } from 'react';

/*
 * As frases que correm no fundo. Nao sao enfeite generico: e o que o app
 * ensina -- o mesmo pedido em ingles e em alemao, palavra com o seu par. Ingles
 * em caramelo cheio, alemao em contorno, e as duas faixas correm em sentidos
 * opostos.
 */
const EN_BAND = ['Could you help me?', 'the', 'Thank you', 'I would like…', 'th'];
const DE_BAND = ['Könnten Sie mir helfen?', 'der · die · das', 'Danke', 'Straße'];
const PAIR_BAND = [
  'Hello',
  'Hallo',
  'suitcase',
  'der Koffer',
  'Good evening',
  'Guten Abend',
  'Excuse me',
  'Entschuldigung',
];

/**
 * A onda que separa o topo escuro do formulario.
 *
 * O periodo e de 390px e a animacao anda exatamente um periodo antes de
 * recomecar -- por isso o laco nao tem emenda. A largura cobre a tela mais
 * larga com folga, ja que o bloco gira alguns graus.
 */
function wavePath(width: number, base: number, crest: number): string {
  let d = `M0 ${base} Q97.5 ${crest} 195 ${base}`;
  for (let x = 390; x <= width; x += 195) d += ` T${x} ${base}`;
  return `${d} V170 H0 Z`;
}

const WAVE_WIDTH = 3120;
const WAVE_BACK = wavePath(WAVE_WIDTH, 50, 14);
const WAVE_FRONT = wavePath(WAVE_WIDTH, 60, 22);

function Band({ items, className }: { items: string[]; className: string }) {
  // Duas copias lado a lado: a animacao anda -50%, e a segunda copia ocupa o
  // lugar exato da primeira quando o laco recomeca.
  const doubled = [...items, ...items];
  return (
    <div className={`flex w-max gap-7 whitespace-nowrap ${className}`}>
      {doubled.map((text, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
  );
}

/**
 * Moldura das telas de entrada: topo escuro com o fundo em movimento, a onda,
 * e o formulario no creme.
 */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-snow">
      <div className="relative h-[22.5rem] shrink-0 overflow-hidden bg-espresso" aria-hidden>
        <div className="absolute -left-32 top-32 flex w-[180%] -rotate-[9deg] flex-col gap-3.5 font-display sm:-rotate-[4deg]">
          <Band items={EN_BAND} className="animate-marquee-l text-[22px] font-semibold text-bee opacity-50" />
          <Band items={DE_BAND} className="text-outline animate-marquee-r text-4xl font-bold opacity-70" />
          <Band items={PAIR_BAND} className="animate-marquee-l-fast text-lg text-honey opacity-35" />
        </div>

        <span className="text-outline absolute right-5 top-10 animate-float font-display text-[120px] font-bold leading-none opacity-55">
          ß
        </span>
        <span className="text-outline absolute left-8 top-60 animate-float-slow font-display text-6xl font-bold leading-none opacity-40">
          W
        </span>
        <span className="text-outline absolute right-32 top-56 animate-float font-display text-5xl font-bold leading-none opacity-35">
          ü
        </span>

        <div className="absolute -bottom-8 -left-[10%] h-[170px] w-[120%] -rotate-[9deg] sm:-rotate-[3deg]">
          <svg
            className="absolute -top-3.5 left-0 animate-wave-slow"
            width={WAVE_WIDTH}
            height="170"
            viewBox={`0 0 ${WAVE_WIDTH} 170`}
          >
            <path d={WAVE_BACK} className="fill-bee" opacity="0.4" />
          </svg>
          <svg
            className="absolute left-0 top-0 animate-wave"
            width={WAVE_WIDTH}
            height="170"
            viewBox={`0 0 ${WAVE_WIDTH} 170`}
          >
            <path d={WAVE_FRONT} className="fill-snow" />
          </svg>
        </div>

        {/* Por cima das faixas, alinhado com a coluna do formulario. */}
        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] mx-auto max-w-sm px-6">
          <p className="font-display text-[28px] font-bold tracking-tight text-white">4L</p>
          <p className="mt-1.5 text-sm text-latte">Inglês e alemão, uma frase de cada vez.</p>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="animate-rise [animation-delay:120ms]">
          <h1 className="font-display text-3xl font-bold tracking-tight text-eel">{title}</h1>
          <span className="mt-2 block h-[3px] w-8 rounded-full bg-accent" aria-hidden />
        </div>
        {children}
      </main>
    </div>
  );
}

/**
 * Campo so com o fio embaixo, como na referencia do login. O fio fica caramelo
 * enquanto o campo esta em uso.
 */
export function UnderlineField({
  label,
  icon,
  hint,
  delay = 0,
  type = 'text',
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: 'mail' | 'lock' | 'user';
  hint?: string;
  delay?: number;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <label className="mt-5 block animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-[13px] font-semibold text-eel">{label}</span>
      <span className="mt-1.5 flex min-h-11 items-center gap-2.5 border-b-[1.5px] border-[#D9CEC5] transition-colors duration-200 focus-within:border-accent">
        <FieldIcon name={icon} />
        <input
          {...input}
          type={isPassword && show ? 'text' : type}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-eel outline-none placeholder:text-hare"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
            className={`press -mr-3 flex h-11 w-11 items-center justify-center transition-colors ${
              show ? 'text-accent' : 'text-wolf'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-wolf">{hint}</span>}
    </label>
  );
}

function FieldIcon({ name }: { name: 'mail' | 'lock' | 'user' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-wolf" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {name === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </>
      )}
      {name === 'lock' && (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      )}
      {name === 'user' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </>
      )}
    </svg>
  );
}
