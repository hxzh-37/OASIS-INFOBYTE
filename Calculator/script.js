// Calculator State Variables
let display = document.getElementById('display');
let currentInput = '0';
let operator = null;
let previousInput = null;
let waitingForOperand = false;

// Display Update Function
function updateDisplay() {
    display.textContent = currentInput;
}

// Number Input Handler
function inputNumber(number) {
    if (waitingForOperand) {
        currentInput = number;
        waitingForOperand = false;
    } else {
        currentInput = currentInput === '0' ? number : currentInput + number;
    }
    updateDisplay();
}

// Decimal Point Handler
function inputDecimal() {
    if (waitingForOperand) {
        currentInput = '0.';
        waitingForOperand = false;
    } else if (currentInput.indexOf('.') === -1) {
        currentInput += '.';
    }
    updateDisplay();
}

// Clear All Function
function clearAll() {
    currentInput = '0';
    operator = null;
    previousInput = null;
    waitingForOperand = false;
    updateDisplay();
}

// Clear Entry Function
function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

// Backspace Function
function backspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Operator Input Handler
function inputOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (previousInput === null) {
        previousInput = inputValue;
    } else if (operator) {
        const currentValue = previousInput || 0;
        const newValue = calculate(currentValue, inputValue, operator);

        currentInput = String(newValue);
        previousInput = newValue;
        updateDisplay();
    }

    waitingForOperand = true;
    operator = nextOperator;
}

// Calculate Function
function calculate(firstOperand, secondOperand, op) {
    switch (op) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            if (secondOperand === 0) {
                alert('Error: Cannot divide by zero!');
                return firstOperand;
            }
            return firstOperand / secondOperand;
        default:
            return secondOperand;
    }
}

// Equals Function
function performCalculation() {
    const inputValue = parseFloat(currentInput);

    if (previousInput !== null && operator) {
        const newValue = calculate(previousInput, inputValue, operator);
        currentInput = String(newValue);
        previousInput = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
    }
}

// Event Listeners for Buttons
document.addEventListener('DOMContentLoaded', function() {
    // Number buttons
    const numberButtons = document.querySelectorAll('.number');
    numberButtons.forEach(button => {
        button.addEventListener('click', function() {
            inputNumber(this.dataset.number);
        });
    });

    // Operator buttons
    const operatorButtons = document.querySelectorAll('.operator');
    operatorButtons.forEach(button => {
        button.addEventListener('click', function() {
            inputOperator(this.dataset.operator);
        });
    });

    // Special buttons
    document.getElementById('clear').addEventListener('click', clearAll);
    document.getElementById('clearEntry').addEventListener('click', clearEntry);
    document.getElementById('equals').addEventListener('click', performCalculation);
    document.getElementById('decimal').addEventListener('click', inputDecimal);
    document.getElementById('backspace').addEventListener('click', backspace);
});

// Keyboard Support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if (key >= '0' && key <= '9' || key === '.' || key === '+' || key === '-' || 
        key === '*' || key === '/' || key === 'Enter' || key === '=' || 
        key === 'Escape' || key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
    }

    // Handle number keys
    if (key >= '0' && key <= '9') {
        inputNumber(key);
    }
    
    // Handle decimal point
    else if (key === '.') {
        inputDecimal();
    }
    
    // Handle operators
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        inputOperator(key);
    }
    
    // Handle equals and enter
    else if (key === 'Enter' || key === '=') {
        performCalculation();
    }
    
    // Handle clear operations
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    }
    
    // Handle backspace
    else if (key === 'Backspace' || key === 'Delete') {
        backspace();
    }
});

// Initialize the calculator
updateDisplay();

// Add visual feedback for button presses
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(1px)';
    });
    
    button.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Utility function to format large numbers
function formatNumber(num) {
    if (num.toString().length > 10) {
        return parseFloat(num).toExponential(5);
    }
    return num.toString();
}

// Error handling for invalid operations
window.addEventListener('error', function(event) {
    console.error('Calculator Error:', event.error);
    currentInput = 'Error';
    updateDisplay();
    setTimeout(() => {
        clearAll();
    }, 2000);
});