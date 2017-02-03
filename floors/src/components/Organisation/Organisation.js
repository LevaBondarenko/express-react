/**
 * Slider widget class
 *
 * @ver 0.0.1
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; //eslint-disable-line no-unused-vars
import {map, isNaN} from 'lodash';
import {priceCleanup, phoneFormatter, generateSearchUrl}
  from '../../utils/Helpers';
import {sendOrder} from '../../utils/requestHelpers';
import request from 'superagent';

/*global data*/
/*global ymaps*/
class Organisation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    this.getFields = this.getFields.bind(this);
  }

  getFields() {
    return new Promise(resolve => {
      const dataArr = {
        'action': 'get_org',
        'la': this.props.gk_la,
        'lo': this.props.gk_lo,
        'object_id': this.props.object_id,
        'class': this.props.class,
        'widget_id': this.props.id,
        'post_id': this.props.post_id.toString()
      };
      const uri = generateSearchUrl(dataArr, '/backend/?');

      request
        .get(uri)
        .set({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'Cache-Control': 'public, max-age=21600'
        }).end((err, res) => {
          if (res.body) {
            const body = res.body;

            this.setState(() => ({
              la: body.la,
              lo: body.lo,
            }));
            resolve(body);
          }
        });
    });
  }

  componentDidMount() {
    const props = this.props;

    const {
      cityId,
      traffic,
      typeMap,
      ticketType
      } = this.props;

    // запрашиваем с сервера данные по карте
    this.getFields()
      .then(response => {
        const {
          'la': gkLa,
          'lo': gkLo,
          'data': fields
        } = response;

        $(document).ready(() => {
          $(document).on('click', '#submitYaForm', () => {
            const nameYa = $('#nameYaForm').val() ?
              $('#nameYaForm').val() : 'БезиИмени';
            const phoneYa = $('#phoneYaForm').val();
            const objectData = data.object.info;
            let source;
            let typeId;

            switch (props.position) {
            case 'builder':
              source = `страница застройщика - ${props.builder}`;
              typeId = ticketType === 'auto' ? 7 : ticketType;
              break;
            case 'realty':
              source = `страница объекта вторички -
                ${data.object.info.object_id}`;
              const realtyTypes = {
                'flats': 3,
                'rent': 5,
                'cottages': 11
              };

              // определяем тип заявки
              if (objectData.table && ticketType === 'auto') {
                typeId = realtyTypes[objectData.table];
              } else {
                typeId = ticketType;
              }
              break;
            case 'jk':
              source = `страница объекта новостройки -
                ${data.object.info.info.gp_short}
                  (${data.object.info.id})`;
              typeId = ticketType === 'auto' ? 7 : ticketType;
              break;
            case 'commerce':
              source = `страница объекта коммерческой -
                ${data.object.info.object_id}`;
              typeId = ticketType === 'auto' ?
               (objectData.action_sl === 'sale' ? 14 : 16) : ticketType;
              break;
            default:
              source = 'положение не определено';
              break;
            }

            const strMessage = `Ваш телефон: ${phoneYa}, ${source}
            . Заявка с яндекс карты (инфраструктуры)`;

            if (phoneYa) {

              if (phoneYa.length >= 17) {
                const dataSend = {
                  action: 'create_ticket',
                  name: nameYa,
                  phone: priceCleanup(phoneYa),
                  message: strMessage,
                  source: 'Web',
                  city_id: cityId, //eslint-disable-line camelcase
                  advancedSource: 'ticket_new_site',
                  type_id: typeId //eslint-disable-line camelcase
                };

                sendOrder(dataSend).then(response => {
                  if (response.ajax.success) {
                    let href = window.location.pathname.substr(1);

                    href = href ? href.split('/')[0] : 'main';
                    document.location.href =
                      `${window.location.origin}/thank-you/?from=${href}`;
                  }
                }, error => {
                  /* eslint-disable no-console */
                  console.log(error);
                });
              } else {
                $('#noticePhoneYaForm').html('Введите телефон полностью');
              }
            } else {
              $('#noticePhoneYaForm').html('Введите телефон');

              return;
            }
          });
          $(document).on('keypress change', '#phoneYaForm', (event) => {
            const val = $('#phoneYaForm').val();

            if (
              (event.keyCode == 65 && event.ctrlKey === true) ||
              (event.keyCode >= 35 && event.keyCode <= 39)) {
              return;
            } else {
              $('#phoneYaForm').val(phoneFormatter(
                val,
                data.options.countryCode.current,
                data.options.countryCode.avail
              ));
            }
          });
        });

        let myMap, myPlacemark;
        const imgBallun = {};

        function init() {
          imgBallun.bank = 'dee4e7619224fdfe42ab96f14ec77a0bcb436649.png';
          imgBallun.fitness = '5bdaacea241a2423eaffb88931f7c9114e4c9f09.png';
          imgBallun.gymnasium = '7add952bf51551348540ab9f6694e1961e056b04.png';
          imgBallun.hospital = '4d4312320ee5194597eff4621760912afd229262.png';
          imgBallun.polyclinic = '4d4312320ee5194597eff4621760912afd229262.png';
          imgBallun.kinder = 'b13f7912d83e3515487901196b873431a9634754.png';
          imgBallun.school = '7add952bf51551348540ab9f6694e1961e056b04.png';
          imgBallun.shopping = 'ec710d2eaad44049e47dd9c087b5836ad0d2d6e5.png';

          const typeMapVal = typeMap ? typeMap : 'publicMap';

          // Создание экземпляра карты и его привязка к контейнеру с
          // заданным id ("map").
          myMap = new ymaps.Map('map', {
            // При инициализации карты обязательно нужно указать
            // её центр и коэффициент масштабирования.
            center: [gkLa, gkLo], // Центер карты, координаты новостройки
            zoom: 16,
            controls: ['zoomControl'],
            type: `yandex#${typeMapVal}`
          });

          const trafficSwitcher = traffic ? +traffic : 1;

          if (trafficSwitcher) {
            // Создадим провайдер пробок "Сейчас" с включенным слоем инфоточек.
            const actualProvider = new ymaps.traffic.provider.Actual(
              {},
              {infoLayerShown: true}
            );

            // И затем добавим его на карту.
            actualProvider.setMap(myMap);
          }

          const gp = new ymaps.GeoObjectCollection();
          const bank = new ymaps.GeoObjectCollection();
          const fitness = new ymaps.GeoObjectCollection();
          const gymnasium = new ymaps.GeoObjectCollection();
          const hospital = new ymaps.GeoObjectCollection();
          const kinder = new ymaps.GeoObjectCollection();
          const shopping = new ymaps.GeoObjectCollection();

          myPlacemark = new ymaps.Placemark(
            [gkLa, gkLo],
            {
              balloonContent: `<div class="blockYaForm">
            <div class="bgYaForm"></div>
            <p class="titleYaForm">Посетите этот объект и оцените
              инфраструктуру района!</p>
            <p>Организуем бесплатный просмотр на автомобиле агентства. </p>
            <input type="text" class="form-etagi col-md-12" id="nameYaForm"
                   value="" placeholder="Ваше имя" name="name" />
            <p id="noticeNameYaForm">&nbsp;</p>
            <input type="text" class="form-etagi col-md-12" id="phoneYaForm"
                   value="" placeholder="Ваш телефон" maxlength="18"
                   name="phone" />
            <p id="noticePhoneYaForm">&nbsp;</p>
            <input type="button" class="btn btn-green btn-searchform"
                   id="submitYaForm" value="Записаться на просмотр" />
          </div>`,
              // Свойства
              hintContent: 'Кликните, чтобы записаться на бесплатный просмотр!',
              imgbal: '<img' +
              ' src="//cdn-media.etagi.com/static/site/0/0d/' +
              '0d2425265fa6a8de29610c060e472d38009595ac.png"' +
              ' width="31" height="39">'
              //imgbal: 'default#yellow'
            }, {
              balloonShadow: false,
              balloonPanelMaxMapArea: 0,
              iconLayout: 'default#image',
              iconImageHref: '//cdn-media.etagi.com/static/site/0/0d/' +
              '0d2425265fa6a8de29610c060e472d38009595ac.png',
              iconImageSize: [31, 39],
              iconImageOffset: [-16, -45],
              draggable: false,
              overflow: 'visible'
            });

          gp.add(myPlacemark);

          map(fields, (cat, keyCat) => {
            const catCollection = keyCat === 'bank' ? 'bank' :
              keyCat === 'fitness' ? 'fitness' :
                keyCat === 'gymnasium' ? 'gymnasium' :
                  keyCat === 'school' ? 'gymnasium' :
                    keyCat === 'hospital' ? 'hospital' :
                      keyCat === 'polyclinic' ? 'hospital' :
                        keyCat === 'kinder' ? 'kinder' :
                          keyCat === 'shopping' ? 'shopping' : '';
            const imgSymbols = imgBallun[keyCat].toString().substr(0, 2);

            map(cat, val => {
              myPlacemark = new ymaps.Placemark(
                [val.object_lo, val.object_la],
                {
                  balloonContent: `<p>
                <strong class="larger">${val.object_title}</strong> <br />
                <strong>Адрес:</strong>${val.address} <br />
              </p>`,
                  // Свойства
                  hintContent: val.object_title,
                  imgbal: `<img src="//cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${imgBallun[keyCat]}" width="31" height="45">` // eslint-disable-line max-len
                },
                {
                  balloonShadow: false,
                  iconLayout: 'default#image',
                  iconImageHref: `//cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${imgBallun[keyCat]}`, // eslint-disable-line max-len
                  iconImageSize: [31, 45],
                  iconImageOffset: [-16, -45],
                  draggable: false
                });
              switch (catCollection) {
              case 'bank':
                bank.add(myPlacemark);
                break;
              case 'fitness':
                fitness.add(myPlacemark);
                break;
              case 'gymnasium':
                gymnasium.add(myPlacemark);
                break;
              case 'hospital':
                hospital.add(myPlacemark);
                break;
              case 'kinder':
                kinder.add(myPlacemark);
                break;
              case 'shopping':
                shopping.add(myPlacemark);
                break;
              default:
              }
            });

            switch (catCollection) {
            case 'bank':
              addMenuItem('Банки', 'bank', bank);
              break;
            case 'fitness':
              addMenuItem('Фитнес центры', 'fitness', fitness);
              break;
            case 'gymnasium':
              addMenuItem('Школы и гимназии', 'gymnasium', gymnasium);
              break;
            case 'hospital':
              addMenuItem('Больницы и поликлиники', 'hospital', hospital);
              break;
            case 'kinder':
              addMenuItem('Детские сады', 'kinder', kinder);
              break;
            case 'shopping':
              addMenuItem('Торговые центры', 'shopping', shopping);
              break;
            default:
            }
          });
          myMap.behaviors.disable('scrollZoom');
          myMap.behaviors.enable('DblClickZoom');

          myMap.geoObjects.add(bank);
          myMap.geoObjects.add(fitness);
          myMap.geoObjects.add(gymnasium);
          myMap.geoObjects.add(hospital);
          myMap.geoObjects.add(kinder);
          myMap.geoObjects.add(shopping);
          myMap.geoObjects.add(gp);

          function addMenuItem(name, engName) {
            // Показать/скрыть группу геообъектов на карте
            $(`<a class="title active" href="#">
              <span class="${engName}"></span>${name}</a>`)
              .bind('click', function() {
                const link = $(this); //eslint-disable-line no-invalid-this

                link.toggleClass('active');

                // Меняем "активность" пункта меню
                // Если пункт меню "неактивный", то добавляем группу на карту,
                // иначе - удаляем с карты
                if (link.hasClass('active')) {
                  switch (engName) {
                  case 'bank':
                    myMap.geoObjects.add(bank);
                    break;
                  case 'fitness':
                    myMap.geoObjects.add(fitness);
                    break;
                  case 'gymnasium':
                    myMap.geoObjects.add(gymnasium);
                    break;
                  case 'hospital':
                    myMap.geoObjects.add(hospital);
                    break;
                  case 'kinder':
                    myMap.geoObjects.add(kinder);
                    break;
                  case 'shopping':
                    myMap.geoObjects.add(shopping);
                    break;
                  default:
                  }
                } else {
                  switch (engName) {
                  case 'bank':
                    myMap.geoObjects.remove(bank);
                    break;
                  case 'fitness':
                    myMap.geoObjects.remove(fitness);
                    break;
                  case 'gymnasium':
                    myMap.geoObjects.remove(gymnasium);
                    break;
                  case 'hospital':
                    myMap.geoObjects.remove(hospital);
                    break;
                  case 'kinder':
                    myMap.geoObjects.remove(kinder);
                    break;
                  case 'shopping':
                    myMap.geoObjects.remove(shopping);
                    break;
                  default:
                  }
                }
                return false;
              })
              // Добавление нового пункта меню в список
              .appendTo(
                $('<li></li>').appendTo($('#menu'))
              );
          }
        }

        const boolLa = !isNaN(+gkLa);
        const boolLo = !isNaN(+gkLo);

        if (gkLa !== '0' && boolLa || gkLo !== '0' && boolLo) {
          ymaps.ready(init);
        }
      });

  };

  render() {
    const state = this.state;
    const {
      height,
      fields
      } = this.props;
    const heightVal = height ? height : 610;

    // не показываем виджет, если у объекта нет координат
    if (!state.la || !state.lo) {
      return (
        <div></div>
      );
    }

    const htmlRender = (
      <div className="mainMap">
        <h2>Расположение и Инфраструктура</h2>
        <div className="mainWrapMap" style={{height: `${heightVal}px`}}>
          <div className="map" id="map" style={{height: `${heightVal}px`}}>
            {
              (fields !== null) ?
                <div className="grayBg">
                  <div className="container-wrapper-content">
                    <ul id="menu"></ul>
                  </div>
                </div> : null
            }
          </div>
        </div>
      </div>
      );

    return (htmlRender);
  }
}

Organisation.propTypes = {
  'gk_la': React.PropTypes.string,
  'gk_lo': React.PropTypes.string,
  cityId: React.PropTypes.string,
  height: React.PropTypes.string,
  traffic: React.PropTypes.string,
  fields: React.PropTypes.object,
  typeMap: React.PropTypes.string,
  ticketType: React.PropTypes.string,
  radius: React.PropTypes.string,
  id: React.PropTypes.string,
  cat: React.PropTypes.array,
  pic: React.PropTypes.array,
  class: React.PropTypes.string,
  'object_id': React.PropTypes.string,
  'post_id': React.PropTypes.number,
};

export default Organisation;
