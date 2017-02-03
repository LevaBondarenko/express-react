/**
 * Created by tatarchuk on 01.09.15.
 */

/*global ymaps*/

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class ContactMap extends Component {

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const props = this.props;

    function init() {
      const myMap = new ymaps.Map('yaMap', {
        // При инициализации карты обязательно нужно указать
        // её центр и коэффициент масштабирования.
        center: [props.la, props.lo],
        zoom: 15,
        controls: ['zoomControl']
      });
      const gp = new ymaps.GeoObjectCollection();
      const myPlacemark = new ymaps.Placemark(
        [props.la, props.lo],
        {
          balloonContent: props.balloon,
          // Свойства
          hintContent: props.address,
          imgbal: '<img src="//cdn-media.etagi.com/static/site/0/0d/' +
            '0d2425265fa6a8de29610c060e472d38009595ac.png"' +
            ' width="31" height="39">'
        }, {
          balloonShadow: false,
          balloonPanelMaxMapArea: 0,
          preset: 'islands#redDotIcon',
          draggable: false
        });

      gp.add(myPlacemark);
      myMap.geoObjects.add(gp);
      myMap.behaviors.disable('scrollZoom');
      myMap.behaviors.enable('DblClickZoom');
    }

    ymaps.ready(init);
  }

  render() {
    const props = this.props;

    return (
      <div className="yandexMapWidget">
        <div className="container-wide">
          <div className="yaMapArrow">
            <span className="h2-address">{props.place}</span>
            <span className="h2-address">Адрес:</span>
            <span className="h2-title">{props.address}</span>
          </div>
        </div>
        <div className="yaMap" id="yaMap"></div>
      </div>
    );
  }
}

export default ContactMap;
