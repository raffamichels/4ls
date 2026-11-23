/**
 * Seletor de poucas opcoes, com o marcador DESLIZANDO ate a escolhida.
 *
 * Duas formas:
 * - `thumb`: trilho bege com polegar branco -- para trocar o assunto da tela
 *   (ingles/alemao).
 * - `underline`: sublinhado caramelo correndo por baixo -- para filtrar uma
 *   lista sem mudar de assunto.
 *
 * O marcador e um elemento so, que anda. Botoes acendendo e apagando no lugar
 * seriam a mesma informacao sem o movimento que diz "saiu daqui, foi pra la".
 * As colunas tem largura igual de proposito: e isso que deixa a posicao do
 * marcador ser so `indice * 100%`.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  variant = 'thumb',
  label,
  className = '',
  minColumn = '0px',
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  variant?: 'thumb' | 'underline';
  label: string;
  className?: string;
  /** Largura minima de cada coluna (so `underline`); com ela, quem chama pode
   *  envolver o seletor numa faixa `.hscroll` quando os rotulos nao cabem. */
  minColumn?: string;
}) {
  const count = options.length;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  if (variant === 'underline') {
    return (
      <div
        role="group"
        aria-label={label}
        className={`relative grid border-b border-[#E3D8CF] ${className}`}
        style={{ gridTemplateColumns: `repeat(${count}, minmax(${minColumn}, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`press min-h-11 truncate px-1 text-sm transition-colors ${
                active ? 'font-semibold text-eel' : 'font-medium text-wolf'
              }`}
            >
              {option.label}
            </button>
          );
        })}
        <span
          className="absolute -bottom-px left-0 h-0.5 rounded-full bg-accent transition-transform duration-300 ease-out"
          style={{ width: `${100 / count}%`, transform: `translateX(${index * 100}%)` }}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div role="group" aria-label={label} className={`segmented ${className}`}>
      <span
        className="segmented-thumb"
        style={{
          width: `calc((100% - ${(count + 1) * 3}px) / ${count})`,
          transform: `translateX(calc(${index} * (100% + 3px)))`,
        }}
        aria-hidden
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
