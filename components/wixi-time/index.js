// components/wixi-time/index.js
const app = getApp()
let lang = app.globalData.lang

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    times: [{
      label: lang.timeName.today,
      key: 0
    }, {
      label: lang.timeName.lastDay,
      key: 1
    }, {
      label: lang.timeName.theWeek,
      key: 2
    }, {
      label: lang.timeName.theMonth,
      key: 3
    }, {
      label: lang.timeName.lastMonth,
      key: 4
    }, {
      label: lang.timeName.sevenDay,
      key: 5
    }, {
      label: lang.timeName.thirtyDay,
      key: 6
    }],
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    timeType: '',
    startShow: false,
    endShow: false,
    formatter(type, value) {
      if (type === 'year') {
        return `${value}${lang.timeName.year}`;
      }
      if (type === 'month') {
        return `${value}${lang.timeName.month}`;
      }
      if (type === 'day') {
        return `${value}${lang.timeName.day}`;
      }
      return value;
    },
  },
  lifetimes: {
    ready() {
      lang = app.globalData.lang
      this.setTime(this.data.active)
      this.setData({
        times: [{
          label: lang.timeName.today,
          key: 0
        }, {
          label: lang.timeName.lastDay,
          key: 1
        }, {
          label: lang.timeName.theWeek,
          key: 2
        }, {
          label: lang.timeName.theMonth,
          key: 3
        }, {
          label: lang.timeName.lastMonth,
          key: 4
        }, {
          label: lang.timeName.sevenDay,
          key: 5
        }, {
          label: lang.timeName.thirtyDay,
          key: 6
        }],
        formatter(type, value) {
          if (type === 'year') {
            return `${value}${lang.timeName.year}`;
          }
          if (type === 'month') {
            return `${value}${lang.timeName.month}`;
          }
          if (type === 'day') {
            return `${value}${lang.timeName.day}`;
          }
          return value;
        },
      })
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    //获取当前时间
    handleTimeValue(date) {
      const _date = date ? new Date(date) : new Date()
      const year = _date.getFullYear()
      const month = _date.getMonth() + 1
      const day = _date.getDate()
      const days = _date.getDay()
      const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
      return {
        time,
        year,
        month,
        day,
        days
      }
    },
    // 打开时间选择器
    handleSelectTime(e) {
      const type = e.currentTarget.dataset.type
      if (type === 'start') {
        this.setData({
          timeType: type,
          startShow: true,
        })
      } else {
        this.setData({
          timeType: type,
          endShow: true
        })
      }

    },
    // 确定弹框选时间
    confirmTime(e) {
      const type = e.currentTarget.dataset.type
      const date = e.detail
      const {
        time
      } = this.handleTimeValue(e.detail)
      if (type === 'start') {
        this.setData({
          startTime: time,
          startDate: date,
        })
        this.onStartClose()
      } else {
        this.setData({
          endTime: time,
          endDate: date,
        })
        this.onEndClose()
      }
    },
    // 点击便捷时间选择
    handleClickTime(e) {
      const active = e.target.dataset.key;
      if (active === undefined) {
        return
      }
      this.setData({
        active
      })
      this.setTime(active)
    },
    // 关闭弹框
    onStartClose() {
      this.setData({
        startShow: false
      })
    },
    // 关闭弹框
    onEndClose() {
      this.setData({
        endShow: false
      })
    },
    setTime(key) {
      switch (key) {
        case 0:
          this.getNowDay()
          break;
        case 1:
          this.getLastDay()
          break;
        case 2:
          this.getNowWeek()
          break;
        case 3:
          this.getNowMonth()
          break;
        case 4:
          this.getLastMonth()
          break;
        case 5:
          this.getMoreDay(7)
          break;
        case 6:
          this.getMoreDay(30)
          break;
      }
      this.triggerEvent('gettime', {
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        startDate: this.data.startDate,
        endDate: this.data.endDate
      })
    },
    // 今天
    getNowDay() {
      const {
        time,
        year,
        month,
        day
      } = this.handleTimeValue()
      this.setData({
        startTime: time,
        endTime: time,
        startDate: new Date(year, month - 1, day).getTime(),
        endDate: new Date(year, month - 1, day).getTime(),
      })
    },
    // 昨天
    getLastDay() {
      const _date = this.handleTimeValue()
      // const _date =   {year: '2023',month: '03', day:'04'}
      let year = parseInt(_date.year)
      let month = parseInt(_date.month)
      let day = parseInt(_date.day)
      if (day === 1) {
        if (month === 1) {
          year = year - 1
          month = 12
          day = 31
        } else {
          month = month - 1
          day = this.getMonthLastDay(month)
        }
      } else {
        year = year
        month = month
        day = day - 1
      }
      this.setData({
        startTime: `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`,
        endTime: `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`,
        startDate: new Date(year, month - 1, day).getTime(),
        endDate: new Date(year, month - 1, day).getTime(),
      })
    },
    // 本周
    getNowWeek() {
      const _date = this.handleTimeValue()
      let year = parseInt(_date.year)
      let month = parseInt(_date.month)
      let day = parseInt(_date.day)
      const days = _date.days === 0 ? 7 : _date.days
      let time = _date.time
      if (day < days) {
        const num = days - 1 - day
        if (month === 1) {
          year = year - 1
          month = 12
          day = 31 - num
        } else {
          month = month - 1
          day = this.getMonthLastDay(month) - num
        }
      } else {
        day = day - days + 1
      }
      const arr = time.split('-')
      this.setData({
        startTime: `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`,
        endTime: `${arr[0]}-${arr[1]}-${arr[2]}`,
        startDate: new Date(year, month - 1, day).getTime(),
        endDate: new Date(arr[0], arr[1] - 1, arr[2]).getTime(),
      })
    },
    // 本月
    getNowMonth() {
      const {
        time,
        year,
        month,
        day
      } = this.handleTimeValue()
      this.setData({
        startTime: `${year}-${month >= 10 ? month : '0' + month}-01`,
        endTime: time,
        startDate: new Date(year, month - 1, '01').getTime(),
        endDate: new Date(year, month - 1, day).getTime(),
      })
    },
    // 上月
    getLastMonth() {
      const _date = this.handleTimeValue()
      let year = parseInt(_date.year)
      let month = parseInt(_date.month)
      if (month === 1) {
        year = year - 1
        month = 12
      } else {
        month = month - 1
      }
      const day = this.getMonthLastDay(month)
      this.setData({
        startTime: `${year}-${month >= 10 ? month : '0' + month}-01`,
        endTime: `${year}-${month >= 10 ? month : '0' + month}-${day}`,
        startDate: new Date(year, month - 1, '01').getTime(),
        endDate: new Date(year, month - 1, day).getTime(),
      })
    },
    // 近n天
    getMoreDay(value) {
      const _date = this.handleTimeValue()
      let year = parseInt(_date.year)
      let month = parseInt(_date.month)
      let day = parseInt(_date.day)
      let time = _date.time
      const days = value
      if (day < days) {
        const num = days - 1 - day
        if (month === 1) {
          year = year - 1
          month = 12
          day = 31 - num
        } else {
          month = month - 1
          day = this.getMonthLastDay(month) - num
        }
      } else {
        day = day - days + 1
      }
      const arr = time.split('-')
      this.setData({
        startTime: `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`,
        endTime: `${arr[0]}-${arr[1]}-${arr[2]}`,
        startDate: new Date(year, month - 1, day).getTime(),
        endDate: new Date(arr[0], arr[1] - 1, arr[2]).getTime(),
      })
    },
    getMonthLastDay(month) {
      if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        return 31
      } else if (month === 2) {
        return 28
      } else {
        return 30
      }
    }
  }
})