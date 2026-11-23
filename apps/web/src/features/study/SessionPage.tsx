import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CloseIcon } from '../../components/Icons';
import { ProgressBar } from '../../components/ProgressBar';
import { activityTheme, languageTheme, PILLAR_LABEL } from '../../lib/ui';
import { api } from '../../services/api';
import { SessionActivity, StudySession } from '../../types';
import { GenericRunner } from './GenericRunner';
import { ReviewRunner } from './ReviewRunner';

export function SessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('activity');
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState<{ xp: number; achievements: string[] } | null>(null);

  const { data: session, isLoading } = useQuery<StudySession>({
    queryKey: ['session', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/study/today');
      return data;
    },
  });

  /**
   * Normalmente a atividade corrente e a primeira ainda nao concluida. Com
   * `?activity=<id>` na URL, o aluno pediu um bloco especifico -- e assim que
   * ele termina, a sessao volta sozinha para a ordem do planejador.
   */
  const current: SessionActivity | undefined = useMemo(() => {
    if (targetId) {
      const target = session?.activities.find((a) => a.id === targetId);
      if (target && !target.completed) return target;
    }
    return session?.activities.find((a) => !a.completed);
  }, [session, targetId]);

  // Cronometro da atividade: zera sempre que a atividade muda.
  useEffect(() => {
    setElapsed(0);
    if (!current) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [current?.id]);

  const completeActivity = useMutation({
    mutationFn: async ({ id, score }: { id: string; score?: number }) => {
      const { data } = await api.post(`/study/activities/${id}/complete`, {
        durationSeconds: elapsed,
        ...(score !== undefined ? { score } : {}),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post(`/study/sessions/${sessionId}/complete`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'today'] });
      setFinished({
        xp: data.session?.xpEarned ?? 0,
        achievements: (data.newAchievements ?? []).map((a: { name: string }) => a.name),
      });
    },
  });

  if (isLoading || !session) {
    return (
      <Shell>
        <div className="mx-auto max-w-md space-y-3 pt-20 text-center">
          <p className="animate-fade font-display text-lg font-semibold text-eel">Montando sua sessão...</p>
        </div>
      </Shell>
    );
  }

  if (finished) {
    return <FinishedScreen xp={finished.xp} achievements={finished.achievements} onHome={() => navigate('/')} />;
  }

  const done = session.activities.filter((a) => a.completed).length;
  const total = session.activities.length;

  // Todas as atividades feitas: falta apenas fechar a sessao.
  if (!current) {
    return (
      <Shell>
        <div className="mx-auto max-w-md space-y-5 pt-12 text-center">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-eel">
              Todos os blocos foram feitos
            </h1>
            <p className="text-sm text-wolf">
              Feche a sessão para registrar o streak e receber o bônus de conclusão.
            </p>
          </div>
          <button
            className="btn-primary w-full py-4 text-base"
            onClick={() => completeSession.mutate(session.id)}
            disabled={completeSession.isPending || session.completed}
          >
            {session.completed
              ? 'Sessão já concluída'
              : completeSession.isPending
                ? 'Fechando...'
                : 'Concluir sessão'}
          </button>
          <button className="btn-plain w-full" onClick={() => navigate('/')}>
            Voltar
          </button>
        </div>
      </Shell>
    );
  }

  const theme = activityTheme(current.type);
  const language = languageTheme(current.languageCode);

  /*
   * Blocos que atravessam os idiomas pertencem, no banco, a um idioma so --
   * `Activity.languageId` nao aceita nulo, entao contraste, comparacao e
   * producao ficam registrados sob o idioma prioritario. Isso e convencao de
   * armazenamento, nao conteudo: anunciar "Contraste, English" num bloco que
   * mostra os quatro lado a lado diz ao aluno exatamente a coisa errada.
   */
  const crossLanguage = CROSS_LANGUAGE_TYPES.has(current.type);
  const overtime = elapsed > current.plannedMinutes * 60;

  return (
    <Shell
      header={
        <>
          <button
            onClick={() => navigate('/')}
            className="tap-target -ml-2 flex shrink-0 items-center justify-center rounded-md text-hare transition-colors hover:bg-snow hover:text-wolf"
            aria-label="Sair da sessão"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          <ProgressBar value={done} max={total} size="sm" tone="bg-accent" />
          <span
            className={`shrink-0 font-mono text-sm tabular-nums ${
              overtime ? 'text-accent' : 'text-wolf'
            }`}
          >
            {formatTime(elapsed)}
          </span>
        </>
      }
    >
      <div key={current.id} className="lesson-pad animate-page space-y-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 animate-pop items-center justify-center rounded-xl font-display text-lg font-semibold ${
              crossLanguage ? 'bg-accent-soft text-accent-dark' : `${language.soft} ${language.text}`
            }`}
          >
            {crossLanguage ? '2' : language.mark}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-lg font-semibold text-eel">
              {theme.label}
              {crossLanguage ? ', os dois idiomas' : `, ${current.languageName}`}
            </h1>
            <p className="font-mono text-xs text-hare">
              bloco {session.activities.findIndex((a) => a.id === current.id) + 1} de {total},{' '}
              {PILLAR_LABEL[current.pillar] ?? current.pillar}, {current.plannedMinutes} min
            </p>
          </div>
        </div>

        {current.reason && (
          <p className="animate-rise text-sm leading-relaxed text-wolf [animation-delay:80ms]">
            {current.reason}
          </p>
        )}

        {current.type === 'review' ? (
          <ReviewRunner
            languageCode={current.languageCode}
            onSkip={() => completeActivity.mutate({ id: current.id })}
            onFinish={(score) => completeActivity.mutate({ id: current.id, score })}
          />
        ) : (
          <GenericRunner
            activity={current}
            onSkip={() => completeActivity.mutate({ id: current.id })}
            onFinish={(score) => completeActivity.mutate({ id: current.id, score })}
          />
        )}
      </div>
    </Shell>
  );
}

/** Tipos cujo conteudo vale para os quatro idiomas, nao para o dono nominal. */
const CROSS_LANGUAGE_TYPES = new Set(['contrast', 'compare', 'production', 'assessment']);

/** Sessao roda em tela cheia, sem a navegacao do app: um bloco por vez. */
function Shell({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  return (
    // 100dvh, e nao 100vh: no celular a barra de endereco entra e sai, e com
    // `vh` a tela fica mais alta que o visivel e o fim do conteudo some.
    <div className="min-h-[100dvh] bg-snow">
      {header && (
        <header className="sticky top-0 z-10 bg-snow/95 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">{header}</div>
        </header>
      )}
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

/**
 * Conta de 0 ate `target` com desaceleracao no fim.
 *
 * O numero do XP subindo e a recompensa da tela -- um "+110" parado le como
 * extrato, o mesmo numero chegando la le como ganho. Quem pediu menos
 * movimento recebe o valor final direto.
 */
function useCountUp(target: number, delay = 250, duration = 1000): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target <= 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay, duration]);

  return value;
}

/**
 * O fim do dia.
 *
 * Era o personagem grande comemorando; agora e o bloco escuro do app com o XP
 * contando em caramelo. O momento continua sendo o maior da sessao -- so que a
 * festa e o numero, nao um boneco.
 */
function FinishedScreen({
  xp,
  achievements,
  onHome,
}: {
  xp: number;
  achievements: string[];
  onHome: () => void;
}) {
  const shown = useCountUp(xp);
  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-snow">
      <section className="bg-espresso px-5 pb-8 pt-[calc(env(safe-area-inset-top)+3.5rem)]">
        <div className="mx-auto max-w-md">
          <p className="animate-fade text-[13px] text-latte first-letter:uppercase">{date}</p>
          <h1 className="mt-1.5 animate-fade font-display text-3xl font-bold tracking-tight text-white">
            Missão concluída
          </h1>
          <p
            className={`mt-6 font-display text-[3.25rem] font-bold leading-none tabular-nums text-honey ${
              shown === xp ? 'animate-glow' : ''
            }`}
            aria-label={`Mais ${xp} XP`}
          >
            +{shown} XP
          </p>
          <p className="mt-4 animate-rise text-sm text-latte [animation-delay:300ms]">
            O dia de hoje entrou na sua sequência.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-md flex-1 space-y-3 px-4 pt-6">
        {achievements.length > 0 && (
          <>
            <p className="section-label animate-rise px-1 [animation-delay:600ms]">Novas conquistas</p>
            <ul className="list-group animate-rise [animation-delay:660ms]">
              {achievements.map((name, i) => (
                <li
                  key={name}
                  className="list-row animate-rise text-[15px] font-medium text-eel"
                  style={{ animationDelay: `${720 + i * 90}ms` }}
                >
                  {name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mx-auto w-full max-w-md animate-rise px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 [animation-delay:900ms]">
        <button className="btn-primary w-full" onClick={onHome}>
          Voltar ao início
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
