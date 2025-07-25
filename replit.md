# CodeQuest - Interactive Coding Education Platform

## Overview

CodeQuest is a gamified coding education platform that combines interactive coding challenges with AI-powered assistance. The application features a quest-based learning system where users progress through coding challenges, earn XP, and level up their programming skills. The platform includes real-time code execution, AI chat support, and a comprehensive user progression system.

## User Preferences

Preferred communication style: Simple, everyday language.
User requested: Remove OpenAI dependency, create custom AI logic, add learning panel, add many more quests/levels, add "Next Quest" button for completed quests, start at absolute beginner level progressing to advanced applications/games, make RPG-style fun lessons to keep users engaged.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration for client-side bundling
- **Styling**: Tailwind CSS with custom cyberpunk theme variables
- **Component Library**: Radix UI components with shadcn/ui design system
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Monaco Editor integration for syntax highlighting and code editing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: PostgreSQL-backed sessions (connect-pg-simple)
- **Code Execution**: Isolated Python execution environment with security constraints
- **AI Integration**: Custom AI logic for code analysis and chat functionality (removed OpenAI dependency)

### Project Structure
- `client/` - Frontend React application
- `server/` - Backend Express.js application
- `shared/` - Shared TypeScript types and database schema
- `migrations/` - Database migration files

## Key Components

### Data Models
- **Users**: User profiles with XP, level, rank, achievements, and quest progress
- **Quests**: Coding challenges with difficulty levels, XP rewards, and test cases
- **Chat Messages**: AI conversation history linked to users and quests
- **Code Submissions**: User code submissions with execution results and feedback

### Frontend Components
- **CodeEditor**: Monaco-based editor with syntax highlighting and execution controls
- **AIChat**: Real-time chat interface with AI tutor
- **QuestPanel**: Displays current quest information and requirements
- **LearningPanel**: Comprehensive learning guide with quest concepts, tips, and educational content
- **TerminalOutput**: Shows code execution results and errors
- **XPBar**: Progress tracking with level and XP visualization (updated for faster progression)

### Backend Services
- **AI Service**: Custom AI logic for code analysis and educational chat with built-in programming knowledge
- **Code Execution Service**: Secure Python code execution with resource limits
- **Storage Service**: In-memory storage implementation with default user creation

## Data Flow

1. **Quest Loading**: User selects or is assigned a quest, starting code is loaded into editor
2. **Code Execution**: User writes code, submits for execution, results displayed in terminal
3. **AI Analysis**: Code can be analyzed by AI for feedback and suggestions
4. **Chat Support**: Users can ask questions and receive AI-powered educational assistance
5. **Progress Tracking**: Successful quest completion awards XP and updates user level

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for persistent data storage (currently using in-memory storage)
- **AI Service**: Custom AI logic (removed OpenAI dependency)
- **Code Execution**: Python runtime for executing user code submissions

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Server-side bundling for production
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development Mode
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations handled via Drizzle Kit

### Production Build
- Frontend built to `dist/public` via Vite
- Backend bundled to `dist/index.js` via ESBuild
- Static file serving integrated with Express
- Environment variables for database and API keys

### Security Considerations
- Code execution runs in isolated environment with timeouts
- Resource limits prevent infinite loops and memory exhaustion
- Custom AI logic eliminates external API dependencies
- Database credentials managed through environment configuration

## Recent Changes (July 2025)

### Advanced Features Implementation (July 18, 2025)
- **Analytics Service**: Implemented comprehensive code complexity analysis with metrics for execution time, memory usage, and cyclomatic complexity
- **Learning Analytics**: Added intelligent learning velocity tracking, concept mastery analysis, and personalized study recommendations
- **Performance Metrics**: Real-time performance tracking with success rates, focus scores, and coding streak visualization
- **Gamification System**: Advanced achievement system with 7 achievement types (common to legendary rarity)
- **Daily Challenges**: Dynamic challenge system with speed, accuracy, creativity, and efficiency challenges
- **Smart Leaderboards**: Multi-type leaderboards (XP, streak, speed) with real-time updates
- **Advanced Code Analysis**: Real-time code complexity analysis during execution with optimization suggestions
- **Smart Hint System**: Context-aware hints that analyze current code and provide targeted suggestions
- **XP Multiplier System**: Dynamic XP calculation based on difficulty, speed, accuracy, and streak bonuses
- **Progress Tracking**: Real-time user action tracking for detailed analytics and behavior analysis
- **Quest Recommendation Engine**: AI-powered quest suggestions based on learning patterns and skill gaps
- **Advanced Dashboard**: Comprehensive analytics dashboard with 5 tabs (Analytics, Performance, Achievements, Challenges, Leaderboard)

