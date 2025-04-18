Page({
  data: {
    isRecording: false
  },

  // 处理录音按钮点击
  handleRecord: function() {
    const { isRecording } = this.data;
    this.setData({
      isRecording: !isRecording
    });
    if (isRecording) {
      // 停止录音
      this.stopRecord();
    } else {
      // 开始录音
      this.startRecord();
    }
  },

  // 开始录音
  startRecord: function() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.start({
      format: 'mp3',
      duration: 60000 // 最长录音时间
    });
  },

  // 停止录音
  stopRecord: function() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  }
})