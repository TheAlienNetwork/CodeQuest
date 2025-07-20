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
      // Beginner Level (1-18)
      1: `print('Hello, Adventure!')`,
      2: `first_name = 'Brave'
last_name = 'Knight'
full_name = first_name + ' ' + last_name
print(full_name)`,
      3: `hero_name = 'Brave Knight'
level = 1
hero_class = 'Warrior'
print(hero_name)
print(level)
print(hero_class)`,
      4: `total_arrows = 20
hits = 15
accuracy = (hits / total_arrows) * 100
print(accuracy)`,
      5: `strength_crystal = 15
magic_crystal = 8.5
total_power = strength_crystal + magic_crystal
print(total_power)`,
      6: `dragon_scales = 7
phoenix_feathers = 3
unicorn_tears = 12
print('Dragon Scales:', dragon_scales)
print('Phoenix Feathers:', phoenix_feathers)
print('Unicorn Tears:', unicorn_tears)`,
      7: `temperature = 25
if temperature > 30:
    print('Hot day ahead!')
elif temperature > 20:
    print('Pleasant weather!')
else:
    print('Bundle up, it\\'s cold!')`,
      8: `for i in range(1, 6):
    print('Day', i, ': Training session')`,
      9: `count = 1
while count <= 5:
    print('Guard patrol', count)
    count += 1`,
      10: `team_members = ['Alice', 'Bob', 'Charlie']
for member in team_members:
    print('Welcome,', member)`,
      11: `def greet_hero(name):
    return 'Welcome, ' + name + '!'
message = greet_hero('Brave Knight')
print(message)`,
      12: `inventory = ['sword', 'shield', 'potion']
print('Your inventory:')
for item in inventory:
    print('-', item)`,
      13: `player_name = input('Enter your hero name: ')
print('Welcome to the quest,', player_name + '!')`,
      14: `skills = ['combat', 'magic', 'stealth']
print('Available skills:')
for i, skill in enumerate(skills, 1):
    print(f'{i}. {skill}')`,
      15: `numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print('Sum:', total)`,
      16: `hero_stats = {'strength': 15, 'magic': 12, 'speed': 10}
print('Hero Stats:')
for stat, value in hero_stats.items():
    print(f'{stat}: {value}')`,
      17: `def calculate_damage(strength, weapon_power):
    return strength + weapon_power
damage = calculate_damage(15, 8)
print('Total damage:', damage)`,
      18: `import random
sides = 6
roll = random.randint(1, sides)
print('You rolled:', roll)`,
      
      // Intermediate Level (19-28)
      19: `def create_spell(element, power):
    return f'{element} spell with {power} power'
spell = create_spell('Fire', 25)
print(spell)`,
      20: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
