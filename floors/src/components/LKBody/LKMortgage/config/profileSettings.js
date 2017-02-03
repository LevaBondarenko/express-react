/*
    Created on : 02.06.2016, 10:30:05
    Author     : zemlyanov
*/

const profileSettings = [
  {
    title: 'Персональные данные',
    description: 'Расскажите нам о себе',
    fields: {
      166: {required: false, lk: 'f'},
      167: {required: true, lk: 'i'},
      168: {required: false, lk: 'o'},
      169: {required: false, titleOverride: 'Дата рождения', lk: 'birthday'},
      205: {required: true, titleOverride: 'Мобильный телефон', lk: 'phone'},
      224: {required: false, lk: 'email'}
    }
  },
  {
    title: 'Адреса',
    description: 'Заполните данные о месте проживания',
    fields: {
      295: {required: false},
      300: {required: false},
      375: {required: false, outputNameOverride: 'radio'}
    }
  },
  {
    title: 'Семейное положение',
    description: 'Заполните информацию о семейном положении',
    fields: {
      197: {required: true, outputNameOverride: 'radio'},
      470: {
        required: false,
        titleOverride: 'Социальный статус супруга(и)',
        outputNameOverride: 'radio'
      },
      739: {required: true},
      854: {required: false}
    }
  },
  {
    title: 'Профессиональная деятельность',
    description: 'Расскажите, где вы учились, работаете, и какой у вас стаж',
    fields: {
      222: {required: false},
      399: {required: true},
      410: {required: false, outputNameOverride: 'radio'},
      401: {required: false, outputNameOverride: 'radio'},
      505: {
        required: true,
        titleOverride: 'Стаж в данной организации (в месяцах)'
      },
      597: {
        required: false,
        titleOverride: 'Общий стаж (в месяцах)'
      }
    },
  },
  {
    title: 'Доходы и расходы',
    description: 'Для одобрения ипотеки банку важно знать ваш среднемесячный доход и затраты', //eslint-disable-line max-len
    groups: [
      {title: 'Доходы', fields: [230, 231, 674]},
      {title: 'Расходы', fields: [239, 240, 242]}
    ],
    fields: {
      373: {required: true, outputNameOverride: 'radio'},
      230: {required: true},
      231: {required: false},
      674: {required: false},
      239: {required: false},
      240: {required: false},
      242: {required: false}
    }
  },
  {
    title: 'Параметры кредита',
    description: 'Расскажите, какую недвижимость вы хотите купить и сколько она стоит', //eslint-disable-line max-len
    fields: {
      359: {required: false, outputNameOverride: 'radio'},
      501: {required: false},
      185: {required: false},
      524: {required: true},
      710: {required: false, titleOverride: 'Срок запрашиваемого кредита'},
      642: {required: false, titleOverride: 'Комментарий'},
      860: {reuired: true}
    }
  },
  {
    title: 'Загрузка документов, необходимых для одобрения',
    description: 'Загрузка документов не является обязательным этапом, и документы можно подвезти к нам в офис, однако, мы предлагаем Вам воспользоваться данной опцией, чтобы сэкономить время.', //eslint-disable-line max-len
    attachs: true,
    fields: {
      archive: {
        outputNameOverride: 'file',
        titleOverride: 'Перетащите сюда архив в формате rar, zip, 7z, tar, gz или pdf, чтобы загрузить весь комплект документов одним файлом.', //eslint-disable-line max-len
        descr: 'Архив документов',
        typeId: 99999,
        rules: {}
      },
      clientPassport: {
        outputNameOverride: 'file',
        titleOverride: 'Паспорт (копия)',
        descr: 'Копия ВСЕХ страниц паспорта',
        typeId: 2,
        multipage: true,
        rules: {}
      },
      educationDoc: {
        outputNameOverride: 'file',
        titleOverride: 'Документ об образовании',
        descr: 'Копия документов об образовании (диплом, аттестат и прочее)',
        typeId: 10,
        multipage: false,
        rules: {}
      },
      snils: {
        outputNameOverride: 'file',
        titleOverride: 'Страховое свидетельство государственного пенсионного страхования', //eslint-disable-line max-len
        descr: 'Копия страхового свидетельства государственного пенсионного страхования', //eslint-disable-line max-len
        typeId: 3,
        multipage: false,
        rules: {}
      },
      marriageCert: {
        outputNameOverride: 'file',
        titleOverride: 'Свидетельство о регистрации брака',
        descr: 'Свидетельство о регистрации брака',
        typeId: 7,
        multipage: false,
        rules: {197: 133}
      },
      spousePassport: {
        outputNameOverride: 'file',
        titleOverride: 'Паспорт супруги(а) (копия)',
        descr: 'Копия ВСЕХ страниц паспорта',
        typeId: 2,
        multipage: true,
        rules: {197: 133}
      },
      deathCert: {
        outputNameOverride: 'file',
        titleOverride: 'Свидетельство о смерти супруги(а)',
        descr: 'Свидетельство о смерти супруги(а)',
        typeId: 7,
        multipage: false,
        rules: {197: 135}
      },
      divorceCert: {
        outputNameOverride: 'file',
        titleOverride: 'Свидетельство о расторжении брака',
        descr: 'Свидетельство о расторжении брака',
        typeId: 7,
        multipage: false,
        rules: {197: 136}
      },
      employmentBook: {
        outputNameOverride: 'file',
        titleOverride: 'Трудовая книжка',
        descr: 'Заверенная  копия всех заполненных страниц трудовой книжки',
        typeId: 11,
        multipage: true,
        rules: {399: 4177}
      },
      employmentContract: {
        outputNameOverride: 'file',
        titleOverride: 'Копия трудового договора',
        descr: 'Копия трудового договора',
        typeId: 9999,
        multipage: true,
        rules: {399: 4177, 505: '<6'}
      },
      incomeProof: {
        outputNameOverride: 'file',
        titleOverride: '2 НДФЛ',
        descr: 'Справка о среднемесячной заработной плате по форме 2-НДФЛ',
        typeId: 12,
        multipage: false,
        rules: {399: 4177}
      }
    }
  }
];

export default profileSettings;