// pages/query-water/report-repair/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
} = require('./../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.reportRepair,
    langMessage: lang.message,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    size: {
      maxHeight: 100,
      minHeight: 100
    },
    showAddImg: true,
    waterList: [],
    form: [],
    type_error: false,
    type: '',
    typeLabel: '',
    report_note_error: false,
    report_note: '',
    show: false,
    columns: [],
    image_error: false,
    autosize: {
      maxHeight: 140,
      minHeight: 140
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const form = lang.reportRepair.form.map(i => ({
      ...i,
      value: ''
    }))
    const repair_type = app.globalData.repair_type
    const columns = Object.keys(repair_type).map(i => ({
      key: i,
      text: repair_type[i]
    }))
    this.setData({
      form,
      columns,
      lang: lang.reportRepair,
      langMessage: lang.message,
      langDialog: lang.dialog,
      btnName: lang.btnName,
    })
  },
  addWaterImage() {
    wxAsyncApi('chooseMedia', {
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      if (res.tempFiles && res.tempFiles[0]) {
        const list = this.data.waterList
        list.push(res.tempFiles[0])
        this.setData({
          waterList: list,
        })

        if (list.length >= 1) {
          this.setData({
            image_error: false,
            showAddImg: false
          })
        }
      }
    })
  },
  deleteWaterImage(e) {
    const _index = e.currentTarget.dataset.index;
    !this.data.showAddImg && (this.setData({
      showAddImg: true
    }))
    const list = this.data.waterList.filter((i, index) => _index !== index)
    this.setData({
      waterList: list
    })
  },
  handleInputReportNote(e) {
    const report_note = e.detail
    this.setData({
      report_note_error: false,
      report_note
    })
  },
  onOpen() {
    this.setData({
      show: true
    })
  },
  onCloseSelect() {
    this.setData({
      show: false
    })
  },
  onConfirmSelect(e) {
    const type = e.detail.value.key
    const typeLabel = e.detail.value.text

    const form = this.data.form
    form.forEach(i => {
      if (i.key === 'wm_no') {
        i.required = (type === '1')
      } else {
        i.required = (type !== '1')
      }
    })
    this.setData({
      type,
      type_error: false,
      typeLabel,
      form
    })
    this.onCloseSelect()
  },
  handleReportRepair() {
    const wixiForm = this.selectComponent('#report-repair-form')
    const type = this.data.type
    const report_note = this.data.report_note
    const waterList = this.data.waterList
    if (!wixiForm) {
      return
    }
    const data = wixiForm.getFormData()
    if (!type) {
      this.setData({
        type_error: true
      })

    }
    if (!waterList.length) {
      this.setData({
        image_error: true
      })
    }
    if (!report_note) {
      this.setData({
        report_note_error: true
      })
    }
    if (data && type && waterList && report_note) {
      const baseUrl = getApp().globalData.baseUrl
      const token = wx.getStorageSync('token')
      const params = {
        report_note,
        type,
      }
      if (type === '1') {
        params.wm_no = data.wm_no
      } else {
        params.area1 = data.area1
        params.area2 = data.area2
        params.area3 = data.area3
        params.address = data.wm_address
      }
      wx.uploadFile({
        filePath: waterList.length ? waterList[0].tempFilePath : '',
        name: 'report_pic',
        url: `${baseUrl}/api/wx/fb/fb_report_repair`,
        header: {
          'Authorization': token ? 'Bearer ' + token : '',
        },
        formData: {
          ...params
        },
        success(res) {
          const data = JSON.parse(res.data)
          if (data.code !== 200) {
            wx.showToast({
              title: data.desc,
              duration: 2000,
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: lang.message.success,
              duration: 2000,
              icon: 'none'
            })
            wx.navigateBack({
              delta: -1
            })
          }
        },
        fail(res) {}
      })
    } else {
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
    }

  }
})