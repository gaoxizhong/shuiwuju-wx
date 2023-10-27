// components/wixi-form/index.js
const app = getApp()
let lang = app.globalData.lang
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    form: {
      type: Array,
      default: [],
      observer(val) {
        this.changeForm(val) // 当visible变为true的时候 会触发initData
      }
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  lifetimes: {
    ready() {
      lang = app.globalData.lang
      const area = app.globalData.area
      const area0 = area.map(i => i.name)
      const area1 = area[0].areas.map(i => i.name)
      const area2 = area[0].areas[0].areas.map(i => i.name)
      const columns = [{
        values: area0,
      }, {
        values: area1,
      }, {
        values: area2,
      }]
      this.setData({
        wixiForm: this.properties.form || [],
        columns,
        langDialog: lang.dialog,
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
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    langDialog: lang.dialog,
    wixiForm: [],
    columns: [],
    showSelect: false,
    formIndex: '',
    columnsIndex: [0, 0, 0],
    confirmIndex: [0, 0, 0],
    confirmValue: [0, 0, 0],

    showSelectTime: false,
    currentDate: new Date().getTime(),
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

  /**
   * 组件的方法列表
   */
  methods: {
    changeForm(value) {
      this.setData({
        wixiForm: value,
      })
    },
    handleChange(e) {
      console.log(e)
      const {
        index,
      } = e.currentTarget.dataset
      const value = e.detail
      const form = this.data.wixiForm
      const item = form[index]
      item.value = value
      if (item.required && value) {
        item.error = false
      }
      this.setData({
        wixiForm: form
      })
    },
    onOpenSelect(e) {
      const area = app.globalData.area
      const picker = this.selectComponent('#wixi-area')
      const confirmIndex = this.data.confirmIndex
      if (picker) {
        confirmIndex.forEach((i, index) => {
          if (index === 0) {
            picker.setColumnValues(1, area[i].areas.map(i => i.name));
          } else if (index === 1) {
            picker.setColumnValues(2, area[confirmIndex[index - 1]].areas[i].areas.map(i => i.name));
          } else {
            setTimeout(() => {
              picker.setColumnIndex(index, i)
            }, 200)
          }
          picker.setColumnIndex(index, i)
        })
      }
      this.setData({
        showSelect: true,
        formIndex: e.currentTarget.dataset.index,
        columnsIndex: [...confirmIndex]
      })
    },
    onCloseSelect() {
      this.setData({
        showSelect: false
      })
    },
    onChangeSelect(e) {
      const area = app.globalData.area
      const {
        picker,
        index,
        value
      } = e.detail;
      if (index === 0) {
        const indexValue = value[index]
        const _columnsIndex = area.findIndex(i => i.name = indexValue)
        const columnsIndex = [_columnsIndex, 0, 0]
        this.setData({
          columnsIndex
        })
        // const _index = area[0].areas.findIndex(i => i.name === value[index])
        picker.setColumnValues(1, area[_columnsIndex].areas.map(i => i.name));
        picker.setColumnValues(2, area[_columnsIndex].areas[0].areas.map(i => i.name));
      } else if (index === 1) {
        const columnsIndex = this.data.columnsIndex
        const _index = area[columnsIndex[0]].areas.findIndex(i => i.name === value[index])
        columnsIndex[1] = _index
        columnsIndex[2] = 0
        this.setData({
          columnsIndex
        })
        picker.setColumnValues(2, area[columnsIndex[0]].areas[_index].areas.map(i => i.name));
      }

    },
    onConfirmSelect(e) {
      const {
        index,
        value
      } = e.detail
      const form = this.data.wixiForm
      const item = form[this.data.formIndex]
      const area = app.globalData.area
      const confirmValue = this.data.confirmValue
      item.value = value.join(',')
      if (item.required) {
        item.error = false
      }
      index.forEach((i, _index) => {
        if (_index === 0) {
          confirmValue[_index] = area[i].id
        } else if (_index === 1) {
          confirmValue[_index] = area[index[_index - 1]].areas[i].id
        } else {
          confirmValue[_index] = area[index[_index - 2]].areas[index[_index - 1]].id
        }
      })
      this.setData({
        confirmIndex: index,
        confirmValue,
        wixiForm: form
      })
      this.onCloseSelect()
    },

    onOpenTimeSelect(e) {
      const index = e.currentTarget.dataset.index
      const value = this.data.wixiForm[index].value || ''
      this.setData({
        showSelectTime: true,
        formIndex: e.currentTarget.dataset.index,
        currentDate: value ? new Date(value).getTime() : new Date().getTime()
      })
    },
    onCloseTimeSelect() {
      this.setData({
        showSelectTime: false,
      })
    },
    handleGetTime(e) {
      const form = this.data.wixiForm
      const item = form[this.data.formIndex]
      const date = new Date(e.detail)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      item.value = `${year}-${month > 10 ? month : '0' + month}-${day > 10 ? day : '0' + day}`
      if (item.required) {
        item.error = false
      }
      this.setData({
        wixiForm: form
      })
      this.onCloseTimeSelect()
    },
    // 获取数据
    getFormData() {
      const params = {}
      const form = this.data.wixiForm
      let flag = true
      const newForm = form.map(i => {
        if (i.required) {
          if (!i.value) {
            flag = false
            i.error = true
          }
        }
        if (i.type === 'area') {
          const confirmValue = this.data.confirmValue
          i.key.split(',').forEach((j, index) => {
            params[j] = confirmValue[index]
          })
        } else {
          params[i.key] = i.value
        }
        return i
      })
      if (flag) {
        return params
      } else {
        this.setData({
          wixiForm: newForm
        })
        return false
      }
    }
  }
})