// search.js

// 在文件顶部添加 UUID 生成函数
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

Page({
  data: {
    searchValue: '',
    searchType: 'text', // 'text' 或 'image'
    searchHistory: [],
    searchResults: [],
    searched: false,
    imageUrl: ''
  },
  
  onLoad: function(options) {
    // 获取本地存储的搜索历史
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({
      searchHistory: history
    })
    
    // 如果是从拍照跳转过来的
    if (options.image) {
      const imagePath = decodeURIComponent(options.image)
      this.setData({
        searchType: 'image',
        imageUrl: imagePath
      })
      this.searchByImage(imagePath)
    }
    
    // 如果是从其他页面带搜索词跳转过来的
    if (options.keyword) {
      this.setData({
        searchValue: options.keyword
      })
      this.searchByText()
    }
    
    // 如果是特定类型的搜索
    if (options.type) {
      // 可以根据type做一些筛选设置
      console.log('搜索类型:', options.type)
    }
  },
  
  // 输入框输入事件
  onInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  
  // 清空输入框
  clearInput: function() {
    this.setData({
      searchValue: '',
      searchResults: [],
      searched: false
    })
  },
  
  // 切换搜索类型
  switchSearchType: function(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      searchType: type,
      searchResults: [],
      searched: false
    })
  },
  
  // 文字搜索
  searchByText: function() {
    const keyword = this.data.searchValue.trim()
    if (!keyword) return
    
    // 保存到搜索历史
    this.saveSearchHistory(keyword)
    
    // 模拟搜索结果
    this.mockSearchResults(keyword)
  },
  
  // 拍照搜索
  takePhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          imageUrl: tempFilePath
        })
        this.searchByImage(tempFilePath)
      }
    })
  },

  // 图片搜索
  searchByImage: function(imagePath) {
    wx.showLoading({
      title: '正在处理图片...',
      mask: true
    });
    
    // 将图片转为base64格式
    wx.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (fileRes) => {
        // 获取图片的base64数据
        const base64Data = `data:image/png;base64,${fileRes.data}`;
        console.log('图片base64数据:', base64Data);
        
        // 步骤1: 获取chat_id
        wx.request({
          url: 'http://47.116.191.47:8080/api/application/2e885548-1b99-11f0-8acd-0242ac120003/chat/open',
          method: 'GET',
          header: {
            'Accept': 'application/json',
            'Authorization': 'application-eeb78051e01eb9512b3c8070c0cb0624'
          },
          success: (res) => {
            console.log('服务器响应:', res.data);
            
            if (res.data.code === 200 && res.data.data) {
              const chatId = res.data.data;
              console.log('会话ID:', chatId);
              
              // 生成有效的 UUID
              const fileId = generateUuid();
              console.log('生成的文件ID:', fileId);
              
              // 步骤2: 发送图片
              wx.request({
                url: `http://47.116.191.47:8080/api/application/chat_message/${chatId}`,
                method: 'POST',
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': 'application-eeb78051e01eb9512b3c8070c0cb0624'
                },
                data: {
                  message: "识别图片",
                  image_list: [
                  {
                    'name': 'image',
                    'url': 'https://gitee.com/wzqwmqbaba/audio/raw/master/%E6%88%AA%E5%B1%8F2025-04-15%2014.22.41.png',
                    'file_id': fileId // 使用生成的UUID
                  }
                  ],
                  re_chat: false,
                  stream: false
                },
                success: (msgRes) => {
                  wx.hideLoading();
                  console.log('识别结果:', msgRes.data);

                  // 将API响应显示在界面上
                  const responseData = msgRes.data.data;
                  const answerList = responseData?.answer_list || [];
                  const formattedResults = answerList.map((item, index) => ({
                  id: `${Date.now()}-${index}`,
                  title: `识别结果 ${index + 1}`,
                  content: item.content || '无内容',
                  rawResponse: JSON.stringify(item, null, 2)
                  }));

                  this.setData({
                  searchResults: formattedResults,
                  searched: true,
                  // 将识别到的文本设置为搜索值(取前20个字符)
                  searchValue: (responseData?.content || '').substring(0, 20)
                  });

                  // 如果有识别出文本，保存到搜索历史
                  if (responseData?.content) {
                  this.saveSearchHistory(responseData.content.substring(0, 20));
                  }
                },
                fail: (err) => {
                  wx.hideLoading();
                  console.error('发送图片失败:', err);
                  wx.showToast({
                  title: '发送图片失败，请重试',
                  icon: 'none'
                  });
                }
              });
            } else {
              wx.hideLoading();
              console.error('错误信息:', res.data.message);
              wx.showToast({
                title: res.data.message || '获取会话ID失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('请求失败:', err);
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('读取图片失败:', err);
        wx.showToast({
          title: '图片处理失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 保存搜索历史
  saveSearchHistory: function(keyword) {
    let history = this.data.searchHistory
    // 如果已经存在，先移除
    const index = history.indexOf(keyword)
    if (index > -1) {
      history.splice(index, 1)
    }
    // 添加到最前面
    history.unshift(keyword)
    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    this.setData({
      searchHistory: history
    })
    
    // 保存到本地存储
    wx.setStorageSync('searchHistory', history)
  },
  
  // 清空搜索历史
  clearHistory: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            searchHistory: []
          })
          wx.removeStorageSync('searchHistory')
        }
      }
    })
  },
  
  // 使用历史记录项
  useHistoryItem: function(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      searchValue: item
    })
    this.searchByText()
  },
  
  // 跳转到详情页
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/exercise/exercise?id=${id}`
    })
  },

})