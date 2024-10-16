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
    lang: lang.maintenance,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    message: lang.message,
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
    show_repairUser: false,
    repairUserList: [],
    repairUsererror: false,
    repairUserLabel:'',
    seltTypeInfo: {},
    is_admin: false,
    my_wm_id:'', // 本人系统id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const auth = app.globalData.auth;
    console.log(auth.some((ele) =>{
      return ele == 'DG'
    }))
    if(auth.indexOf('DG') != -1 || auth.indexOf('CT') != -1  || auth.indexOf('R') != -1){
      // 找到角色
      this.setData({
        is_admin: true,
      })
    }else{
      this.setData({
        is_admin: false,
      })
    }
   
    const data = JSON.parse(options.data)
    let status = 'doing'
    if (data.status !== 1) {
      status = 'done'
    }
    // 本人系统id
    let my_wm_id = app.globalData.wm_id;
    this.setData({
      form: data,
      status,
      btnName: lang.btnName,
      title_active: options.title_active,
      my_wm_id
    })
    if(data.do_user){
      this.setData({
        repairUserLabel: data.do_user.name 
      })
    }
    // 获取分配人员列表
    this.getRepairUserList();
  },
    //获取当前时间
    handleTimeValue(date) {
      const _date = date ? new Date(date) : new Date()
      const year = _date.getFullYear()
      const month = _date.getMonth() + 1
      const day = _date.getDate()
      const hh = _date.getHours()
      const mm = _date.getMinutes()
      const ss = _date.getSeconds()
      const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
      return {
        year,
        month,
        day,
        time,
      }
    },
  getRepairUserList(){
    getRepairUserList({}).then(res => {
      if(res.code == 200){
        let data = res.data.list;
        let repairUserList = [];
        data.forEach( ele =>{
          repairUserList.push({
            admin_id: ele.admin_id,
            model_id: ele.model_id,
            text: ele.name
          });
        })
      
        this.setData({
          repairUserList
        })
      }
    })
  },
   // 点击详情页面 -- 确认按钮  1、情况下管理员分配任务
  repairAssig(){
    let that = this;
    let seltTypeInfo = that.data.seltTypeInfo;
    let p ={
      do_uid: seltTypeInfo.admin_id,
      wmr_id: that.data.form.wmr_id
    }
    handleRepairAssig(p).then( res =>{
      if(res.code == 200){
        wx.showToast({
          title: that.data.message.success,
          duration: 2000,
          icon: 'none'
        })
          let form = that.data.form;
          form.do_uid = p.do_uid;
        that.setData({
          repairUserLabel:'',
          seltTypeInfo: {},
          form,
        })
        
        setTimeout( () =>{
          wx.navigateBack({
            delta: 1
          })
        })
      }else{
        wx.showToast({
          title: res.desc,
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(e =>{
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none',
        duration: 2000
      })
    })

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
      const _this = this;
      let done_date = _this.handleTimeValue().time;
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
          done_date
        },
        success(res) {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            wx.showToast({
              title: _this.data.message.success,
              duration: 2000,
              icon: 'none'
            })
            _this.setData({
              show: false
            })
            setTimeout( () =>{
              wx.navigateBack({
                delta: 1
              })
            },1500)
          }

        },
        fail(res) {
        }
      })
    }
  },
  // 点击选择人员分配
  onType1Open() {
    this.setData({
      show_repairUser: true
    })
  },
    // 打印类型 弹窗关闭按钮
    onCloseType1Select() {
      this.setData({
        show_repairUser: false
      })
    },
    // 弹窗选择打印类型
    onConfirmType1Select(e) {
      const repairUserLabel = e.detail.value.text
      console.log(e)
      this.setData({
        repairUsererror: false,
        repairUserLabel,
        seltTypeInfo: e.detail.value,
      })
      this.onCloseType1Select();
    },
    previewImage(e){
      console.log(e)
      let that = this;
      that.setData({
        report_pic:e.currentTarget.dataset.report_pic,
        swiper_shop:true
      })
    },
    closePic(){
      this.setData({
        swiper_shop: false
      })
    }
})