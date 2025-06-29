// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getAllUserPayLog,delAllUserPayLog,getDelAllUserPayLog
} from './../../../apis/financial-manager'
import {
  wxAsyncApi,fmoney,handleTimeValue
} from './../../../utils/util'
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
    del_selt_info: {},
    del_selt_index: null,

    type_seach: 'type', // type - - 选类型  seach 输入
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号
    select_value:'', // 查询内容
    searchStatusList: [],
    selectTypeIndex: 0,
    Type_show: false,
    title_active: 1,
    delList: [],  // 删除记录
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      page: 1,
      total: 0,
      loading: '',
      isScroll: true,
      list: [],
      title_active: 1,
      delPayLogList: [], // 删除记录
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
      url: `/pages/business-hall/user-pay-info/index?id=${item.id}&wm_name=${item.wm_name}&wm_no=${item.wm_no}&total_money=${item.total_money}&pay_time=${item.pay_time}&pay_way=${item.pay_way}&discount_money=${item.discount_money}&invoice_code=${item.invoice_code}&source=business-hall&del_admin_id=${item.del_admin_id?item.del_admin_id:''}&operator_name=${item.operator_name?item.operator_name:''}`,
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
  }
})