module.exports = {
  // Environment configuration
  env: {
    browser: true,
    es2021: true,
    node: false
  },

  // Parser configuration
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  // Extended configurations
  extends: [
    'eslint:recommended'
  ],

  // Custom rules for TaskFlow
  rules: {
    // Code quality rules
    'no-console': 'off',                    // Allow console.log for debugging
    'no-unused-vars': 'error',              // Prevent unused variables
    'no-undef': 'error',                    // Prevent undefined variables
    'no-duplicate-imports': 'error',        // Prevent duplicate imports
    'no-var': 'error',                      // Use let/const instead of var
    'prefer-const': 'error',                // Use const when possible
    
    // Style rules
    'indent': ['error', 2],                 // 2-space indentation
    'quotes': ['error', 'single'],          // Single quotes for strings
    'semi': ['error', 'always'],            // Require semicolons
    'comma-dangle': ['error', 'never'],     // No trailing commas
    'object-curly-spacing': ['error', 'always'], // Spaces in objects
    'array-bracket-spacing': ['error', 'never'],  // No spaces in arrays
    
    // Best practices
    'eqeqeq': ['error', 'always'],          // Use === instead of ==
    'no-eval': 'error',                     // Prevent eval() usage
    'no-implied-eval': 'error',             // Prevent implied eval
    'no-new-func': 'error',                 // Prevent Function constructor
    'no-script-url': 'error',               // Prevent javascript: URLs
    'no-alert': 'warn',                     // Warn about alert() usage
    'no-confirm': 'off',                    // Allow confirm() for user interaction
    
    // Function rules
    'func-call-spacing': ['error', 'never'], // No space before parentheses
    'space-before-function-paren': ['error', 'never'], // No space before function parens
    'function-paren-newline': ['error', 'multiline'], // Consistent function params
    
    // Object and array rules
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    
    // Class rules
    'class-methods-use-this': 'off',        // Allow methods that don't use 'this'
    'no-useless-constructor': 'error',      // Prevent empty constructors
    
    // Variable naming
    'camelcase': ['error', { properties: 'always' }], // Enforce camelCase
    'new-cap': ['error', { newIsCap: true }],          // Constructor names start with capital
    
    // ES6+ rules
    'arrow-spacing': ['error', { before: true, after: true }], // Arrow function spacing
    'template-curly-spacing': ['error', 'never'],              // Template literal spacing
    'rest-spread-spacing': ['error', 'never'],                 // Rest/spread spacing
    
    // Comment rules
    'spaced-comment': ['error', 'always'],                     // Space after // or /*
    'multiline-comment-style': ['error', 'starred-block'],     // Consistent comment style
    
    // Complexity rules
    'complexity': ['warn', 10],                                // Warn on complex functions
    'max-depth': ['warn', 4],                                  // Warn on deep nesting
    'max-lines-per-function': ['warn', 50],                    // Warn on long functions
    'max-params': ['warn', 4]                                  // Warn on many parameters
  },

  // Global variables specific to TaskFlow
  globals: {
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    localStorage: 'readonly',
    console: 'readonly',
    alert: 'readonly',
    confirm: 'readonly',
    prompt: 'readonly',
    
    // TaskFlow globals
    taskFlow: 'writable',                   // Main application instance
    TaskFlow: 'readonly'                    // TaskFlow class
  },

  // Override rules for specific files
  overrides: [
    {
      // More lenient rules for main application file
      files: ['scripts/app.js'],
      rules: {
        'max-lines-per-function': ['warn', 100],  // Allow longer methods in main class
        'complexity': ['warn', 15]                // Allow higher complexity in main file
      }
    },
    {
      // Specific rules for utility files
      files: ['scripts/utils.js', 'scripts/helpers.js'],
      rules: {
        'no-console': 'warn'                      // Prefer less console usage in utilities
      }
    },
    {
      // Configuration files
      files: ['.eslintrc.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'quotes': ['error', 'single'],
        'comma-dangle': ['error', 'never']
      }
    }
  ],

  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'vendor/'
  ]
};
