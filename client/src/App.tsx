import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import CodeQuest from '@/pages/codequest';
import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Profile from '@/pages/profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface User {
  id: number;
  email: string;
  adventurersName: string;
  profileImageUrl?: string;
  xp: number;
  level: number;
  rank: string;
  achievements: number;
  streak: number;
  currentQuest: number;
  completedQuests: number[];
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'game' | 'profile'>('login');

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('codequest-user');
    console.log('Checking saved user:', savedUser);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user:', parsedUser);
        
        // Validate user exists in database by making a quick API call
        fetch(`/api/user/${parsedUser.id}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('User not found in database');
            }
          })
          .then(userData => {
            setUser(userData);
            setCurrentView('game');
          })
          .catch(error => {
            console.error('Error validating saved user:', error);
            localStorage.removeItem('codequest-user');
            setCurrentView('login');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('codequest-user');
        setCurrentView('login');
        setIsLoading(false);
      }
    } else {
      setCurrentView('login');
      setIsLoading(false);
    }
    console.log('Setting loading to false');
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('codequest-user', JSON.stringify(loggedInUser));
    setCurrentView('game');
  };

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('codequest-user', JSON.stringify(newUser));
    setCurrentView('game');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('codequest-user');
    setCurrentView('login');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('codequest-user', JSON.stringify(updatedUser));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
        <div className="text-[var(--cyber-cyan)] text-xl">Loading CodeQuest...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[var(--cyber-dark)]">
          {currentView === 'login' && (
            <Login 
              onLogin={handleLogin} 
              onShowRegister={() => setCurrentView('register')} 
            />
          )}
          {currentView === 'register' && (
            <Register 
              onRegister={handleRegister} 
              onShowLogin={() => setCurrentView('login')} 
            />
          )}
          {currentView === 'game' && user && (
            <CodeQuest 
              user={user} 
              onUserUpdate={handleUserUpdate}
              onLogout={handleLogout}
              onShowProfile={() => setCurrentView('profile')}
            />
          )}
          {currentView === 'profile' && user && (
            <Profile 
              user={user} 
              onBack={() => setCurrentView('game')}
              onUserUpdate={handleUserUpdate}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;