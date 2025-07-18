import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface LoginProps {
  onLogin: (user: any) => void;
  onShowRegister: () => void;
}

export default function Login({ onLogin, onShowRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success) {
        onLogin(response.user);
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${response.user.adventurersName}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[var(--cyber-gray)] border-[var(--cyber-cyan)]/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[var(--cyber-cyan)]">
              🚀 Welcome to CodeQuest
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to continue your coding adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[var(--cyber-cyan)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-[var(--cyber-cyan)]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-cyber"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onShowRegister}
                  className="text-[var(--cyber-cyan)] hover:text-[var(--cyber-pink)] font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}