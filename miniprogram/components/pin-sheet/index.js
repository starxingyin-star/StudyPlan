Component({
  properties: {
    visible: Boolean,
    title: String
  },
  data: {
    value: ''
  },
  methods: {
    onInput(event) {
      this.setData({ value: event.detail.value });
    },
    onConfirm() {
      const pin = String(this.data.value || '').trim();
      if (!pin) {
        wx.showToast({
          title: '请输入家长密码',
          icon: 'none'
        });
        return;
      }

      this.triggerEvent('confirm', { pin });
    },
    onCancel() {
      this.triggerEvent('cancel');
      this.setData({ value: '' });
    }
  }
});
