// pages/maintenance/maintenance-info/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  wxAsyncApi,fmoney
} from './../../../utils/util'
const blueToolth = require('../../../utils/bluetoolth')
//只需要引用encoding.js,注意路径
var encoding = require("../../../utils/encoding.js")
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
    bluetoolthDevice: lang.admin.bluetoolthDevice,
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
    lang = app.globalData.lang;
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
      bluetoolthDevice: lang.admin.bluetoolthDevice,
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
  // 弹窗关闭按钮
  onCloseType1Select() {
    this.setData({
      show_repairUser: false
    })
  },
  // 弹窗选择
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
  },
  // 打印数据-- 获取打印信息
  imprimirInfo(){
    let that = this;
    // 获取打印信息
    let date = this.handleTimeValue();
    let form = that.data.form;
    let lang = that.data.lang;
    let printInfo_title = `EPASKS-E.P.`;
    let printInfo = `
Informações de reparação
--------------------------------
Status:      ${form.status_text}
Nome de usuário:    ${form.report_user.name?form.report_user.name: ''}
Consumidor:    ${form.meter ? form.meter.wm_no : ''}
Localidade:    ${form.area ? form.area : ''}
Endereço detalhado:    ${form.address ? form.address : ''}
Telefone:    ${form.meter.wm_phone? form.meter.wm_phone : ''}
Resolução:   ${form.report_note? form.report_note : ''}
Status da atribuição:   ${form.do_uid > 0 ? lang.distribution_1: lang.distribution_2}
Distribuição:    ${that.data.repairUserLabel}
--------------------------------` ;

      let printInfo_data= `
Processado por programaválido n31.1/AGT20
DATA: ${date.time}

`;
    let printData = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": encodeURIComponent(printInfo_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
          "concentration": 15, //打印浓度1~20，默认15
          "align": 1, //0左对齐，1居中对齐，2右对齐；
          "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
          //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
          "isDoubleHeight": true, //是否倍高；
          "isDoubleWidth": false, //是否倍宽；
          "isUnderLine": 0, //是否加下划线；
          "isBold": true, //是否加粗；
        },
        {
          "printType": 0,
          "text": encodeURIComponent(printInfo) + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": encodeURIComponent(printInfo_data) + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
      ]
    };
    this.SendControlCommand(printData);

  },
  // 新打印机打印方法
  SendControlCommand(printData) {
    let that = this;
    let bluetoolthDevice = that.data.bluetoolthDevice;
    // 判断是否有设备SN码
    let terminalNo = wx.getStorageSync('terminalNo');
    if(!terminalNo || terminalNo == ''){
      wx.showModal({
        title: bluetoolthDevice.equipmentNumber,
        editable: true, // 开启输入框
        placeholderText: bluetoolthDevice.pleaseequipmentNumber, // 输入框提示文字
        success(res) {
          if (res.confirm) {
            // 用户点击确定后，通过res.content获取输入的内容
            console.log('设备SN码：', res.content)
            wx.setStorageSync('terminalNo',res.content);
            app.globalData.terminalNo = res.content;
            that.SendControlCommand_1(printData);
          }
        }
      })
      return
    }else{
      that.SendControlCommand_1(printData);
    }
  },
  SendControlCommand_1(printData) {
    let that = this;
     wx.showLoading({
      title: ''
    });

    let printCtn = {
      "type":"print",
      "printJsonStr": printData
    }
    wx.request({
      url: app.globalData.apiUrl + "/iotAdmin/iot/write2Printer",
      method: "post",
      data: {
        terminalNo: wx.getStorageSync('terminalNo'),
        groupId: app.globalData.groupId,
        printCtn: JSON.stringify(printCtn)
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('success...',res)
        if(res.data.code == 200){
          wx.showToast({
            title: lang.blueToolth.printSuccess,
            icon: "",
            duration: 3000,
          })
          that.getOrderInfo(res.data.data[0].orderId);
        }else{
          wx.showToast({
            title: 'error',
            icon: "none",
            duration: 3000,
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('err...',err)// 控制台打印完整错误，方便排查
      }
    })
  },
  getOrderInfo(id){

    wx.request({
      url: "https://iot.unioncore.vip/iotAdmin/iot/getOrderInfo",
      method: "post",
      data: {
        orderId: id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('success...',res)
        if(res.data.code == 200){
          
        }else{
         
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('err...',err)// 控制台打印完整错误，方便排查
        
      }
    })
  },
  //获取当前时间
  handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date()
    const year = _date.getFullYear()
    const month = _date.getMonth() + 1
    const day = _date.getDate()
    const days = _date.getDay()
    const hh = _date.getHours()
    const mm = _date.getMinutes()
    const ss = _date.getSeconds()
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    return {
      time,
      year,
      month,
      day,
      days
    }
  },
  // 转二进制 并数组复制
  arrEncoderCopy(str){
    let data = str;
    // const encoder = new TextEncoder('cp860');  // 微信小程序不支持 new TextEncoder
    // let arr = [...encoder.encode(data)]
    // console.log(arr)
    //utf8
    let inputBuffer = new encoding.TextEncoder().encode(str);
    let arr = [ ...inputBuffer ]
    return arr
  }
})