// exercise.js
Page({
  data: {
    id: null,
    question: null,
    userAnswer: '',
    showAnswer: false,
    isCorrect: false,
    loading: true,
    // 题目类型：'choice'(选择题), 'fill'(填空题), 'essay'(解答题)
    questionType: 'choice',
    // 选择题选项
    options: [],
    selectedOption: '',
    // 相关推荐题目
    relatedQuestions: []
  },
  
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.loadQuestion(options.id)
    } else {
      // 如果没有指定题目ID，加载随机题目
      this.loadRandomQuestion()
    }
  },
  
  // 加载指定ID的题目
  loadQuestion: function(id) {
    wx.showLoading({
      title: '加载中...',
    })
    
    // 这里将来会接入真实API
    // 目前使用模拟数据
    setTimeout(() => {
      // 模拟题目数据
      const mockQuestion = this.getMockQuestion(id)
      
      this.setData({
        question: mockQuestion,
        questionType: mockQuestion.type,
        options: mockQuestion.type === 'choice' ? mockQuestion.options : [],
        loading: false
      })
      
      wx.hideLoading()
      
      // 加载相关推荐题目
      this.loadRelatedQuestions(mockQuestion)
    }, 500)
  },
  
  // 加载随机题目
  loadRandomQuestion: function() {
    // 随机生成一个ID
    const randomId = Math.floor(Math.random() * 1000) + 1
    this.loadQuestion(randomId)
  },
  
  // 获取模拟题目数据
  getMockQuestion: function(id) {
    // 根据ID返回不同的模拟题目
    const idNum = parseInt(id)
    
    // 选择题
    if (idNum % 3 === 0) {
      // 数学题目
      if (idNum % 2 === 0) {
        return {
          id: idNum,
          type: 'choice',
          title: '下列关于二次函数的说法，正确的是：',
          options: [
            { id: 'A', text: '二次函数图像一定是开口向上的抛物线' },
            { id: 'B', text: '二次函数图像与x轴最多有两个交点' },
            { id: 'C', text: '二次函数的最值点一定在对称轴上' },
            { id: 'D', text: '二次函数的解析式一定可以写成y=a(x-h)²+k的形式' }
          ],
          answer: 'C',
          analysis: '二次函数图像可能开口向上或向下，取决于二次项系数的正负；与x轴可能有0、1或2个交点；最值点一定在对称轴上；解析式可以写成y=ax²+bx+c或y=a(x-h)²+k的形式。',
          difficulty: '中等',
          tags: ['数学', '函数']
        }
      }
      // 古诗文题目
      else {
        return {
          id: idNum,
          type: 'choice',
          title: '下列对《静夜思》的理解，不正确的是：',
          options: [
            { id: 'A', text: '表达了诗人对故乡的思念之情' },
            { id: 'B', text: '诗中"床前明月光"的"床"指的是睡床' },
            { id: 'C', text: '全诗语言清新朴素，明白如话' },
            { id: 'D', text: '是唐代诗人李白的代表作之一' }
          ],
          answer: 'B',
          analysis: '诗中的"床"指的是井栏或庭院中的井床，而非睡床。',
          difficulty: '简单',
          tags: ['语文', '古诗文']
        }
      }
    }
    // 填空题
    else if (idNum % 3 === 1) {
      // 数学题目
      if (idNum % 2 === 0) {
        return {
          id: idNum,
          type: 'fill',
          title: '已知函数f(x)=ax²+bx+c(a≠0)的图像与x轴交于点(1,0)和(2,0)，则该函数的解析式为________。',
          answer: 'f(x)=k(x-1)(x-2)，其中k为非零常数',
          analysis: '根据韦达定理，如果一个二次函数与x轴的交点是x₁和x₂，那么这个函数可以表示为f(x)=a(x-x₁)(x-x₂)的形式。题目中给出交点是(1,0)和(2,0)，所以x₁=1，x₂=2，代入得f(x)=a(x-1)(x-2)，其中a是非零常数。',
          difficulty: '中等',
          tags: ['数学', '函数']
        }
      }
      // 古诗文题目
      else {
        return {
          id: idNum,
          type: 'fill',
          title: '《论语》中"学而时习之，不亦说乎？"的下一句是：________。',
          answer: '有朋自远方来，不亦乐乎？',
          analysis: '这是《论语·学而》篇的开头两句，表达了学习与交友的快乐。',
          difficulty: '简单',
          tags: ['语文', '古诗文']
        }
      }
    }
    // 解答题
    else {
      // 数学题目
      if (idNum % 2 === 0) {
        return {
          id: idNum,
          type: 'essay',
          title: '已知抛物线y=ax²+bx+c(a≠0)过点(1,2)和(2,1)，且与y轴交点的纵坐标为4，求这条抛物线的解析式。',
          answer: 'y=-x²+3x+2',
          analysis: '解：设抛物线的解析式为y=ax²+bx+c(a≠0)\n(1)因为抛物线过点(1,2)，所以a+b+c=2\n(2)因为抛物线过点(2,1)，所以4a+2b+c=1\n(3)因为抛物线与y轴交点的纵坐标为4，所以c=4\n由(1)得：a+b=2-c=2-4=-2\n由(2)得：4a+2b=-3\n联立方程组：\n{a+b=-2\n{4a+2b=-3\n解得：a=-1，b=3\n所以抛物线的解析式为y=-x²+3x+4',
          difficulty: '较难',
          tags: ['数学', '函数']
        }
      }
      // 古诗文题目
      else {
        return {
          id: idNum,
          type: 'essay',
          title: '请分析《春望》这首诗表达了诗人怎样的思想感情？',
          answer: '《春望》表达了诗人杜甫在安史之乱期间对国家命运的忧虑和对家人安危的牵挂。',
          analysis: '诗中"国破山河在"表现了诗人对国家命运的深切忧虑；"感时花溅泪，恨别鸟惊心"通过拟人手法表达了诗人的悲痛；"烽火连三月，家书抵万金"则表达了对家人安危的牵挂。全诗抒发了诗人忧国忧民的情怀。',
          difficulty: '中等',
          tags: ['语文', '古诗文']
        }
      }
    }
  },
  
  // 选择选项（选择题）
  selectOption: function(e) {
    const option = e.currentTarget.dataset.option
    this.setData({
      selectedOption: option
    })
  },
  
  // 提交答案
  submitAnswer: function() {
    let userAnswer = ''
    let isCorrect = false
    
    // 根据题目类型获取用户答案
    if (this.data.questionType === 'choice') {
      userAnswer = this.data.selectedOption
      isCorrect = userAnswer === this.data.question.answer
    } else {
      userAnswer = this.data.userAnswer
      // 简单判断填空题和解答题（实际应用中需要更复杂的判断逻辑）
      isCorrect = userAnswer.includes(this.data.question.answer)
    }
    
    this.setData({
      showAnswer: true,
      isCorrect: isCorrect
    })
    
    // 保存到做题记录
    this.saveExerciseRecord(isCorrect)
    
    // 如果答错了，添加到错题本
    if (!isCorrect) {
      this.addToWrongQuestions()
    }
  },
  
  // 输入框输入事件（填空题和解答题）
  onInput: function(e) {
    this.setData({
      userAnswer: e.detail.value
    })
  },
  
  // 保存做题记录
  saveExerciseRecord: function(isCorrect) {
    const app = getApp()
    const question = this.data.question
    
    // 添加到最近做题
    if (app.globalData.learningData) {
      // 创建做题记录
      const record = {
        id: question.id,
        title: question.title,
        isCorrect: isCorrect,
        timestamp: new Date().getTime(),
        type: question.type,
        tags: question.tags
      }
      
      // 添加到最近做题
      app.globalData.learningData.recentTopics.unshift(record)
      
      // 最多保存50条记录
      if (app.globalData.learningData.recentTopics.length > 50) {
        app.globalData.learningData.recentTopics = app.globalData.learningData.recentTopics.slice(0, 50)
      }
      
      // 保存到本地存储
      wx.setStorageSync('learningData', app.globalData.learningData)
    }
  },
  
  // 添加到错题本
  addToWrongQuestions: function() {
    const app = getApp()
    const question = this.data.question
    
    if (app.globalData.learningData) {
      // 检查是否已经在错题本中
      const isExist = app.globalData.learningData.wrongQuestions.some(item => item.id === question.id)
      
      if (!isExist) {
        // 添加到错题本
        app.globalData.learningData.wrongQuestions.unshift({
          id: question.id,
          title: question.title,
          timestamp: new Date().getTime(),
          type: question.type,
          tags: question.tags
        })
        
        // 保存到本地存储
        wx.setStorageSync('learningData', app.globalData.learningData)
      }
    }
  },
  
  // 加载相关推荐题目
  loadRelatedQuestions: function(question) {
    // 这里将来会接入AI推荐算法
    // 目前使用模拟数据，根据题目标签推荐
    setTimeout(() => {
      const mockRelated = [
        { id: 201, title: '相关推荐题目1', tags: question.tags },
        { id: 202, title: '相关推荐题目2', tags: question.tags }
      ]
      
      this.setData({
        relatedQuestions: mockRelated
      })
    }, 1000)
  },
  
  // 下一题
  nextQuestion: function() {
    this.setData({
      userAnswer: '',
      showAnswer: false,
      isCorrect: false,
      loading: true,
      selectedOption: '',
      relatedQuestions: []
    })
    
    // 加载随机题目
    this.loadRandomQuestion()
  },
  
  // 跳转到相关题目
  goToRelatedQuestion: function(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/exercise/exercise?id=${id}`
    })
  }
})