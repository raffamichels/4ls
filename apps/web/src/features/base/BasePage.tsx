import { NavLink, Outlet, useLocation } from 'react-router-dom';

/**
 * A Base: tudo que não é a missão do dia.
 *
 * Consulta, tutor e progresso são as três coisas que o aluno faz ENTRE as
 * missões, não durante -- por isso dividem uma aba só.
 *
 * As rotas antigas continuam existindo e redirecionam para cá: qualquer atalho
 * que ele já tenha salvo na tela inicial do celular continua funcionando.
 */

const SECTIONS = [
  { to: 'consulta', label: 'Consulta' },
  { to: 'tutor', label: 'Tutor' },
  { to: 'progresso', label: 'Progresso' },
];

export function BasePage() {
  const { pathname } = useLocation();
  const active = Math.max(
    0,
    SECTIONS.findIndex((s) => pathname.startsWith(`/base/${s.to}`)),
  );

  return (
    <div className="space-y-5">
      <h1 className="page-title animate-rise">Base</h1>

      {/*
        Seletor com o polegar branco deslizando até a seção escolhida. O
        polegar é um elemento só, que anda -- e não três fundos acendendo e
        apagando --, e é isso que faz a troca parecer movimento.
      */}
      <nav className="segmented animate-rise [animation-delay:60ms]" aria-label="Seções da Base">
        <span
          className="segmented-thumb w-[calc((100%-12px)/3)]"
          style={{ transform: `translateX(calc(${active} * (100% + 3px)))` }}
          aria-hidden
        />
        {SECTIONS.map((section) => (
          <NavLink key={section.to} to={section.to}>
            {section.label}
          </NavLink>
        ))}
      </nav>

      <div key={SECTIONS[active].to} className="animate-page">
        <Outlet />
      </div>
    </div>
  );
}