result = factorial(5)
print(result)`,
      21: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [n for n in numbers if n % 2 == 0]
print('Even numbers:', evens)`,
      22: `scores = [85, 92, 78, 96, 87]
average = sum(scores) / len(scores)
print(f'Average score: {average:.1f}')`,
      23: `for i in range(1, 6):
    for j in range(i):
        print('*', end='')
    print()`,
      24: `inventory = {'sword': 3, 'shield': 1, 'potion': 5}
for item, count in inventory.items():
    print(f'{item}: {count}')`,
      25: `word = 'adventure'
vowels = 'aeiou'
vowel_count = sum(1 for char in word if char.lower() in vowels)
print(f'Vowels in "{word}": {vowel_count}')`,
      26: `import re
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
print(validate_email('hero@quest.com'))`,
      27: `player_data = {'name': 'Hero', 'level': 5, 'class': 'Warrior'}
print('Player Information:')
for key, value in player_data.items():
    print(f'{key.title()}: {value}')`,
      28: `def roll_dice(num_dice, sides):
    import random
    total = 0
    for _ in range(num_dice):
        total += random.randint(1, sides)
    return total
result = roll_dice(3, 6)
print(f'Total roll: {result}')`,
      
      // Advanced Level (29-36)
      29: `class Hero:
    def __init__(self, name, level):
        self.name = name
        self.level = level
    
    def introduce(self):
        return f'I am {self.name}, level {self.level} hero!'

hero = Hero('Brave Knight', 5)
print(hero.introduce())`,
      30: `class Weapon:
    def __init__(self, name, damage):
        self.name = name
        self.damage = damage

class Hero:
    def __init__(self, name):
        self.name = name
        self.weapon = None
    
    def equip_weapon(self, weapon):
        self.weapon = weapon
    
    def attack(self):
        if self.weapon:
            return f'{self.name} attacks with {self.weapon.name} for {self.weapon.damage} damage!'
        return f'{self.name} attacks with bare hands!'

hero = Hero('Knight')
sword = Weapon('Excalibur', 50)
hero.equip_weapon(sword)
print(hero.attack())`,
      31: `class Mage:
    def __init__(self, name):
        self.name = name
    
    def cast_spell(self, spell):
        return f'{self.name} casts {spell}!'

class FireMage(Mage):
    def cast_fireball(self):
        return self.cast_spell('Fireball')

class IceMage(Mage):
    def cast_ice_shard(self):
        return self.cast_spell('Ice Shard')

fire_mage = FireMage('Pyros')
ice_mage = IceMage('Frost')
print(fire_mage.cast_fireball())
print(ice_mage.cast_ice_shard())`,
      32: `class BattleSystem:
    def __init__(self):
        self.combatants = []
    
    def add_combatant(self, combatant):
        self.combatants.append(combatant)
    
    def start_battle(self):
        return f'Battle begins with {len(self.combatants)} combatants!'

class Warrior:
    def __init__(self, name, health):
        self.name = name
        self.health = health

battle = BattleSystem()
warrior1 = Warrior('Knight', 100)
warrior2 = Warrior('Orc', 80)
battle.add_combatant(warrior1)
battle.add_combatant(warrior2)
print(battle.start_battle())`,
      33: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

treasure_locations = [1, 3, 5, 7, 9, 11, 13, 15]
position = binary_search(treasure_locations, 7)
print(f'Treasure found at position: {position}')`,
      34: `try:
    treasure_chest = int(input('Enter treasure amount: '))
    if treasure_chest < 0:
        raise ValueError('Treasure cannot be negative!')
    print(f'You found {treasure_chest} gold!')
except ValueError as e:
    print(f'Error: {e}')
except:
    print('Invalid input! Please enter a number.')`,
      35: `heroes = ['Alice', 'Bob', 'Charlie', 'Diana']
powerful_heroes = [hero.upper() for hero in heroes if len(hero) > 3]
print('Powerful heroes:', powerful_heroes)`,
      36: `def handle_quest(quest_type):
    handlers = {
        'combat': lambda: 'Engaging in combat!',
        'puzzle': lambda: 'Solving puzzle!',
        'exploration': lambda: 'Exploring new area!'
    }
    return handlers.get(quest_type, lambda: 'Unknown quest type!')()

print(handle_quest('combat'))
print(handle_quest('puzzle'))`,
      
      // Expert Level (37-40)
      37: `def quest_logger(func):
    def wrapper(*args, **kwargs):
        print(f'Starting quest: {func.__name__}')
        result = func(*args, **kwargs)
        print(f'Quest completed: {func.__name__}')
        return result
    return wrapper

@quest_logger
def rescue_princess():
    return 'Princess rescued!'

@quest_logger
def defeat_dragon():
    return 'Dragon defeated!'

print(rescue_princess())
print(defeat_dragon())`,
      38: `class QuestError(Exception):
    pass

class InvalidQuestError(QuestError):
    pass

def start_quest(quest_name):
    valid_quests = ['rescue', 'explore', 'battle']
    if quest_name not in valid_quests:
        raise InvalidQuestError(f'Quest "{quest_name}" is not available!')
    return f'Starting {quest_name} quest!'

