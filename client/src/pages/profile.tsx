import { useState } from 'react';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

interface ProfileProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
}

export default function Profile({ user, onBack, onUserUpdate }: ProfileProps) {
  const [adventurersName, setAdventurersName] = useState(user.adventurersName);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/user/${user.id}`, {
        adventurersName,
        profileImageUrl: profileImageUrl || null,
      });

      onUserUpdate(response);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CodeQuest
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--cyber-gray)] border border-[var(--cyber-cyan)]/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[var(--cyber-cyan)] mb-8">
            🛡️ Adventurer Profile
          </h1>

          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-[var(--cyber-cyan)] overflow-hidden bg-[var(--cyber-dark)] flex items-center justify-center">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-[var(--cyber-cyan)]" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[var(--cyber-cyan)] text-black p-2 rounded-full cursor-pointer hover:bg-[var(--cyber-pink)] transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--cyber-cyan)]">
                {user.adventurersName}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-[var(--cyber-yellow)] font-semibold">
                Level {user.level} • {user.rank}
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--cyber-dark)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--cyber-cyan)]">{user.xp}</div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
            <div className="bg-[var(--cyber-dark)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--cyber-pink)]">{user.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="bg-[var(--cyber-dark)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--cyber-yellow)]">{user.completedQuests.length}</div>
              <div className="text-sm text-gray-400">Quests Done</div>
            </div>
            <div className="bg-[var(--cyber-dark)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--cyber-green)]">{user.streak}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="adventurersName" className="text-[var(--cyber-cyan)]">
                Adventurer's Name
              </Label>
              <Input
                id="adventurersName"
                value={adventurersName}
                onChange={(e) => setAdventurersName(e.target.value)}
                className="mt-2 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="profileImageUrl" className="text-[var(--cyber-cyan)]">
                Profile Image URL (optional)
              </Label>
              <Input
                id="profileImageUrl"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/your-image.jpg"
                className="mt-2 bg-[var(--cyber-dark)] border-[var(--cyber-cyan)]/30 text-white"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full btn-cyber"
            >
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}