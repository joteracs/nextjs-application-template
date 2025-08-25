import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validateSession } from './lib/auth';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = await validateSession();
      if (!sessionUser) {
        router.push('/login');
      } else {
        setUser(sessionUser);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Bem-vindo, {user ? user.name : 'Usuário'}</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a href="/solve-questions">Resolver Questões</a>
          </li>
          <li>
            <a href="/review-questions">Revisar Questões Resolvidas (Flashcards)</a>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Painel do Usuário Comum</h1>
        </div>
        {user && user.firstLogin && (
          <div className="welcome-message">
            <p>Bem-vindo à plataforma! Aqui você pode resolver questões e revisar suas respostas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