### Database Schema Enhancements (July 18, 2025)
- **Extended User Model**: Added fields for achievements, badges, completion times, hints usage, and helpful messages
- **Enhanced Code Submissions**: Added tracking for success rates, optimality, creativity, execution metrics, and complexity scores
- **Performance Tracking**: Comprehensive submission analytics with execution time, lines of code, and hints usage tracking

### Migration to Replit Environment (July 18, 2025)
- **Database Migration**: Successfully migrated from in-memory storage to PostgreSQL database
- **User Authentication**: Fixed localStorage validation to ensure user data consistency with database
- **Database Schema**: Applied all database migrations and loaded 20 RPG-themed quests
- **Environment Setup**: Configured proper environment variables and database connectivity
- **Data Integrity**: Ensured all existing user data and quest progression is preserved
- **Security**: Implemented proper client-server separation and authentication validation

## Previous Changes (January 2025)

### Major Updates
- **Removed OpenAI Dependency**: Implemented custom AI logic for code analysis and tutoring
- **Added Learning Panel**: Comprehensive educational content with quest concepts, tips, and explanations
- **Expanded Quest System**: Added 20 RPG-themed quests progressing from absolute beginner to expert level
- **Enhanced Progression**: Faster leveling (500 XP per level), new rank system, quest completion tracking
- **Next Quest Feature**: Automatic progression to next quest upon completion
- **Tab System**: Added Quest/Learning/Lessons tabs for better organization
- **Custom AI Features**: 
  - Advanced code analysis with syntax checking
  - Educational feedback system
  - Context-aware tutoring responses
  - Programming concept explanations
  - Debugging assistance

### Latest Improvements (January 18, 2025)
- **Fixed Python Execution**: Resolved "/bin/sh: 1: python3: not found" error by installing Python 3.11
- **Fixed Quest Progression**: Users now automatically advance to next quest upon completion
- **Added Lessons Tab**: Complete curriculum overview showing all quests with completion status
- **Enhanced Code Editor**: Improved SimpleCodeEditor with better syntax highlighting and IDE-like features
- **Badge System**: Added achievement badges for quest completion, XP milestones, and streaks
- **Database Integration**: PostgreSQL database setup with Drizzle ORM (currently using in-memory storage)
- **Authentication System**: Complete user authentication with registration, login, and profile management
- **Production-Ready Features**:
  - ✅ Python syntax highlighting with color-coded keywords, strings, numbers, and comments
  - ✅ Expected output display in Learning Panel for all quests
  - ✅ Advanced AI tutor with solution provision at XP cost
  - ✅ Scrollable lessons panel with custom styling
  - ✅ Enhanced streak system for production use
  - ✅ Custom scrollbar styling for better UX
  - ✅ AI tutor buttons for getting solutions and explanations
  - ✅ User authentication with email and adventurer name
  - ✅ Profile management with image upload capability
  - ✅ Session persistence with localStorage
  - ✅ Profile icon in top-right corner with dropdown menu
- **Verified Functionality**: All core features working correctly:
  - ✅ Python code execution working
  - ✅ Quest completion and progression working
  - ✅ XP and leveling system working
  - ✅ AI analysis providing accurate feedback
  - ✅ Syntax highlighting fully functional
  - ✅ Expected output display working
  - ✅ User registration and login working
  - ✅ Profile updates and image management working

### Authentication Features Added (January 18, 2025)
- **User Registration**: Email-based registration with adventurer name selection
- **User Login**: Email and password authentication with session persistence
- **Profile Management**: Profile page with image upload, stats display, and editable fields
- **Session Management**: Persistent login state using localStorage
- **Profile Icon**: Top-right profile dropdown with user info and logout option
- **Data Schema**: Updated database schema with email, adventurersName, and profileImageUrl fields
- **Security**: Password validation and user data protection (production-ready for basic auth)

### Scalability Notes
- In-memory storage currently used with default user creation
- Database integration prepared via Drizzle ORM (PostgreSQL ready)
- Custom AI service eliminates external API rate limits
- Code execution service designed for concurrent users

### Quest System Features
- **20 Progressive Quests**: From basic print statements to complex OOP and game development
- **RPG Theming**: Adventure-themed quests with engaging narratives
- **Difficulty Scaling**: Beginner → Intermediate → Advanced → Expert
- **Concept Learning**: Each quest introduces new programming concepts
- **Immediate Feedback**: Real-time code analysis and educational feedback
- **Next Quest Progression**: Automatic unlock system for completed quests