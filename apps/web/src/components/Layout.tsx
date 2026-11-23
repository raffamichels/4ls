import { ReactNode, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useHeightVar } from '../lib/metrics';
import { useBottomBanner } from '../lib/pwa';
import { useAuthStore } from '../stores/auth.store';
import { BaseIcon, CardsIcon, HomeIcon, LogoutIcon, PuzzleIcon } from './Icons';
import { InstallButton, InstallPrompt } from './InstallPrompt';

const NAV = [
  { to: '/', label: 'Hoje', Icon: HomeIcon },
  { to: '/vocabulario', label: 'Palavras', Icon: CardsIcon },
  { to: '/estruturas', label: 'Estruturas', Icon: PuzzleIcon },
  /*
   * Consulta, tutor e progresso vivem na Base: as tres sao o que o aluno faz
   * ENTRE as missoes, nao durante. Sete abas nao cabem numa linha em 360px.
   */
  { to: '/base', label: 'Base', Icon: BaseIcon },
];

/**
 * A moldura das telas com abas.
 *
 * O cabecalho fixo com sequencia/XP/nivel saiu: ele repetia em toda tela o que
 * o topo do Inicio ja mostra grande, e cada tela agora abre com o proprio
 * titulo. Menos uma faixa competindo pelo topo num celular de 360px.
 */
export function Layout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const location = useLocation();

  /*
   * A barra fixa do rodape (instalar) cobre o fim da pagina. Reservar espaco
   * so quando ela existe evita o vazio permanente que um padding fixo deixaria.
   */
  const banner = useBottomBanner();

  // As abas publicam a propria altura para que o rodape das licoes se posicione
  // acima delas. No desktop a barra some por breakpoint e mede zero.
  const tabbarRef = useHeightVar<HTMLElement>('--tabbar-h');

  // Com as abas na tela, sao elas que absorvem a area segura de baixo.
  useEffect(() => {
    document.documentElement.style.setProperty('--footer-safe', '0px');
    return () => {
      document.documentElement.style.removeProperty('--footer-safe');
    };
  }, []);

  const bottomSpace = banner ? 'pb-44 lg:pb-24' : 'pb-28 lg:pb-12';

  /*
   * A chave da transicao e a SECAO, nao o caminho inteiro: dentro da Base,
   * trocar Consulta por Tutor ja tem o seletor deslizando, e repetir a entrada
   * da pagina inteira por cima disso seria movimento demais.
   */
  const section = '/' + (location.pathname.split('/')[1] ?? '');

  return (
    <div className="min-h-screen bg-snow">
      {/* Barra lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-swan bg-snow px-3 py-6 lg:flex">
        <span className="mb-6 px-3 font-display text-2xl font-bold tracking-tight text-eel">4L</span>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-soft font-semibold text-accent-dark'
                    : 'text-wolf hover:bg-white hover:text-eel'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-swan pt-3">
          <p className="truncate px-3 text-sm font-medium text-eel">{user?.name}</p>
          <button
            onClick={signOut}
            className="press mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-wolf transition hover:bg-white hover:text-cardinal"
          >
            <LogoutIcon className="h-4 w-4" />
            Sair
          </button>
          <InstallButton className="mt-2 w-full justify-center" />
        </div>
      </aside>

      <div className="lg:pl-60">
        <main
          className={`mx-auto max-w-3xl px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] ${bottomSpace}`}
        >
          <div key={section} className="animate-page">
            {children}
          </div>
        </main>
      </div>

      {/* Abas (mobile) */}
      {/*
        `grid-flow-col auto-cols-fr` garante UMA linha, sempre, seja qual for a
        quantidade de abas. pb-[env(safe-area-inset-bottom)] mantem as abas
        acima da barra de gestos do iPhone (viewport-fit=cover).
      */}
      <nav
        ref={tabbarRef}
        className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col border-t border-swan bg-white pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden"
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `tab flex min-w-0 flex-col items-center gap-0.5 pb-2 text-[11px] leading-tight transition-colors ${
                isActive ? 'font-semibold text-accent-dark' : 'font-medium text-hare'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/*
                  A pilula atras do icone e o que diz "voce esta aqui". Ela so
                  existe na aba ativa, entao nasce de novo a cada troca -- e o
                  `animate-pill` faz esse nascimento ser visivel.
                */}
                <span
                  className={`tab-ico flex h-8 w-14 items-center justify-center rounded-full ${
                    isActive ? 'animate-pill bg-accent-soft' : ''
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                {/* `truncate` e a garantia: "Estruturas" ocupa quase os 72px de
                    uma celula num aparelho de 360px. */}
                <span className="w-full truncate px-0.5 text-center">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <InstallPrompt />
    </div>
  );
}
