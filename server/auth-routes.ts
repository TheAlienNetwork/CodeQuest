import { Router } from 'express';
import { storage } from './storage';
import { insertUserSchema, loginUserSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, adventurersName, password } = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = await storage.createUser({
      email,
      adventurersName,
      password, // In production, hash this password
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      user: userWithoutPassword,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid registration data'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginUserSchema.parse(req.body);
    
    // Check for admin login
    if (email === 'admin@codequest.com' && password === 'admin123') {
      const adminUser = {
        id: 999,
        email: 'admin@codequest.com',
        adventurersName: 'Admin',
        username: 'admin',
        xp: 999999,
        level: 100,
        rank: 'System Administrator',
        achievements: 999,
        streak: 999,
        currentQuest: null,
        completedQuests: [],
        profileImageUrl: null,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.json({
        success: true,
        user: adminUser,
        message: 'Admin login successful'
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid login data'
    });
  }
});

// Update user profile
router.put('/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { adventurersName, profileImageUrl } = req.body;
    
    const updatedUser = await storage.updateUser(userId, {
      adventurersName,
      profileImageUrl,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;