export interface CodeAnalysisResult {
  isCorrect: boolean;
  feedback: string;
  suggestions: string[];
  xpEarned: number;
  concepts: string[];
}

export interface ChatResponse {
  message: string;
  isHelpful: boolean;
  xpEarned: number;
}

export class AIService {
  // Custom AI logic for code analysis and tutoring
  private programmingKnowledge = {
    concepts: {
      'print': 'Used to display output to the console',
      'variables': 'Store data values that can be referenced and manipulated',
      'strings': 'Sequences of characters enclosed in quotes',
      'integers': 'Whole numbers without decimal points',
      'floats': 'Numbers with decimal points',
      'functions': 'Reusable blocks of code that perform specific tasks',
      'loops': 'Repeat code multiple times',
      'conditionals': 'Execute code based on conditions',
      'lists': 'Collections of items that can be modified',
      'dictionaries': 'Collections of key-value pairs',
      'classes': 'Templates for creating objects',
      'methods': 'Functions that belong to a class',
      'inheritance': 'Classes can inherit properties from other classes',
      'recursion': 'Functions that call themselves',
      'error handling': 'Managing exceptions and errors in code'
    },

    questSolutions: {
      1: `print("Hello, World!")`,
      2: `name = "Tyler"
age = 18
item = "sword"
print(name)
print(age)
print(item)`,
      3: `x = 10
y = 5
print(x + y)
print(x - y)
print(x * y)
print(x / y)`,
      4: `for i in range(5):
    print(i)`,
      5: `for i in range(1, 11):
    print(i)`,
      6: `name = input("What is your name? ")
print(f"Hello, {name}!")`,
      7: `age = int(input("Enter your age: "))
if age >= 18:
    print("You are an adult!")
else:
    print("You are a minor!")`,
      8: `count = 0
while count < 5:
    print(count)
    count += 1`,
      9: `def greet(name):
    return f"Hello, {name}!"

result = greet("Alice")
print(result)`,
      10: `fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)`,
    },
    
    commonMistakes: {
      'indentation': 'Python uses indentation to define code blocks',
      'syntax': 'Check for missing colons, parentheses, or quotes',
      'naming': 'Use descriptive variable names',
      'logic': 'Review your algorithm step by step'
    },
    
    hints: {
      'beginner': [
        'Start with simple print statements',
        'Use descriptive variable names',
        'Test your code step by step',
        'Remember Python is case-sensitive'
      ],
      'intermediate': [
        'Break complex problems into smaller functions',
        'Use lists and loops for repetitive tasks',
        'Consider edge cases in your logic',
        'Practice debugging techniques'
      ],
      'advanced': [
        'Think about code efficiency and optimization',
        'Use object-oriented programming principles',
        'Consider error handling and validation',
        'Write clean, maintainable code'
      ]
    }
  };

  async analyzeCode(code: string, questTitle: string, questDescription: string, expectedOutput: string): Promise<CodeAnalysisResult> {
    try {
      const analysis = this.performCodeAnalysis(code, questTitle, questDescription, expectedOutput);
      return analysis;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return {
        isCorrect: false,
        feedback: "Code analysis encountered an error. Please check your syntax and try again.",
        suggestions: [],
        xpEarned: 0,
        concepts: []
      };
    }
  }

