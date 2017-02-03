/**
 * Slider v2.0 component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {cloneDeep, map, chain,
  forEach, size, isArray, union, take, drop} from 'lodash';
import {getObjects} from '../../utils/requestHelpers';
/**
 * React/Flux entities
 */
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';
import SaleSliderItem from './SaleSliderItem';
import RentSliderItem from './RentSliderItem';
import NewhouseSliderItem from './NewhouseSliderItem';
import CottagesSliderItem from './CottagesSliderItem';
import OfficesSliderItem from './OfficesSliderItem';
import RentOfficesSliderItem from './RentOfficesSliderItem';

/*global data*/
import withCondition from '../../decorators/withCondition';

@withCondition()
class Slider2 extends Component {

  constructor(props) {
    super(props);
    const filters = [];

    this.onChange = this.onChange.bind(this);
    this.animate = this.animate.bind(this);
    this.getObjects = this.getObjects.bind(this);

    this.state = {
      wrapperPos: 0,
      current: 0,
      animate: false,
      objects: [],
      filters: []
    };

    for(const i in props.modes) {
      if(props.modes[i] && props.modes[i].type === '3') {
        const filter = {};

        for(const l in props.modes[i].like) {
          if(props.modes[i].like[l]) {
            const param = props.modes[i].like[l].param;
            const percent = props.modes[i].like[l].percent;
            let deviation = parseFloat(props.modes[i].like[l].deviation);

            if(percent) {
              deviation = Math.floor(
                parseInt(data.object.info[param]) * deviation / 100
              );
            }

            if(param !== 'distance') {
              if(deviation === 0) {
                filter[`${param}`] = data.object.info[param];
              } else {
                filter[`${param}_min`] =
                  parseInt(data.object.info[param]) - deviation;
                filter[`${param}_max`] =
                  parseInt(data.object.info[param]) + deviation;
              }
            } else {
              filter.distance = deviation;
              filter.la = data.object.info.la;
              filter.lo = data.object.info.lo;
            }
            filter.class = data.object.info.table;
            filter['city_id'] = data.options.cityId;
          }
        }
        filters[i] = filter;
        this.getObjects(filter, i);
      }
      if(props.modes[i].type === '5') {
        const filter = {};

        if (typeof(data.object.info) === 'object') {
          const analogs = data.object.info.analogs;
          let analogObjects = analogs ? analogs : [];

          analogObjects = analogObjects.slice(1, -1);
          analogObjects = analogObjects.length > 0 ?
            analogObjects.split(',') : null;
          if (analogObjects) {
            filter['object_id'] = analogObjects;
            filter.class = data.object.info.table;
            filters[i] = filter;
            this.getObjects(filter, i);
          }
        }
      }
    }
    this.state.filters = filters;
  }

  getObjects(filter, mode) {
    getObjects(filter).then((response) => {
      const objects = this.state.objects || [];

      for(const i in response.objects) {
        if(response.objects[i] &&
          response.objects[i].object_id ===
          data.object.info.object_id) {
          response.objects.splice(i, 1);
        }
      }
      objects[mode] = response.objects;
      this.setState(() => ({
        objects: objects
      }));
      this.onChange();
    }, () => {
      //error
    });
  }

