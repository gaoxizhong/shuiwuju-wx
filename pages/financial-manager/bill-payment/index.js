// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getAllUserPayLog,delAllUserPayLog
} from './../../../apis/financial-manager'
import {
  wxAsyncApi,fmoney
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
    Type_statusList: [
      {id: 1,text: 'Dados do contador'},
      {id: 2,text: 'Nome de usuário'},
      {id: 3,text: 'Endereço detalhado'},
      {id: 4,text: 'Nº de Porta'}
    ],
    selectTypeIndex: 0,
    Type_show: false,
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
      lang: lang.index,
      langDialog: lang.dialog,
    })
    if (stime && etime) {
      this.getListData()
    }
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
      isScroll: true,
      loading: ''
    })
    this.getListData()
  },
  handleGetTime(e) {
    console.log(e)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    this.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      loading: ''
    })
    this.getListData()
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
      url: `/pages/business-hall/user-pay-info/index?id=${item.id}&wm_name=${item.wm_name}&wm_no=${item.wm_no}&total_money=${item.total_money}&pay_time=${item.pay_time}&pay_way=${item.pay_way}&discount_money=${item.discount_money}&invoice_code=${item.invoice_code}&source=business-hall`,
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
            user_pay_log_id: item.id
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

})