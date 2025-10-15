class ScientificCalculator {
    constructor() {
        this.display = document.getElementById("display");
        this.expression = document.getElementById("expression");
        this.historyList = document.getElementById("history-list");
        this.themeSelector = document.getElementById("theme");
        this.memory = 0;
        this.currentExpression = "";
        this.isProcessing = false;
        this.focusedIndex = 0;
        this.buttons = Array.from(document.querySelectorAll('.buttons button'));
        this.isArrowNavigating = false; // Add this flag
        
        this.initializeEventListeners();
        this.initializeKeyboardNavigation();
        this.initializeThemeSelector();
        this.clearDisplay();
    }
    
    initializeEventListeners() {
        // Button click events
        document.querySelectorAll('.buttons button, .clear-history').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = button.getAttribute('data-value');
                const action = button.getAttribute('data-action');
                
                if (value) {
                    this.appendToDisplay(value);
                } else if (action) {
                    this.handleAction(action);
                }
            });
        });
        
        // Keyboard support for direct input
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }
    
    initializeKeyboardNavigation() {
        // Focus the first button initially
        this.updateFocus();
        
        // Add focus styles on focus
        this.buttons.forEach(button => {
            button.addEventListener('focus', () => {
                button.classList.add('focused');
            });
            
            button.addEventListener('blur', () => {
                button.classList.remove('focused');
            });
        });
    }
    
    initializeThemeSelector() {
        this.themeSelector.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme) {
            this.themeSelector.value = savedTheme;
            this.changeTheme(savedTheme);
        }
    }
    
    changeTheme(theme) {
        // Remove all theme classes
        document.body.className = '';
        
        // Add selected theme class
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-theme`);
        }
        
        // Save theme preference
        localStorage.setItem('calculatorTheme', theme);
    }
    
    updateFocus() {
        // Remove focus from all buttons
        this.buttons.forEach(button => {
            button.classList.remove('focused');
            button.blur();
        });
        
        // Add focus to current button
        if (this.buttons[this.focusedIndex]) {
            this.buttons[this.focusedIndex].focus();
            this.buttons[this.focusedIndex].classList.add('focused');
        }
    }
    
    handleArrowNavigation(direction) {
        this.isArrowNavigating = true; // Set flag when arrow navigating
        
        const cols = 5;
        const total = this.buttons.length;
        
        switch(direction) {
            case 'ArrowRight':
                this.focusedIndex = (this.focusedIndex + 1) % total;
                break;
            case 'ArrowLeft':
                this.focusedIndex = (this.focusedIndex - 1 + total) % total;
                break;
            case 'ArrowUp':
                this.focusedIndex = (this.focusedIndex - cols + total) % total;
                break;
            case 'ArrowDown':
                this.focusedIndex = (this.focusedIndex + cols) % total;
                break;
        }
        
        this.updateFocus();
        
        // Reset flag after a short delay
        setTimeout(() => {
            this.isArrowNavigating = false;
        }, 100);
    }
    
    handleKeyboardInput(e) {
        // Arrow key navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            this.handleArrowNavigation(e.key);
            return;
        }
        
        // Enter key - ONLY calculate if we're not arrow navigating
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // If we have a focused button from arrow navigation, click it
            if (this.isArrowNavigating && this.focusedIndex >= 0) {
                const focusedButton = this.buttons[this.focusedIndex];
                if (focusedButton) {
                    focusedButton.click();
                }
            } else {
                // Otherwise, treat Enter as equals
                this.calculate();
            }
            return;
        }
        
        // Space key to click focused button (only when arrow navigating)
        if (e.key === ' ' && this.isArrowNavigating && this.focusedIndex >= 0) {
            e.preventDefault();
            const focusedButton = this.buttons[this.focusedIndex];
            if (focusedButton) {
                focusedButton.click();
            }
            return;
        }
        
        // Direct key mappings from data-key attributes
        const keyButton = this.buttons.find(button => 
            button.getAttribute('data-key') === e.key
        );
        
        if (keyButton) {
            e.preventDefault();
            keyButton.click();
            // Reset arrow navigation when using direct keys
            this.isArrowNavigating = false;
            return;
        }
        
        // Traditional keyboard input
        if (e.key >= "0" && e.key <= "9") {
            this.appendToDisplay(e.key);
            this.isArrowNavigating = false; // Reset when typing numbers
        } else if (e.key === ".") {
            this.appendToDisplay(".");
            this.isArrowNavigating = false;
        } else if (["+", "-", "*", "/"].includes(e.key)) {
            this.appendToDisplay(e.key);
            this.isArrowNavigating = false;
        } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
            this.clearDisplay();
            this.isArrowNavigating = false;
        } else if (e.key === "Backspace") {
            this.deleteLast();
            this.isArrowNavigating = false;
        } else if (e.key === "(") {
            this.appendToDisplay("(");
            this.isArrowNavigating = false;
        } else if (e.key === ")") {
            this.appendToDisplay(")");
            this.isArrowNavigating = false;
        } else if (e.key === "^") {
            this.appendToDisplay("^");
            this.isArrowNavigating = false;
        }
    }
    
    appendToDisplay(value) {
        if (this.isProcessing) return;
        
        // Handle special values
        switch(value) {
            case 'π':
                this.display.value += Math.PI;
                break;
            case 'e':
                this.display.value += Math.E;
                break;
            default:
                this.display.value += value;
        }
        
        this.currentExpression = this.display.value;
    }
    
    handleAction(action) {
        if (this.isProcessing) return;
        
        switch(action) {
            case 'clear':
                this.clearDisplay();
                break;
            case 'calculate':
                this.calculate();
                break;
            case 'factorial':
                this.factorial();
                break;
            case 'reciprocal':
                this.reciprocal();
                break;
            case 'square':
                this.square();
                break;
            case 'memoryRecall':
                this.memoryRecall();
                break;
            case 'memoryClear':
                this.memoryClear();
                break;
            case 'memoryAdd':
                this.memoryAdd();
                break;
            case 'clearHistory':
                this.clearHistory();
                break;
        }
    }
    
    clearDisplay() {
        this.display.value = "";
        this.expression.textContent = "";
        this.currentExpression = "";
        this.isProcessing = false;
        this.isArrowNavigating = false; // Reset navigation flag
    }
    
    deleteLast() {
        this.display.value = this.display.value.slice(0, -1);
        this.currentExpression = this.display.value;
    }
    
    calculate() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        try {
            if (this.display.value.trim() === "") {
                throw "Empty expression";
            }
            
            let expr = this.display.value
                .replace(/×/g, "*")
                .replace(/√\(/g, "Math.sqrt(")
                .replace(/\^/g, "**")
                .replace(/²/g, "**2")
                .replace(/abs\(/g, "Math.abs(")
                .replace(/sin\(/g, "Math.sin(")
                .replace(/cos\(/g, "Math.cos(")
                .replace(/tan\(/g, "Math.tan(")
                .replace(/log\(/g, "Math.log10(")
                .replace(/ln\(/g, "Math.log(");
            
            // Handle degrees to radians conversion for trig functions
            expr = expr.replace(/Math\.sin\(([^)]+)\)/g, 
                (match, p1) => `Math.sin((${p1}) * Math.PI / 180)`);
            expr = expr.replace(/Math\.cos\(([^)]+)\)/g, 
                (match, p1) => `Math.cos((${p1}) * Math.PI / 180)`);
            expr = expr.replace(/Math\.tan\(([^)]+)\)/g, 
                (match, p1) => `Math.tan((${p1}) * Math.PI / 180)`);
            
            const result = eval(expr);
            
            if (isNaN(result) || !isFinite(result)) {
                throw "Invalid calculation";
            }
            
            // Format the result to avoid long decimals
            const formattedResult = this.formatResult(result);
            
            this.expression.textContent = this.display.value;
            this.display.value = formattedResult;
            this.addToHistory(this.expression.textContent, formattedResult);
            this.currentExpression = "";
        } catch (error) {
            this.display.value = "Error";
            setTimeout(() => this.clearDisplay(), 1500);
        } finally {
            this.isProcessing = false;
        }
    }
    
    formatResult(result) {
        // If it's an integer, return as is
        if (Number.isInteger(result)) {
            return result.toString();
        }
        
        // If it's a decimal, limit to 10 decimal places
        return parseFloat(result.toPrecision(12)).toString();
    }
    
    factorial() {
        try {
            let num = parseFloat(this.display.value);
            if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
                throw "Invalid input for factorial";
            }
            
            // Handle large factorials
            if (num > 170) {
                throw "Number too large";
            }
            
            let result = 1;
            for (let i = 2; i <= num; i++) {
                result *= i;
            }
            
            this.expression.textContent = this.display.value + "!";
            this.display.value = result;
            this.addToHistory(this.expression.textContent, result);
            this.currentExpression = "";
        } catch (error) {
            this.display.value = "Error";
            setTimeout(() => this.clearDisplay(), 1500);
        }
    }
    
    reciprocal() {
        try {
            const value = parseFloat(this.display.value);
            if (value === 0) throw "Division by zero";
            
            const result = 1 / value;
            this.expression.textContent = "1/(" + this.display.value + ")";
            this.display.value = this.formatResult(result);
            this.addToHistory(this.expression.textContent, this.formatResult(result));
            this.currentExpression = "";
        } catch (error) {
            this.display.value = "Error";
            setTimeout(() => this.clearDisplay(), 1500);
        }
    }
    
    square() {
        try {
            const value = parseFloat(this.display.value);
            const result = value * value;
            this.expression.textContent = "(" + this.display.value + ")²";
            this.display.value = this.formatResult(result);
            this.addToHistory(this.expression.textContent, this.formatResult(result));
            this.currentExpression = "";
        } catch (error) {
            this.display.value = "Error";
            setTimeout(() => this.clearDisplay(), 1500);
        }
    }
    
    addToHistory(expression, result) {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        historyItem.innerHTML = `
            <span class="history-expression">${expression}</span>
            <span class="history-result">= ${result}</span>
        `;
        this.historyList.prepend(historyItem);
        
        // Limit history to 12 items
        if (this.historyList.children.length > 12) {
            this.historyList.removeChild(this.historyList.lastChild);
        }
    }
    
    clearHistory() {
        this.historyList.innerHTML = "";
    }
    
    // Memory functions
    memoryRecall() {
        this.display.value += this.memory;
        this.currentExpression = this.display.value;
    }
    
    memoryClear() {
        this.memory = 0;
        // Visual feedback
        const memoryButtons = document.querySelectorAll('.memory');
        memoryButtons.forEach(btn => {
            btn.style.background = '#34495e';
        });
    }
    
    memoryAdd() {
        try {
            const currentValue = parseFloat(this.display.value);
            if (!isNaN(currentValue)) {
                this.memory += currentValue;
                // Visual feedback
                const memoryButtons = document.querySelectorAll('.memory');
                memoryButtons.forEach(btn => {
                    btn.style.background = '#16a085';
                });
            }
        } catch (error) {
            // Ignore errors for memory functions
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ScientificCalculator();
});