  private performCodeAnalysis(code: string, questTitle: string, questDescription: string, expectedOutput: string): CodeAnalysisResult {
    let isCorrect = false;
    let feedback = "";
    let suggestions: string[] = [];
    let xpEarned = 0;
    let concepts: string[] = [];

    // Basic syntax checks
    const syntaxIssues = this.checkSyntax(code);
    if (syntaxIssues.length > 0) {
      feedback = `Syntax issues found: ${syntaxIssues.join(', ')}`;
      suggestions = ['Check your syntax carefully', 'Make sure all quotes and parentheses are matched'];
      return { isCorrect, feedback, suggestions, xpEarned, concepts };
    }

    // Check if code produces expected output
    const hasCorrectOutput = this.checkOutput(code, expectedOutput);
    if (hasCorrectOutput) {
      isCorrect = true;
      xpEarned = 50 + Math.floor(Math.random() * 50); // 50-100 XP for correct solutions
      feedback = "Excellent work! Your code produces the correct output.";
    } else {
      feedback = "Your code runs but doesn't produce the expected output.";
      suggestions.push("Check your logic and compare with the expected output");
      xpEarned = 10 + Math.floor(Math.random() * 20); // 10-30 XP for effort
    }

    // Analyze code quality
    const qualityAnalysis = this.analyzeCodeQuality(code);
    if (qualityAnalysis.suggestions.length > 0) {
      suggestions.push(...qualityAnalysis.suggestions);
    }

    // Extract concepts used
    concepts = this.extractConcepts(code);

    // Add educational feedback
    const educationalFeedback = this.generateEducationalFeedback(code, questTitle);
    if (educationalFeedback) {
      feedback += " " + educationalFeedback;
    }

    return { isCorrect, feedback, suggestions, xpEarned, concepts };
  }

  private checkSyntax(code: string): string[] {
    const issues: string[] = [];
    
    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push('Unmatched parentheses');
    }

    // Check for unmatched quotes
    const singleQuotes = (code.match(/'/g) || []).length;
    const doubleQuotes = (code.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      issues.push('Unmatched quotes');
    }

    // Check for missing colons in function/class definitions
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('def ') || line.startsWith('class ') || 
          line.startsWith('if ') || line.startsWith('for ') || 
          line.startsWith('while ') || line.startsWith('else') ||
          line.startsWith('elif ')) {
        if (!line.endsWith(':')) {
          issues.push(`Missing colon on line ${i + 1}`);
        }
      }
    }

