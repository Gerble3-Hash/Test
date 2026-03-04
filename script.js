const display = document.querySelector('#display');
const buttons = document.querySelector('.buttons');

let expression = '';
let lastWasResult = false;

const updateDisplay = (value) => {
  display.value = value || '0';
};

const isOperator = (char) => ['+', '-', '*', '/'].includes(char);

const appendValue = (value) => {
  if (lastWasResult && !isOperator(value)) {
    expression = '';
  }

  if (value === '.') {
    const currentNumber = expression.split(/[+\-*/]/).at(-1);
    if (currentNumber.includes('.')) return;
  }

  if (isOperator(value)) {
    if (!expression) return;
    if (isOperator(expression.at(-1))) {
      expression = expression.slice(0, -1) + value;
      updateDisplay(expression);
      return;
    }
  }

  expression += value;
  lastWasResult = false;
  updateDisplay(expression);
};

const clear = () => {
  expression = '';
  lastWasResult = false;
  updateDisplay('0');
};

const backspace = () => {
  if (lastWasResult) {
    clear();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(expression);
};

const evaluateExpression = () => {
  if (!expression || isOperator(expression.at(-1))) return;

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    expression = Number.isFinite(result) ? String(result) : 'Error';
  } catch {
    expression = 'Error';
  }

  lastWasResult = true;
  updateDisplay(expression);

  if (expression === 'Error') {
    expression = '';
    lastWasResult = false;
  }
};

buttons.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const { value, action } = target.dataset;

  if (value) {
    appendValue(value);
    return;
  }

  if (action === 'clear') clear();
  if (action === 'backspace') backspace();
  if (action === 'equals') evaluateExpression();
});
