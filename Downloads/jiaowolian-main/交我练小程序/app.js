// app.js
App({
  globalData: {
    userInfo: null,
    // 学习数据
    learningData: {
      recentTopics: [],
      wrongQuestions: [],
      learningPath: []
    },
    // AI推荐系统配置
    aiConfig: {
      enabled: true,
      recommendationFrequency: 'daily'
    }
  },
  onLaunch: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              // 如果已经定义了回调函数，则执行
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    
    // 初始化学习数据
    this.initLearningData()
  },
  
  // 初始化学习数据
  initLearningData: function() {
    try {
      const learningData = wx.getStorageSync('learningData')
      if (learningData) {
        this.globalData.learningData = learningData
      } else {
        // 首次使用，设置默认学习路径
        this.setDefaultLearningPath()
        wx.setStorageSync('learningData', this.globalData.learningData)
      }
    } catch (e) {
      if (e && e.errMsg && (e.errMsg.includes('INVALID_LOGIN') || e.errMsg.includes('access_token expired'))) {
        // token过期，清除旧数据并重新登录
        wx.removeStorageSync('learningData')
        this.login()
        // 登录成功后重新尝试初始化数据
        this.loginCallback = () => {
          this.initLearningData()
        }
        return
      } else {
        console.error('初始化学习数据失败:', e)
      }
    }
  },
  
  // 设置默认学习路径
  setDefaultLearningPath: function() {
    // 这里可以根据用户年级等信息设置默认学习路径
    this.globalData.learningData.learningPath = [
      { id: 1, name: '基础知识巩固', completed: false },
      { id: 2, name: '重点难点突破', completed: false },
      { id: 3, name: '综合能力提升', completed: false }
    ]
  },
  
  // 登录方法
  login: function() {
    wx.login({
      success: res => {
        if (res.code) {
          // 这里可以发送code到后端换取新的token
          console.log('登录成功，code:', res.code)
          // 重新初始化数据
          this.initLearningData()
          // 如果有登录回调则执行
          if (this.loginCallback) {
            this.loginCallback()
            this.loginCallback = null
          }
        } else {
          console.error('登录失败:', res)
        }
      },
      fail: err => {
        console.error('登录失败:', err)
      }
    })
  },
  
  // 更新学习路径（AI推荐）
  updateLearningPath: function(userData) {
    // 这里将来会接入AI算法，根据用户学习情况动态调整学习路径
    // 目前使用模拟数据
    console.log('更新学习路径，用户数据:', userData)
    // TODO: 接入AI算法
  }
})