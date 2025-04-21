// calculator.js
Page({
  data: {
    display: '0',
    currentInput: '0',
    operator: null,
    previousInput: null,
    waitingForOperand: false,
    history: [],
    showHistory: false
  },
  
  // 跳转到错题本
  goToWrongQuestions: function() {
    wx.navigateTo({
      url: '/pages/wrong-questions/wrong-questions'
    })
  },

  // 处理数字按钮点击
  inputDigit: function(e) {
    const digit = e.currentTarget.dataset.digit
    const { currentInput, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      this.setData({
        currentInput: digit,
        waitingForOperand: false
      })
    } else {
      this.setData({
        currentInput: currentInput === '0' ? digit : currentInput + digit
      })
    }
    
    this.setData({
      display: this.data.currentInput
    })
    this.recordKeyPress(digit);
  },

  // 处理小数点按钮点击（优化自动补零）
  inputDot: function() {
    const { currentInput, waitingForOperand, operator } = this.data;
    
    if (waitingForOperand || currentInput === '') {
      this.setData({
        currentInput: '0.',
        waitingForOperand: false
      });
    } else if (currentInput.indexOf('.') === -1) {
      // 运算符后自动补零
      if (/[+\-*/]$/.test(currentInput)) {
        this.setData({
          currentInput: currentInput + '0.'
        });
      } else {
        this.setData({
          currentInput: currentInput + '.'
        });
      }
    }
    
    this.setData({
      display: this.data.currentInput
    });
  },

  // 处理运算符按钮点击（增加连续运算符限制）
  handleOperator: function(e) {
    const operator = e.currentTarget.dataset.operator;
    const { currentInput, operator: currentOp } = this.data;

    // 禁止连续输入不同运算符
    if (this.data.waitingForOperand && currentOp) {
      this.setData({
        operator: operator
      });
      return;
    }

    // 输入运算符后自动补零
    if (currentInput.endsWith('.') || currentInput === '') {
      this.setData({
        currentInput: currentInput + '0'
      });
    }

    if (!this.data.previousInput) {
      this.setData({
        previousInput: currentInput,
        waitingForOperand: true,
        operator: operator
      });
    } else {
      try {
        const result = this.calculate();
        this.setData({
          display: String(result),
          previousInput: String(result),
          currentInput: String(result),
          waitingForOperand: true,
          operator: operator
        });
      } catch (error) {
        return; // 错误信息已在calculate中处理
      }
    }
    this.recordKeyPress(operator);
  },

  // 带优先级的表达式计算
  calculate: function() {
    const expression = this.data.previousInput + this.data.operator + this.data.currentInput;
    const tokens = expression.match(/(\d+\.?\d*)|([+\-*/])/g);
    const outputStack = [];
    const operatorStack = [];
    const precedence = {'+':1, '-':1, '*':2, '/':2};

    tokens.forEach(token => {
      if (!isNaN(token)) {
        outputStack.push(parseFloat(token));
      } else {
        while (operatorStack.length > 0 && 
              precedence[token] <= precedence[operatorStack[operatorStack.length-1]]) {
          outputStack.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    });

    while (operatorStack.length > 0) {
      outputStack.push(operatorStack.pop());
    }

    const evalStack = [];
    outputStack.forEach(token => {
      if (typeof token === 'number') {
        evalStack.push(token);
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (token === '/' && b === 0) {
          this.setData({
            display: '无法除以零',
            currentInput: '0',
            previousInput: null,
            operator: null
          });
          throw new Error('Division by zero');
        }
        evalStack.push(this.basicCalculate(a, b, token));
      }
    });

    return evalStack.pop();
  },

  // 基本运算单元
  basicCalculate: function(a, b, operator) {
    switch(operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
    }
  },

  // 清除所有输入
  clearAll: function() {
    this.setData({
      display: '0',
      currentInput: '0',
      operator: null,
      previousInput: null,
      waitingForOperand: false
    })
  },

  // 处理等号按钮点击
  handleEquals: function() {
    const { currentInput, previousInput, operator } = this.data
    
    if (operator === null || previousInput === null) {
      return
    }
    
    const result = this.calculate(parseFloat(previousInput), parseFloat(currentInput), operator)
    this.setData({
      display: String(result),
      previousInput: null,
      currentInput: String(result),
      operator: null,
      waitingForOperand: true
    })
    this.saveToHistory(result);
  },

  // 处理百分比按钮点击
  handlePercentage: function() {
    const { currentInput } = this.data
    const value = parseFloat(currentInput) / 100
    this.setData({
      display: String(value),
      currentInput: String(value)
    })
  },

  // 处理正负号切换
  toggleSign: function() {
    const { currentInput } = this.data
    const value = parseFloat(currentInput) * -1
    this.setData({
      display: String(value),
      currentInput: String(value)
    })
  },

  // 加载历史记录
  onLoad: function() {
    this.loadHistory();
  },

  // 保存到历史记录
  saveToHistory: function(result) {
    const history = wx.getStorageSync('calculatorHistory') || [];
    const keyHistory = wx.getStorageSync('calculatorKeyHistory') || [];
    
    // 从按键历史中构建完整表达式
    let expression = keyHistory.join('');
    expression += ' = ' + result;
    
    history.unshift(expression);
    if (history.length > 20) {
      history.pop();
    }
    
    wx.setStorageSync('calculatorHistory', history);
    this.setData({ history });
    wx.setStorageSync('calculatorKeyHistory', []); // 清空按键历史
  },
  
  // 记录按键操作
  recordKeyPress: function(key) {
    const history = wx.getStorageSync('calculatorKeyHistory') || [];
    history.push(key);
    if (history.length > 50) {
      history.pop();
    }
    wx.setStorageSync('calculatorKeyHistory', history);
  },

  // 加载历史记录
  loadHistory: function() {
    const history = wx.getStorageSync('calculatorHistory') || [];
    this.setData({ history });
  },
  
  // 切换历史记录显示状态
  toggleHistory: function() {
    this.setData({
      showHistory: !this.data.showHistory
    });
  }
})