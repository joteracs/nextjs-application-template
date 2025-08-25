import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validateSession } from './lib/auth';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = await validateSession();
      if (!sessionUser) {
        router.push('/login');
      } else if (sessionUser.type !== 'admin') {
        router.push('/dashboard');
      } else {
        setUser(sessionUser);
        fetchQuestions();
        fetchUsers();
      }
    };
    fetchUser();
  }, [router]);

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    if (res.ok) {
      const data = await res.json();
      setQuestions(data);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Painel Admin</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a 
              href="#" 
              className={activeTab === 'questions' ? 'active' : ''}
              onClick={() => setActiveTab('questions')}
            >
              Gerenciar Questões
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Gerenciar Usuários
            </a>
          </li>
          <li><a href="/dashboard">Voltar ao Dashboard</a></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Painel Administrativo</h1>
        </div>

        {activeTab === 'questions' && (
          <div>
            <div className="card">
              <div className="card-header">
                <h2>Gerenciar Questões</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowQuestionForm(true)}
                >
                  Adicionar Questão
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Matéria</th>
                    <th>Enunciado</th>
                    <th>Alternativas</th>
                    <th>Resposta Correta</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td>{question.id}</td>
                      <td>{question.subject}</td>
                      <td>{question.statement}</td>
                      <td>
                        <ul>
                          {question.alternatives.map((alt, index) => (
                            <li key={index}>{alt}</li>
                          ))}
                        </ul>
                      </td>
                      <td>{question.alternatives[question.correct_answer]}</td>
                      <td>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setEditingQuestion(question)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="card">
              <div className="card-header">
                <h2>Gerenciar Usuários</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUserForm(true)}
                >
                  Adicionar Usuário
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Último Login</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.type}</td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}</td>
                      <td>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setEditingUser(user)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
