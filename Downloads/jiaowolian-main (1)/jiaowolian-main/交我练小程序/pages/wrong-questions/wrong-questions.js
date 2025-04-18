// wrong-questions.js
Page({
  data: {
    wrongQuestions: [],
    loading: true,
    isEmpty: false
  },
  
  onLoad: function() {
    // 获取错题本数据
    this.getWrongQuestions()
  },
  
  onShow: function() {
    // 每次显示页面时刷新数据
    this.getWrongQuestions()
  },
  
  // 获取错题本数据
  getWrongQuestions: function() {
    wx.showLoading({
      title: '加载中...',
    })
    
    // 这里将来会接入真实API
    // 目前使用模拟数据
    setTimeout(() => {
      const app = getApp()
      let wrongQuestions = []
      
      // 如果全局数据中有错题记录，则使用全局数据
      if (app.globalData.learningData && app.globalData.learningData.wrongQuestions) {
        wrongQuestions = app.globalData.learningData.wrongQuestions
      } else {
        // 否则使用模拟数据
        wrongQuestions = this.getMockWrongQuestions()
        
        // 保存到全局数据
        if (!app.globalData.learningData) {
          app.globalData.learningData = {}
        }
        app.globalData.learningData.wrongQuestions = wrongQuestions
      }
      
      this.setData({
        wrongQuestions: wrongQuestions,
        loading: false,
        isEmpty: wrongQuestions.length === 0
      })
      
      wx.hideLoading()
    }, 500)
  },
  
  // 获取模拟错题数据
  getMockWrongQuestions: function() {
    return [
      {
        id: 101,
        title: '已知函数f(x)=ax²+bx+c(a≠0)的图像与x轴交于点(1,0)和(2,0)，则该函数的解析式为________。',
        type: 'fill',
        userAnswer: 'f(x)=k(x-1)(x-2)',
        correctAnswer: 'f(x)=k(x-1)(x-2)，其中k为非零常数',
        subject: '数学',
        addTime: '2023-05-15',
        tags: ['函数', '解析几何']
      },
      {
        id: 102,
        title: '下列关于牛顿第一定律的说法，错误的是：',
        type: 'choice',
        options: [
          { id: 'A', text: '牛顿第一定律又称为惯性定律' },
          { id: 'B', text: '物体在没有外力作用时保持静止或匀速直线运动状态' },
          { id: 'C', text: '牛顿第一定律适用于任何参考系' },
          { id: 'D', text: '牛顿第一定律表明，力是改变物体运动状态的原因' }
        ],
        userAnswer: 'B',
        correctAnswer: 'C',
        subject: '物理',
        addTime: '2023-05-16',
        tags: ['力学', '牛顿定律']
      },
      {
        id: 103,
        title: '《蜀道难》的作者是：',
        type: 'choice',
        options: [
          { id: 'A', text: '李白' },
          { id: 'B', text: '杜甫' },
          { id: 'C', text: '白居易' },
          { id: 'D', text: '王维' }
        ],
        userAnswer: 'B',
        correctAnswer: 'A',
        subject: '语文',
        addTime: '2023-05-17',
        tags: ['古诗文', '唐诗']
      }
    ]
  },
  
  // 跳转到题目详情
  goToQuestion: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/exercise/exercise?id=' + id
    })
  },
  
  // 删除错题
  deleteQuestion: function(e) {
    const id = e.currentTarget.dataset.id
    const that = this
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这道错题吗？',
      success: function(res) {
        if (res.confirm) {
          // 从错题本中删除
          const app = getApp()
          if (app.globalData.learningData && app.globalData.learningData.wrongQuestions) {
            const wrongQuestions = app.globalData.learningData.wrongQuestions.filter(item => item.id !== id)
            app.globalData.learningData.wrongQuestions = wrongQuestions
            
            that.setData({
              wrongQuestions: wrongQuestions,
              isEmpty: wrongQuestions.length === 0
            })
          }
        }
      }
    })
  },
  
  // 清空错题本
  clearWrongQuestions: function() {
    const that = this
    
    wx.showModal({
      title: '提示',
      content: '确定要清空错题本吗？',
      success: function(res) {
        if (res.confirm) {
          // 清空错题本
          const app = getApp()
          if (app.globalData.learningData) {
            app.globalData.learningData.wrongQuestions = []
          }
          
          that.setData({
            wrongQuestions: [],
            isEmpty: true
          })
        }
      }
    })
  }
})