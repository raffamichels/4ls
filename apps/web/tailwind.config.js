/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * Tema "cafe": creme, espresso e caramelo.
         *
         * Os NOMES dos tokens sao os mesmos desde o primeiro dia -- so a cor
         * por tras muda. E isso que permite trocar o app inteiro de visual sem
         * tocar nas centenas de `text-eel` espalhadas por 40 arquivos. Os
         * papeis continuam os mesmos:
         *
         * - `snow` e o fundo da pagina (creme).
         * - `white` e o painel elevado (branco de verdade, sobre o creme).
         * - `swan` borda/divisoria, `hare` texto apagado, `wolf` texto
         *   secundario, `eel` texto principal.
         * - `X-dark` e o tom para texto sobre `X-soft` e para hover. No tema
         *   claro ele volta a ser mais ESCURO, como o nome sempre disse.
         * - `X-soft` e o fundo tingido do acento, para painel e chip.
         *
         * `hare` e `wolf` foram escolhidos para passar 4.5:1 sobre o creme --
         * texto apagado que ninguem consegue ler nao e discreto, e quebrado.
         */
        snow: '#F9F2ED',
        swan: '#E7DFD9',
        hare: '#766D68',
        wolf: '#5A524D',
        eel: '#2B2826',
        white: '#FFFFFF',

        // A cor da acao: todo botao principal, a aba ativa, o proximo passo.
        accent: '#A9603A',
        'accent-dark': '#7A4426',
        'accent-soft': '#F2E3D7',

        // Os blocos escuros (topo do inicio, login, missao concluida). E o
        // mesmo tom do texto principal: o escuro do app e um so.
        espresso: '#2B2826',
        'espresso-2': '#3A3532',
        'espresso-3': '#4A4440',
        // Texto sobre espresso.
        latte: '#D8CFC9',

        // Acerto. Verde-oliva, nao verde de semaforo.
        grass: '#5E7A4E',
        'grass-dark': '#46613A',
        'grass-soft': '#E6EDDF',

        // Informacao, selecao -- e o ingles.
        macaw: '#3F6584',
        'macaw-dark': '#2F5674',
        'macaw-soft': '#DCE6EE',

        // Erro. Tijolo, distinto do caramelo da acao.
        cardinal: '#B54A3C',
        'cardinal-dark': '#8E3328',
        'cardinal-soft': '#F6DDD7',

        // Recompensa: XP, sequencia, nivel. Caramelo claro.
        bee: '#B86E40',
        'bee-dark': '#7A4426',
        'bee-soft': '#F2E3D7',
        // O caramelo claro que brilha sobre o espresso.
        honey: '#E3B392',

        beak: '#B86E40',

        // Ameixa: o que e raro/desbloqueavel.
        humpback: '#7B5A86',
        'humpback-dark': '#5E4268',
        'humpback-soft': '#ECE2EF',

        // O alemao. Verde-musgo, distinto do oliva do acerto.
        forest: '#4A7A6A',
        'forest-dark': '#355C50',
        'forest-soft': '#DDEAE5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /*
         * `font-serif` era o titulo desde o diario de bordo e esta em quase 150
         * lugares. Ele agora aponta para a Sora: e o papel ("isto e titulo")
         * que se manteve, nao a serifa.
         */
        serif: ['Sora', 'Inter', 'ui-sans-serif', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'sans-serif'],
        /*
         * Mesmo raciocinio: `font-mono` marcava NUMERO (XP, nivel, contagem).
         * Numero em fonte de terminal era um dos tracos de "app gerado". Ele
         * vira Inter com algarismos tabulares (ver index.css); codigo de
         * verdade usa `font-code`.
         */
        mono: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        code: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      transitionTimingFunction: {
        // A curva de tudo que entra: sai rapido, assenta devagar.
        out: 'cubic-bezier(.2,.7,.2,1)',
        // Com um leve passo alem do alvo, para o que precisa "estalar".
        spring: 'cubic-bezier(.3,1.3,.5,1)',
      },
      keyframes: {
        /* --- Entrada --- */
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        page: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        pop: {
          '0%': { transform: 'scale(0.6) translateY(8px)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'none', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        // A pilula da aba ativa surgindo atras do icone.
        pill: {
          from: { opacity: '0', transform: 'scale(0.4, 0.8)' },
          to: { opacity: '1', transform: 'none' },
        },
        // Barra enchendo da esquerda.
        fill: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        // O visto se desenhando (stroke-dasharray: 30).
        draw: {
          from: { strokeDashoffset: '30' },
          to: { strokeDashoffset: '0' },
        },
        // O contador de sequencia virando.
        flip: {
          from: { opacity: '0', transform: 'translateY(60%) rotateX(-70deg)' },
          to: { opacity: '1', transform: 'none' },
        },

        /* --- Atencao --- */
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        shake: {
          '0%, 100%': { transform: 'none' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(7px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        // Erro errado de novo precisa tremer de novo: duas copias do mesmo
        // tremor deixam alternar a classe e reiniciar a animacao.
        'shake-b': {
          '0%, 100%': { transform: 'none' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(7px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // Anel em volta do microfone gravando.
        ring: {
          from: { transform: 'scale(1)', opacity: '0.5' },
          to: { transform: 'scale(1.9)', opacity: '0' },
        },
        dot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        // O XP terminando de contar.
        glow: {
          '0%': { textShadow: '0 0 0 rgba(227,179,146,0)' },
          '40%': { textShadow: '0 0 24px rgba(227,179,146,.55)' },
          '100%': { textShadow: '0 0 0 rgba(227,179,146,0)' },
        },

        /* --- Fundo do login --- */
        'marquee-l': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-r': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-4deg)' },
        },
        wave: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-390px)' },
        },
      },
      animation: {
        /*
         * As entradas usam `backwards` e nao `both`: o estado final da
         * animacao fica sendo o estilo normal do elemento. Com `both`, a
         * animacao seguraria o `transform` final e anularia o `active:scale`
         * do toque -- o botao entrava bonito e depois nao afundava mais.
         */
        rise: 'rise 520ms cubic-bezier(.2,.7,.2,1) backwards',
        fade: 'fade 420ms ease-out backwards',
        page: 'page 280ms cubic-bezier(.2,.7,.2,1) backwards',
        pop: 'pop 300ms cubic-bezier(.3,1.3,.5,1) backwards',
        'slide-up': 'slide-up 320ms cubic-bezier(.2,.8,.2,1)',
        pill: 'pill 380ms cubic-bezier(.3,1.3,.5,1) backwards',
        fill: 'fill 900ms cubic-bezier(.2,.7,.2,1) 250ms backwards',
        draw: 'draw 420ms ease-out 200ms backwards',
        flip: 'flip 420ms cubic-bezier(.2,.8,.2,1) backwards',
        nudge: 'nudge 1.6s ease-in-out infinite',
        shake: 'shake 380ms ease-in-out',
        'shake-b': 'shake-b 380ms ease-in-out',
        wiggle: 'wiggle 500ms ease-in-out 2',
        ring: 'ring 1.4s ease-out infinite',
        dot: 'dot 1.2s ease-in-out infinite',
        glow: 'glow 1200ms ease-out',
        'marquee-l': 'marquee-l 38s linear infinite',
        'marquee-l-fast': 'marquee-l 30s linear infinite',
        'marquee-r': 'marquee-r 46s linear infinite',
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite reverse',
        wave: 'wave 10s linear infinite',
        'wave-slow': 'wave 15s linear infinite',
      },
    },
  },
  plugins: [],
};