try:
    print(start_quest('rescue'))
    print(start_quest('invalid'))
except InvalidQuestError as e:
    print(f'Quest Error: {e}')
except QuestError as e:
    print(f'General Quest Error: {e}')`,
      39: `def quest_generator():
    quests = ['Find treasure', 'Rescue villager', 'Defeat monster', 'Solve riddle']
    for quest in quests:
        yield f'New quest available: {quest}'

def resource_manager():
    print('Opening quest log...')
    try:
        yield 'Quest log ready'
    finally:
        print('Closing quest log...')

# Using generator
quest_gen = quest_generator()
for quest in quest_gen:
    print(quest)

# Using context manager pattern
with resource_manager() as manager:
    print(manager)`,
      40: `import random

class Character:
    def __init__(self, name, health, attack):
        self.name = name
        self.health = health
        self.attack = attack
    
    def is_alive(self):
        return self.health > 0
    
    def take_damage(self, damage):
        self.health -= damage
        if self.health < 0:
            self.health = 0

class GameEngine:
    def __init__(self):
        self.player = None
        self.enemies = []
    
    def create_player(self, name):
        self.player = Character(name, 100, 20)
    
    def add_enemy(self, name, health, attack):
        self.enemies.append(Character(name, health, attack))
    
    def battle(self):
        while self.player.is_alive() and any(enemy.is_alive() for enemy in self.enemies):
            # Player attacks random enemy
            alive_enemies = [e for e in self.enemies if e.is_alive()]
            if alive_enemies:
                target = random.choice(alive_enemies)
                damage = random.randint(15, 25)
                target.take_damage(damage)
                print(f'{self.player.name} attacks {target.name} for {damage} damage!')
                
                if not target.is_alive():
                    print(f'{target.name} defeated!')
            
            # Enemies attack player
            for enemy in self.enemies:
                if enemy.is_alive():
                    damage = random.randint(10, 15)
                    self.player.take_damage(damage)
                    print(f'{enemy.name} attacks {self.player.name} for {damage} damage!')
                    
                    if not self.player.is_alive():
                        print(f'{self.player.name} has been defeated!')
                        return
        
        if self.player.is_alive():
            print(f'{self.player.name} wins the battle!')

