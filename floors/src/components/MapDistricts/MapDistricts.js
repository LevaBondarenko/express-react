/**
 * Map widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/*global ymaps*/

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, includes} from 'lodash';
import request from 'superagent';

/**
 * React/Flux entities
 */
import SearchActions from '../../actions/SearchActions';
import WidgetsActions from '../../actions/WidgetsActions';


class MapDistricts extends Component {
  static propTypes = {
    collection: React.PropTypes.array,
    selectedData: React.PropTypes.array,
    citiesIds: React.PropTypes.array,
    coords: React.PropTypes.string,
    height: React.PropTypes.number,
    defaultZoomYa: React.PropTypes.string,
    stepYa: React.PropTypes.string,
    minZoomYa: React.PropTypes.string,
    maxZoomYa: React.PropTypes.string,
    scrollZoom: React.PropTypes.string
  };
  static defaultProps = {
    defaultZoomYa: '11',
    stepYa: '1',
    minZoomYa: '10',
    maxZoomYa: '14',
    scrollZoom: '0'
  };
  constructor(props) {
    super(props);
    this.myMap = {};
    this.state = {
      collection: props.collection,
      selectedData: props.selectedData,
      color: '#49bd3b',
      colorHover: '#49bd3b',
      colorActive: '#e31f30',
      colorStroke: '#393f48',
      colorStrokeActive: '#393f48'
    };
    this.init = this.init.bind(this);
    this.ic = this.ic.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMouseenter = this.handleMouseenter.bind(this);
    this.handleMouseleave = this.handleMouseleave.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      collection: nextProps.collection,
      selectedData: nextProps.selectedData
    }));
    const selectedData = map(this.state.selectedData, district =>
      district.toString());

    if (this.myMap.geoObjects) {
      this.myMap.geoObjects.each(geoObject => {
        const district = geoObject.myDistrictsIds || 0;

        if (includes(selectedData, district.toString())) {
          geoObject.options.set('fillColor', this.state.colorActive);
          geoObject.myColor = this.state.colorActive;
          geoObject.myClickColor = this.state.color;
          geoObject.myCheck = !geoObject.myCheck;
          geoObject.myStrokeColor = this.state.colorStrokeActive;
        } else {
          geoObject.options.set('fillColor', this.state.color);
          geoObject.myColor = this.state.color;
          geoObject.myClickColor = this.state.colorActive;
          geoObject.myCheck = !geoObject.myCheck;
          geoObject.myStrokeColor = this.state.colorStroke;
        }
      });
    }
  }

  componentDidMount() {
    ymaps.ready(this.init);
  }

  shouldComponentUpdate() {
    return false;
  }

  init() {
    const {
      defaultZoomYa, stepYa, minZoomYa, maxZoomYa, height
    } = this.props;
    let coords = this.props.coords.split(',');
    const topPosition = (height - 206) / 2 > 64 ?
      (height - 206) / 2 :
      (height - 61) / 2;

    coords = coords.map(item => parseFloat(item));

    this.myMap = new ymaps.Map('poligon_map', {
      center: [coords[1], coords[0]],
      zoom: +defaultZoomYa,
      controls: [],
    }, {
      suppressMapOpenBlock: true,
    });

    this.myMap.controls.add('zoomControl', {
      zoomStep: +stepYa,
      visible: true,
      position: {
        left: 10,
        top: topPosition
      }
    });

    this.myMap.options.set('minZoom', +minZoomYa);
    this.myMap.options.set('maxZoom', +maxZoomYa);
    this.ic();
    this.myMap.behaviors.disable('dblClickZoom');
    if(this.props.scrollZoom !== '1') {
      this.myMap.behaviors.disable('scrollZoom');
    }

  }

  handleChange(event) {
    if (event.get('target').mySetting[2]) {
      const t = event.get('target').myColor;

      event
        .get('target')
        .options
        .set('fillColor', event.get('target').myClickColor);
      event
        .get('target')
        .options
        .set('strokeColor', event.get('target').myStrokeColor);
      event
        .get('target')
        .myColor = event.get('target').myClickColor;
      event
        .get('target')
        .myClickColor = t;
      event
        .get('target')
        .myCheck = !event.get('target').myCheck;
    }
    const district = parseInt(event.get('target').myDistrictsIds);

    SearchActions.change('districts', district);
  }

  handleMouseenter(event) {
    event
      .get('target')
      .options
      .set('fillColor', event.get('target').myHoverColor);
  }

  handleMouseleave(event) {
    event
      .get('target')
      .options
      .set('fillColor', event.get('target').myColor);
  }

  ic() {
    const AllPolygons = [];
    const cities = this.props.citiesIds;
    const self = this;

    const distrIds = map(this.props.collection, distr => distr.id);

    const args = {
      action: 'get_map_areas',
      city: cities,
      lvl: 2,
      districtsIds: distrIds
    };

    request
      .post('/backend/')
      .query(args)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if(err || (!res || !res.ok || res.error)) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          const data = JSON.parse(res.text);

          self.myMap.geoObjects.removeAll();

          for (let i = 0; i < data.length; i++) {
            var properties = {};

            if (data[i].settings[0]) {
              properties.hintContent = data[i].name;
            }

            if (data[i].settings[1]) {
              properties.balloonContent = data[i].balloonContent;
            }

            AllPolygons[data[i].id] = new ymaps.Polygon(
              [data[i].coordinates],
              properties, {
                fillColor: self.state.color,
                strokeWidth: '3',
                strokeColor: self.state.colorStroke,
                strokeStyle: data[i].params.strokeStyle,
                opacity: data[i].params.opacity
              }
            );

            AllPolygons[data[i].id].myCoordinates = data[i].coordinates;
            AllPolygons[data[i].id].myDistrictsIds = data[i].district_id;
            AllPolygons[data[i].id].myСityID = data[i].city_id;
            AllPolygons[data[i].id].myId = data[i].id;
            AllPolygons[data[i].id].myStrokeColor = self.state.colorStroke;
            AllPolygons[data[i].id].myStrokeWidth = '3';
            AllPolygons[data[i].id].myStrokeStyle = data[i].params.strokeStyle;
            AllPolygons[data[i].id].myOpacity = '0.62';
            AllPolygons[data[i].id].myHoverColor = self.state.colorActive;
            AllPolygons[data[i].id].myColor = self.state.color;
            AllPolygons[data[i].id].myIsEdit = 0;
            AllPolygons[data[i].id].myClickColor = self.state.colorActive;
            AllPolygons[data[i].id].myCheck = false;
            AllPolygons[data[i].id].mySetting = data[i].settings;
            AllPolygons[data[i].id].myHame = data[i].name;
            AllPolygons[data[i].id].myLvl = data[i].level;
            AllPolygons[data[i].id].myParent = data[i].parent_id;
            if (data[i].settings[3]) {
              AllPolygons[data[i].id]
                .events
                .add('mouseenter', self.handleMouseenter);
              AllPolygons[data[i].id]
                .events
                .add('mouseleave', self.handleMouseleave);
            }
            if (data[i].settings[2]) {
              AllPolygons[data[i].id]
                .events
                .add('click', self.handleChange);

            }

            const selectedData = map(self.state.selectedData, district =>
              district.toString());

            if (includes(
              selectedData, data[i].district_id.toString()
            )) {
              AllPolygons[data[i].id]
                .options
                .set('fillColor', self.state.colorActive);
              AllPolygons[data[i].id].myColor = self.state.colorActive;
              AllPolygons[data[i].id].myClickColor = self.state.color;
              AllPolygons[data[i].id].myCheck =
               !AllPolygons[data[i].id].myCheck;
            }
            self.myMap.geoObjects.add(AllPolygons[data[i].id]);

          }
        }
      });

  }

  render() {
    const divStyle = {
      width: '100%',
      height: this.props.height ? `${this.props.height}px` : '350px',
      marginBottom: '2rem'
    };

    return (
      <div id='pm_main_wnd' style={divStyle}>
          <div id='poligon_map' />
      </div>
    );
  }
}

export default MapDistricts;
