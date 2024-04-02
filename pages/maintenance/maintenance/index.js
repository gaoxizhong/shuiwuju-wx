// pages/maintenance/maintenance/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getMaintenanceList, // 所有列表
  getMyMaintenanceList, // 我的维修列表
  getRepairAllStatis, //维修投诉总数据统计
  getMyRepairAllStatis, // 我的维修投诉总数据统计
} from './../../../apis/maintenance'
import {
  wxAsyncApi 
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.maintenance,
    langIndex: lang.index,
    langDialog: lang.dialog,
    wm_no: '',
    status: '',

    page: 1,
    per_page: 0,
    total: 0,

    list: [],
    statusList: [],

    show: false,
    selectIndex: 0,

    loading: lang.message.scrollLoading,
    isScroll: false,


    // 新改
    title_active: 1,
    all_complain_finish_num: 0,
    all_complain_num: 0,
    all_repair_finish_num: 0,
    all_repair_num: 0,
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    this.setData({
      page: 1,
      loading: lang.message.scrollLoading,
      isScroll: true,
      list: [],
      lang: lang.maintenance,
      langIndex: lang.index,
      langDialog: lang.dialog,
      all_complain_finish_num: 0,
      all_complain_num: 0,
      all_repair_finish_num: 0,
      all_repair_num: 0,
    })
    if (this.data.title_active == 1){
      // 所有
      this.getMaintenanceList();
      this.getRepairAllStatis();
    }
    if (this.data.title_active == 2){
      // 我的
      this.getMyMaintenanceList();
      this.getMyRepairAllStatis();
    }
  },
  // 获取所有的统计
  getRepairAllStatis(){
    getRepairAllStatis({}).then(res => {
      let data = res.data.data[0];
      if(res.code == 200){
        this.setData({
          all_complain_num: data.complain_num, // 全部投诉数量
          all_complain_finish_num: data.complain_finish_num, // 全部投诉完成数量
          all_repair_num: data.repair_num, // 全部维修数量
          all_repair_finish_num: data.repair_finish_num, // 全部维修完成数量
        })
      }
    })
  },
  // 获取所有维修列表
  getMaintenanceList() {
    const areas = app.globalData.area
    const params = {
      status: this.data.status, // 1、待处理 
      page: this.data.page
    }
    getMaintenanceList(params).then(res => {
      const l = (res.data.list.data || []).map(i => {
        let a1, a2, a3
        a1 = areas.find(j => j.id === i.area1)
        if (a1) {
          a2 = a1.areas.find(j => j.id === i.area2)
          if (a2) {
            a3 = a2.areas.find(j => j.id === i.area3)
          }
        }
        const area = `${a1 ? a1.name : ''} ${a2 ? a2.name: ''} ${a3 ? a3.name : ''}`
        i.area = area
        return i
      })
      const list = this.data.list.concat(l)
      const total = res.data.list.total || 0
      const per_page = res.data.list.per_page
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      this.setData({
        list,
        per_page,
        total,
        statusList,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    })
  },
  // 获取我的统计
  getMyRepairAllStatis(){
    getMyRepairAllStatis({}).then(res => {
      let data = res.data.data[0];
      if(res.code == 200){
        this.setData({
          all_complain_num: data.complain_num, // 全部投诉数量
          all_complain_finish_num: data.complain_finish_num, // 全部投诉完成数量
          all_repair_num: data.repair_num, // 全部维修数量
          all_repair_finish_num: data.repair_finish_num, // 全部维修完成数量
        })
      }
    })
  },
  // 获取我的维修列表
  getMyMaintenanceList() {
    const areas = app.globalData.area
    const params = {
      status: this.data.status, // 1、待处理 
      page: this.data.page
    }
    getMyMaintenanceList(params).then(res => {
      const l = (res.data.list.data || []).map(i => {
        let a1, a2, a3
        a1 = areas.find(j => j.id === i.area1)
        if (a1) {
          a2 = a1.areas.find(j => j.id === i.area2)
          if (a2) {
            a3 = a2.areas.find(j => j.id === i.area3)
          }
        }
        const area = `${a1 ? a1.name : ''} ${a2 ? a2.name: ''} ${a3 ? a3.name : ''}`
        i.area = area
        return i
      })
      const list = this.data.list.concat(l)
      const total = res.data.list.total || 0
      const per_page = res.data.list.per_page
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      this.setData({
        list,
        per_page,
        total,
        statusList,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    })
  },
  // 滚动底部加载更多
  addListData() {
    let page = this.data.page
    const total = this.data.total
    const per_page = this.data.per_page
    if (total >= page * per_page) {
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
  // 点击列表项
  handleDetails(e) {
    const index = e.currentTarget.dataset.index;
    const data = JSON.stringify(this.data.list[index]);
    let title_active = this.data.title_active;
    wxAsyncApi('navigateTo', {
      url: `/pages/maintenance/maintenance-info/index?data=${data}&title_active=${title_active}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },


  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      title_active,
      all_complain_finish_num: 0,
      all_complain_num: 0,
      all_repair_finish_num: 0,
      all_repair_num: 0,
    })
    if (this.data.title_active == 1){
      // 所有
      this.getMaintenanceList();
      this.getRepairAllStatis();
    }
    if (this.data.title_active == 2){
      // 我的
      this.getMyMaintenanceList();
      this.getMyRepairAllStatis();
    }
  }
})