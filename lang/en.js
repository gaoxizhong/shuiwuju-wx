const en_lang = {
  // 错误码
  errorInfo: {
    10001: "Dispositivos bluetooth não está disponível",
    10002: "Dispositivo especificado não encontrado",
    10003: "Falha na conexão",
    10004: "Serviço especificado não encontrado",
    10005: "Recurso especificado não encontrado",
    10006: "Conexão atual foi desligada",
    10007: "Características atuais não suportam esta ação",
    10008: "Todas as outras exceções que relatórios do sistema",
    10009: "BLE não é suportado para versões do sistema abaixo de 4.3",
    10012: "Tempo limite de conexão",
    10013: "DeviceId da conexão está vazio ou está no formato incorreto",
  },
  // 系统
  system: {
    name: 'Residente'
  },
  // 全部选项
  allOptions: {
    text: 'Tudo',
    key: ''
  },
  // 通用message
  message: {
    loading: 'carregando...',
    scrollLoading: 'Role para baixo Carregar mais dados',
    noMoreEmpty: 'Não existe actualmente informação',
    success: 'Operação com sucesso',
    fail: 'Falha na operação',
    formWarning: 'Insira as informações completas',
    info: 'Detalhes',
    deviceName: 'Permissões para dispositivos',
    historio: 'Historio',
    fecho: 'Fecho'
  },
  // 弹框
  dialog: {
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    refreshText: 'Actualizar',
  },
  // 按钮
  btnName: {
    next: 'Próximo passo ',
    updateName: 'Passo anterior',
    submitName: 'Confirmar',
    cancelName: 'Cancelar',
    deleteName: 'Apagar',
    pay: 'Pagamento',
    printOther: 'Imprimir recibo',
    printOtherTwo: 'Reabastecimento de recibos',
    print: 'Factura Simplificada',
    invoice: 'Imprimir As facturas',
    invoice_1: 'Factura/recibo',
    agree: 'Concordo',
    disagree: 'A permissão Bluetooth não é obtida',
    selectImg: 'Por favor, selecione uma imagem',
    selectPop: 'Por favor selecione',
    his_name: 'Nome da história',
    fecho: 'Fecho',
  },
  // 蓝牙
  blueToolth: {
    title: 'Dispositivo',
    onBlueAuth: 'A permissão Bluetooth não é obtida',
    onBlueAuthContent: 'ir para a página de configurações?',
    cancelText: 'No',
    confirmText: 'Ok',
    noConnect: "Não conectado ao dispositivo",
    noConnectWarning: "Deseja ir para a página de conexão do dispositivo?",
    connectDevice: 'Dispositivo conectado em...',
    connectSuccess: 'Dispositivo conectado com sucesso',
    connectfail: 'Falha na conexão do dispositivo',
    cancel: 'Cancelado',
    printSuccess: 'Imprimir com sucesso'
  },
  // 时间选择器
  timeName: {
    today: 'Hoje',
    lastDay: 'Ontem',
    theWeek: 'Esta semana',
    theMonth: 'Este mês',
    lastMonth: 'Mês passado',
    sevenDay: 'últimos sete dias',
    thirtyDay: 'Nos últimos trinta dias',
    year: "Ano",
    month: "Mês",
    day: "Dia",
  },
  // 首页
  index: {
    lang: 'Línguas',
    searchBar: 'Digite Dados do contador',
    btnName: "Pesquisar",

    descriptionEmpty: 'Pesquisar Dados',
    noEmpty: 'Dados não disponíveis ainda',

    water: 'Consumo de água',
    money: 'Valor a pagar',
    saldo: 'Saldo da conta',
    createTime: 'Hora de leitura',

    iconSearch: 'Consulta',
    iconFunc: 'Função',
    iconNotice: 'Anúncio de parada de água',
    iconNoticeText: 'Não há informações de parada de água ainda',
    wm_name: 'Nome do Cliente',
    historio: 'Historio',
    fecho: 'Fecho',
    jiaofei: 'Pagamento',
    dayin: 'Imprimir'
  },
  // 新增用户
  addAccount: {
    form: [{
        name: 'Serie do Contador',
        placeholder: 'Digite Dados do contador',
        type: 'input',
        key: 'wm_no',
        maxlength: 10,
        required: true,
        is_button: true,
        orientation:'localização'
      },
      {
        name: 'Totalizador/Normal',
        placeholder: 'Totalizador/Normal',
        type: 'tot_sim',
        key: 'is_share',
        required: true
      },
      {
        name: 'Unidades',
        placeholder: 'Unidades',
        type: 'input',
        key: 'household_num',
        required: true,
      },
      {
        name: 'Localidade',
        placeholder: 'Escolha Localidade',
        type: 'area',
        key: 'area1,area2,area3',
        required: true
      },
      {
        name: 'Endereço detalhado',
        placeholder: 'Preencher o endereço detalhado',
        type: 'input',
        key: 'wm_address',
        required: true
      },
      {
        name: 'Nº de Porta',
        placeholder: 'Nº de Porta',
        type: 'input',
        key: 'house_number',
        required: true
      },
      {
        name: 'Giro/Zona',
        placeholder: 'Giro/Zona',
        type: 'area_code',
        key: 'area_code',
        required: true
      },
      {
        name: 'Leitura anterior',
        placeholder: 'Preecher o Leitura anterior de Registo',
        type: 'input',
        key: 'last_reading',
        required: true
      },
      {
        name: 'Data de Registo',
        placeholder: 'Preecher a data de Registo',
        type: 'date',
        key: 'last_time',
        required: true
      },
      {
        name: 'Categoria Tarifaria',
        placeholder: 'Categoria Tarifaria',
        type: 'priceType',
        key: 'user_type_id',
        required: true
      },
      {
        name: 'Agua Residuais',
        placeholder: 'Agua Residuais',
        type: 'sewage',
        key: 'sewage_rate',
        required: true
      },
      {
        name: 'Consumidor',
        placeholder: 'Preencher o nome do consumidor',
        type: 'input',
        key: 'wm_name',
        required: true
      },
      {
        name: 'NIF/BI',
        placeholder: 'Preencher o NIF/BI',
        type: 'input',
        // type_digit:'number',
        maxlength: 14,
        key: 'user_card',
        required: true
      },
      {
        name: 'Telefone',
        placeholder: 'Digite número de telefone',
        type: 'input',
        key: 'wm_phone',
        required: true
      },
      {
        name: 'Email',
        placeholder: 'Digite número de Email',
        type: 'input',
        key: 'email',
        required: false
      },
    ],
    submit: 'Confirmar'
  },
  // 查表缴费
  pay: {
    steps: [{
        desc: 'Coleta informações',
        activeIcon: 'success',
      },
      {
        desc: 'Confirme informações',
        activeIcon: 'success',
      },
      {
        desc: 'Pagamento e imprimir',
        activeIcon: 'success',
      },
    ],
    collectInfo: {
      title: 'Informações de comsumir água',
      wm_no: 'Dados do contador',
      wm_name: 'Nome do Cliente',
      last_water: 'Leitura anterior',
      reading: 'Leitura do contador',
      total_water: 'Consumo de água',
      months: 'Em julho',
      total_money: 'Montante a pagar',
      paid_total_money: 'Valor a pagar',
      last_date:'Ultima data',
      now_date:'Esta data',
      createDate: 'Hora da consulta',
      waterList: 'Fotos',
      placeholder: 'Por favor, digite',
      systemPlaceholder: 'O sistema calcula automaticamente',
      btnName: "Pesquisar",
      noData: "Dados não disponíveis",
      look: "Ver usuários próximos"
    }
  },
  // 今日收费
  todaySummary: {
    todayNumber: 'Factura Simplificada',
    todayMoney: 'Valor total',
    cash: 'Numerário',
    pos: 'Cartão Multicaixa',
    itemWater: 'Consumo de água',
    itemMoney: 'Valor a pagar',
    num: 'un',
  },
  // 上报维修
  reportRepair: {
    form: [{
        name: 'Dados do contador',
        placeholder: 'Por favor, digite',
        type: 'input',
        key: 'wm_no',
        required: false,
        error: false,
      },
      {
        name: 'Localidade',
        placeholder: 'Escolha Localidade',
        type: 'area',
        key: 'area1,area2,area3',
        required: false,
        error: false,
      },
      {
        name: 'Endereço detalhado',
        placeholder: 'Preencher o endereço detalhado',
        type: 'input',
        key: 'wm_address',
        required: false,
        error: false,
      },
    ],
    photo: 'Fotos',
    placeholder: 'Por favor, digite',
    type: 'Tipo de falha',
    remark: 'Situação',
  },
  // 维修
  maintenance: {
    phone: 'Telefone',
    location: 'Localidade',
    info: {
      title: 'Informações de reparação',
      status: 'Status',
      name: 'Consumidor',
      wm_no: 'Nome de usuário',
      area: 'Localidade',
      address: 'Endereço detalhado',
      phone: 'Telefone',
      report_pic: 'Fotos',
      report_note: 'Situação',
      placeholder: "Por favor insira"
    }
  },
  // 营业厅
  businessHall: {

  },
  // 财务经理
  financial: {
    tabs: {
      one: 'Numerário',
      two: 'Cartão Multicaixa',
      three: 'Banco',
    },
    totalNumber: 'Número da ordem',
    totalMoney: 'Valor a pagar',
  },
  //交班人
  fecho: {
    title: 'Factura Simplificada',
    price: 'Valor a pagar',
    name: 'nome',
    operator_name: 'Pessoa de entrega',
    total_price: 'Valor total',
    cash: 'dinheiro',
    transfer_money: 'transferência',
    swipe_card: 'pos',
    submit: 'impressão',
    receipt: 'recibo',
    invoice: 'As facturas',
    zhang: 'un',
    jbsj: 'Horário de turno',
  },
  // 用水详情
  userWaterInfo: {
    title: 'Informações de comsumir água',
    title_1: 'Factura Simplificada',
    wm_name: 'Nome do Cliente',
    wm_no: 'Dados do contador',
    last_water: 'Leitura anterior',
    reading: 'Leitura do contador',
    last_water_1: 'Leitura O último',
    total_water: 'Consumo de água',
    total_money: 'valor da factura',
    total_money_1: 'valor da factura',
    createDate: 'Date',
    waterList: 'Fotos',

    check_detail: 'Causa',
    placeholder: 'Por favor, digite',
    pay_type: 'Métodos de Pagamento',
    paid_total_money: 'Valor real pago',
    placeholderName: 'Preencher o nome do pedágio',
  },
  // 功能列表
  func: {
    list: [{
        auth: 'L',
        key: '/img/index/add-account.png',
        title: 'Cadastrar',
        tabberName: 'Cadastrar consumidor',
        color: '#6cbcfc',
        url: '/pages/query-water/add-account/index'
      },
      {
        auth: 'L',
        key: '/img/index/search-pay.png',
        title: 'Leituras',
        tabberName: 'Factura Simplificada',
        color: '#fc9c3c',
        url: '/pages/query-water/pay/collect-info/index'
      },
      {
        auth: 'L',
        key: '/img/index/today-summary.png',
        title: 'Impressos',
        tabberName: 'Impressos',
        color: '#58cab4',
        url: '/pages/query-water/today-summary/index'
      },
      {
        auth: 'L',
        key: '/img/index/report-pepair.png',
        title: 'Manutenção',
        tabberName: 'Mautenção e Reparação',
        color: '#58cab4',
        url: '/pages/query-water/report-repair/index'
      },
      {
        auth: 'C',
        key: '/img/index/maintenance.png',
        title: 'Extratos',
        tabberName: 'Tavefas de Revisão',
        color: '#fc9c3c',
        url: '/pages/maintenance/maintenance/index'
      },
      {
        auth: 'R',
        key: '/img/index/business-hall.png',
        title: 'Caixa',
        tabberName: 'Pagamento e recibo',
        color: '#58cab4',
        url: '/pages/business-hall/index/index',
      },
      {
        auth: 'CF',
        key: '/img/index/fm-search-account.png',
        title: 'Finanças',
        tabberName: 'Verificação financeira',
        color: '#6cbcfc',
        url: '/pages/financial-manager/search-account/index'
      },
      // {
      //   auth: 'DG',
      //   key: '/img/index/gm-query-report.png',
      //   title: 'Relatório',
      //   tabberName: 'Relatório'
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
    name: 'EU',
    meinfo: 'Autenticação de funcionários',
    deviceItem: 'Meu dispositivo',
    lang: 'Línguas',
    employee: {
      name: 'Autenticação de funcionários',
      form: [{
          name: 'Nome de usuário',
          placeholder: 'Por favor, digite',
          type: 'input',
          key: 'email',
          required: true,
          error: false
        },
        {
          name: 'Senha',
          placeholder: 'Por favor, digite',
          type: 'password',
          key: 'password',
          required: true,
          error: false,
        },
        {
          name: 'Telefone',
          placeholder: 'Por favor, digite',
          type: 'input',
          key: 'mobile',
          error: false,
        },
      ],
      submit: 'Confirmar'
    },
    bluetoolthDevice: {
      connectDeviceTitle: 'Dispositivos já conectados',
      disConnectDeviceTitle: 'Dispositivo a ser conectado',
      noDevice: 'Dispositivo não Pesquisardo',
      searching: 'Pesquise dispositivos próximos...',
      noSearchDevice: 'Nenhum dispositivo disponível encontrado！',
      connectDeviceing: 'Fispositivo conectado em...',
      defaultDevice: 'Fispositivo padrão',
      isDefaultDevice: 'Seja definido dispositivo',
      success: 'Dispositivo conectado com sucesso',
      fail: 'Falha na conexão do dispositivo',
      noDeviceBuleToolth: 'Dispositivo bluetooth não conectado'
    },
    setLang: {
      label: 'Línguas',
      placeholder: 'Por favor selecione'
    }
  },
  // tabber
  tabber: {
    list: [{
        no: 0,
        pagePath: "/pages/index/index",
        icon: 'home-o',
        text: "Geral"
      },
      {
        no: 1,
        pagePath: "/pages/admin/index",
        icon: 'setting-o',
        text: "EU"
      }
    ]
  }
}

export default en_lang