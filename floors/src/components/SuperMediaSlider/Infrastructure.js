/**
 * Infrastructure component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, isNaN} from 'lodash';
import {priceCleanup, phoneFormatter, generateSearchUrl}
  from '../../utils/Helpers';
import {sendOrder} from '../../utils/requestHelpers';
import request from 'superagent';
import ReactDOM from 'react-dom';
/**
 * components
 */
import FullScreenButton from '../SuperMediaSlider/FullScreenButton';

const isMounted = (component) => {
  try {
    ReactDOM.findDOMNode(component);
    return true;
  } catch (e) {
    return false;
  }
};

/*global data*/
/*global ymaps*/
class Infrastructure extends Component {
  static propTypes = {
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
    parentProps: React.PropTypes.object,
    parentState: React.PropTypes.object,
    toggleFullScreen: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
    this.getFields = this.getFields.bind(this);
  }

  getFields() {
    return new Promise(resolve => {
      const props = this.props.parentProps;
      const dataArr = {
        'action': 'get_org',
        'la': props.gk_la,
        'lo': props.gk_lo,
        'object_id': props.object_id,
        'class': props.class,
        'widget_id': props.id,
        'post_id': props.post_id.toString()
      };
      const uri = generateSearchUrl(dataArr, '/backend/?');

      request
        .get(uri)
        .set({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'Cache-Control': 'public, max-age=21600'
        }).end((err, res) => {
          if (res.body && isMounted(this)) {
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
    const props = this.props.parentProps;

    const {
      cityId,
      traffic,
      typeMap,
      ticketType
      } = props;

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
          imgBallun.bank = '7715f195ddf0cb3ea97b6bc7e66576227add2f69.png';
          imgBallun.fitness = 'd71e2a25d64ebfd44c7b66912c82040f4619b711.png';
          imgBallun.gymnasium = '52065eb5fcad827e1b5ee3e3924e62c550c2dba7.png';
          imgBallun.hospital = 'e7de00073c4ecf6417c2aacf96ab00ee9386e4c5.png';
          imgBallun.kinder = 'b76a2148fe8c3ce86859a3615d55d1a8ca7238e0.png';
          imgBallun.shopping = '0fdd64e2babb502f531b073452a11da89787be68.png';

          const typeMapVal = typeMap ? typeMap : 'publicMap';

          // Создание экземпляра карты и его привязка к контейнеру с
          // заданным id ("slider-map").
          myMap = new ymaps.Map('slider-map', {
            // При инициализации карты обязательно нужно указать
            // её центр и коэффициент масштабирования.
            center: [gkLa, gkLo], // Центр карты, координаты новостройки
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
          const geoObjectCollections = {
            gp: new ymaps.GeoObjectCollection(),
            bank: new ymaps.GeoObjectCollection(),
            fitness: new ymaps.GeoObjectCollection(),
            gymnasium: new ymaps.GeoObjectCollection(),
            hospital: new ymaps.GeoObjectCollection(),
            kinder: new ymaps.GeoObjectCollection(),
            shopping: new ymaps.GeoObjectCollection(),
          };

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
            }, {
              balloonShadow: false,
              balloonPanelMaxMapArea: 0,
              iconLayout: 'default#image',
              iconImageHref: '//cdn-media.etagi.com/static/site/e/e0/' +
              'e0c7a86d4ae4e738af271cd04a3f21a6a6d0d017.png',
              iconImageSize: [98, 83],
              iconImageOffset: [-33, -80],
              draggable: false,
              overflow: 'visible'
            });

          geoObjectCollections.gp.add(myPlacemark);

          map(fields, (cat, keyCat) => {
            const catCollection = keyCat === 'school' ? 'gymnasium' :
              keyCat === 'polyclinic' ? 'hospital' : keyCat;
            const imgSymbols = imgBallun[keyCat].toString().substr(0, 2);

            map(cat, val => {
              myPlacemark = new ymaps.Placemark(
                [val.object_lo, val.object_la],
                {
                  balloonContent: `<p>
                    <strong>${val.object_title}</strong> <br />
                    <strong>Адрес: </strong>
                    <span class="balloon-address">${val.address}</span> <br />
                  </p>`,
                  // Свойства
                  hintContent: val.object_title,
                  imgbal: `<img src="https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${imgBallun[keyCat]}" width="31" height="45">`
                },
                {
                  balloonShadow: false,
                  iconLayout: 'default#image',
                  iconImageHref: `https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${imgBallun[keyCat]}`,
                  iconImageSize: [59, 50],
                  iconImageOffset: [-16, -45],
                  draggable: false
                });
              geoObjectCollections[catCollection] &&
                geoObjectCollections[catCollection].add(myPlacemark);

            });

            switch (catCollection) {
            case 'bank':
              addMenuItem('Банки', 'bank', geoObjectCollections.bank);
              break;
            case 'fitness':
              addMenuItem('Фитнес центры', 'fitness',
                geoObjectCollections.fitness);
              break;
            case 'gymnasium':
              addMenuItem('Школы и гимназии', 'gymnasium',
                geoObjectCollections.gymnasium);
              break;
            case 'hospital':
              addMenuItem('Больницы и поликлиники', 'hospital',
                geoObjectCollections.hospital);
              break;
            case 'kinder':
              addMenuItem('Детские сады', 'kinder',
                geoObjectCollections.kinder);
              break;
            case 'shopping':
              addMenuItem('Торговые центры', 'shopping',
                geoObjectCollections.shopping);
              break;
            default:
            }
          });

          myMap.behaviors.disable('scrollZoom');
          myMap.behaviors.enable('DblClickZoom');

          myMap.geoObjects.add(geoObjectCollections.bank);
          myMap.geoObjects.add(geoObjectCollections.fitness);
          myMap.geoObjects.add(geoObjectCollections.gymnasium);
          myMap.geoObjects.add(geoObjectCollections.hospital);
          myMap.geoObjects.add(geoObjectCollections.kinder);
          myMap.geoObjects.add(geoObjectCollections.shopping);
          myMap.geoObjects.add(geoObjectCollections.gp);

          function addMenuItem(name, engName) {
            // Показать/скрыть группу геообъектов на карте
            $(`<div class='active'><a class="title" href="#">
              <span class="${engName} infrastructure-icon"></span>
              <span class="infrastructure-type">${name}</span>
              <span class="infrastructure-check"></span></a></div>`)
              .bind('click', function() {
                const link = $(this); //eslint-disable-line no-invalid-this

                link.toggleClass('active');

                // Меняем "активность" пункта меню
                // Если пункт меню "неактивный", то добавляем группу на карту,
                // иначе - удаляем с карты
                link.hasClass('active') ?
                  myMap.geoObjects.add(geoObjectCollections[engName]) :
                  myMap.geoObjects.remove(geoObjectCollections[engName]);
                return false;
              })
              // Добавление нового пункта меню в список
              .appendTo(
                $('.infrastructure-list')
              );
          }
          $('.infrastructure-list').children().length &&
            $('.infrastructure-menu').show();
        }

        $('.infrastructure-turn').bind('click', () => {
          $('.infrastructure-title').toggle();
          $('.infrastructure-type').toggle();
          $('.infrastructure-turn').toggleClass('turned');
          $('.infrastructure-check').toggleClass('turned');
          $('.infrastructure-icon').toggleClass('turned');
          $('.infrastructure-list div').toggleClass('turned');
        });

        const boolLa = !isNaN(+gkLa);
        const boolLo = !isNaN(+gkLo);

        if (gkLa !== '0' && boolLa || gkLo !== '0' && boolLo) {
          ymaps.ready(init);
        }
      });

  };

  render() {
    const {isFullScreen, sliderHeight} = this.props.parentState;
    const heightVal = sliderHeight && !isFullScreen ?
      sliderHeight :
      isFullScreen ? 700 : 506;

    return (<div>
      <div className="mainMap">
        <div className="mainWrapMap" style={{height: heightVal}}>
          <div className="map" id="slider-map" style={{height: heightVal}}>
              <div className='infrastructure-menu'>
                <div className='infrastructure-header'>
                  <div className='infrastructure-title'>
                    Инфраструктура
                  </div>
                  <div className='infrastructure-turn' title='свернуть'></div>
                </div>
                <div className='infrastructure-list'>
                </div>
              </div>
          </div>
        </div>
      </div>
      <FullScreenButton
        isFullScreen={isFullScreen}
        toggleFullScreen={this.props.toggleFullScreen}
        buttonFloat={false}
      />
    </div>);
  }
}

export default Infrastructure;
