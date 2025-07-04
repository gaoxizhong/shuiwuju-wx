const zh_lang = {
  // 错误码
  errorInfo: {
    10001: "当前蓝牙适配器不可用",
    10002: "没有找到指定设备",
    10003: "连接失败",
    10004: "没有找到指定服务",
    10005: "没有找到指定特征",
    10006: "当前连接已断开",
    10007: "当前特征不支持此操作",
    10008: "其余所有系统上报的异常",
    10009: "系统版本低于 4.3 不支持 BLE",
    10012: "连接超时",
    10013: "连接 deviceId 为空或者是格式不正确",
  },
  // 系统
  system: {
    name: '居民'
  },
  // 全部选项
  allOptions: {
    text: '全部',
    key: ''
  },
  // 通用message
  message: {
    loading: '加载中',
    scrollLoading: '下滑加载更多数据',
    noMoreEmpty: '暂无数据',
    success: '操作成功',
    fail: '操作失败',
    formWarning: '请输入完整的信息',
    info: '详情',
    deviceName: '设备权限',
    businessHours:'非营业时间',
  },
  // 弹框
  dialog: {
    confirmText: '确认',
    cancelText: '取消',
    refreshText: '刷新',
  },
  // 按钮
  btnName: {
    next: '下一步',
    updateName: '修改',
    submitName: '确认',
    cancelName: '取消',
    deleteName: '删除',
    pay: '缴费',
    printOther: '打印收据',
    printOther1: '打印收据',
    printOtherTwo: '补开收据',
    print: '打印缴费单',
    invoice: '打印发票',
    invoice_1: '打印发票',
    agree: '同意',
    disagree: '不同意',
    selectImg: '请选择图片',
    selectPop: '请选择',
    his_name: '历史姓名',
    fecho: '交接班',
    cadastrar: '打印',
  },
  // 蓝牙
  blueToolth: {
    title: '设备',
    onBlueAuth: '未获取蓝牙权限',
    onBlueAuthContent: '确认跳转至设置页面？',
    cancelText: '取消',
    confirmText: '确认',
    noConnect: '未连接到设备',
    noConnectWarning: "是否跳转设备连接页面？",
    connectDevice: '设备连接中...',
    connectSuccess: '设备连接成功',
    connectfail: '设备连接失败',
    cancel: '已取消',
    printSuccess: '打印成功'
  },
  // 时间选择器
  timeName: {
    today: '今日',
    lastDay: '昨天',
    theWeek: '本周',
    theMonth: '本月',
    lastMonth: '上月',
    sevenDay: '近七天',
    thirtyDay: '近三十天',
    year: "年",
    month: "月",
    day: "日",
  },
  // 历史记录
  historical: {
    title: '提示',
    content: '确认删除？',
    cancelText: '取消',
    confirmText: '确认',
  },
  // 搜索类型
  searchStatusList: [
    {id: 1,text: '水表号'},
    {id: 2,text: '用户名'},
    {id: 3,text: '详细的地址'},
    {id: 4,text: '门牌号'},
    // {id: 5,text: '一公里范围内'},
    // {id: 6,text: '水表类型'},
    {id: 7,text: '欠费数量'},
  ],
  // 其他类发票记录类型
  typeStatusList: [
    {id: 1,text: '全部'},
    {id: 2,text: '正常发票'},
    {id: 3,text: '形式发票'},
  ],
  // 用户状态
  userStatusList: [
    {"text":"正常","key":1},
    {"text":"暂停","key":2},
    {"text":"关闭","key":3}
  ],
  // 首页
  index: {
    lang: '语言',
    searchBar: '请输入水表号',
    btnName: "搜索",
    descriptionEmpty: '搜索数据',
    noEmpty: '暂无数据',
    water: '用水量',
    money: '缴费金额',
    saldo: '账户余额',
    createTime: '查询时间',
    iconSearch: '用户查询',
    iconFunc: '功能',
    iconNotice: '停水公告',
    iconNoticeText: '暂无停水信息',
    wm_name: '用户名',
    wm_no:'水表号',
    historio: '历史记录',
    fecho: '交接班',
    other: '其他',
    jiaofei: '缴费',
    dayin: '打印',
    placeholder: '请输入',
    selecione: '请选择',
    location: '地址',
    parent_type:'种类',
    parent_price: '价格',
    conversion: '一键转换',
    use_status: '用户状态',
    use_activo: '正常',
    use_suspenso: '暂停',
    use_desligado: '关闭',
    facturaType: '类型',
    tabs_1: {
      one: '用户',
      two: '管理员',
    },
    tabs_2: {
      one: '发票',
      two: '缴费单',
      baojia: '报价',
      tab_jl: '记录',
      tab_yjf: '预交费',
    },
    tabs_3: {
      one: '缴费记录',
      two: '删除记录',
    },
    tabs_4: {
      one: '缴费记录',
      two: '删除记录',
    },
    pay_type: '支付方式',
    cheque_number: '支票编码',
    placeholderName: '请输入姓名',
    paid_total_money: '实缴金额',
  },
  // 新增用户
  addAccount: {
    form: [{
        name: '水表号',
        placeholder: '请输入水表号',
        type: 'input',
        key: 'wm_no',
        maxlength: 10,
        required: true,
        is_button: true,
        orientation:'定位'
      },
      {
        name: '共有/独有',
        placeholder: '共有/独有',
        type: 'tot_sim',
        key: 'is_share',
        required: true
      },
      {
        name: '户数',
        placeholder: '户数',
        type: 'input',
        key: 'household_num',
        required: true,
      },
      {
        name: '地区',
        placeholder: '请选择地区',
        type: 'area',
        key: 'area1,area2,area3',
        required: true
      },
      {
        name: '详细地址',
        placeholder: '请输入详细地址',
        type: 'input',
        key: 'wm_address',
        required: true
      },
      {
        name: '门牌号',
        placeholder: '请输入门牌号',
        type: 'input',
        key: 'house_number',
        required: true
      },
      {
        name: '分区',
        placeholder: '请输入分区',
        type: 'area_code',
        key: 'area_code',
        required: true
      },
      {
        name: '初始读数',
        placeholder: '请输入初始读数',
        type: 'input',
        key: 'last_reading',
        required: true
      },
      {
        name: '上次读数时间',
        placeholder: '请选择上次读数时间',
        type: 'date',
        key: 'last_time',
        required: true
      },
      {
        name: '价格类型',
        placeholder: '请选择价格类型',
        type: 'priceType',
        key: 'user_type_id',
        required: true
      },
      {
        name: '是否有污水',
        placeholder: '是否有污水',
        type: 'sewage',
        key: 'sewage_rate',
        required: true
      },
      {
        name: '姓名',
        placeholder: '请输入姓名',
        type: 'input',
        key: 'wm_name',
        required: true
      },
      {
        name: '税号/身份证号',
        placeholder: '税号/身份证号',
        type: 'input',
        // type_digit:'number',
        maxlength: 14,
        key: 'user_card',
        required: true
      },
      
      {
        name: '电话号码',
        placeholder: '请输入电话号码',
        type: 'input',
        key: 'wm_phone',
        required: true
      },
      {
        name: '邮箱',
        placeholder: '请输入邮箱',
        type: 'input',
        key: 'email',
        required: false
      },
    ],
    submit: '确认',
    im_title:'是否打印用户信息?',
    no: '否',
  },
  // 查表缴费
  pay: {
    steps: [{
        desc: '采集查表信息',
        activeIcon: 'success',
      },
      {
        desc: '确认采集信息',
        activeIcon: 'success',
      },
      {
        desc: '缴费、打印收据',
        activeIcon: 'success',
      },
    ],
    collectInfo: {
      title: '用水信息',
      wm_no: '水表号',
      wm_name: '用户名',
      last_water: '上次读数',
      reading: '本次读数',
      total_water: '用水量',
      months: '月份',
      total_money: '应缴金额',
      paid_total_money: '实缴金额',
      last_date:'上次抄表时间',
      now_date:'本次抄表时间',
      createDate: '查询时间',
      waterList: '照片',
      placeholder: '请输入',
      systemPlaceholder: '系统自动带出',
      btnName: "搜索",
      noData: "暂无数据",
      look: "查看附近用户",
      zjsc: '最近三次记录'
    }
  },
  // 今日收费
  todaySummary: {
    noEmpty: '暂无数据',
    todayNumber: '缴费单',
    todayMoney: '金额总数',
    invoice: '发票',
    receipt: '收据',
    cash: '现金',
    pos: 'POS机',
    itemWater: '用水量',
    itemMoney: '缴费金额',
    user_pay_demand_note_count: '收据数量',
    pay_demand_note_count: '收据收费数量',
    user_pay_demand_note_total_money_sum: '收据总金额',
    pay_demand_note_total_money_sum: '收费总金额',
    num: '个',
    tabs_1: {
      one: '用户',
      two: '管理员',
    },
    other: '其他发票类',
  },
  // 上报维修
  reportRepair: {
    wm_no: '水表号',
    area: '地区',
    area_placeholder: '请选择地区',
    address: '详细地址',
    address_placeholder: '请输入详细地址',
    photo: '照片',
    placeholder: '请输入',
    parent_type:'投诉/申请',
    type: '类型',
    remark: '情况',
    btnName: "搜索",
  },
  // 维修
  maintenance: {
    phone: '电话号码',
    location: '地址',
    comNumber: '投诉数量',
    comresNumber: '投诉解决数量',
    reqNumber: '维修数量',
    reqresNumber: '维修完成数量',
    repairUser: '分配人员', 
    selectPop: "请选择",
    distribution: "分配状态",
    distribution_1: "已分配",
    distribution_2: "未分配",
    noEmpty: '暂无数据',
    btnName: "搜索",
    wx_type: '维修类型',
    wx_bz: '备注',
    info: {
      title: '维修信息',
      status: '状态',
      name: '姓名',
      wm_no: '用户名',
      area: '地区',
      address: '详细地址',
      phone: '电话号码',
      report_pic: '照片',
      report_note: '情况',
      placeholder: "请输入"
    },
    tabs_1: {
      one: '全部',
      two: '我的',
    },
  },
  // 营业厅
  businessHall: {

  },
  // 财务经理
  financial: {
    tabs: {
      one: '现金',
      two: 'POS机',
      three: '银行',
    },
    totalNumber: '订单数',
    totalMoney: '缴费金额',
  },
  //交班人
  fecho: {
    title: '缴费单',
    receipt: '收据',
    invoice: '发票',
    price: '金额',
    total_price: '总金额',
    cash: '现金',
    transfer_money: '转账',
    money_zk: '折扣',
    swipe_card: '刷卡',
    zhang: '张',
    name: '姓名',
    operator_name: '交班人',
    submit: '提交打印',
    jbsj: '交班时间',
    actual_amount:'实收金额',
    other: '其他发票类',

  },
  // 用户水表信息修改
  waterInfoEdit: {
    wm_name: '用户名',
    wm_no: '水表号',
    last_water: '末次读数',
    last_time: '末次时间',
    user_type: '水表类型',
    user_card: '税号/身份证号',
    wm_phone: '电话号码',
    is_share: '共有/私有',
    household_num: '户数',
    area: '地区',
    area_placeholder: '请选择地区',
    wm_address: '详情地址',
    house_number: '门牌号',
    area_code: '分区',
    sewage_rate: '是否有污水',
    email: '邮箱',

  },
  // 用水详情
  userWaterInfo: {
    title: '用水信息',
    title_1: '缴费单',
    wm_name: '用户名',
    wm_no: '水表号',
    last_water: '初始读数',
    reading: '本次读数',
    last_water_1:'末次读数',
    total_water: '用水量',
    total_money: '应缴金额',
    total_money_1: '应缴金额',
    createDate: '查询时间',
    waterList: '照片',

    check_detail: '原因',
    placeholder: '请输入',
    pay_type: '支付方式',
    paid_total_money: '实缴金额',
    descontos:'折扣',
    placeholderName: '请输入姓名',
    cheque_number: '支票编码',
    jfjl: '缴费记录',
    jfd: '缴费单',
    jmed: '减免总额',
    jfzje: '缴费总金额',
    jfdzje: '缴费单总金额',
    qfzje: '欠费总额',
    jfdsl: '缴费单数量',
    zhye: '账户余额',
    num: 'un',
    wm_name: '用户名',
    wm_no:'水表号',
    water: '用水量',
    money: '缴费金额',
    createTime: '查询时间',
    f_status: '发票状态',
    s_status: '收据状态',
    wkj_status: '未开具',
    ykj_status: '已开具',
    yqx_status: '已取消',
  },
  // 功能列表
  func: {
    list: [{
        auth: 'L',
        key: '/img/index/add-account.png',
        title: '新增用户',
        color: '#6cbcfc',
        url: '/pages/query-water/add-account/index'
      },
      {
        auth: 'L',
        key: '/img/index/search-pay.png',
        title: '查表缴费',
        color: '#fc9c3c',
        url: '/pages/query-water/pay/collect-info/index'
      },
      {
        auth: 'L',
        key: '/img/index/today-summary.png',
        title: '今日收费',
        color: '#58cab4',
        url: '/pages/query-water/today-summary/index'
      },
      {
        auth: 'L',
        key: '/img/index/report-pepair.png',
        title: '请求维护',
        color: '#58cab4',
        url: '/pages/query-water/report-repair/index'
      },
      {
        auth: 'C',
        key: '/img/index/maintenance.png',
        title: '维修清单',
        color: '#fc9c3c',
        url: '/pages/maintenance/maintenance/index'
      },
      {
        auth: 'R',
        key: '/img/index/business-hall.png',
        title: '缴费和收据',
        color: '#58cab4',
        url: '/pages/business-hall/index/index',
      },
      {
        auth: 'CF',
        key: '/img/index/fm-search-account.png',
        title: '对账',
        color: '#6cbcfc',
        url: '/pages/financial-manager/search-account/index'
      },
      {
        auth: 'GC',
        key: '/img/index/search.png',
        title: '缴费单',
        color: '#6cbcfc',
        url: '/pages/financial-manager/bill-payment/index'
      },
      {
        auth: 'L',
        key: '/img/index/add-account.png',
        title: '用户状态',
        color: '#6cbcfc',
        url: '/pages/query-water/account-status/index'
      },
      {
        auth: 'R',
        key: '/img/index/business-hall.png',
        title: '其他发票',
        color: '#58cab4',
        url: '/pages/query-water/other-invoices/index',
      },
      // {
      //   auth: 'DG',
      //   key: '/img/index/gm-query-report.png',
      //   title: '查看报告',
      //   color: '#6cbcfc',
      //   url: '/pages/general-manager/query-report/index'
      // },
      // addAccount: ['新增用户', '/pages/query-water/add-account/index'],
      // searchPay: ['查表缴费', '/pages/query-water/pay/collect-info/index'],
      // todaySummary: ['今日收费', '/pages/query-water/today-summary/index'],
      // reportRepair: ['请求维护', '/pages/query-water/report-repair/index'],
      // maintenance: ['维修清单', '/pages/maintenance/maintenance/index'],
      // businessHall: ['缴费和收据', '/pages/business-hall/index/index'],
      // fMSearchAccount: ['对账', '/pages/financial-manager/search-account/index'],
      // gMQueryReport: ['查看报告', '/pages/general-manager/query-report/index'],
    ]
  },
  // 我的
  admin: {
    name: '我的',
    meinfo: '员工认证',
    deviceItem: '我的设备',
    lang: '语言',
    employee: {
      name: '员工认证',
      form: [{
          name: '用户名',
          placeholder: '请输入',
          type: 'input',
          key: 'email',
          required: true,
          error: false
        },
        {
          name: '密码',
          placeholder: '请输入',
          type: 'password',
          key: 'password',
          required: true,
          error: false,
        },
        {
          name: '电话号码',
          placeholder: '请输入',
          type: 'input',
          key: 'mobile',
          error: false,
        },
      ],
      submit: '确认'
    },
    bluetoolthDevice: {
      connectDeviceTitle: '已连接设备',
      disConnectDeviceTitle: '待连接设备',
      noDevice: '未查询到设备',
      searching: '搜索附近设备中...',
      noSearchDevice: '暂无发现可用设备！',
      connectDeviceing: '设备连接中...',
      defaultDevice: '默认设备',
      isDefaultDevice: '是否将设置为常用设备？',
      success: '设备连接成功',
      fail: '设备连接失败',
      noDeviceBuleToolth: '未连接蓝牙设备'
    },
    setLang: {
      label: '设备语言',
      placeholder: '请选择'
    }
  },
  // tabber
  tabber: {
    list: [{
        no: 0,
        pagePath: "/pages/index/index",
        icon: 'home-o',
        text: "首页"
      },
      {
        no: 1,
        pagePath: "/pages/admin/index",
        icon: 'setting-o',
        text: "我的"
      }
    ]
  }
}

export default zh_lang