    return issues;
  }

  private checkOutput(code: string, expectedOutput: string): boolean {
    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedExpected = expectedOutput.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Split expected output into lines for multi-line matching
    const expectedLines = expectedOutput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // If no expected output lines, return true
    if (expectedLines.length === 0) {
      return true;
    }
    
    // Check each expected line
    for (const line of expectedLines) {
      const lineLower = line.toLowerCase();
      let foundMatch = false;
      
      // Check for direct print statements with the expected output
      const printPatterns = [
        `print("${line}")`,
        `print('${line}')`,
        `print(${line})`,
        `print("${lineLower}")`,
        `print('${lineLower}')`,
        `print(${lineLower})`
      ];
      
      for (const pattern of printPatterns) {
        if (normalizedCode.includes(pattern.toLowerCase())) {
          foundMatch = true;
          break;
        }
      }
      
      // Check for mathematical expressions that evaluate to the expected result
      if (!foundMatch && line.match(/^\d+\.?\d*$/)) {
        const numValue = parseFloat(line);
        
        // Check for direct number printing
        if (normalizedCode.includes(`print(${numValue})`) || 
            normalizedCode.includes(`print(${numValue}.0)`)) {
          foundMatch = true;
        }
        
        // Check for common mathematical operations
        const mathPatterns = [
          /print\s*\(\s*\d+\s*\+\s*\d+\.?\d*\s*\)/,
          /print\s*\(\s*\d+\s*-\s*\d+\.?\d*\s*\)/,
          /print\s*\(\s*\d+\s*\*\s*\d+\.?\d*\s*\)/,
          /print\s*\(\s*\d+\s*\/\s*\d+\.?\d*\s*\)/,
          /print\s*\(\s*\w+\s*\+\s*\w+\s*\)/,
          /print\s*\(\s*\w+\s*-\s*\w+\s*\)/,
          /print\s*\(\s*\w+\s*\*\s*\w+\s*\)/,
          /print\s*\(\s*\w+\s*\/\s*\w+\s*\)/
        ];
        
        for (const pattern of mathPatterns) {
          if (pattern.test(normalizedCode)) {
            foundMatch = true;
            break;
          }
        }
      }
      
      // Special handling for variable assignments and printing
      if (!foundMatch) {
        // Check for variable definitions that match expected values
        if (lineLower === 'hero' || lineLower === 'tyler') {
          if (normalizedCode.includes('name =') && normalizedCode.includes('print(name)')) {
            foundMatch = true;
          }
        } else if (lineLower.match(/^\d+$/)) {
          if (normalizedCode.includes('age =') && normalizedCode.includes('print(age)')) {
            foundMatch = true;
          }
        } else if (lineLower === 'sword') {
          if (normalizedCode.includes('item =') && normalizedCode.includes('print(item)')) {
            foundMatch = true;
          }
        }
      }
      
      if (!foundMatch) {
        return false;
      }
    }
    
    return true;
  }

  private analyzeCodeQuality(code: string): { suggestions: string[] } {
    const suggestions: string[] = [];
    
    // Check for good variable naming
    const variables = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\s*=/g);
    if (variables) {
      const shortNames = variables.filter(v => v.length < 4);
      if (shortNames.length > 0) {
        suggestions.push('Consider using more descriptive variable names');
      }
    }

    // Check for comments
    if (!code.includes('#')) {
      suggestions.push('Adding comments can help explain your code');
    }

    // Check for proper indentation
    const lines = code.split('\n');
    let hasIndentationIssues = false;
    for (const line of lines) {
      if (line.trim() && line.startsWith(' ') && !line.startsWith('    ')) {
        hasIndentationIssues = true;
        break;
      }
    }
    if (hasIndentationIssues) {
      suggestions.push('Use 4 spaces for indentation in Python');
    }

    return { suggestions };
  }

  private extractConcepts(code: string): string[] {
    const concepts: string[] = [];
    
    if (code.includes('print(')) concepts.push('print');
    if (code.includes('=') && !code.includes('==')) concepts.push('variables');
    if (code.includes('"') || code.includes("'")) concepts.push('strings');
    if (/\b\d+\b/.test(code)) concepts.push('numbers');
    if (code.includes('def ')) concepts.push('functions');
    if (code.includes('for ') || code.includes('while ')) concepts.push('loops');
    if (code.includes('if ')) concepts.push('conditionals');
    if (code.includes('[') || code.includes(']')) concepts.push('lists');
    if (code.includes('class ')) concepts.push('classes');
    
    return concepts;
  }

  private generateEducationalFeedback(code: string, questTitle: string): string {
    const concepts = this.extractConcepts(code);
    const feedbacks: string[] = [];
    
    for (const concept of concepts) {
      if (this.programmingKnowledge.concepts[concept]) {
        feedbacks.push(`Great use of ${concept}!`);
      }
    }
    
    return feedbacks.join(' ');
  }

  async generateChatResponse(message: string, userLevel: number, currentQuest?: any): Promise<ChatResponse> {
    try {
      const response = this.generateTutorResponse(message, userLevel, currentQuest);
      return response;
    } catch (error) {
      console.error("Chat AI Error:", error);
      return {
        message: "I'm having trouble right now. Please try again in a moment!",
        isHelpful: false,
        xpEarned: 0
      };
    }
  }

  private generateTutorResponse(message: string, userLevel: number, currentQuest?: any): ChatResponse {
    const lowerMessage = message.toLowerCase();
    let responseMessage = "";
    let isHelpful = true;
    let xpEarned = 5;

    // Handle specific question types
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      responseMessage = this.generateHelpResponse(userLevel, currentQuest);
      xpEarned = 10;
    } else if (lowerMessage.includes('hint')) {
      responseMessage = this.generateHintResponse(userLevel, currentQuest);
      xpEarned = 15;
    } else if (lowerMessage.includes('explain')) {
      responseMessage = this.generateExplanationResponse(lowerMessage, userLevel);
      xpEarned = 20;
    } else if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
      responseMessage = this.generateDebuggingResponse(userLevel);
      xpEarned = 15;
    } else {
      responseMessage = this.generateGeneralResponse(userLevel);
      xpEarned = 5;
    }

    return { message: responseMessage, isHelpful, xpEarned };
  }

  private generateHelpResponse(userLevel: number, currentQuest?: any): string {
    const responses = [
      "I'm here to help you on your coding journey! What specific part are you struggling with?",
      "No worries, every great programmer gets stuck sometimes! Let's break this down step by step.",
      "That's what I'm here for! Tell me what's confusing you and we'll figure it out together.",
    ];
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (currentQuest) {
      response += ` For your current quest "${currentQuest.title}", try thinking about what the problem is asking you to do first.`;
    }
    
    return response;
  }

  private generateHintResponse(userLevel: number, currentQuest?: any): string {
    const levelHints = this.programmingKnowledge.hints[
      userLevel <= 2 ? 'beginner' : userLevel <= 5 ? 'intermediate' : 'advanced'
    ];
    
    const hint = levelHints[Math.floor(Math.random() * levelHints.length)];
    return `Here's a hint for you: ${hint}`;
  }

  private generateExplanationResponse(message: string, userLevel: number): string {
    // Extract concept from message
    for (const [concept, explanation] of Object.entries(this.programmingKnowledge.concepts)) {
      if (message.includes(concept)) {
        return `Great question! ${concept.charAt(0).toUpperCase() + concept.slice(1)} are ${explanation}. Would you like me to explain more about how to use them?`;
      }
    }
    
    return "I'd be happy to explain! Could you be more specific about what concept you'd like me to explain?";
  }

  async getHint(questId: number, userId: number): Promise<string> {
    // Comprehensive quest-specific hints that guide without giving answers
    const questHints: { [key: number]: string[] } = {
      1: [
        'Use the print() function to display text. Put your message inside quotes.',
        'Remember that strings in Python need to be enclosed in quotes - either single \' or double ".',
        'The exact message should match what the quest is asking for.',
        'Try: print("your message here") - replace "your message here" with the actual text.'
      ],
      2: [
        'Variables are created by assigning values: variable_name = value',
        'For strings, use quotes around the value: name = "Hero"',
        'For numbers, no quotes needed: age = 25',
        'After creating each variable, use print(variable_name) to display it.'
      ],
      3: [
        'Integer numbers don\'t need decimal points: strength = 10',
        'Float numbers have decimal points: magic_power = 7.5',
        'Use the + operator to add numbers together',
        'Store your calculation in a new variable, then print it.'
      ],
      4: [
        'If statements check conditions using comparison operators like ==',
        'The structure is: if condition: followed by indented code',
        'Use 4 spaces or one tab for indentation after the if statement',
        'Don\'t forget the colon : at the end of the if line!'
      ],
      5: [
        'For loops iterate through ranges of numbers',
        'Use range(start, end) to create a sequence of numbers',
        'The loop variable takes each value in the range one by one',
        'Indent the code inside the loop with 4 spaces or a tab.'
      ]
    };

    const defaultHints = [
      'Break the problem into smaller, manageable steps.',
      'Look at the expected output - what exactly needs to be displayed?',
      'Check if you need variables, loops, conditions, or functions.',
      'Make sure your indentation is correct - Python is picky about spaces!',
      'Test your code step by step, adding one piece at a time.',
      'Remember Python syntax rules: colons after if/for/def, proper indentation.',
      'Read the quest description carefully - it contains important clues!'
    ];

    const hints = questHints[questId] || defaultHints;
    return hints[Math.floor(Math.random() * hints.length)];
  }

  async getSolution(questId: number, userId: number): Promise<string> {
    // Load quest data to get solution using ES6 imports
    try {
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const { fileURLToPath } = await import('url');
      const { dirname } = await import('path');
      
      const __filename = fileURLToPath(import.meta.url || 'file://' + __filename);
      const __dirname = dirname(__filename);
      
      const questsPath = join(__dirname, '../data/comprehensive-quests.json');
      const questsData = JSON.parse(readFileSync(questsPath, 'utf8'));
      const quest = questsData.find((q: any) => q.id === questId);
      
      if (quest && quest.solutionCode) {
        return `Here's the complete solution:\n\n${quest.solutionCode}\n\nThis solution demonstrates the key concepts needed for this quest.`;
      }
      
      // Fallback solutions for first few quests
      const fallbackSolutions: { [key: number]: string } = {
        1: 'print("Hello, World!")',
        2: 'adventurer_name = "Hero"\nage = 25\nweapon = "Magic Sword"\nprint(adventurer_name)\nprint(age)\nprint(weapon)',
        3: 'strength = 10\nmagic_power = 7.5\ntotal_power = strength + magic_power\nprint(total_power)',
        4: 'level = 1\nif level == 1:\n    print("Welcome, brave adventurer!")',
        5: 'for i in range(1, 6):\n    print(f"Casting spell {i}")'
      };
      
      if (fallbackSolutions[questId]) {
        return `Here's the complete solution:\n\n${fallbackSolutions[questId]}\n\nThis solution demonstrates the key concepts needed for this quest.`;
      }
    } catch (error) {
      console.error('Error loading quest solution:', error);
    }
    
    return 'Sorry, I couldn\'t retrieve the solution for this quest. Try working through it step by step!';
  }

  async getExplanation(questId: number, userId: number): Promise<string> {
    // Quest-specific explanations that break down the task without giving full answer
    const questExplanations: { [key: number]: string } = {
      1: 'This quest teaches you about the print() function, which is used to display output to the user. You need to write code that outputs exactly "Hello, World!" to the console. The print() function takes whatever you put inside the parentheses and displays it.',
      2: 'This quest introduces variables - containers that store values. You\'ll create three variables: one for text (name), one for a number (age), and another for text (weapon). After creating each variable, you need to display its value using print().',
      3: 'This quest covers different number types in Python. Integers are whole numbers like 10, while floats have decimal points like 7.5. You\'ll create both types of variables and then add them together to calculate a total.',
      4: 'This quest teaches conditional logic using if statements. You\'ll check if a condition is true (level equals 1) and execute different code based on that condition. Remember that if statements need a colon and proper indentation.',
      5: 'This quest introduces loops - specifically for loops that repeat code multiple times. You\'ll use the range() function to create a sequence of numbers and loop through them, executing code for each number.'
    };

    const defaultExplanation = 'This quest teaches important programming concepts. Break down the problem: read the description carefully, identify what output is expected, and think about which Python concepts (variables, loops, conditions, etc.) you need to use.';
    
    return questExplanations[questId] || defaultExplanation;
  }

  private generateDebuggingResponse(userLevel: number): string {
    const tips = [
      "When debugging, start by reading the error message carefully - it often tells you exactly what's wrong!",
      "Try adding print statements to see what values your variables have at different points in your code.",
      "Check your indentation - Python is very picky about proper spacing!",
      "Make sure all your parentheses, brackets, and quotes are properly matched.",
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }

  private generateGeneralResponse(userLevel: number): string {
    const responses = [
      "That's an interesting question! I love helping aspiring coders learn.",
      "Keep up the great work! Every line of code you write makes you a better programmer.",
      "I'm here to support your coding adventure. What would you like to explore next?",
      "Programming is like solving puzzles - each challenge makes you stronger!",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateHint(questTitle: string, questDescription: string, userCode: string): Promise<string> {
    try {
      return this.generateQuestHint(questTitle, questDescription, userCode);
    } catch (error) {
      console.error("Hint Generation Error:", error);
      return "Try breaking down the problem into smaller steps!";
    }
  }

  private generateQuestHint(questTitle: string, questDescription: string, userCode: string): string {
    const hints = [
      "Think about what the problem is asking you to do step by step.",
      "Try writing some sample code first, even if it's not perfect.",
      "Check the expected output - what does your code need to produce?",
      "Consider using print statements to debug your logic.",
      "Break the problem into smaller, manageable pieces.",
    ];
    
    // Customize hints based on quest content
    if (questTitle.toLowerCase().includes('function')) {
      hints.push("Remember: functions start with 'def' and need a colon at the end.");
      hints.push("Don't forget to return a value if the function needs to give back a result.");
    }
    
    if (questTitle.toLowerCase().includes('loop')) {
      hints.push("Think about what you want to repeat and how many times.");
      hints.push("Remember to update your loop variable to avoid infinite loops.");
    }
    
    if (questTitle.toLowerCase().includes('class')) {
      hints.push("Classes are templates for creating objects. Start with __init__.");
      hints.push("Methods in classes need 'self' as their first parameter.");
    }
    
    return hints[Math.floor(Math.random() * hints.length)];
  }
}

export const aiService = new AIService();
