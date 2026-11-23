import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { AuthShell, UnderlineField } from './AuthShell';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    },
    onSuccess: (data) => {
      signIn(data.accessToken, data.user);
      navigate('/');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthShell title="Criar conta">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <UnderlineField
          label="Nome"
          icon="user"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          delay={220}
        />
        <UnderlineField
          label="E-mail"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          delay={280}
        />
        <UnderlineField
          label="Senha"
          icon="lock"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          hint="Mínimo de 8 caracteres."
          delay={340}
        />

        {mutation.isError && (
          <p
            key={mutation.submittedAt}
            className="mt-4 animate-shake rounded-xl bg-cardinal-soft px-3 py-2 text-sm text-cardinal-dark"
            role="alert"
          >
            {errorMessage(mutation.error)}
          </p>
        )}

        <div className="mt-auto animate-rise pt-8 [animation-delay:420ms]">
          <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando...' : 'Criar conta'}
          </button>
          <p className="mt-3 text-center text-sm text-wolf">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-dark">
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
