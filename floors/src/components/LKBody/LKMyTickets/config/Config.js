/*
    Created on : 02.06.2016, 10:30:05
    Author     : zemlyanov
*/

const Config = [
  {
    typeId: [2,4,10,13,15,17],
    name: 'sellOrRent',
    title: 'Разместите недвижимость на сайте, не выходя из дома',
    activeTitle: ['У вас', ['предложение', 'предложения', 'предложений']],
    remarkHead: 'Ссылка на объект',
    remarkAction: 'objectLink',
    desc: 'Создайте предложение о продаже или аренде. Получите оценку рыночной стоимости и следите за спросом на вашу недвижимость!', //eslint-disable-line max-len
    icon: 'https://cdn-media.etagi.com/static/site/1/16/16cf9a58a531b40d50d5fe61064bdae3a8a54862.png', //eslint-disable-line max-len
    submit: {
      title: 'Продать недвижимость',
      ticketCreate: null,
      link: '#/myobjects/add'
    },
    extraSubmit: {
      title: 'Сдать недвижимость',
      ticketCreate: null,
      link: '#/myobjects/add'
    },
    activeSubmit: {
      desc: 'Добавьте еще предложение о продаже или аренде, не выходя из дома.',
      title: 'Добавить недвижимость',
      ticketCreate: null,
      link: '#/myobjects/add'
    }
  },
  {
    typeId: [132],
    name: 'review',
    title: 'Запишитесь на просмотр понравившейся недвижимости',
    activeTitle: ['Вы записались на', ['просмотр', 'просмотра', 'просмотров']],
    remarkHead: 'Время просмотра',
    remarkAction: 'datetime',
    desc: 'Организуем бесплатный просмотр выбранных вами объектов недвижимости в удобное вам время на автомобиле агентства.', //eslint-disable-line max-len
    icon: 'https://cdn-media.etagi.com/static/site/5/52/52996ae508b50011d62ef800c09ddd8464473bc3.png', //eslint-disable-line max-len
    submit: {
      title: 'Записаться на просмотр',
      ticketCreate: true,
      link: null,
      advancedSource: 'LK Objects Review Request',
      message: 'Запрос на просмотр объектов от пользователя ЛК, список выбранных объектов: ${objs} выбранное время: ${dateFormatted}' //eslint-disable-line max-len
    },
    extraControls: [
      'datetimeSelector',
      'objectsFromFavs'
    ],
    activeSubmit: {
      desc: 'Запишитесь на просмотр других объектов.',
      title: 'Записаться на просмотр',
      ticketCreate: true,
      link: null,
      controls: [
        'datetimeSelector',
        'objectsFromFavs'
      ]
    }
  },
  {
    typeId: [6],
    name: 'mortgage',
    title: 'Оформите ипотеку онлайн',
    activeTitle: ['Оформите ипотеку онлайн'],
    remarkHead: '',
    remarkAction: null,
    desc: 'Пройдите онлайн-заявку на ипотеку за 5 минут! Одна анкета во все банки. Вам не нужно посещать офис.', //eslint-disable-line max-len
    icon: 'https://cdn-media.etagi.com/static/site/4/4f/4f4808067f9c6bf6acb32933fcbe741b468a3e55.png', //eslint-disable-line max-len
    submit: {
      title: 'Оформить ипотеку онлайн',
      ticketCreate: null,
      link: '/ipoteka/'
    },
    activeSubmit: {
      desc: 'Пройдите онлайн-заявку на ипотеку за 5 минут! Одна анкета во все банки. Вам не нужно посещать офис.', //eslint-disable-line max-len
      title: 'Подать заявку',
      ticketCreate: null,
      link: '/ipoteka/'
    }
  },
  {
    typeId: [28],
    name: 'photo',
    title: 'Закажите профессиональные фотографии',
    activeTitle: ['Вы заказали бесплатное фотографирование'],
    remarkHead: 'Время съемки',
    remarkAction: 'datetime',
    desc: 'Качественные фотографии недвижимости произведут правильное впечатление и привлекут потенциальных клиентов. Оставьте заявку, фотограф приедет в удобное вам время.', //eslint-disable-line max-len
    icon: 'https://cdn-media.etagi.com/static/site/1/1e/1e0879ad70c89631e64fc0adf07a9801e3a53190.png', //eslint-disable-line max-len
    submit: {
      title: 'Заказать фотографирование',
      ticketCreate: true,
      link: null,
      advancedSource: 'LK Professional photo Request',
      message: 'Запрос на профессиональное фотографирование объекта от пользователя ЛК, выбранный объект: ${objs} выбранное время: ${dateFormatted}' //eslint-disable-line max-len
    },
    extraControls: [
      'datetimeSelector',
      'objectsFromMyObjects'
    ],
    activeSubmit: {
      desc: 'Закажите фотографирование других объектов.',
      title: 'Заказать фотографирование',
      ticketCreate: true,
      link: null,
      controls: [
        'datetimeSelector',
        'objectsFromMyObjects'
      ]
    }
  },
  {
    typeId: [116],
    name: 'layout',
    title: 'Закажите обрисованную планировку',
    activeTitle: ['Вы заказали бесплатную обрисовку планировки'],
    remarkHead: 'Загруженный файл',
    remarkAction: 'attach',
    desc: 'Бесплатно отрисуем для вас красивую планировку! Прикрепите скан или фотографию плана вашей недвижимости.', //eslint-disable-line max-len
    icon: 'https://cdn-media.etagi.com/static/site/e/ed/ed4761924888aeefdd8b769e2334e0244d7e1712.png', //eslint-disable-line max-len
    submit: {
      title: 'Заказать обрисовку',
      ticketCreate: true,
      link: null,
      advancedSource: 'LK Professional layout Request',
      message: 'Запрос на обрисовку планировки объекта от пользователя ЛК, выбранный объект: ${objs} прикрепленный файл: ${attach}' //eslint-disable-line max-len
    },
    extraControls: [
      'objectsFromMyObjects',
      'attach'
    ],
    activeSubmit: {
      desc: 'Закажите планировку для других объектов.',
      title: 'Заказать обрисовку',
      ticketCreate: true,
      link: null,
      controls: [
        'objectsFromMyObjects',
        'attach'
      ]
    }
  },
];

export default Config;
