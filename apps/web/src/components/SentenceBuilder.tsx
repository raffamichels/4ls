import { useState } from 'react';

/** Um pedaço da frase, com o papel que ele cumpre. */
export interface BuilderChunk {
  text: string;
  /** QUEM, SER, ONDE, AÇÃO... em português. */
  label: string;
}

/**
 * Montar a frase pondo os pedaços na ordem.
 *
 * É o exercício central do produto: saber o que "nicht" quer dizer não prova
 * nada sobre saber onde ele entra, e "onde entra" é a única pergunta que o
 * aluno realmente tem. Também é o único formato de produção que dá para
 * corrigir objetivamente — comparar texto livre com a frase-modelo marcaria
 * variante legítima como erro, que ensina o contrário do certo.
 *
 * Vive aqui, e não dentro de um runner, porque dois blocos precisam dele com
 * intenções opostas:
 *
 * - Nos Fundamentos ele ENSINA, e por isso mostra os rótulos: a aula não é
 *   adivinhar qual palavra vem primeiro, é ver que neste idioma o papel "SER"
 *   ocupa aquela posição.
 * - Na avaliação ele MEDE, e aí os rótulos saem. Com eles à vista, a ordem
 *   vira dedução a partir da dica em português em vez de lembrança do idioma —
 *   e a prova passaria a medir raciocínio, não retenção.
 */
export function SentenceBuilder({
  prompt,
  chunks,
  answer,
  languageCode,
  answered,
  onAnswer,
  showLabels = true,
}: {
  /** O que dizer, em português. */
  prompt: string;
  /** Os pedaços JÁ embaralhados por quem chama. */
  chunks: BuilderChunk[];
  /** A ordem certa, já juntada por espaços. */
  answer: string;
  languageCode: string;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
  /** Mostra o papel de cada peça. Ensino sim, medição não. */
  showLabels?: boolean;
}) {
  const [placed, setPlaced] = useState<number[]>([]);
  const available = chunks.map((_, i) => i).filter((i) => !placed.includes(i));
  const complete = placed.length === chunks.length;

  const Piece = ({
    index,
    onClick,
    placedStyle,
  }: {
    index: number;
    onClick: () => void;
    placedStyle: boolean;
  }) => {
    const chunk = chunks[index];
    return (
      <button
        type="button"
        disabled={answered}
        onClick={onClick}
        className={`tap-target press rounded-lg border border-b-2 border-[#E3D8CF] bg-white px-3 py-2 text-left ${
          placedStyle ? 'animate-pop' : ''
        }`}
      >
        {showLabels && (
          <span className="block text-[11px] leading-tight text-hare">
            {chunk.label}
          </span>
        )}
        <span lang={languageCode} className="block text-lg font-medium text-eel">
          {chunk.text}
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-[13px] text-wolf">Monte a frase</p>
        <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-eel">{prompt}</p>
      </div>

      {/* Altura mínima para a tela não pular a cada toque. */}
      <div className="flex min-h-[7.25rem] flex-wrap content-start items-end gap-x-1.5 gap-y-4 bg-[linear-gradient(to_bottom,transparent_calc(3.5rem-1.5px),#D9CEC5_calc(3.5rem-1.5px),#D9CEC5_3.5rem,transparent_3.5rem)] bg-[length:100%_3.5rem] pt-2.5">
        {placed.length === 0 && (
          <p className="pb-3 text-sm text-hare">Toque nas peças abaixo, na ordem.</p>
        )}
        {placed.map((chunkIndex, position) => (
          <Piece
            key={`${chunkIndex}-${position}`}
            index={chunkIndex}
            placedStyle
            onClick={() => setPlaced((p) => p.filter((_, i) => i !== position))}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-4">
        {available.map((chunkIndex) => (
          <Piece
            key={chunkIndex}
            index={chunkIndex}
            placedStyle={false}
            onClick={() => setPlaced((p) => [...p, chunkIndex])}
          />
        ))}
      </div>

      {!answered && (
        <button
          className="btn-primary w-full"
          disabled={!complete}
          onClick={() => onAnswer(placed.map((i) => chunks[i].text).join(' ') === answer)}
        >
          {complete ? 'Verificar' : 'Use todas as peças'}
        </button>
      )}
    </>
  );
}
