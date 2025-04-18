// index.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    searchType: 'text', // 'text' 或 'image'
    searchValue: '',
    searchHistory: [],
    searchResults: [],
    searched: false,
    imageUrl: '',
    // 热门推荐功能列表
    features: [
      { id: 1, name: '试卷库', icon: '/images/features/exam.png', path: '/pages/exercise/exercise' },     
      { id: 2, name: '同步练习', icon: '/images/features/practice.png', path: '/pages/exercise/exercise' },
      { id: 4, name: '计算器', icon: '/images/features/calculator.png', path: '/pages/calculator/calculator' }
    ],
    // 学习进度
    learningProgress: 0,
    // 推荐题目
    recommendQuestions: []
  },
  
  onLoad: function() {
    // 获取用户信息
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 获取学习进度
    this.getLearningProgress()
    
    // 获取推荐题目
    this.getRecommendQuestions()
  },
  
  // 获取用户信息
  getUserProfile: function(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // 保存用户信息到全局数据
        const app = getApp()
        app.globalData.userInfo = res.userInfo
      }
    })
  },
  
  // 获取学习进度
  getLearningProgress: function() {
    const app = getApp()
    const learningData = app.globalData.learningData
    
    // 计算学习进度
    if (learningData && learningData.learningPath) {
      const total = learningData.learningPath.length
      const completed = learningData.learningPath.filter(item => item.completed).length
      const progress = total > 0 ? (completed / total * 100) : 0
      
      this.setData({
        learningProgress: progress
      })
    }
  },
  
  // 获取推荐题目
  getRecommendQuestions: function() {
    // 这里将来会接入AI推荐算法
    // 目前使用模拟数据
    const mockQuestions = [
      { id: 1, title: '二次函数图像与性质', difficulty: '中等', tags: ['函数', '数学'] },
      { id: 2, title: '牛顿第一定律应用题', difficulty: '较难', tags: ['物理', '力学'] },
      { id: 3, title: '古诗文阅读理解', difficulty: '简单', tags: ['语文', '古诗'] }
    ]
    
    this.setData({
      recommendQuestions: mockQuestions
    })
  },
  
  // 跳转到搜题页面
  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  
  // 跳转到拍照搜题
  goToPhotoSearch: function() {
    // 调用相机API
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 跳转到搜索页面并传递图片路径
        wx.navigateTo({
          url: `/pages/search/search?image=${encodeURIComponent(tempFilePath)}`
        })
      }
    })
  },
  
  // 切换搜索类型
  switchSearchType: function(e) {
    this.setData({
      searchType: e.currentTarget.dataset.type
    })
  },

  // 拍照搜题
  takePhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 跳转到搜索页面并传递图片路径
        wx.navigateTo({
          url: `/pages/search/search?image=${encodeURIComponent(tempFilePath)}`
        })
      }
    })
  },

  // 文字搜索
  searchByText: function() {
    if (!this.data.searchValue) return
    
    // 保存搜索历史
    const history = [...new Set([this.data.searchValue, ...this.data.searchHistory])].slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({
      searchHistory: history
    })
    
    // 这里调用搜索API
    // 暂时使用模拟数据
    const mockResults = [
      { id: 1, title: '二次函数图像与性质', desc: '数学 - 函数' },
      { id: 2, title: '牛顿第一定律应用题', desc: '物理 - 力学' },
      { id: 3, title: '古诗文阅读理解', desc: '语文 - 古诗' }
    ]
    
    this.setData({
      searchResults: mockResults
    })
  },

  // 图片搜索
  searchByImage: function(imagePath) {
    // 这里调用图片搜索API
    // 暂时使用模拟数据
    const mockResults = [
      { id: 1, title: '二次函数图像与性质', desc: '数学 - 函数' },
      { id: 2, title: '牛顿第一定律应用题', desc: '物理 - 力学' },
      { id: 3, title: '古诗文阅读理解', desc: '语文 - 古诗' }
    ]
    
    this.setData({
      searchResults: mockResults
    })
  },

  // 跳转到功能页面
  goToFeature: function(e) {
    const index = e.currentTarget.dataset.index
    const feature = this.data.features[index]
    wx.navigateTo({
      url: feature.path
    })
  },
  
  // 跳转到题目详情
  goToQuestion: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exercise/exercise?id=${id}`
    })
  },
  
  // 跳转到错题本
  goToWrongQuestions: function() {
    wx.navigateTo({
      url: '/pages/wrong-questions/wrong-questions'
    })
  },
  
  // 跳转到学习路径
  goToLearningPath: function() {
    wx.navigateTo({
      url: '/pages/learning-path/learning-path'
    })
  }
})