# Create game
game = GameEngine()
game.create_player('Hero')
game.add_enemy('Goblin', 50, 12)
game.add_enemy('Orc', 80, 15)
print('Epic battle begins!')
game.battle()`
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
        feedback: "Analysis failed. Unable to analyze code at this time.",
        suggestions: ["Please try again later"],
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

    // If the code has proper structure (variables and prints), mark as correct
    const hasCorrectStructure = this.checkOutput(code, expectedOutput);
    if (hasCorrectStructure) {
      isCorrect = true;
      xpEarned = 50 + Math.floor(Math.random() * 50); // 50-100 XP for correct solutions
      feedback = "Excellent work! Your code produces the correct output.";
    } else {
      // Only do syntax checks if structure is wrong
      const syntaxIssues = this.checkSyntax(code);
      if (syntaxIssues.length > 0) {
        feedback = `Syntax issues found: ${syntaxIssues.join(', ')}`;
        suggestions = ['Check your syntax carefully', 'Make sure all quotes and parentheses are matched'];
        return { isCorrect, feedback, suggestions, xpEarned, concepts };
      }
      
      feedback = "Your code runs but doesn't have the expected structure.";
      suggestions.push("Make sure you're using variables and print statements as required");
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

    // Only check for critical syntax errors that would prevent execution
    try {
      // Check for unmatched parentheses
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push('Unmatched parentheses');
      }

      // Check for unmatched quotes (but be more careful about strings)
      let inSingleQuote = false;
      let inDoubleQuote = false;
      let escaped = false;
      
      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"' && !inSingleQuote) {
          inDoubleQuote = !inDoubleQuote;
        } else if (char === "'" && !inDoubleQuote) {
          inSingleQuote = !inSingleQuote;
        }
      }
      
      if (inSingleQuote || inDoubleQuote) {
        issues.push('Unmatched quotes');
      }

      // Check for missing colons only for control structures that absolutely need them
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) continue;
        
        // Only check lines that should definitely end with colons
        const controlPatterns = [
          /^def\s+\w+\s*\([^)]*\)\s*$/,
          /^class\s+\w+.*$/,
          /^if\s+.+$/,
          /^elif\s+.+$/,
          /^else\s*$/,
          /^for\s+.+\s+in\s+.+$/,
          /^while\s+.+$/,
          /^try\s*$/,
          /^except.*$/,
          /^finally\s*$/,
          /^with\s+.+$/
        ];
        
        const needsColon = controlPatterns.some(pattern => pattern.test(line));
        
        if (needsColon && !line.endsWith(':')) {
          issues.push(`Missing colon on line ${i + 1}: ${line}`);
        }
      }
    } catch (error) {
      // If syntax checking itself fails, don't report syntax errors
      console.log('Syntax checking error:', error);
    }

    return issues;
  }

  private checkOutput(code: string, expectedOutput: string): boolean {
    // Improved output checking that handles various quest patterns
    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ').trim();
    const expectedLines = expectedOutput.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // If no expected output lines, return true
    if (expectedLines.length === 0) {
      return true;
    }

    // Basic validation: must have print statements
    const expectedPrintCount = expectedLines.length;
    const actualPrintCount = (normalizedCode.match(/print\s*\(/g) || []).length;
    
    // Must have at least the expected number of print statements
    if (actualPrintCount < expectedPrintCount) {
      return false;
    }

    // Check for specific quest patterns
    
    // Quest 6 pattern: Dragon Scales, Phoenix Feathers, Unicorn Tears
    if (expectedOutput.includes('Dragon Scales') && expectedOutput.includes('Phoenix Feathers') && expectedOutput.includes('Unicorn Tears')) {
      const hasAllIngredients = normalizedCode.includes('dragon_scales') && 
                               normalizedCode.includes('phoenix_feathers') && 
                               normalizedCode.includes('unicorn_tears');
      const hasProperPrints = normalizedCode.includes('print(') && actualPrintCount >= 3;
      return hasAllIngredients && hasProperPrints;
    }

    // Quest 1-5 patterns: Basic variable and print checking
    const hasStringVariables = normalizedCode.includes('=') && (normalizedCode.includes('"') || normalizedCode.includes("'"));
    const hasNumberVariables = normalizedCode.includes('=') && /\d/.test(normalizedCode);
    
    // If we have variables and print statements, consider it valid structure
    if ((hasStringVariables || hasNumberVariables) && actualPrintCount >= expectedPrintCount) {
      return true;
    }

    // Fallback: if code has the right number of prints, it's probably correct
    return actualPrintCount >= expectedPrintCount;
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
      if (this.programmingKnowledge.concepts[concept as keyof typeof this.programmingKnowledge.concepts]) {
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
      // Beginner Level (1-18)
      1: [
        'Use the print() function to display text. Put your message inside quotes.',
        'Remember that strings in Python need to be enclosed in quotes - either single \' or double ".',
        'The exact message should match what the quest is asking for: "Hello, Adventure!"',
        'Try: print("Hello, Adventure!") - this will output the welcome message.'
      ],
      2: [
        'Create two variables: first_name and last_name with string values.',
        'Use the + operator to combine strings: first_name + " " + last_name',
        'Don\'t forget the space between names: first_name + " " + last_name',
        'Store the result in a variable called full_name, then print it.'
      ],
      3: [
        'Create three variables: hero_name (string), level (number), hero_class (string)',
        'Use descriptive names and appropriate data types for each variable',
        'Print each variable on a separate line using print()',
        'Example: hero_name = "Your Hero Name" then print(hero_name)'
      ],
      4: [
        'Calculate accuracy as: (hits / total_arrows) * 100',
        'Use division (/) to get the percentage as a decimal first',
        'Multiply by 100 to convert to percentage format',
        'The result should be 75.0 for 15 hits out of 20 arrows'
      ],
      5: [
        'Create two variables: one for strength (integer) and one for magic (decimal)',
        'Use the + operator to add the two values together',
        'Store the result in a variable called total_power',
        'The magic crystal should be 8.5 (a decimal number)'
      ],
      6: [
        'Create three variables for the ingredient counts',
        'Use print() with both text and variables: print("Item name:", variable)',
        'Print each ingredient with its descriptive name and count',
        'Example: print("Dragon Scales:", dragon_scales)'
      ],
      7: [
        'Use if, elif, and else statements to check temperature ranges',
        'First check if temperature > 30, then elif temperature > 20',
        'Use proper indentation (4 spaces) for the code inside each condition',
        'Don\'t forget the colon : at the end of each condition line'
      ],
      8: [
        'Use a for loop with range(1, 6) to get numbers 1 through 5',
        'Inside the loop, print a message with the day number',
        'Use print() to combine text and the loop variable',
        'Example: print("Day", i, ": Training session")'
      ],
      9: [
        'Use a while loop that continues while count <= 5',
        'Initialize count = 1 before the loop',
        'Don\'t forget to increment count inside the loop: count += 1',
        'Print the patrol message with the current count'
      ],
      10: [
        'Create a list of team member names using square brackets []',
        'Use a for loop to iterate through each member in the list',
        'Print a welcome message for each member',
        'Example: for member in team_members:'
      ],
      11: [
        'Define a function using def keyword followed by function name and parameters',
        'Use return to send back a result from the function',
        'Call the function and store the result in a variable',
        'Don\'t forget to print the final message'
      ],
      12: [
        'Create a list of inventory items using square brackets',
        'Print a header message first, then use a for loop',
        'Print each item with a dash or bullet point',
        'Example: print("-", item) inside the loop'
      ],
      13: [
        'Use input() function to get user input: input("Enter your hero name: ")',
        'Store the input in a variable called player_name',
        'Use string concatenation to combine welcome message with the name',
        'Add an exclamation mark at the end for excitement!'
      ],
      14: [
        'Create a list of skill names',
        'Use enumerate(skills, 1) to get both index and skill name',
        'This starts numbering from 1 instead of 0',
        'Use f-strings to format: f"{i}. {skill}"'
      ],
      15: [
        'Create a list of numbers from 1 to 5',
        'Use the built-in sum() function to add all numbers',
        'Store the result and print it with a descriptive label',
        'sum([1, 2, 3, 4, 5]) will give you 15'
      ],
      16: [
        'Create a dictionary using curly braces {} with key: value pairs',
        'Use .items() method to iterate through both keys and values',
        'Print each stat name and its value',
        'Example: for stat, value in hero_stats.items():'
      ],
      17: [
        'Define a function that takes two parameters: strength and weapon_power',
        'Return the sum of both parameters',
        'Call the function with specific values and store the result',
        'Print the total damage with a descriptive message'
      ],
      18: [
        'Import the random module at the top of your code',
        'Use random.randint(1, sides) to generate a random number',
        'Store the result in a variable called roll',
        'Print the result with a descriptive message'
      ],
      
      // Intermediate Level (19-28)
      19: [
        'Define a function that takes element and power as parameters',
        'Use f-strings to format the return string: f"{element} spell with {power} power"',
        'Call the function with "Fire" and 25 as arguments',
        'Print the returned spell description'
      ],
      20: [
        'Define a recursive function that calls itself',
        'Base case: if n <= 1, return 1',
        'Recursive case: return n * factorial(n - 1)',
        'Test with factorial(5) which should return 120'
      ],
      21: [
        'Use list comprehension: [expression for item in list if condition]',
        'Check if a number is even using: n % 2 == 0',
        'Create a new list with only even numbers',
        'Print the filtered list of even numbers'
      ],
      22: [
        'Use sum() to add all scores and len() to count them',
        'Divide sum by length to get average',
        'Use f-strings with :.1f to format to 1 decimal place',
        'Example: f"Average score: {average:.1f}"'
      ],
      23: [
        'Use nested for loops: outer loop for rows, inner loop for stars',
        'Outer loop: for i in range(1, 6)',
        'Inner loop: for j in range(i) to print i stars',
        'Use print("*", end="") to print stars on same line, then print() for new line'
      ],
      24: [
        'Create a dictionary with item names as keys and counts as values',
        'Use .items() to iterate through the dictionary',
        'Print each item and its count',
        'Example: for item, count in inventory.items():'
      ],
      25: [
        'Create a string variable and a vowels string',
        'Use a list comprehension or loop to count vowels',
        'Check if each character is in the vowels string',
        'Use sum() with a generator expression to count'
      ],
      26: [
        'Import the re module for regular expressions',
        'Define a pattern for email validation',
        'Use re.match() to check if email matches the pattern',
        'Return True or False based on the match result'
      ],
      27: [
        'Create a dictionary with player information',
        'Use .items() to iterate through key-value pairs',
        'Use .title() method to capitalize the key names',
        'Print each piece of information with formatting'
      ],
      28: [
        'Define a function that takes number of dice and sides as parameters',
        'Use a for loop with range(num_dice) to roll each die',
        'Use random.randint(1, sides) for each roll',
        'Add up all the rolls and return the total'
      ],
      
      // Advanced Level (29-36)
      29: [
        'Define a class using the class keyword',
        'Use __init__ method to initialize object properties',
        'Create methods that use self to access object properties',
        'Create an instance of the class and call its methods'
      ],
      30: [
        'Create two classes: Weapon and Hero',
        'Hero should have a weapon property that starts as None',
        'Add methods to equip weapons and perform attacks',
        'Use conditional logic to check if weapon is equipped'
      ],
      31: [
        'Create a base Mage class with common functionality',
        'Create child classes that inherit from Mage',
        'Use super() or call parent methods from child classes',
        'Each child class should have specialized methods'
      ],
      32: [
        'Create classes that work together in a system',
        'Use lists to store multiple objects',
        'Add methods to manage collections of objects',
        'Demonstrate object interaction and collaboration'
      ],
      33: [
        'Implement binary search algorithm with left and right pointers',
        'Use while loop with left <= right condition',
        'Calculate middle index: mid = (left + right) // 2',
        'Update left or right based on comparison with target'
      ],
      34: [
        'Use try-except blocks to handle different types of errors',
        'Create custom exceptions by raising ValueError',
        'Handle specific exception types with separate except blocks',
        'Use a general except block as a fallback'
      ],
      35: [
        'Use list comprehension with conditional filtering',
        'Apply string methods like .upper() within the comprehension',
        'Filter based on string length using len()',
        'Create a new list with transformed and filtered data'
      ],
      36: [
        'Create a dictionary mapping quest types to handler functions',
        'Use lambda functions as simple handlers',
        'Use .get() method with a default lambda for unknown types',
        'Call the returned function immediately with ()'
      ],
      
      // Expert Level (37-40)
      37: [
        'Create a decorator function that wraps other functions',
        'Use *args and **kwargs to handle any function signature',
        'Add logging before and after the original function call',
        'Use @decorator_name syntax to apply the decorator'
      ],
      38: [
        'Create custom exception classes that inherit from Exception',
        'Create a hierarchy of exceptions for different error types',
        'Use try-except blocks to catch specific exception types',
        'Raise custom exceptions with descriptive messages'
      ],
      39: [
        'Create a generator function using yield instead of return',
        'Implement a context manager pattern with try-finally',
        'Use yield to provide values one at a time',
        'Demonstrate both generator and context manager usage'
      ],
      40: [
        'Create a complete game system with multiple interacting classes',
        'Implement game logic with loops and conditional statements',
        'Use random module for game mechanics',
        'Create a battle system that handles multiple entities'
      ]
    };

    const hints = questHints[questId];
    if (!hints || hints.length === 0) {
      return "I don't have specific hints for this quest, but remember to break the problem down into smaller steps!";
    }

    // Return a random hint for variety
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    return randomHint;
  }

  async getSolution(questId: number, userId: number): Promise<string> {
    const solution = this.programmingKnowledge.questSolutions[questId as keyof typeof this.programmingKnowledge.questSolutions];
    if (solution) {
      return `Here's the complete solution:\n\n${solution}\n\nThis solution demonstrates the key concepts needed for this quest.`;
    }
    
    return "Solution not available for this quest. Try working through it step by step!";
  }

  async getExplanation(questId: number, userId: number): Promise<string> {
    // Comprehensive quest-specific explanations for all 40 quests
    const questExplanations: { [key: number]: string } = {
      // Beginner Level (1-18)
      1: 'This quest teaches you about the print() function, which is the foundation of output in Python. You need to display "Hello, Adventure!" exactly as specified. The print() function takes text inside parentheses and shows it to the user.',
      2: 'This quest introduces string concatenation - combining multiple text values. You\'ll create two variables for first and last names, then use the + operator to join them with a space. This demonstrates how to work with string variables and combine them.',
      3: 'This quest covers variables and data types. You\'ll create three variables: a hero name (string), level (integer), and class (string). Each variable stores different types of data, and you\'ll print each one to display the hero\'s registration.',
      4: 'This quest teaches basic arithmetic and percentage calculations. You\'ll use division and multiplication to calculate accuracy as a percentage. This demonstrates mathematical operations and working with different number types.',
      5: 'This quest introduces working with integers and floats (decimal numbers). You\'ll add a whole number (strength) to a decimal number (magic) to get a total. This shows how Python handles different numeric types.',
      6: 'This quest teaches formatted output with multiple variables. You\'ll print descriptive labels alongside variable values, showing how to create user-friendly output that explains what each number represents.',
      7: 'This quest introduces conditional logic with if, elif, and else statements. You\'ll check temperature ranges and print different messages based on the value. This demonstrates decision-making in code.',
      8: 'This quest teaches for loops with the range() function. You\'ll iterate through numbers 1-5 and print a message for each day. This introduces repetitive actions and loop variables.',
      9: 'This quest covers while loops, which continue until a condition becomes false. You\'ll use a counter variable and increment it each iteration. This shows manual loop control and avoiding infinite loops.',
      10: 'This quest introduces lists and iteration. You\'ll create a list of team members and use a for loop to welcome each one. This demonstrates working with collections of data.',
      11: 'This quest teaches function basics - defining reusable code blocks. You\'ll create a function that takes a parameter and returns a formatted greeting. This introduces function parameters and return values.',
      12: 'This quest combines lists and loops for inventory management. You\'ll create a list of items and display them in a formatted way. This shows practical applications of data structures.',
      13: 'This quest introduces user input with the input() function. You\'ll get the user\'s name and create a personalized welcome message. This demonstrates interactive programming.',
      14: 'This quest teaches enumerate() for getting both index and value when looping. You\'ll number skills starting from 1 and format them nicely. This shows advanced list iteration techniques.',
      15: 'This quest introduces the sum() function for adding list elements. You\'ll create a list of numbers and calculate their total. This demonstrates built-in functions for common operations.',
      16: 'This quest teaches dictionaries - key-value pairs for storing related data. You\'ll create hero stats and iterate through them to display each stat and its value.',
      17: 'This quest covers function parameters and return values. You\'ll create a function that takes multiple parameters and returns a calculated result. This shows how functions process input and provide output.',
      18: 'This quest introduces the random module for generating unpredictable values. You\'ll simulate rolling a die and display the result. This shows how to import and use external modules.',
      
      // Intermediate Level (19-28)
      19: 'This quest teaches f-string formatting for creating dynamic text. You\'ll build a function that creates spell descriptions using formatted strings. This demonstrates modern Python string formatting.',
      20: 'This quest introduces recursion - functions that call themselves. You\'ll implement factorial calculation using recursive logic. This teaches advanced function concepts and mathematical thinking.',
      21: 'This quest covers list comprehensions - a concise way to create new lists. You\'ll filter even numbers from a list using elegant Python syntax. This shows advanced data processing techniques.',
      22: 'This quest teaches statistical calculations and string formatting. You\'ll calculate an average and format it to one decimal place. This demonstrates practical data analysis and presentation.',
      23: 'This quest introduces nested loops for creating patterns. You\'ll use two loops to create a star pattern, with the outer loop controlling rows and inner loop controlling stars per row.',
      24: 'This quest reinforces dictionary iteration and formatting. You\'ll display inventory items with their quantities in a user-friendly format. This shows practical data presentation.',
      25: 'This quest teaches string analysis and counting. You\'ll count vowels in a word using iteration and conditional logic. This demonstrates string processing and analysis techniques.',
      26: 'This quest introduces regular expressions for pattern matching. You\'ll validate email addresses using regex patterns. This shows advanced text processing and validation.',
      27: 'This quest covers dictionary formatting and string methods. You\'ll display player information with properly capitalized labels. This demonstrates data presentation and string manipulation.',
      28: 'This quest teaches functions with multiple parameters and loops. You\'ll simulate rolling multiple dice and calculate the total. This shows practical applications of randomness and functions.',
      
      // Advanced Level (29-36)
      29: 'This quest introduces object-oriented programming with classes. You\'ll create a Hero class with properties and methods. This teaches encapsulation and object-based design.',
      30: 'This quest teaches class interaction and object composition. You\'ll create Weapon and Hero classes that work together. This demonstrates how objects can contain and interact with other objects.',
      31: 'This quest covers inheritance - creating specialized classes from base classes. You\'ll create different types of mages that inherit common functionality. This shows code reuse and specialization.',
      32: 'This quest teaches system design with multiple interacting classes. You\'ll create a battle system that manages multiple combatants. This demonstrates complex object relationships.',
      33: 'This quest introduces the binary search algorithm - an efficient way to find items in sorted lists. You\'ll implement this classic computer science algorithm using iterative logic.',
      34: 'This quest teaches exception handling for managing errors gracefully. You\'ll use try-except blocks to handle different types of errors. This shows robust error management.',
      35: 'This quest covers advanced list comprehensions with filtering and transformations. You\'ll create new lists based on conditions and apply string methods. This demonstrates powerful data processing.',
      36: 'This quest introduces functional programming concepts with lambda functions and dictionaries. You\'ll create a dispatcher system using functions as values. This shows advanced programming patterns.',
      
      // Expert Level (37-40)
      37: 'This quest teaches decorators - functions that modify other functions. You\'ll create logging functionality that wraps existing functions. This demonstrates advanced Python features and meta-programming.',
      38: 'This quest covers custom exceptions and error hierarchies. You\'ll create specialized exception classes and handle them appropriately. This shows advanced error handling and class design.',
      39: 'This quest introduces generators and context managers - advanced Python features. You\'ll create functions that yield values and manage resources. This demonstrates memory-efficient programming.',
      40: 'This quest brings together all concepts in a complete game system. You\'ll create multiple classes, implement game logic, and handle complex interactions. This demonstrates professional-level system design.'
    };

    const defaultExplanation = 'This quest teaches important programming concepts. Break down the problem: read the description carefully, identify what output is expected, and think about which Python concepts you need to use. Check the expected output to understand exactly what your code should produce.';

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