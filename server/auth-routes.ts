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

    // Create new user with first quest assigned
    const newUser = await storage.createUser({
      email,
      adventurersName,
      password, // In production, hash this password
      currentQuest: 1, // Assign first quest to new users
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
    
    // Find user by email (including admin users)
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

    // For admin users, add admin flag
    let userResponse = { ...user };
    if (email === 'admin@codequest.com') {
      userResponse = {
        ...user,
        isAdmin: true
      };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userResponse;

    return res.json({
      success: true,
      user: userWithoutPassword,
      message: email === 'admin@codequest.com' ? 'Admin login successful' : 'Login successful'
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