import { useState } from 'react';
import { Book, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LearningPanelProps {
  quest: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    concepts: string[];
    xpReward: number;
    estimatedTime: string;
    testCases?: Array<{
      input: string;
      expectedOutput: string;
    }>;
  } | null;
  userLevel: number;
  onNextQuest: () => void;
  showNextButton: boolean;
}

export default function LearningPanel({ quest, userLevel, onNextQuest, showNextButton }: LearningPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');

  if (!quest) {
    return (
      <div className="bg-[var(--cyber-gray)] p-4 rounded-lg">
        <div className="text-center text-gray-400">
          <Book className="w-12 h-12 mx-auto mb-2" />
          <p>No quest selected</p>
        </div>
      </div>
    );
  }

  const getConceptExplanation = (concept: string): string => {
    const explanations: { [key: string]: string } = {
      'print': 'The print() function displays text or values to the console. It\'s your primary way to show output to users.',
      'variables': 'Variables are containers that store data values. In Python, you create them by assigning values with the = operator.',
      'strings': 'Strings are sequences of characters enclosed in quotes. They represent text data in your programs.',
      'integers': 'Integers are whole numbers without decimal points. They\'re used for counting, indexing, and mathematical operations.',
      'floats': 'Floats are numbers with decimal points. They\'re used for precise calculations and measurements.',
      'functions': 'Functions are reusable blocks of code that perform specific tasks. They help organize your code and avoid repetition.',
      'loops': 'Loops allow you to repeat code multiple times. They\'re essential for processing data and automating repetitive tasks.',
      'conditionals': 'Conditionals (if statements) allow your program to make decisions based on certain conditions.',
      'lists': 'Lists are ordered collections of items that can be modified. They\'re perfect for storing multiple related values.',
      'dictionaries': 'Dictionaries store data in key-value pairs. They\'re like real dictionaries where you look up definitions.',
      'classes': 'Classes are blueprints for creating objects. They define the structure and behavior of your custom data types.',
      'methods': 'Methods are functions that belong to a class. They define what actions objects of that class can perform.',
      'inheritance': 'Inheritance allows classes to inherit properties and methods from other classes, promoting code reuse.',
      'recursion': 'Recursion is when a function calls itself. It\'s useful for solving problems that can be broken down into smaller, similar problems.',
      'error handling': 'Error handling helps your program gracefully deal with unexpected situations using try-except blocks.',
      'for loops': 'For loops iterate over sequences like lists or ranges. They\'re perfect for processing each item in a collection.',
      'while loops': 'While loops continue executing as long as a condition is true. They\'re useful for indefinite iteration.',
      'range': 'The range() function generates a sequence of numbers. It\'s commonly used with for loops.',
      'iteration': 'Iteration is the process of repeating a set of instructions. It\'s fundamental to programming.',
      'if statements': 'If statements allow your program to execute different code based on conditions.',
      'comparison operators': 'Comparison operators (==, !=, <, >, etc.) compare values and return True or False.',
      'arithmetic': 'Arithmetic operations (+, -, *, /) perform mathematical calculations on numbers.',
      'parameters': 'Parameters are inputs that functions accept. They make functions flexible and reusable.',
      'return values': 'Return values are outputs that functions provide back to the caller.',
      'counters': 'Counters are variables used to keep track of how many times something has happened.',
      'incrementation': 'Incrementation is the process of increasing a value, typically by 1 using the += operator.',
      'nested loops': 'Nested loops are loops inside other loops. They\'re useful for working with multi-dimensional data.',
      'print formatting': 'Print formatting controls how output is displayed, including spacing and line breaks.',
      'key-value pairs': 'Key-value pairs are the basic structure of dictionaries, where each key maps to a value.',
      'dictionary access': 'Dictionary access uses square brackets [] to retrieve values by their keys.',
      'nested data structures': 'Nested data structures contain other data structures inside them, like lists of dictionaries.',
      'objects': 'Objects are instances of classes. They contain both data (attributes) and functions (methods).',
      '__init__': 'The __init__ method is a special method that initializes new objects when they\'re created.',
      'base cases': 'Base cases are conditions that stop recursive functions from calling themselves infinitely.',
      'game logic': 'Game logic refers to the rules and decision-making processes that control how a game behaves.',
      'object-oriented programming': 'OOP is a programming paradigm based on objects and classes, promoting code organization and reuse.',
      'exceptions': 'Exceptions are errors that occur during program execution that can be caught and handled.',
      'try-except': 'Try-except blocks allow you to handle errors gracefully without crashing your program.',
      'list comprehensions': 'List comprehensions provide a concise way to create lists based on existing lists.',
      'decorators': 'Decorators are functions that modify or enhance other functions without changing their core logic.',
      'advanced Python': 'Advanced Python features include decorators, generators, context managers, and metaclasses.',
      'system design': 'System design involves planning how different parts of a program work together.',
      'data structures': 'Data structures are ways of organizing and storing data efficiently for different use cases.',
      'basic syntax': 'Python syntax is the set of rules that defines how Python programs are written and interpreted.',
      'console output': 'Console output is text that appears in the terminal or command prompt when your program runs.',
      'variable assignment': 'Variable assignment is the process of giving a name to a value using the = operator.',
      'data types': 'Data types specify what kind of data a variable can hold (string, integer, float, boolean, etc.).',
      'mathematical operations': 'Mathematical operations include addition (+), subtraction (-), multiplication (*), and division (/).',
      'type conversion': 'Type conversion is changing data from one type to another, like converting a string to an integer.',
      'boolean logic': 'Boolean logic deals with True/False values and logical operations like and, or, and not.',
      'control flow': 'Control flow determines the order in which your program executes statements.',
      'f-strings': 'F-strings are a way to format strings by embedding expressions inside curly braces {}.',
      'loop variables': 'Loop variables are temporary variables that hold the current value during each iteration of a loop.',
      'counting': 'Counting is keeping track of how many times something has occurred, often using numbers.',
      'list creation': 'List creation is making a new list using square brackets [] and separating items with commas.',
      'code reusability': 'Code reusability means writing code once and using it multiple times in different parts of your program.',
      'modular programming': 'Modular programming is organizing code into separate, interchangeable modules or functions.',
      'input': 'The input() function gets text from the user and returns it as a string.',
      'user interaction': 'User interaction is when your program communicates with the person using it.',
      'string interpolation': 'String interpolation is inserting variable values into strings using f-strings or .format().',
      'dictionary creation': 'Dictionary creation uses curly braces {} to make a collection of key-value pairs.',
      'dictionary iteration': 'Dictionary iteration is going through each key-value pair in a dictionary using loops.',
      'items method': 'The items() method returns all key-value pairs in a dictionary as tuples.',
      'random module': 'The random module provides functions to generate random numbers and make random choices.',
      'imports': 'Imports let you use code from other modules by bringing them into your current program.',
      'function calls': 'Function calls are when you execute a function by writing its name followed by parentheses.',
      'end parameter': 'The end parameter in print() controls what character is printed at the end of the output.',
      'loop control': 'Loop control involves managing how loops start, continue, and stop executing.',
      'patterns': 'Patterns are repeated designs or structures, often created using loops and string operations.',
      'self': 'Self is a reference to the current instance of a class, used to access attributes and methods.',
      'object interaction': 'Object interaction is when different objects communicate and work together in your program.',
      'conditional statements': 'Conditional statements execute different code based on whether conditions are true or false.',
      'input validation': 'Input validation checks if user input is correct and safe before using it in your program.',
      'filtering': 'Filtering is selecting only certain items from a collection based on specific criteria.',
      'mapping': 'Mapping is transforming each item in a collection into something else using a function or expression.',
      'conditional expressions': 'Conditional expressions are compact if-else statements that return values based on conditions.',
      'higher-order functions': 'Higher-order functions are functions that take other functions as arguments or return functions.',
      'function wrapping': 'Function wrapping is creating a new function that enhances or modifies another function.',
      'timing': 'Timing is measuring how long code takes to execute, useful for performance analysis.',
      'slicing': 'Slicing is extracting parts of sequences like strings or lists using [start:end] notation.',
    };

    return explanations[concept] || `${concept} is an important programming concept you'll learn more about as you progress.`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-[var(--cyber-green)]';
      case 'intermediate':
        return 'text-[var(--cyber-cyan)]';
      case 'advanced':
        return 'text-[var(--cyber-purple)]';
      case 'expert':
        return 'text-[var(--cyber-pink)]';
      default:
        return 'text-gray-400';
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: '🎯' },
    { id: 'expected', label: 'Expected Output', icon: '📋' },
    { id: 'concepts', label: 'Concepts', icon: '🧠' },
    { id: 'tips', label: 'Tips', icon: '💡' },
  ];

  return (
    <div className="bg-[var(--cyber-gray)] rounded-lg border border-[var(--cyber-cyan)]/30 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--cyber-cyan)]/30 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Book className="w-5 h-5 text-[var(--cyber-cyan)]" />
          <h3 className="font-bold text-[var(--cyber-cyan)]">Learning Guide</h3>
        </div>
        <div className="flex space-x-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-[var(--cyber-cyan)] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {section.icon} {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeSection === 'overview' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white mb-2">{quest.title}</h4>
              <p className="text-gray-300 text-sm">{quest.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--cyber-dark)] p-3 rounded">
                <div className="text-xs text-gray-400 mb-1">Difficulty</div>
                <div className={`font-bold ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty.toUpperCase()}
                </div>
              </div>
              <div className="bg-[var(--cyber-dark)] p-3 rounded">
                <div className="text-xs text-gray-400 mb-1">XP Reward</div>
                <div className="font-bold text-[var(--cyber-green)]">
                  {quest.xpReward} XP
                </div>
              </div>
              <div className="bg-[var(--cyber-dark)] p-3 rounded">
                <div className="text-xs text-gray-400 mb-1">Est. Time</div>
                <div className="font-bold text-[var(--cyber-cyan)]">
                  {quest.estimatedTime}
                </div>
              </div>
              <div className="bg-[var(--cyber-dark)] p-3 rounded">
                <div className="text-xs text-gray-400 mb-1">Your Level</div>
                <div className="font-bold text-white">
                  Level {userLevel}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'expected' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white mb-3">Expected Output</h4>
            {quest.testCases && quest.testCases.length > 0 ? (
              <div className="space-y-3">
                {quest.testCases.map((testCase, index) => (
                  <div key={index} className="bg-[var(--cyber-dark)] border border-[var(--cyber-cyan)]/30 rounded-lg p-4">
                    {testCase.input && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-400 mb-1">Input:</div>
                        <pre className="text-[var(--cyber-cyan)] font-mono text-sm">{testCase.input}</pre>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">Expected Output:</div>
                      <pre className="text-[var(--cyber-green)] font-mono text-sm whitespace-pre-wrap">{testCase.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--cyber-dark)] border border-[var(--cyber-cyan)]/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm">No specific output expected - focus on implementing the required functionality.</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'concepts' && (
          <div className="space-y-3">
            <h4 className="font-bold text-white mb-3">Key Concepts</h4>
            {quest.concepts.map((concept, index) => (
              <div key={index} className="bg-[var(--cyber-dark)] p-3 rounded">
                <div className="font-medium text-[var(--cyber-cyan)] mb-1">
                  {concept.charAt(0).toUpperCase() + concept.slice(1)}
                </div>
                <div className="text-sm text-gray-300">
                  {getConceptExplanation(concept)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'tips' && (
          <div className="space-y-3">
            <h4 className="font-bold text-white mb-3">Success Tips</h4>
            <div className="space-y-2">
              {quest.difficulty === 'beginner' && (
                <>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Take your time to understand each line of code</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Test your code frequently using the Run button</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Use the AI tutor wisely - hints (-10 XP), explanations (-15 XP), solutions (-25 XP)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Start simple and gradually add complexity to your code</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Check the expected output to ensure your solution matches exactly</p>
                  </div>
                </>
              )}
              {quest.difficulty === 'intermediate' && (
                <>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Break complex problems into smaller, manageable steps</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Use meaningful variable names that describe their purpose</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Test different inputs and consider edge cases</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Plan your logic before writing code - pseudocode helps!</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Remember XP penalties for AI assistance - try solving independently first</p>
                  </div>
                </>
              )}
              {(quest.difficulty === 'advanced' || quest.difficulty === 'expert') && (
                <>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Focus on clean code structure and proper organization</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Optimize for efficiency and follow Python best practices</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Write reusable, maintainable code with proper documentation</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Research the concepts thoroughly before using AI assistance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-[var(--cyber-green)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">Challenge yourself to solve problems using multiple approaches</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next Quest Button */}
      {showNextButton && (
        <div className="border-t border-[var(--cyber-cyan)]/30 p-4">
          <Button
            onClick={onNextQuest}
            className="w-full btn-cyber flex items-center justify-center space-x-2"
          >
            <span>Next Quest</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}