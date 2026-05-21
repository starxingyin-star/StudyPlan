Component({
  properties: {
    children: {
      type: Array,
      value: []
    },
    currentChildId: {
      type: String,
      value: ''
    }
  },
  methods: {
    onTapChild(event) {
      const { childId } = event.currentTarget.dataset;
      this.triggerEvent('change', { childId });
    }
  }
});
