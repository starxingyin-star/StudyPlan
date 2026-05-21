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
      this.triggerEvent('confirm', { pin: this.data.value });
      this.setData({ value: '' });
    },
    onCancel() {
      this.triggerEvent('cancel');
      this.setData({ value: '' });
    }
  }
});
