import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validateSession } from './lib/auth';

export default function SolveQuestions() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndQuestions = async () => {
      const sessionUser = await validateSession();
      if (!sessionUser) {
        router.push('/login');
      } else {
        setUser(sessionUser);
        const res = await fetch('/api/questions');
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
          if (data.length > 0) {
            setCurrentQuestion(data[0]);
          }
        }
      }
    };
    fetchUserAndQuestions();
  }, [router]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const isAnswerCorrect = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(isAnswerCorrect);
    setIsAnswered(true);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }
    setTotalAnswered(totalAnswered + 1);

    // Save answer to database
    await fetch('/api/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        questionId: currentQuestion.id,
        givenAnswer: selectedAnswer,
        isCorrect: isAnswerCorrect,
      }),
    });
  };

  const handleNextQuestion = () => {
    const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentQuestion(questions[nextIndex]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  if (!user || !currentQuestion) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Resolver Questões</h2>
        </div>
        <ul className="sidebar-nav">
          <li><a href="/dashboard">Voltar ao Dashboard</a></li>
          <li><a href="/review-questions">Revisar Questões</a></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Resolver Questões</h1>
          <div className="score">
            <p>Pontuação: {score}/{totalAnswered}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>Questão {questions.findIndex(q => q.id === currentQuestion.id) + 1} de {questions.length}</h2>
            <p>Matéria: {currentQuestion.subject}</p>
          </div>
          <div className="question-content">
            <p>{currentQuestion.statement}</p>
            <div className="alternatives">
              {currentQuestion.alternatives.map((alternative, index) => (
                <div key={index} className="alternative">
                  <input
                    type="radio"
                    id={`answer-${index}`}
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                  />
                  <label htmlFor={`answer-${index}`}>{alternative}</label>
                </div>
              ))}
            </div>
            {!isAnswered ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Enviar Resposta
              </button>
            ) : (
              <div>
                <p className={isCorrect ? 'success-message' : 'error-message'}>
                  {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
                </p>
                <button className="btn btn-secondary" onClick={handleNextQuestion}>
                  Próxima Questão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
