import React from 'react';
import { Button } from '../components/shared/Button';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();

  // Se já está autenticado, redirecionar para dashboard
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Verifique se seu email é @clubpetro ou @familiapires');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <p className="text-text-secondary">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="https://i.imgur.com/Pw5rL2k.png"
            alt="ClubPetro"
            className="mx-auto mb-6 w-48"
          />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Bem-vindo ao Cockpit
          </h1>
          <p className="text-text-secondary">
            Faça login com sua conta corporativa
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </Button>

        <p className="text-xs text-text-secondary text-center mt-6">
          Apenas emails @clubpetro e @familiapires são permitidos
        </p>
      </div>
    </div>
  );
};
