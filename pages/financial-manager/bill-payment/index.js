// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import { getAllUserPayLog,delAllUserPayLog,getDelAllUserPayLog, } from './../../../apis/financial-manager'
const { addUserPayLogNumber } = require('../../../apis/water')
import { wxAsyncApi,fmoney,handleTimeValue } from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.index,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    page: 1,
    total: 0,
    isScroll: true,
    loading: '',
    list: [],
    stime: '', // 开始时间
    etime: '', // 结束时间


    type_seach: 'type', // type - - 选类型  seach 输入
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号
    select_value:'', // 查询内容
    searchStatusList: [],
    selectTypeIndex: 0,
    Type_show: false,
    title_active: 1,
    del_selt_info: {},
    del_selt_index: null,
    delList: [],  // 删除记录
    cancelShowPop: false,
    cancelList: [], // 取消原因
    selt_cancel_status: {}, // 选中的取消原因
    status_type: '',
    is_return: true
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      lang: lang.index,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      searchStatusList: lang.searchStatusList, 

    })
    // if (stime && etime) {
    //   this.getListData()
    // }
  },
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      select_value: value,
    })
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const select_value = e.detail.value;
    this.setData({
      select_value,
      type_seach: 'type'
    })
  },
  onShowTypePopup() {
    console.log('#Type_select')
    const select = this.selectComponent('#Type_select')
    select && select.setColumnIndex(0, this.data.selectTypeIndex)
    this.setData({
      Type_show: true
    })
  },
  onCloseTypePopup() {
    this.setData({
      Type_show: false
    })
  },
  handleTypeSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    console.log(e.detail)
    this.setData({
      selectTypeIndex: index,
      select_type: value.id,
      type_seach: 'seach'
    });
    this.onCloseTypePopup()
  },
  handleSearchInfo() {
    this.setData({
      page: 1,
      list: [],
      delPayLogList: [],
      isScroll: true,
      loading: ''
    })
    this.getListData();
    // if(this.title_active == 1){
    //   this.getListData();
    // }else{
    //   this.getDelAllUserPayLog();
    // }
  },
  handleGetTime(e) {
    let that = this;
    console.log(e)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    that.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      delPayLogList: [],
      page: 1,
      total: 0,
      isScroll: true,
      loading: ''
    })
    if(this.data.title_active == 1){
      this.getListData();
    }else{
      this.getDelAllUserPayLog();
    }
  },
  getListData() {
    const params = {
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_no: this.data.wm_no,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    getAllUserPayLog(params).then(res => {
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.total_money = fmoney(Number(ele.total_money),2);
        ele.after_arrears_money = fmoney(Number(ele.after_arrears_money),2);
      })
      const list = this.data.list.concat(data)
      const total = res.data.list.total || 0
      this.setData({
        list,
        total,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    })
  },
  addListData() {
    let page = this.data.page
    const total = this.data.total
    if (total >= page * 15) {
      page += 1
      this.setData({
        page,
        loading: `${lang.message.loading}...`,
        isScroll: false,
      })
      this.getListData()
    } else {
      this.setData({
        loading: lang.message.noMoreEmpty,
      })
    }
  },
  handleDetails(e) {
    const item = e.currentTarget.dataset.item;
    wxAsyncApi('navigateTo', {
      url: `/pages/business-hall/user-pay-info/index?item=${JSON.stringify(item)}&source=business-hall`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  // 点击历史记录按钮
  goToHistorio(){
 
  },
  // 点击交班按钮
  goToFecho(){
  
  },
  // 点击列表删除 icon
  clickDelete(e){
    let that = this;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    let list = that.data.list;
    if(item.cancel_receipt_number){
      wx.showModal({
        title: lang.historical.title,
        content: lang.historical.content,
        cancelText: lang.historical.cancelText,
        confirmText: lang.historical.confirmText,
        complete: (res) => {
          if (res.confirm) {
            console.log(item)
            delAllUserPayLog({
              user_pay_log_id: item.id,
              del_data_time: handleTimeValue().time
            }).then( res =>{
              if(res.code == 200){
                wx.showToast({
                  title: lang.message.success,
                })
                list.splice(index,1);
                that.setData({
                  list,
                })
              }else{
                wx.showToast({
                  title: res.desc,
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    }else{
      that.setData({
        cancelList: [
          {id: 1,text:'Erro de lançamento'},
          {id: 2,text:'Duplicação'},
          {id: 3,text:'Devolução do pagamento'},
          {id: 4,text:'Outro motivo justificado'},
        ],
        del_selt_index: index,
        del_selt_info: item,
        cancelShowPop: true
      })
    }
  },
  onChange(e){
    console.log(e)
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      delPayLogList: [],
      list: [],
      wm_no: '',
      admin_name:'',
      page: 1,
      total: 0,
      title_active,
    })
    if(title_active == 2){
      this.getDelAllUserPayLog();
    }
  },
  getDelAllUserPayLog(){
    let that = this;
    const params = {
      stime: this.data.startTime + ' 00:00:00',
      etime: this.data.endTime + ' 23:59:59',
      wm_no: this.data.wm_no,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    getDelAllUserPayLog(params).then( res =>{
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.total_money = fmoney(Number(ele.total_money),2);
        ele.after_arrears_money = fmoney(Number(ele.after_arrears_money),2);
      })
      const delPayLogList = this.data.delPayLogList.concat(data)
      this.setData({
        delPayLogList,
      })
    }).catch( e=>{
      console.log(e)
    })
  },
  // 点击取消按钮
  // clickQx(){

  // },
  onCloseType1Select() {
    this.setData({
      cancelShowPop: false
    })
  },
  // 取消原因弹窗 确认
  onConfirmType1Select(e){
    let that = this;
    let valueinfo = e.detail.value; // 取消原因
    let datainfo = this.data.del_selt_info; 
    let list = that.data.list;
    let index = that.data.del_selt_index;
    if( !that.data.is_return ){
      return
    }
    that.setData({
      is_return: false
    })
    let p = {
      id: datainfo.id,
      type: 3,
      comment: valueinfo.text
    }
    // 1:收据编码 2:发票编码 3:取消收据编码 4:取消发票编码
    // 获取编码
    addUserPayLogNumber(p).then(res => {
      console.log(res)
      if(res.code == 200){
        // that.blueToothPrint();
        // 删除接口
        delAllUserPayLog({
          user_pay_log_id: datainfo.id,
          del_data_time: handleTimeValue().time
        }).then( res =>{
          if(res.code == 200){
            wx.showToast({
              title: lang.message.success,
            })
            list.splice(index,1);
            that.setData({
              list,
              del_selt_index: null,
              del_selt_info: {},
              cancelShowPop: false
            })
          }else{
            wx.showToast({
              title: res.desc,
              icon: 'none'
            })
          }
        })
      }else{
        wx.showToast({
          title: 'Error',
          icon:'none'
        })
      }
      that.setData({
        is_return: true
      })
    }).catch(e => {
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
      that.setData({
        is_return: true
      })
    })
    
  },
})