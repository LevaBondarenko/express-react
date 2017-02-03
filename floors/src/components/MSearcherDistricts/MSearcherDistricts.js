/**
 * Modular Searcher Range component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, includes, find, sortBy, isArray} from 'lodash';
import MapDistricts from '../MapDistricts/MapDistricts';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Tabs from 'react-bootstrap/lib/Tabs'; //TabbedArea
import Tab from 'react-bootstrap/lib/Tab'; //tab
import classNames from 'classnames';
import Badge from 'react-bootstrap/lib/Badge';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import wss from '../../stores/WidgetsStateStore';
import Url from '../../utils/Url';
import {getSearchResult} from '../../actions/SearchActions';
import withCondition from '../../decorators/withCondition';
import {declOfNum} from '../../utils/Helpers';

const ModalBody = Modal.Body;

@withCondition()
class MSearcherDistricts extends Component {
  static propTypes = {
    showName: React.PropTypes.string,
    showDistricts: React.PropTypes.string,
    showStreets: React.PropTypes.string,
    showMap: React.PropTypes.string,
    defaultLabel: React.PropTypes.string,
    customLabel: React.PropTypes.string,
    cityStore: React.PropTypes.string,
    defaultZoomYa: React.PropTypes.string,
    stepYa: React.PropTypes.string,
    minZoomYa: React.PropTypes.string,
    maxZoomYa: React.PropTypes.string,
    updateResult: React.PropTypes.string,
    scrollZoom: React.PropTypes.string,
    replacementDistricts: React.PropTypes.string,
    replacementStreets: React.PropTypes.string
  };

  static defaultProps = {
    defaultLabel: 'Район, Улица',
    defaultZoomYa: '11',
    customLabel: 'Выбрано',
    stepYa: '2',
    minZoomYa: '10',
    maxZoomYa: '14'
  };

  constructor(props) {
    super(props);
    this.state = {
      key: parseInt(props.showDistricts) ? 1 : 2,
      label: this.props.defaultLabel,
      customLabel: this.props.customLabel,
      showModal: false,
      districts: [],
      streets: [],
      collections: {},
      line: ''
    };
  }

  componentDidMount() {
    const line = ReactDOM.findDOMNode(this.refs.line);

    if(line) {
      this.setState(() => ({
        line: line
      }));
    }
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {

    const districts = parseInt(this.props.showDistricts) ?
      mss.get('district_id') : [];
    const streets = parseInt(this.props.showStreets) ?
      mss.get('street_id') : [];
    const districtsCnt = districts.length;
    const streetsCnt = streets.length;
    const cnt = districts.length + streets.length;
    const splitStreets = this.props.replacementStreets ?
     this.props.replacementStreets.split('|') : null;
    const splitDistricts = this.props.replacementDistricts ?
     this.props.replacementDistricts.split('|') : null;
    const districtsLabel = districtsCnt > 0 && splitDistricts && splitStreets ?
     `${districtsCnt} ${declOfNum(districtsCnt, splitDistricts)}` : '';
    const streetsLabel = streetsCnt > 0 && splitDistricts && splitStreets ?
     `${streetsCnt} ${declOfNum(streetsCnt, splitStreets)}` : '' ;
    const customLabel = this.props.customLabel || 'Выбрано';
    const showName = this.props.showName || 0;
    const space = streetsCnt > 0 && districtsCnt > 0 ? ' и ' : '';
    let label =  districtsLabel || streetsLabel  ? (splitDistricts &&
       splitStreets ?
        `${customLabel}: ${districtsLabel} ${space}${streetsLabel}` :
         `${customLabel}: ${cnt}`) : (cnt > 0 ?
          `${customLabel}: ${cnt}` : this.props.defaultLabel);
    let title = label;

    if (cnt === 1 && parseInt(showName)) {
      if (districts.length) {
        const districtId = parseInt(districts);
        const allDistricts = mss.get('collections')['district_id'];

        if (allDistricts.length) {
          label = find(allDistricts, {id: districtId}).name;
        }
      } else if (streets.length) {
        const streetId = parseInt(streets);
        const allStreets = mss.get('collections')['street_id'];

        if (allStreets.length) {
          label = find(allStreets, {id: streetId}).name;
        }
      }
      title = label;
    }

    this.setState({
      districts: districts,
      streets: streets,
      collections: mss.get('collections'),
      label: label,
      title: title
    });
  }

  open = () => {
    ReactDOM.findDOMNode(this.refs.districtsButton).blur();
    this.setState(() => ({
      showModal: true
    }));
  }

  close = () => {
    this.setState(() => ({
      showModal: false
    }));
  }

  selectAll = () => {
    if(parseInt(this.props.showDistricts)) {
      const all = {};
      const collections = mss.get('collections');

      all['district_id'] = map(collections.district_id, item => {
        return item.id.toString();
      });

      ModularSearcherActions.set(null, all);
      ModularSearcherActions.getCollections();

      Url.updateSearchParam('district_id', all['district_id']);
      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }
  }

  clear = () => {
    const clearCollection = {};

    if(parseInt(this.props.showDistricts)) {
      clearCollection['district_id'] = [];
    }
    if(parseInt(this.props.showStreets)) {
      clearCollection['street_id'] = [];
    }
    ModularSearcherActions.set(null, clearCollection);
    ModularSearcherActions.getCollections();
    Url.updateSearchParam('district_id', undefined);
    Url.updateSearchParam('street_id', undefined);
    getSearchResult(
      mss.get('class'),
      mss.get('perPage'),
      0,
      mss.get(),
      {}
    );
  }

  handleSelect = (key) => {
    this.setState({key});
  }

  render() {
    const showModal = this.state.showModal;
    const label = this.state.label;
    const collections = this.state.collections || [];
    const streets = this.state.streets || [];
    const districts = this.state.districts || [];
    const showMap = parseInt(this.props.showMap);
    const updateResult = parseInt(this.props.updateResult);
    const showDistricts = parseInt(this.props.showDistricts);
    const showStreets = parseInt(this.props.showStreets);
    const modelCitiesIds = mss.get('city_id');
    const modelCityId = isArray(modelCitiesIds) ?
      modelCitiesIds : [modelCitiesIds];
    const modelCities = mss.get('collections').city_id;
    const wssCityData = wss.get()[this.props.cityStore] || {};
    const cityId = modelCityId[0] || wssCityData.city_id;
    const mapCoords = modelCities ?
      find(mss.get('collections').city_id, {id: parseInt(cityId)}).coords :
      wssCityData.coords;
    const {
      defaultZoomYa, stepYa, minZoomYa, maxZoomYa, scrollZoom
      } = this.props;
    const districtsTitle = (
      <div>Район {districts.length > 0 ? (
        <Badge className="tabbedBadge">
           {districts.length}
         </Badge>
      ) :
      null}
      </div>
    );
    const streetsTitle = (
      <div>Улица {streets.length > 0 ? (
        <Badge className="tabbedBadge">
           {streets.length}
         </Badge>
      ) :
      null}
      </div>
    );

    return (
      <div className="clearfix msearcher msearcher-disctrict"
         title={this.state.title}>
        <Button
          ref='districtsButton'
          className='btn-select'
          bsStyle='default'
          data-field='districts'
          onClick={this.open}>
            <span className="btn-label">{label}</span>&nbsp;
            <span className="caret"></span>
        </Button>
        <Modal
          className='etagi--modal wide modal-districts'
          show={showModal}
          onHide={this.close}>
          <Button onClick={this.close}
            bsSize='large'
            className="etagi--closeBtn">
            <span aria-hidden="true">&times;</span>
          </Button>
          {showDistricts ?
            (<a href="#" onClick={this.selectAll}
                style={{right: '27rem'}}
                className="etagi--clearBtn etagi--clearBtn__hi">
               Выбрать все районы
             </a>) : null}
          <a href="#" onClick={this.clear}
             className="etagi--clearBtn etagi--clearBtn__hi">
            Очистить запрос
          </a>
          <button onClick={this.close}
                  className="btn-abs-modal
                  btn btn-green btn-modal
                  btn-modal__hi">
            Выбрать
          </button>
          {showDistricts ?
            (<a href="#" onClick={this.selectAll}
              style={{right: '27rem'}}
              className="etagi--clearBtn">
              Выбрать все районы
            </a>) : null}
          <a href="#" onClick={this.clear}
            className="etagi--clearBtn">
            Очистить запрос
          </a>
          <button onClick={this.close}
            className="btn-abs-modal btn btn-green btn-modal">
            Выбрать
          </button>
          <ModalBody className='padding-bottom-75'>
            <Tabs id='mSearcherDistricts-tabs' activeKey={this.state.key}
              onSelect={this.handleSelect}>
                {(showDistricts ?
                  <Tab
                    eventKey={1}
                    title={districtsTitle}
                    className="clearfix">
                      <MSearcherDistrictsTab
                        coords={mapCoords}
                        defaultZoomYa={defaultZoomYa}
                        stepYa={stepYa}
                        minZoomYa={minZoomYa}
                        maxZoomYa={maxZoomYa}
                        scrollZoom={scrollZoom}
                        showMap={showMap}
                        updateResult={updateResult}
                        collection={collections.district_id}
                        selectedData={districts}
                        citiesIds={modelCitiesIds ? modelCityId :
                          [wssCityData.city_id]}
                        tabType="district_id"/>
                  </Tab> : null)}
                {(showStreets ?
                  <Tab
                    eventKey={2}
                    title={streetsTitle}
                    className="clearfix">
                      <MSearcherDistrictsTab
                        streetsByDistricts={collections.streets_by_districts}
                        collection={collections.street_id}
                        selectedData={streets}
                        updateResult={updateResult}
                        tabType="street_id"/>
                  </Tab> : null)}
            </Tabs>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

class MSearcherMapDistricts extends MapDistricts {
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

    const distrId = event.get('target').myDistrictsIds;
    const districtsInUrl = Url.parseQuery()['district_id'] || [];
    const districtsInMss = mss.get('district_id');

    if (districtsInUrl.indexOf(distrId) === -1 &&
        districtsInMss.indexOf(distrId) === -1) {
      districtsInUrl.push(distrId);
    } else {
      districtsInUrl.splice(districtsInUrl.indexOf(distrId), 1);
    }

    ModularSearcherActions.toggle('district_id', distrId);
    if (this.props.updateResult) {
      // добавляем в URL
      Url.updateSearchParam('district_id', districtsInUrl);
      Url.updateSearchParam('currentPage', undefined);

      const {perPage} = mss.get();

      getSearchResult(
        mss.get('class'),
        perPage,
        0,
        mss.get(),
        {}
      );

      // нужно ли перисчитывать кол-во объектов при изменении фильтра?
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    }
  }
}

class MSearcherDistrictsTab extends Component {
  static propTypes = {
    showMap: React.PropTypes.number
  };

  render() {
    const windowHeight = window.innerHeight;
    const mapHeight = windowHeight - 520;
    const listHeight = this.props.showMap ? 200 : 220 + mapHeight;

    return (
        <div>
          <MSearcherTags {...this.props} key='1'/>
          {(this.props.showMap ?
            <MSearcherMapDistricts height={mapHeight} {...this.props} /> : '')}
          <MSearcherSearch {...this.props} height={listHeight} key='2'/>
        </div>
    );
  }
}

class MSearcherTags extends Component {
  static propTypes = {
    selectedData: React.PropTypes.array,
    collection: React.PropTypes.array,
    tabType: React.PropTypes.string,
    updateResult: React.PropTypes.string
  };
  handleTagDelete(event) {
    const {value, type} = event.target.dataset;

    ModularSearcherActions.del(type, value);

    if (this.props.updateResult) {
      // добавляем в URL
      const itemsInUrl = Url.parseQuery()[type] || [];

      if (itemsInUrl.indexOf(value) !== -1) {
        itemsInUrl.splice(itemsInUrl.indexOf(value), 1);
      }

      Url.updateSearchParam(type, itemsInUrl);
      Url.updateSearchParam('currentPage', undefined);

      const {perPage} = mss.get();

      getSearchResult(
        mss.get('class'),
        perPage,
        0,
        mss.get(),
        {}
      );

      // нужно ли перисчитывать кол-во объектов при изменении фильтра?
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    }
  }

  render() {
    const selectedData = this.props.selectedData;
    const collection = this.props.collection;
    const tabType = this.props.tabType;
    const handleTagDelete = this.handleTagDelete.bind(this);
    const tags = selectedData.map((tag) => {
      const tagFull = find(collection, {id: parseInt(tag)});

      return (
        <li className="searchform--tag__item" key={tag}>
          {tagFull.name}
          <button type="button" className="close"
            aria-label="Close"
            data-type={tabType}
            data-value={tag}
            onClick={handleTagDelete}>
              <span data-type={tabType}
                data-value={tag}
                aria-hidden="true">&times;</span>
          </button>
        </li>
      );
    });

    return (
        <div className="clearfix searchform--tags__wrap">
          <ul className="clearfix">
            {tags}
          </ul>
        </div>
    );
  }
}

class MSearcherSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterString: '',
      isModalOpen: true
    };
  }

  handleSearchInput = (event) => {
    let valueInput = event.target.value;

    valueInput = valueInput.toLowerCase();
    this.setState(() => ({
      filterString: valueInput
    }));
  }

  handleToggle(event) {
    event.preventDefault();
    this.setState(() => ({
      isModalOpen: !this.state.isModalOpen
    }));

  }

  render() {
    const state = this.state;
    const props = this.props;
    const searchPlaceholder =
      props.collection[0] && props.collection[0].name ?
      `Например, ${props.collection[0].name}` : 'Например, Республики';

    return (
        <div>
          <div className="form-group clearfix searchform--input__form">
            <input type="text"
              className="form-etagi form-bordered col-md-12"
              onChange={this.handleSearchInput}
              placeholder={searchPlaceholder}/>
          </div>
          <MSearcherList filterString={state.filterString} {...this.props}/>
        </div>
    );
  }
}

class MSearcherList extends Component {
  static propTypes = {
    collection: React.PropTypes.array,
    filterString: React.PropTypes.string,
    updateResult: React.PropTypes.string,
    selectedData: React.PropTypes.array,
    tabType: React.PropTypes.string,
    streetsByDistricts: React.PropTypes.array,
    showMap: React.PropTypes.number,
    height: React.PropTypes.number
  };

  handleSelectItem(event) {
    const {value, type} = event.target.dataset;
    const className = event.target.className;

    if(className !== ' disabledItem') {
      if (this.props.updateResult) {
        // добавляем в URL
        const itemsInUrl = Url.parseQuery()[type] || [];
        const itemsInMss = mss.get(type) || [];

        if (itemsInUrl.indexOf(value) === -1 &&
            itemsInMss.indexOf(value) === -1) {
          itemsInUrl.push(value);
        } else {
          itemsInUrl.splice(itemsInUrl.indexOf(value), 1);
        }

        Url.updateSearchParam(type, itemsInUrl);

        Url.updateSearchParam('currentPage', undefined);

        const {perPage} = mss.get();

        setTimeout(() => { // Костыль. Проблемы с асинхронностью выдачи
          getSearchResult(
            mss.get('class'),
            perPage,
            0,
            mss.get(),
            {}
          );
          // нужно ли перисчитывать кол-во объектов при изменении фильтра?
          ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
          ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
          ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
          ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
        }, 0);
      }
    }

    ModularSearcherActions.toggle(type, value);
  }

  render() {
    const collection = sortBy(this.props.collection, 'name');
    const filterString = this.props.filterString || '';
    const handleSelectItem = this.handleSelectItem.bind(this);
    const selectedData = this.props.selectedData;
    const tabType = this.props.tabType;
    const maxHeight = `${this.props.height}px`;
    const dataList = collection.map((listItem) => {
      const itemName = listItem.name.toString().toLowerCase();
      let  activeItem = '';

      if (includes(selectedData, listItem.id.toString())) {
        activeItem = 'activeItem';
      }

      if(this.props.tabType === 'street_id' &&
        this.props.streetsByDistricts.length &&
        !includes(this.props.streetsByDistricts, listItem.id.toString())) {
        activeItem += ' disabledItem';
      }

      const title = this.props.tabType === 'district_id' ?
        'Нажмите для добавления района в фильтр' :
          (activeItem === ' disabledItem' ||
          activeItem === 'activeItem disabledItem' ?
          'Улица не входит в выбранные районы' :
          'Нажмите для добавления улицы в фильтр');

      if (itemName.indexOf(filterString) !== -1 ||
          itemName.indexOf(filterString.replace(' ', '-')) !== -1 ||
          itemName.indexOf(filterString.replace('-', ' ')) !== -1) {
        return (
            <li key={listItem.id}>
                <span className={activeItem}
                  title={title}
                  onClick={handleSelectItem}
                  data-type={tabType}
                  data-value={listItem.id}>{listItem.name}</span>
                <span className='mdistricts_line'>
                {(activeItem === 'activeItem' ||
                  activeItem === 'activeItem disabledItem' ?
                  <span className={classNames(
                    'item-closeBtn',
                    'absoluteItem'
                    )}
                    onClick={handleSelectItem}
                    data-type={tabType}
                    data-value={listItem.id}
                    aria-hidden="true">&times;</span> : '')}
                </span>
            </li>
        );
      }
    });

    return (
        <div style={{maxHeight: maxHeight, overflowY: 'auto'}}>
          <ul className="searchform--tab__list clearfix col-md-12">
            {dataList}
          </ul>
        </div>
    );
  }
}

export default MSearcherDistricts;
