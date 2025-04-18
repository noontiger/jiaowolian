// user.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    // 学习统计数据
    statistics: {
      totalExercises: 0,
      correctRate: 0,
      learningDays: 0,
      wrongQuestions: 0
    },
    // 功能列表
    functionList: [
      { id: 1, name: '错题本', icon: '📝', path: '/pages/wrong-questions/wrong-questions' },
      { id: 2, name: '学习路径', icon: '🛤️', path: '/pages/learning-path/learning-path' },
      { id: 3, name: '设置', icon: '⚙️', path: '/pages/settings/settings' }
    ]
  },
  
  onLoad: function() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 获取用户信息
    this.getUserInfo()
    
    // 获取学习统计数据
    this.getStatistics()
  },
  
  // 获取用户信息
  getUserInfo: function() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },
  
  // 获取用户信息（新接口）
  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const app = getApp()
        app.globalData.userInfo = res.userInfo
        
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // 获取学习统计数据
        this.getStatistics()
      }
    })
  },
  
  // 获取学习统计数据
  getStatistics: function() {
    const app = getApp()
    const learningData = app.globalData.learningData
    
    if (learningData) {
      // 计算做题总数
      const totalExercises = learningData.recentTopics.length
      
      // 计算正确率（模拟数据）
      const correctRate = Math.floor(Math.random() * 30) + 70
      
      // 计算学习天数（模拟数据）
      const learningDays = Math.floor(Math.random() * 10) + 5
      
      // 错题数量
      const wrongQuestions = learningData.wrongQuestions.length
      
      this.setData({
        'statistics.totalExercises': totalExercises,
        'statistics.correctRate': correctRate,
        'statistics.learningDays': learningDays,
        'statistics.wrongQuestions': wrongQuestions
      })
    }
  },
  
  // 跳转到功能页面
  navigateToFunction: function(e) {
    const index = e.currentTarget.dataset.index
    const path = this.data.functionList[index].path
    wx.navigateTo({
      url: path
    })
  },
  
  // 清除用户数据
  clearUserData: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有学习数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局数据
          const app = getApp()
          app.globalData.learningData = {
            recentTopics: [],
            wrongQuestions: [],
            learningPath: []
          }
          
          // 重新设置默认学习路径
          app.setDefaultLearningPath()
          
          // 清除本地存储
          wx.removeStorageSync('learningData')
          
          // 更新统计数据
          this.getStatistics()
          
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          })
        }
      }
    })
  }
})