  componentWillMount() {
    wss.onChange(this.onChange);
    mss.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  animate() {
    this.setState(() => ({
      animate: true,
      wrapperPos: this.state.wrapperPos ?
        0 :
        -((this.props.slideWidth + 15) * parseInt(this.props.scrCnt))
    }));
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
    mss.offChange(this.onChange);
  }

  onChange() {
    let selectedMode;
    let msAction = (size(mss.get('action_sl')) &&
     this.props.useSelect === '1') ? mss.get('action_sl') : this.props.action;

    if(isArray(msAction)) {
      msAction = msAction[0];
    }

    const shownObjects = chain(this.props.modes)
      .map(val => {
        const helpArr = [];

        forEach(val.objects, valObj => {
          if(valObj.action_sl === msAction || !valObj.action_sl) {
            helpArr.push(valObj);
          }
        });
        return helpArr;
      })
      .value();

    const selection = this.props.storeProperty ?
      wss.get(this.props.storeProperty) :
      this.props.modes[0].name;
    const shownModes = cloneDeep(this.props.modes);

    for(const i in shownModes) {
      if(shownModes[i] !== undefined) {
        shownModes[i].objects = shownObjects[i];
        if(shownModes[i].name === selection) {
          selectedMode = shownModes[i];
          if(shownModes[i].type === '3' ||
           shownModes[i].type === '5') {
            selectedMode.objects = this.state.objects[i];
          }
        }
      }
    }
    const slides = take(selectedMode.objects, parseInt(this.props.dspCnt));

    this.setState(() => ({
      selection: selection,
      selectedMode: selectedMode,
      slides: slides,
      wrapperPos: 0,
      current: 0,
      animate: false
    }));
  }

  toLeft() {
    let slides;
    const cnt = this.state.selectedMode.objects.length;
    let firstVar = this.state.current - parseInt(this.props.scrCnt);
    const need = parseInt(this.props.dspCnt) + parseInt(this.props.scrCnt);
    const width = (this.props.slideWidth + 15) * need;

    if(firstVar < 0) {
      firstVar += cnt;
    }
    if(firstVar + need <= cnt) {
      slides = take(drop(this.state.selectedMode.objects, firstVar), need);
    } else {
      slides = union(drop(this.state.selectedMode.objects, firstVar),
        take(this.state.selectedMode.objects, need + firstVar - cnt));
    }
    this.setState(() => ({
      wrapperPos: -((this.props.slideWidth + 15) * parseInt(this.props.scrCnt)),
      slides: slides,
      current: firstVar,
      wrapperWidth: width,
      animate: false
    }));
    setTimeout(this.animate, 100);
  }

  toRight() {
    let slides;
    const cnt = this.state.selectedMode.objects.length;
    let firstVar = this.state.current;
    const need = parseInt(this.props.dspCnt) + parseInt(this.props.scrCnt);
    const width = (this.props.slideWidth + 15) * need;

    if(firstVar >= cnt) {
      firstVar -= cnt;
    }
    if(firstVar + need <= cnt) {
      slides = take(drop(this.state.selectedMode.objects, firstVar), need);
    } else {
      slides = union(drop(this.state.selectedMode.objects, firstVar),
        take(this.state.selectedMode.objects, need + firstVar - cnt));
    }
    this.setState(() => ({
      wrapperPos: 0,
      slides: slides,
      current: firstVar + parseInt(this.props.scrCnt),
      wrapperWidth: width,
      animate: false
    }));
    setTimeout(this.animate, 100);
  }

  render() {
    let source = parseInt(this.props.mediaSource);
    let slides,  controls;
    const pos = this.state.wrapperPos;
    const favorites = parseInt(this.props.favorites);
    const style = {left: pos, width: this.state.wrapperWidth};
    const width = parseInt(this.props.dspCnt) * (this.props.slideWidth + 15);
    const slideWidth = this.props.slideWidth;
    const title = this.state.selectedMode ? this.state.selectedMode.title : '';
    const notice = this.state.selectedMode ?
      this.state.selectedMode.notice : '';
    const id = `${this.props.storeProperty}.${this.state.selection}`;
    const addrMode = this.state.selectedMode ?
      this.state.selectedMode.addrMode : 'address';
    const totalObjects =
      this.state.selectedMode && this.state.selectedMode.objects ?
      this.state.selectedMode.objects.length : 0;
    const {showMortgage} = this.props;
    var msAction = (size(mss.get('action_sl')) &&
     this.props.useSelect === '1') ? mss.get('action_sl') : this.props.action;

    if(isArray(msAction)) {
      msAction = msAction[0];
    }

    if(source < 0) {
      source = data.options.mediaSource;
    }
    if(this.state.animate) {
      style.transition = 'left .5s ease-in';
    }

    const noObjectsText = this.state.selectedMode &&
      this.state.selectedMode.noObjectsText ?
      this.state.selectedMode.noObjectsText : 'Объекты не найдены';

    const discount = this.state.selectedMode ?
      parseInt(this.state.selectedMode.discount) : 0;

    switch (msAction) {
    case 'sale':
      slides = map(this.state.slides, (val, key) => {
        let res;

        switch (val.class) {
        case 'nh_flats':
          res = (<NewhouseSliderItem
            discount={discount}
            addrMode={addrMode}
            key={key}
            slide={val}
            favorites={favorites}/>);
          break;
        case 'flats':
          res = (<SaleSliderItem
              slide={val}
              discount={discount}
              favorites={favorites}
              source={source}
              addrMode={addrMode}
              showMortgage={showMortgage} />);
          break;
        case 'cottages':
          res = (<CottagesSliderItem
            slide={val}
            discount={discount}
            favorites={favorites}
            source={source}
            addrMode={addrMode}/>);
          break;
        case 'offices':
          res = (<OfficesSliderItem
            slide={val}
            discount={discount}
            favorites={favorites}
            source={source}
            addrMode={addrMode}
            showMortgage={showMortgage} />);
          break;
        default:
          break;
        }
        return (
          <div
            key={key}
            className='slider2-slide'
            style={{width: slideWidth}}>
              {res}
          </div>
        );
      });
      break;
    case 'lease':
      slides = map(this.state.slides, (val, key) => {
        let res;

        switch (val.class) {
        case 'offices':
          res = (<RentOfficesSliderItem
            slide={val}
            discount={discount}
            favorites={favorites}
            source={source}
            addrMode={addrMode}/>);
          break;
        case 'flats':
          res = (<RentSliderItem
            slide={val}
            discount={discount}
            favorites={favorites}
            source={source}
            addrMode={addrMode}/>);
          break;
        default:
          break;
        }
        return (
          <div
            key={key}
            className='slider2-slide'
            style={{width: slideWidth}}>
              {res}
          </div>
        );
      });
      break;
    default :
        // nothing
      break;
    }

    if(!slides.length) {
      slides = <div className='slider2-noobjects'>{noObjectsText}</div>;
    }

    if(totalObjects > parseInt(this.props.dspCnt)) {
      controls =
        (<div className='slider2-control'>
          <div className='slider2-left' onClick={this.toLeft.bind(this)}>
          </div>
          <div className='slider2-right' onClick={this.toRight.bind(this)}>
          </div>
        </div>);
    } else {
      controls = '';
    }

    return (
      <div id={id} className='slider2' style={{width: `${width}px`}}>
        <div className='slider2-header'>
          <h3>{title}</h3>
        </div>
        <div className='slider2-container'>
            <div className='slider2-wrapper' style={style}>
              {slides}
            </div>
        </div>
        {controls}
        <div className='slider2-notice'>
          <span>{notice}</span>
        </div>
      </div>
    );
  }
}

Slider2.propTypes = {
  modes: React.PropTypes.array,
  storeProperty: React.PropTypes.string,
  dspCnt: React.PropTypes.string,
  scrCnt: React.PropTypes.string,
  slideWidth: React.PropTypes.number,
  mediaSource: React.PropTypes.string,
  favorites: React.PropTypes.string,
  action: React.PropTypes.string,
  useSelect: React.PropTypes.string,
  showMortgage: React.PropTypes.string
};
Slider2.defaultProps = {
  modes: [],
  favorites: '0',
  mediaSource: '-1',
  useSelect: '0',
  showMortgage: '1'
};

export default Slider2;
