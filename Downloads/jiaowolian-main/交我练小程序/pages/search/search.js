// search.js

// 上传图片文件到服务器
function uploadImageFile(chatId, filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `http://47.116.191.47:8080/api/application/2e885548-1b99-11f0-8acd-0242ac120003/chat/${chatId}/upload_file`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'application-eeb78051e01eb9512b3c8070c0cb0624'
      },
      success: (uploadRes) => {
        console.log('图片上传成功:', uploadRes);
        let result;
        try {
          // uploadFile 返回的 data 是字符串，需要解析成对象
          result = JSON.parse(uploadRes.data);
          
          if (result.code === 200 && result.data) {
            // 返回上传后的文件信息
            resolve(result.data);
          } else {
            reject(new Error(result.message || '上传文件失败'));
          }
        } catch (error) {
          console.error('解析上传结果失败:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('上传文件请求失败:', err);
        reject(err);
      }
    });
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
          
          // 步骤2: 上传图片
          uploadImageFile(chatId, imagePath)
            .then(fileInfo => {
              console.log('上传的文件信息:', fileInfo);
      
              const imageList = fileInfo;
              console.log('Image List:', imageList);
              
              // 步骤3: 发送消息，引用已上传的图片
              wx.request({
                url: `http://47.116.191.47:8080/api/application/chat_message/${chatId}`,
                method: 'POST',
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': 'application-eeb78051e01eb9512b3c8070c0cb0624'
                },
                data: {
                  message: "识别图片",
                  image_list: imageList,
                  re_chat: false,
                  stream: false
                },
                success: (msgRes) => {
                  wx.hideLoading();

                  if (msgRes.data.code === 200 && msgRes.data.data) {
                    const content = msgRes.data.data.content;
                    console.log('识别内容:', content);
                    
                    // 尝试根据特定格式提取信息
                    let difficulty = '';
                    let question = '';
                    let answer = '';
                    let analysis = '';
                    let difficultyLevel = 0;
                    
                    // 使用正则表达式提取各部分内容
                    const difficultyMatch = content.match(/\[难度\]:\s*(.*?)(?=\n\[|$)/s);
                    const questionMatch = content.match(/\[题目\]:\s*(.*?)(?=\n\[|$)/s);
                    const answerMatch = content.match(/\[答案\]:\s*(.*?)(?=\n\[|$)/s);
                    const analysisMatch = content.match(/\[解析\]:\s*(.*?)(?=\n\[|$)/s);
                    
                    // 提取难度
                    if (difficultyMatch && difficultyMatch[1]) {
                      difficulty = difficultyMatch[1].trim();
                      // 尝试将难度转换为数字
                      const numericMatch = difficulty.match(/(\d+)/);
                      if (numericMatch) {
                        difficultyLevel = parseInt(numericMatch[1]);
                      }
                    }
                    
                    // 提取题目、答案和解析
                    if (questionMatch && questionMatch[1]) {
                      question = questionMatch[1].trim();
                    }
                    
                    if (answerMatch && answerMatch[1]) {
                      answer = answerMatch[1].trim();
                    }
                    
                    if (analysisMatch && analysisMatch[1]) {
                      analysis = analysisMatch[1].trim();
                    }
                    
                    let isStructured = difficulty || question || answer || analysis;
                    
                    
                    // 解析识别结果
                    let formattedResult = {
                      id: Date.now().toString(), // 简单生成ID
                      title: '题目识别结果',
                      rawContent: content,
                      question: question || content,
                      answer: answer || '',
                      analysis: analysis || '',
                      // 格式化后的内容，用于渲染
                      formattedQuestion: question,
                      formattedAnswer: answer,
                      formattedAnalysis: analysis,
                      difficulty: difficultyLevel,
                      difficultyText: difficulty || '',
                      isStructured: !!isStructured,
                      timestamp: new Date().toLocaleString(),
                      tags: ['AI识别', '题目分析']
                    };
                    
                    // 保存识别的文本到搜索历史
                    this.saveSearchHistory(question ? 
                      question.substring(0, 30) : 
                      content.substring(0, 30)); // 只保存前30个字符
                    
                    this.setData({
                      searchResults: [formattedResult],
                      searched: true,
                      searchValue: question ? 
                        question.substring(0, 20) : 
                        content.substring(0, 20) // 将识别结果设置为搜索值
                    });
                    
                  } else {
                    wx.showToast({
                      title: msgRes.data.message || '识别失败',
                      icon: 'none'
                    });
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
            })
            .catch(error => {
              wx.hideLoading();
              console.error('上传图片失败:', error);
              wx.showToast({
                title: error.message || '上传图片失败',
                icon: 'none'
              });
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
  
  // 格式化LaTeX公式
  formatLatexContent: function(content) {
    if (!content) return '';
    
    // 创建基本的HTML标记来包装数学公式
    let formatted = content
      // 替换行内公式
      .replace(/\\\((.*?)\\\)/g, '<text class="formula math-inline">[$1]</text>')
      // 替换行间公式
      .replace(/\\\[(.*?)\\\]/g, '<view class="formula math-block">[$1]</view>')
      // 转义HTML字符
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 处理换行
      .replace(/\n/g, '<br/>')
      // 处理粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 处理斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted;
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