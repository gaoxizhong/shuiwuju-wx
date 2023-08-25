const eventBus = {
  // 存储所有事件和对应的订阅者
  eventList: new Map(),
  // 订阅事件
  on(event, callback) {
    if (!this.eventList.has(event)) {
      this.eventList.set(event, new Set())
    }
    this.eventList.get(event).add(callback)
  },
  // 取消订阅事件
  off(event, callback) {
    if (this.eventList.has(event)) {
      const callbacks = this.eventList.get(event)
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.eventList.delete(event)
      }
    }
  },
  // 发布事件
  emit(event, ...args) {
    if (this.eventList.has(event)) {
      const callbacks = this.eventList.get(event)
      callbacks.forEach((callback) => {
        callback.call(null, ...args)
      })
    }
  }
}

module.exports = eventBus
