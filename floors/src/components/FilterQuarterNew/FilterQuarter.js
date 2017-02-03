/**
 * Searchform widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars

import FilterQuarterBuild from './FilterQuarterBuild';
import FilterQuarterSectionPager from
    './FilterQuarterSectionPager';
import s from './Flat.scss';
import {map, filter, values, size, keys} from 'lodash';
import {isElementInViewport} from '../../utils/Helpers';
import ContextType from '../../utils/contextType';
/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import WidgetsActions from '../../actions/WidgetsActions';

class FilterQuarter extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      model: '',
      currentSection: [1],
      fields: data.object.info,
      typeBuild: FilterQuarterStore.typeBuild,
      count: FilterQuarterStore.model.count,
      chosenFlat: {},
      hideChess: false
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    /* global data */
    const {gp} = this.state.fields;
    const {insertCss} = this.props.context;
    const {checkChess} = this.props;
    let hideChess = false;

    FilterQuarterActions.fill(gp);
    if(checkChess) {
      const firstFloorFlatsKeys =
          size(FilterQuarterStore.myHouse.sections) > 0 ?
              keys(
                  values(values(FilterQuarterStore.myHouse.sections)[0]
                  .floors)[0].flats
              ) : null;

      if(firstFloorFlatsKeys && parseInt(firstFloorFlatsKeys[0]) > 99) {
        hideChess = true;
      }

      if(hideChess) {
        WidgetsActions.set('hideChess', 'yes');
      } else {
        WidgetsActions.set('hideChess', 'no');
      }
    }

    this.setState(() => ({
      model: FilterQuarterStore.getModel(),
      count: FilterQuarterStore.getModel().count,
      hideChess: hideChess
    }));
    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    FilterQuarterStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    FilterQuarterStore.off(this.onChange);
    this.removeCss();
  }

  onChange() {
    this.setState(() => ({
      chosenFlat: FilterQuarterStore.myFlat,
      model: FilterQuarterStore.model,
      typeBuild: FilterQuarterStore.typeBuild,
      count: FilterQuarterStore.model.count
    }));
  }

  onClick(val) {
    FilterQuarterActions.click(val.target.dataset.type);
  }

  handleScroll() {
    const sections = document.getElementsByClassName('build');
    const viewPort = document.getElementsByClassName('build-list')[0];

    const visible = map(sections, section => {
      return {
        sectionId: parseInt(section.id.split('_')[1]),
        visible: isElementInViewport(section, viewPort)
      };
    });

    const currents = filter(visible, {visible: true});

    const arr = map(currents, current => {
      return current.sectionId;
    });

    this.setState(()=>({currentSection: arr}));
  }

  sectionClick(event) {
    const targetId = event.target.dataset.target;
    const target = document.getElementById(targetId);
    const scroll = document.getElementsByClassName('build-list')[0];
    let addedOffset = 0;

    if (scroll.clientWidth > target.clientWidth) {
      addedOffset = (scroll.clientWidth - target.clientWidth) / 2;
    }
    if (target) {
      const position = target.offsetLeft - addedOffset;

      // scroll.scrollLeft = position;
      $(scroll).animate({
        scrollLeft: position
      }, 400); // Oleg hopes we'll get rid off jQuery someday. HO-HO-HO ;)
    }
    const section = event.target.dataset.section;

    this.setState(()=>({currentSection: [section]}));
    event.preventDefault();
  }

  render() {
    const {autoLayoutSwitch} = this.props;
    const typeBuild = FilterQuarterStore.typeBuild;

    const sectionElement = document
        .getElementById(`c_${FilterQuarterStore.myFlat.id}`);

    let legend = null;

    /* global data */
    if (data.object.info.legend) {
      legend = map(data.object.info.legend, value => {
        let result;

        switch (value) {
        case 'room1':
          result = (
              <li key={value}>
                <div className="sale firstRoom"></div>
                <div>1К</div>
              </li>
          );
          break;
        case 'room2':
          result = (
              <li key={value}>
                <div className="sale secondRoom"></div>
                <div>2К</div>
              </li>
          );
          break;
        case 'room3':
          result = (
              <li key={value}>
                <div className="sale thirdRoom"></div>
                <div>3К</div>
              </li>
          );
          break;
        case 'room4+':
          result = (
              <li key={value}>
                <div className="sale pluralRooms"></div>
                <div>4К+</div>
              </li>
          );
          break;
        case 'discount':
          result = (
              <li key={value}>
                <div className="sale2 firstRoom"></div>
                <div>Квартира со скидкой</div>
              </li>
          );
          break;
        case 'dolshik':
          result = (
              <li  key={value}>
                <div className="sale dolshik"></div>
                <div>Квартира от дольщика</div>
              </li>
          );
          break;
        case 'sold':
          result = (
              <li  key={value}>
                <div className="sold"></div>
                <div>Продано</div>
              </li>
          );
          break;
        case 'mismatch':
          result = (
              <li  key={value}>
                <div className="dole"></div>
                <div>Не соответствуют поиску</div>
              </li>
          );
          break;
        case 'reserved':
          result = (
              <li  key={value}>
                <div className={s.reservedLegend}></div>
                <div>Квартира забронирована</div>
              </li>
          );
          break;
        case 'demo':
          result = (
              <li  key={value}>
                <div className={'sale demo'}></div>
                <div>Квартира с ремонтом</div>
              </li>
          );
          break;
        default:
          // ничего
          break;
        }
        return result;
      });
    }

    return (
        <div className="new-jk">
          <div className="container-wrapper-content filter-jk">
            <div className="row">
              <div className="col-md-12 noPadding">
                <ul className="menuBuild clearfix">
                  <li className="fontBig">Отображать</li>
                  <li className="menuStart">
                    <a
                        className={(+typeBuild === 0) ? 'active' : ''}
                        data-type='0'
                        onClick={this.onClick}>
                      количество комнат
                    </a>
                  </li>
                  <li className="menuMiddle">
                    <a
                        className={(+typeBuild === 1) ? 'active' : ''}
                        data-type='1'
                        onClick={this.onClick}>
                      цену
                    </a>
                  </li>
                  <li className="menuEnd">
                    <a
                        className={(+typeBuild === 2) ? 'active' : ''}
                        data-type='2'
                        onClick={this.onClick}>
                      {'цену за м\u00B2'}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="clear"></div>
              <FilterQuarterSectionPager
                  sectionClick={this.sectionClick.bind(this)}
                  {...this.state}
                  typeBuild={typeBuild} />
            </div>
            <div className="row">
              <FilterQuarterBuild
                  autoLayoutSwitch={autoLayoutSwitch}
                  sectionElement={sectionElement}
                  handleScroll={this.handleScroll.bind(this)}
                  {...this.state} />
            </div>
            <div className="row">
              <div className="legend">
                <ul>
                  {legend}
                </ul>
              </div>
            </div>
          </div>
          <div className="clear"></div>
        </div>
    );
  }
}

FilterQuarter.propTypes = {
  fields: React.PropTypes.object,
  checkChess: React.PropTypes.bool,
  autoLayoutSwitch: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.string
  ])
};

FilterQuarter.defaultProps = {
  checkChess: false
};

export default FilterQuarter;
