// learning-path.js
Page({
  data: {
    overallProgress: 0,
    subjects: [
      { id: 1, name: '数学' },
      { id: 2, name: '语文' },
      { id: 3, name: '英语' },
      { id: 4, name: '物理' },
      { id: 5, name: '化学' },
      { id: 6, name: '生物' }
    ],
    currentSubject: 1,
    learningPaths: [],
    loading: true
  },
  
  onLoad: function() {
    // 获取学习路径数据
    this.getLearningPaths()
  },
  
  // 切换学科
  switchSubject: function(e) {
    const subjectId = e.currentTarget.dataset.id
    
    this.setData({
      currentSubject: subjectId,
      loading: true
    })
    
    // 重新获取学习路径数据
    this.getLearningPaths()
  },
  
  // 获取学习路径数据
  getLearningPaths: function() {
    wx.showLoading({
      title: '加载中...',
    })
    
    // 这里将来会接入真实API
    // 目前使用模拟数据
    setTimeout(() => {
      const app = getApp()
      let learningPaths = []
      let overallProgress = 0
      
      // 如果全局数据中有学习路径记录，则使用全局数据
      if (app.globalData.learningData && app.globalData.learningData.learningPath) {
        learningPaths = app.globalData.learningData.learningPath.filter(
          path => path.subjectId === this.data.currentSubject
        )
        
        // 计算总体进度（基于题目数量）
        const allPaths = app.globalData.learningData.learningPath
        const totalTopics = allPaths.reduce((sum, path) => sum + (path?.topics?.length || 0), 0)
        const completedTopics = allPaths.reduce((sum, path) => {
          return sum + (path?.topics?.filter(topic => topic?.completed)?.length || 0)
        }, 0)
        
        overallProgress = totalTopics > 0 ? (completedTopics / totalTopics * 100) : 0
      } else {
        // 否则使用模拟数据
        learningPaths = this.getMockLearningPaths(this.data.currentSubject)
        
        // 计算总体进度（基于题目数量）
        const totalTopics = learningPaths.reduce((sum, path) => sum + (path?.topics?.length || 0), 0)
        const completedTopics = learningPaths.reduce((sum, path) => {
          return sum + (path?.topics?.filter(topic => topic?.completed)?.length || 0)
        }, 0)
        
        overallProgress = totalTopics > 0 ? (completedTopics / totalTopics * 100) : 0
        
        // 保存到全局数据
        if (!app.globalData.learningData) {
          app.globalData.learningData = {}
        }
        app.globalData.learningData.learningPath = learningPaths
      }
      
      this.setData({
        learningPaths: learningPaths,
        overallProgress: overallProgress,
        loading: false
      })
      
      wx.hideLoading()
    }, 500)
  },
  
  // 获取模拟学习路径数据
  getMockLearningPaths: function(subjectId) {
    // 数学
    if (subjectId === 1) {
      return [
        {
          id: 101,
          subjectId: 1,
          title: '初中数学基础',
          progress: 75,
          topics: [
            { id: 1001, name: '整数与有理数', completed: true },
            { id: 1002, name: '实数', completed: true },
            { id: 1003, name: '一元一次方程', completed: true },
            { id: 1004, name: '一元一次不等式', completed: false }
          ]
        },
        {
          id: 102,
          subjectId: 1,
          title: '函数与图像',
          progress: 50,
          topics: [
            { id: 1005, name: '函数的概念', completed: true },
            { id: 1006, name: '一次函数', completed: true },
            { id: 1007, name: '二次函数', completed: false },
            { id: 1008, name: '函数应用', completed: false }
          ]
        },
        {
          id: 103,
          subjectId: 1,
          title: '几何基础',
          progress: 25,
          topics: [
            { id: 1009, name: '三角形', completed: true },
            { id: 1010, name: '四边形', completed: false },
            { id: 1011, name: '圆', completed: false },
            { id: 1012, name: '相似形', completed: false }
          ]
        }
      ]
    }
    // 语文
    else if (subjectId === 2) {
      return [
        {
          id: 201,
          subjectId: 2,
          title: '现代文阅读',
          progress: 60,
          topics: [
            { id: 2001, name: '记叙文阅读', completed: true },
            { id: 2002, name: '说明文阅读', completed: true },
            { id: 2003, name: '议论文阅读', completed: false }
          ]
        },
        {
          id: 202,
          subjectId: 2,
          title: '古诗文阅读',
          progress: 33,
          topics: [
            { id: 2004, name: '古诗鉴赏', completed: true },
            { id: 2005, name: '文言文阅读', completed: false },
            { id: 2006, name: '名句默写', completed: false }
          ]
        }
      ]
    }
    // 其他学科返回空数据
    else {
      return []
    }
  },
  
  // 开始学习主题
  startTopic: function(e) {
    const pathId = e.currentTarget.dataset.pathId
    const topicId = e.currentTarget.dataset.topicId
    
    // 跳转到练习页面
    wx.navigateTo({
      url: '/pages/exercise/exercise?pathId=' + pathId + '&topicId=' + topicId
    })
  }
})