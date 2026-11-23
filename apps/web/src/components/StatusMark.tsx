/**
 * O selo redondo de acerto/erro, com o traco se desenhando.
 *
 * Ocupa o lugar onde o personagem reagia. A reacao continua existindo -- ela
 * so deixou de ser um boneco: o circulo estala ao aparecer e o visto (ou o X)
 * se desenha logo depois, o que ja diz "isto acabou de acontecer".
 *
 * Quem chama troca a `key` a cada resposta para a animacao rodar de novo.
 */
export function StatusMark({
  tone,
  size = 'md',
  className = '',
}: {
  tone: 'correct' | 'wrong' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const box = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const bg = tone === 'correct' ? 'bg-grass' : tone === 'wrong' ? 'bg-cardinal' : 'bg-accent';

  return (
    <span
      className={`flex shrink-0 animate-pop items-center justify-center rounded-full text-white ${box} ${bg} ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className={icon}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tone === 'wrong' ? (
          <path className="dash-30 animate-draw" d="M6 6l12 12M18 6L6 18" />
        ) : tone === 'correct' ? (
          <path className="dash-30 animate-draw" d="M5 12l5 5 9-10" />
        ) : (
          <path className="dash-30 animate-draw" d="M12 6v7M12 17h.01" />
        )}
      </svg>
    </span>
  );
}
