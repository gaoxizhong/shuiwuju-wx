// pages/maintenance/maintenance-info/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  wxAsyncApi
} from './../../../utils/util'
import {
  handleRepairAssig, //手动分配维修/投诉单给相关人员
  getRepairUserList,  // 获取维修人员列表
} from './../../../apis/maintenance'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.maintenance.info,
    btnName: lang.btnName,
    form: {},
    status: 'doing',
    show: false,

    done_note: '',
    done_note_error: false,

    done_pic: '',
    done_pic_error: false,
    autosizeimg: {
      maxHeight: 120,
      minHeight: 120
    },
    autosize: {
      maxHeight: 80,
      minHeight: 80
    },
    title_active:'', // 1、全部 2、个人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    const data = JSON.parse(options.data)
    let status = 'doing'
    if (data.status !== 1) {
      status = 'done'
    }
    this.setData({
      form: data,
      status,
      lang: lang.maintenance.info,
      btnName: lang.btnName,
      title_active: options.title_active
    })
    this.getRepairUserList();
  },
   // 点击详情页面 -- 确认按钮  1、情况下管理员分配任务
  repairAssig(){
    
  },
  // 点击详情页面 -- 确认按钮  2、情况下
  openRepairDone() {
    this.setData({
      show: true,
      done_note: '',
      done_pic: '',
      done_note_error: false,
      done_pic_error: false
    })
  },

  onCloseRepairDone() {
    this.setData({
      show: false,
    })
  },
  handleInputCheckDetail(e) {
    const done_note = e.detail
    this.setData({
      done_notel_error: false,
      done_note
    })
  },

  // 选择图片
  addWaterImage() {
    wxAsyncApi('chooseMedia', {
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      if (res.tempFiles && res.tempFiles[0]) {
        const done_pic = res.tempFiles[0].tempFilePath
        this.setData({
          done_pic,
          done_pic_error: false
        })
      }
    })
  },
  // 删除图片
  deleteWaterImage() {
    this.setData({
      done_pic: ''
    })
  },

  handleInfoStatus() {
    const wmr_id = this.data.form.wmr_id
    const done_note = this.data.done_note
    const done_pic = this.data.done_pic
    let flag = true
    if (!done_note) {
      flag = false
      this.setData({
        done_note_error: true
      })
    }
    if (!done_pic) {
      flag = false
      this.setData({
        done_pic_error: true
      })
    }
    if (flag) {
      const baseUrl = app.globalData.baseUrl
      const token = wx.getStorageSync('token')
      const _this = this
      wx.uploadFile({
        filePath: done_pic,
        name: 'done_pic',
        url: `${baseUrl}/api/wx/m/m_repair_done`,
        header: {
          'Authorization': token ? 'Bearer ' + token : '',
        },
        formData: {
          wmr_id,
          done_note,
        },
        success(res) {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            wx.showToast({
              title: "操作成功",
              duration: 2000,
              icon: 'none'
            })
            _this.setData({
              show: false
            })
          }

        },
        fail(res) {
        }
      })
    }
  }
})