Page({
  data: {
    userInfo: {},
    language: 'zh',
    theme: 'light'
  },

  onLoad: function() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
    
    // 获取存储的语言和主题设置
    const language = wx.getStorageSync('language') || 'zh';
    const theme = wx.getStorageSync('theme') || 'light';
    this.setData({ language, theme });
  },

  // 切换语言
  toggleLanguage: function() {
    const newLanguage = this.data.language === 'zh' ? 'en' : 'zh';
    this.setData({ language: newLanguage });
    wx.setStorageSync('language', newLanguage);
  },
  
  // 切换主题
  toggleTheme: function() {
    const newTheme = this.data.theme === 'light' ? 'dark' : 'light';
    this.setData({ theme: newTheme });
    wx.setStorageSync('theme', newTheme);
    
    // 应用主题样式
    if (newTheme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      });
    }
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
})