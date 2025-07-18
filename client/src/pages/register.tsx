import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RegisterProps {
  onRegister: (user: any) => void;
  onShowLogin: () => void;
}

export default function Register({ onRegister, onShowLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [adventurersName, setAdventurersName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adventurersName, password }),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onRegister(result.user);
        toast({
          title: "Welcome to CodeQuest!",
          description: `Account created for ${result.user.adventurersName}!`,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
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
              🛡️ Join CodeQuest
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create your account and start your coding adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
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
                <Label htmlFor="adventurersName" className="text-[var(--cyber-cyan)]">
                  Adventurer's Name
                </Label>
                <Input
                  id="adventurersName"
                  type="text"
                  value={adventurersName}
                  onChange={(e) => setAdventurersName(e.target.value)}
                  className="mt-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
                  placeholder="Enter your adventurer name"
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
              <div>
                <Label htmlFor="confirmPassword" className="text-[var(--cyber-cyan)]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-cyber"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onShowLogin}
                  className="text-[var(--cyber-cyan)] hover:text-[var(--cyber-pink)] font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}