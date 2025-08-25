'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateSession } from './lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await validateSession();
      if (user) {
        if (user.type === 'admin') {
          router.push('/admin-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        textAlign: 'center', 
        color: 'white',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Plataforma de Estudos</h1>
        <p style={{ fontSize: '1.2rem' }}>Carregando...</p>
      </div>
    </div>
  );
}
