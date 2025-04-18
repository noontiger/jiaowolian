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

  // 处理小数点按钮点击
  inputDot: function() {
    const { currentInput, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      this.setData({
        currentInput: '0.',
        waitingForOperand: false
      })
    } else if (currentInput.indexOf('.') === -1) {
      this.setData({
        currentInput: currentInput + '.'
      })
    }
    
    this.setData({
      display: this.data.currentInput
    })
  },

  // 处理运算符按钮点击
  handleOperator: function(e) {
    const operator = e.currentTarget.dataset.operator
    const { currentInput, previousInput } = this.data
    
    if (this.data.waitingForOperand) {
      this.setData({
        operator: operator
      })
      return
    }
    
    if (this.data.previousInput === null) {
      this.setData({
        previousInput: currentInput,
        waitingForOperand: true,
        operator: operator
      })
    } else {
      const result = this.calculate(parseFloat(previousInput), parseFloat(currentInput), this.data.operator)
      this.setData({
        display: String(result),
        previousInput: result,
        currentInput: String(result),
        waitingForOperand: true,
        operator: operator
      })
    }
    this.recordKeyPress(operator);
  },

  // 执行计算
  calculate: function(previous, current, operator) {
    switch (operator) {
      case '+':
        return previous + current
      case '-':
        return previous - current
      case '*':
        return previous * current
      case '/':
        return previous / current
      default:
        return current
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