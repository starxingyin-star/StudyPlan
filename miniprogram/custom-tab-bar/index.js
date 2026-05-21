Component({
  data: {
    selected: 0,
    color: '#6b7280',
    selectedColor: '#166534',
    list: [
      {
        pagePath: '/pages/today/index',
        text: '今日',
        emoji: '✓'
      },
      {
        pagePath: '/pages/rewards/index',
        text: '奖励',
        emoji: '★'
      },
      {
        pagePath: '/pages/mine/index',
        text: '我的',
        emoji: '●'
      }
    ]
  },
  methods: {
    switchTab(event) {
      const { index, path } = event.currentTarget.dataset;
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});
