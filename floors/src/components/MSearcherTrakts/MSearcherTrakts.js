/**
 * Modular Searcher Trakts and Districts Component
 *
 * @ver 0.0.1
 * @author Babitsyn Andrey
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {clone, uniq, each, union, find, includes, isEqual, size, findIndex,
  sortBy, filter, isEmpty,
  intersection, reject, difference, map} from 'lodash';
import MapDistricts from '../MapDistricts/MapDistricts';
import request from 'superagent';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import classNames from 'classnames';
import {declOfNum} from '../../utils/Helpers';

const ModalBody = Modal.Body;

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import wss from '../../stores/WidgetsStateStore';
import WidgetActions from '../../actions/WidgetsActions';
import DistrictsByTrakt from './DistrictsByTrakt';
import SearchResult from './SearchResult';
import Url from '../../utils/Url';
import {getSearchResult} from '../../actions/SearchActions';
import withCondition from '../../decorators/withCondition';

@withCondition()
class MSearcherTrakts extends Component {
  static propTypes = {
    defaultLabel: PropTypes.string,
    customLabel: PropTypes.string,
    showName: PropTypes.string,
    showMap: PropTypes.string,
    districts: PropTypes.array,
    cityStore: PropTypes.string,
    modalHeader: PropTypes.string,
    updateResult: PropTypes.string,
    checkAllTraktLabel: PropTypes.string,
    checkAllTraktsLabel: PropTypes.string,
    clearAllTraktsLabel: PropTypes.string,
    traktSearchPlaceholder: PropTypes.string,
  }

  static defaultProps = {
    defaultLabel: 'Районы',
    customLabel: 'Выбрано',
    districts: [],
    cityStore: 'selectedCity',
    showMap: 'yes',
    modalHeader: 'Поиск по трактам',
    checkAllTraktLabel: 'Выбрать весь тракт',
    checkAllTraktsLabel: 'Выбрать все тракты',
    clearAllTraktsLabel: 'Очистить все тракты',
    traktSearchPlaceholder: 'Искать в тракте'
  }

  constructor(props) {
    super(props);
    const {selectedCity} = wss.get();
    const cityId = mss.get('city_id') ? mss.get('city_id') :
      (selectedCity ? selectedCity.city_id : 0);

    this.state = {
      showModal: false,
      listDisplayType: 'trakt',
      label: props.defaultLabel,
      collections: mss.get('collections') || [],
      districts: mss.get('district_id') || [],
      init: false,
      districtsByTrakts: {},
      activeStap: -1,
      'city_id': cityId,
      view: props.showMap === 'yes' ? 'map' : 'list',
      showSearchResult: false,
    };
    wss.set('currentTrakt', {});
  }

  componentWillMount() {
    mss.onChange(this.onChange);
    wss.onChange(this.onChange);
    this.getTotalObjectsCount().then(response => {
      this.setState(() => ({
        counts: response.body.result
      }));
    });
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
    wss.offChange(this.onChange);
  }

  onChange = () => {
    let districts, title = this.props.defaultLabel;
    const allDistricts = clone(mss.get('collections')['district_id']) || [];
    const trakts = clone(mss.get('collections')['trakt_id']);
    const dByT = clone(mss.get('collections')['districtsByTrakts']);
    const traktsFromUrl = uniq(clone(mss.get('trakt_id')));
    const newState = {};
    const showName = parseInt(this.props.showName) || 0;
    const customLabel = this.props.customLabel || 'Выбрано';

    if (!isEqual(mss.get('city_id'), this.state.city_id)) {
      newState['city_id'] = mss.get('city_id');

      this.getTotalObjectsCount().then(response => {
        this.setState(() => ({
          showModal: false,
          view: this.props.showMap === 'yes' ? 'map' : 'list',
          listDisplayType: 'trakt',
          counts: response.body.result,
          showSearchResult: false,
        }));
      });
    }

    // при инициализации виджета записываем в state массив районов
    districts = clone(mss.get('district_id'));
    if (!this.state.init && allDistricts.length > 0) {
      each(traktsFromUrl, (traktId) => {
        districts = union(dByT[traktId], districts);
      });

      each(districts, distr => {
        const district = find(allDistricts, {id: parseInt(distr)});
        const traktId = district.trakt_id.toString();

        if (!includes(traktsFromUrl, traktId)) {
          traktsFromUrl.push(traktId);
        }
      });
      mss.set(null, {
        'district_id': districts
      });
      mss.set(null, {
        'trakt_id': traktsFromUrl
      });

      if (this.props.showMap === 'no') {
        wss.set('currentTrakt', trakts[0]);
      }

      newState.init = true;
    }

    const cnt = districts.length;
    let label = cnt ? `${customLabel}: ${cnt} ${declOfNum(cnt,
   ['район', 'района', 'районов'])}` : this.props.defaultLabel;

    if (cnt === 1 && showName) {
      const districtId = parseInt(mss.get('district_id'));

      if (size(allDistricts)) {
        label = find(allDistricts, {id: districtId});
        label = label ? label.name : '';
        title = label;
      }
    }
    title = label;

    const chosenTrakts = filter(trakts, trakt => {
      return includes(traktsFromUrl, trakt.id.toString());
    });

    wss.set(null, {
      chosenTrakts: chosenTrakts,
    });

    newState.districts = districts;
    newState.districtsByTrakts = dByT;
    newState.collections = mss.get('collections');
    newState.label = label;
    newState.title = title;
    this.setState(() => (newState));
  }

  open(event) {
    let init = this.state.init;

    if (!this.state.init) {
      if (!mss.get('district_id').length > 0) {
        this.clear(event);
      }
      init = true;
    }

    ReactDOM.findDOMNode(this.refs.districtsButton).blur();
    this.setState(() => ({
      showModal: true,
      init: init
    }));
  }

  close() {
    this.setState(() => ({
      showModal: false
    }));
  }

  clear(event) {
    if (event) {
      event.preventDefault();
    }


    const clearCollections = {
      'trakt_id': [],
      'district_id': [],
    };

    const currentTrakt = this.props.showMap === 'yes' ? {} :
      mss.get('collections').trakt_id[0];


    ModularSearcherActions.set(null, clearCollections);
    wss.set(null, {
      currentTrakt: currentTrakt,
      chosenTrakts: []
    });

    if (this.props.updateResult) {
      Url.updateSearchParam(
        'district_id',
        undefined
      );
      Url.updateSearchParam(
        'trakt_id',
        undefined
      );
      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

    this.setState(() => ({
      view: this.props.showMap === 'yes' ? 'map' : 'list',
      listDisplayType: this.props.showMap === 'yes' ?
        this.state.listDisplayType :
        'trakt'
    }));
  }

  // переключение по трактам. Выделенный тракт помечается классом active
  changeCurrentTrakt() {
    const currentTrakt = {
      id: arguments[0],
      name: arguments[1]
    };

    wss.set('currentTrakt', currentTrakt);

    this.setState(() => ({
      listDisplayType: 'trakt',
      view: 'list'
    }));
  }

  // переключение между отображениями. Карта / Список
  changeView() {
    const view = arguments[0];
    const listDisplayType = arguments[3];
    let currentTrakt = {};
    const oldCurrentTrakt = !isEmpty(wss.get('currentTrakt')) ?
                clone(wss.get('currentTrakt')) :
                this.state.collections.trakt_id[0];

    if (listDisplayType === 'trakt') {
      currentTrakt = {
        id: arguments[1] ? arguments[1] : oldCurrentTrakt['id'],
        name: arguments[2] ? arguments[2] : oldCurrentTrakt['name']
      };
    } else {
      currentTrakt = wss.get('chosenTrakts')[0];
    }

    if (this.state.view !== view || listDisplayType !== 'trakt') {
      wss.set('currentTrakt', currentTrakt);
      this.setState(() => ({
        view: view,
        listDisplayType: listDisplayType,
      }));
    }
  }

  changeViewSearch() {
    return this.changeView.bind(
      this, 'list', null, null, 'search'
    );
  }

  // метод, который проверяет, есть ли в выделенном тракте выбранные районы
  // необходим для отображения галочки рядом с названием тракта
  hasSelectedDistricts() {
    const traktId = arguments[0];
    const selectedDistricts = mss.get('district_id');
    const districtsByTrakts = this.state.districtsByTrakts;
    const allDistricts = districtsByTrakts[traktId] || [];
    const has = intersection(selectedDistricts, allDistricts);

    return has.length > 0;
  }

  // метод записывает в хранилище районы выбранного тракта
  selectAllByTrakt() {
    const traktId = arguments[0];
    const selectedByTrakt = arguments[2];
    const traktColl = this.state.collections.trakt_id;
    const currentTrakt = find(traktColl, {id: traktId});
    const districtsByTrakts = this.state.districtsByTrakts;
    const allByTrakt = districtsByTrakts[traktId] || [];
    let chosenTrakts = wss.get('chosenTrakts') ?
      clone(wss.get('chosenTrakts'))   : [];
    let selected = mss.get('district_id') ?
      clone(mss.get('district_id'))   : [];

    // если кол-во выбранных в тракте районов равно кол-ву
    // всех районов в тракте, то отменяем выбор
    if (allByTrakt.length === selectedByTrakt.length) {
      selected = difference(selected, allByTrakt);

      // удаляем тракт из выбранных в state.trakts
      chosenTrakts = reject(chosenTrakts, trakt => {
        return trakt.id === currentTrakt.id;
      });
    } else {
      // добавляем в state.trakts выбранный тракт
      if (!find(chosenTrakts, {id: currentTrakt.id})) {
        chosenTrakts.push(currentTrakt);
      }
      selected = union(selected, allByTrakt);
    }

    const trakts = map(chosenTrakts, trakt => trakt.id.toString());

    ModularSearcherActions.set(null, {
      'district_id': selected,
      'trakt_id': trakts
    });

    if (this.props.updateResult) {

      this.updateUrlParams();

      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

    WidgetActions.set(null, {
      'chosenTrakts': chosenTrakts,
    });
  }

  updateUrlParams = () => {
    const selected = clone(mss.get('district_id'));
    const trakts = clone(mss.get('trakt_id'));
    const districtsByTrakts = this.state.districtsByTrakts;

    Url.updateSearchParam(
      'trakt_id',
      undefined
    );
    Url.updateSearchParam(
      'district_id',
      undefined
    );
    Url.updateSearchParam(
      'currentPage',
      undefined
    );

    let districtsToUrl = [];
    let traktsToUrl = [];

    if (size(trakts)) {
      each(trakts, (traktId) => {
        const sel = intersection(selected, districtsByTrakts[traktId])
          .length;
        const total = districtsByTrakts[traktId].length;

        if (sel === total) {
          traktsToUrl.push(traktId);
        } else {
          districtsToUrl = union(districtsToUrl,
            intersection(selected, districtsByTrakts[traktId]));
        }
      });
    } else {
      districtsToUrl = selected;
      traktsToUrl = undefined;
    }


    Url.updateSearchParam(
      'trakt_id',
      traktsToUrl
    );
    Url.updateSearchParam(
      'district_id',
      districtsToUrl
    );

    ModularSearcherActions.set(null, {
      offset: 0,
      currentPage: 0
    });
  }

  // метод записывает в хранилище все районы
  selectAll(event) {
    event.preventDefault();

    let allDistricts = this.state.collections.district_id;

    allDistricts = map(allDistricts, distr => distr.id.toString());
    const allTrakts = map(this.state.collections.trakt_id, trakt => {
      return {
        id: trakt.id,
        name: trakt.name
      };
    });

    ModularSearcherActions.set(null, {
      'district_id': allDistricts,
      'trakt_id': map(allTrakts, trakt => trakt.id.toString())
    });
    WidgetActions.set(null, {
      chosenTrakts: allTrakts,
      currentTrakt: allTrakts[0]
    });

    if (this.props.updateResult) {
      Url.updateSearchParam(
        'trakt_id',
        map(allTrakts, trakt => trakt.id.toString())
      );
      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

    this.setState(() => ({
      view: 'list',
      listDisplayType: 'all',
    }));
  }

  textSearch(event) {
    const q = event.target.value;
    const showSearchResult = q !== '';
    let matching = [];
    const allDistricts = this.state.collections.district_id;

    matching = filter(allDistricts, distr => {
      const nameStart = distr.name ?
        distr.name.toString().slice(0, q.length) : false;

      return nameStart && nameStart
          .toLocaleLowerCase()
          .search(q.toLocaleLowerCase()) !== -1;
    });

    this.setState(() => ({
      showSearchResult: showSearchResult,
      query: q,
      matching: matching
    }));
  }

  getSearchResult() {
    if (this.state.init) {
      let matching = this.state.matching || [];
      const trakts = this.state.collections.trakt_id || [];

      if (matching.length > 0) {
        matching = map(matching, distr => {
          distr.trakt = find(trakts, {id: distr.trakt_id});
          return distr;
        });
      }

      return matching;
    }
  }

  clearSearch() {
    this.setState(() => ({
      query: '',
      showSearchResult: false
    }));
  }

  getTotalObjectsCount() {

    const cityId = mss.get('city_id') ? mss.get('city_id') :
      wss.get('selectedCity').city_id;

    return new Promise((resolve, reject) => {
      request
        .get(`/backend/?city_id=${cityId}`)
        .type('form')
        .set('Accept', 'application/json')
        .query({
          action: 'get_object_count_by_distr',
        })
        .end((err, res) => {
          if (err) {
            reject({error: err.text});
          } else if (res.body.status != 'ok') {
            reject({error: err.text});
          } else {
            resolve(res);
          }
        });
    });
  }

  handleBlur = () => {
    this.setState(() => ({
      activeStap: -1
    }));
  }

  handleKeyDown = (event) => {
    //event.preventDefault();
    const {activeStap, matching, counts} = this.state;
    const matchinLength = matching && matching.length || 0;
    const self = this;
    let newActiveStap = activeStap;

    if (matchinLength) {
      switch(event.which) {
      case 13:
        if (activeStap > -1) {
          const activeDistrict = sortBy(matching, distr => {
            const objCounts = counts[distr.id];
            let total = 0;

            for (const objType in objCounts) {
              if (objCounts.hasOwnProperty(objType)) {
                total += parseInt(objCounts[objType]);
              }
            }
            return total * -1;
          });

          const activeDistrictVal = activeDistrict[activeStap];
          const {districts, districtsByTrakts} = this.state;
          const doubleId = findIndex(districts, (val) => {
            return val === activeDistrictVal.id.toString();
          });

          if (doubleId === -1) {
            districts.push(activeDistrictVal.id.toString());
          } else {
            districts.splice(doubleId, 1);
          }

          ModularSearcherActions.toggle('district_id',
            activeDistrictVal.id.toString());

          let chosenTrakts = wss.get('chosenTrakts') ?
            clone(wss.get('chosenTrakts')) : [];

          // добавляем в trakts выбранный тракт
          if (!find(chosenTrakts, {id: activeDistrictVal.trakt.id})) {
            chosenTrakts.push(activeDistrictVal.trakt);
          }
          let currentTrakt = activeDistrictVal.trakt;
          const curTrakt =
            districtsByTrakts[activeDistrictVal['trakt_id'].toString()];

          if (intersection(curTrakt, districts).length === 0 &&
            chosenTrakts) {
            chosenTrakts = reject(chosenTrakts, trakt => {
              return trakt.id === currentTrakt.id;
            });

            currentTrakt = chosenTrakts.length ?
              chosenTrakts[0] :
              mss.get().collections['trakt_id'][0];
          }

          ModularSearcherActions.set(null, {
            'trakt_id': map(chosenTrakts, trakt => trakt.id.toString()),
          });
          WidgetActions.set(null, {
            chosenTrakts: chosenTrakts,
            currentTrakt: currentTrakt
          });
        }
        break;
      case 40:
        event.preventDefault();
        newActiveStap = activeStap >= -1 ? activeStap + 1 : -1;
        newActiveStap = matchinLength - 1 > newActiveStap ?
          (newActiveStap > 12 ? 12 : newActiveStap) :
          matchinLength - 1;

        break;
      case 38:
        event.preventDefault();
        newActiveStap = activeStap > -1 ? activeStap - 1 : -1;
        break;
      default:
        newActiveStap = -1;
      }
    }

    if (newActiveStap !== activeStap) {
      self.setState(() => ({
        activeStap: newActiveStap
      }));
    }
  }

  focusSearch() {
    const input = ReactDOM.findDOMNode(this.refs.textSearch);
    const initialClassName = input.className;

    input.focus();
    input.className += ' highlighted';
    setTimeout(() => {
      input.className = initialClassName;
    },2000);
  }

  render() {
    const {
      showModal, label, collections, districts, districtsByTrakts, counts,
      listDisplayType, activeStap
    } = this.state;
    const {
      showMap, cityStore, modalHeader, checkAllTraktsLabel, clearAllTraktsLabel,
      checkAllTraktLabel, traktSearchPlaceholder
    } = this.props;
    const {
      [cityStore]: {coords, 'city_id': cityId, name: cityName},
      currentTrakt
    } = wss.get();
    const self = this;
    const hasSelectedDistricts = this.hasSelectedDistricts.bind(this);
    const handleKeyDown = this.handleKeyDown.bind(this);
    const handleBlur = this.handleBlur.bind(this);
    let totalCount = 0;

    if (districts) {
      if (districts.length > 0 && counts) {
        each(districts, distrId => {
          const item = counts[distrId];

          for (const t in item) {
            if (item.hasOwnProperty(t)) {
              totalCount += parseInt(item[t]);
            }
          }
        });
      }
    }

    // подготавливаем компоненты для отображения трактов
    const trakts = map(collections.trakt_id, (trakt) => {
      const name = trakt.name === cityName ? 'В черте города' : trakt.name;
      const id = trakt.id;
      const traktClassName = classNames({
        'mapTraktItem form-group label--margin': true,
        'active': currentTrakt ? currentTrakt.id === trakt.id : false
      });

      // все районы, которые соответствуют текущему trakt.id
      const allDistricts = districtsByTrakts[trakt.id] || [];

      // пересечение массивов выбранных районов и районов, которые соответствуют тракту
      const selectedByTrakt = intersection(districts, allDistricts);
      const checkBoxClassName = classNames({
        'icon_arrow': true,
        'partially': allDistricts.length !== selectedByTrakt.length
      });
      let objectsCount = 0;

      if (counts) {
        each(selectedByTrakt, distrId => {
          const item = counts[distrId];

          for (const t in item) {
            if (item.hasOwnProperty(t)) {
              objectsCount += parseInt(item[t]);
            }
          }
        });
      }

      const countText = `${objectsCount} ${declOfNum(
        objectsCount, ['объект', 'объекта', 'объектов'])} в
         ${selectedByTrakt.length} ${declOfNum(
              selectedByTrakt.length, ['районе', 'районах', 'районах'])}`;

      return (
        <div key={id}
             onClick={self.changeCurrentTrakt.bind(self, id, trakt.name)}
             className={traktClassName}>
          <input type='checkbox'
                 id={`trakt_${id}`}
                 className='form-etagi input_arrow'
                 checked={hasSelectedDistricts(id)}
                 onChange={self.selectAllByTrakt.bind(
                  self, id, 'district_id', selectedByTrakt
                 )} />
          <label className='checkbox_arrow arrow_extend'>
            <i onClick={self.selectAllByTrakt.bind(
                 self, id, 'district_id', selectedByTrakt)}
               className={checkBoxClassName}></i>
            <span>{name}</span>
          </label>
          {objectsCount > 0 ? (
          <span className='mapTraktObjCount'>
            {countText}
          </span>
          ) : <span />}
        </div>
      );
    });

    return (
      <div className="clearfix msearcher
         msearcher-disctrict" title={this.state.title}>
        <Button
          ref='districtsButton'
          className='btn-select'
          bsStyle='default'
          data-field='trakts'
          onClick={this.open.bind(this)}>
            <span className="btn-label">{label}</span>&nbsp;
            <span className="caret" />
        </Button>
        <Modal
          className='etagi--modal wide modal-trakts'
          show={showModal ? showModal : false}
          onHide={this.close.bind(this)}>
          <button onClick={this.close.bind(this)}
            className="etagi--closeBtn etagi--closeBtn-white">
            <span aria-hidden="true">&times;</span>
          </button>
          <ModalBody className='mapTraktModal'>
            <div className="mapTraktHeader">
              {modalHeader}
            </div>
            <div className="mapTraktContent">
              <div className="mapTraktLeft">
                <div className="showAllList">
                  {(districts.length > 0 && this.state.view === 'map') ? (
                    <Button
                      className='btn-green'
                      onClick={this.changeView.bind(
                        this, 'list', null, null, 'all'
                      )}>
                      Показать списком
                    </Button>
                  ) : ''}
                </div>
                <div className="mapTraktCategories">
                  <div className="headerText">
                    Воспользуйтесь нашим текстовым поиском по районам
                  </div>
                  <div className="megaKnopka">
                    <button
                      onClick={this.focusSearch.bind(this)}
                      className='btn btn-green btnUseSearch'>
                      Воспользоваться
                    </button>
                  </div>
                </div>
                {this.state.view === 'list' ? (
                  <DistrictsByTrakt
                    cityStore={cityStore}
                    counts={counts}
                    districts={collections.district_id}
                    districtsByTrakts={districtsByTrakts}
                    selected={districts}
                    updateUrlParams={this.updateUrlParams}
                    listDisplayType={listDisplayType}
                    matching={this.state.matching}
                    mapVisible={showMap}
                    showMap={this.changeView.bind(
                      this, 'map', null, null, 'trakt'
                    )}
                    updateResult={this.props.updateResult}
                    show={this.state.view === 'list'}
                    checkAllTraktLabel={checkAllTraktLabel}
                    traktSearchPlaceholder={traktSearchPlaceholder} />
                ) : ''}
                <div className="mapTraktMap">
                  {showMap === 'yes' ? (
                    <MSearcherMapTrakts
                      collection={collections.district_id}
                      selectedData={districts}
                      coords={coords}
                      citiesIds={[cityId]}
                      districtsByTrakts={districtsByTrakts}
                      updateUrlParams={this.updateUrlParams}
                      updateResult={this.props.updateResult}
                      height={600}/>
                    ) : (<div />)}
                </div>
              </div>
              <div className="mapTraktRight">
                <div className="mapTraktSearchForm">
                  <input
                    type="text"
                    id='textSearch'
                    ref='textSearch'
                    className='mapTraktTextSearch'
                    placeholder='Поиск по районам'
                    value={this.state.query}
                    onChange={this.textSearch.bind(this)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    />
                  <Glyphicon className='mapTraktSIcon' glyph="search" />
                  {this.state.query ? (
                    <span
                      onClick={this.clearSearch.bind(this)}
                      className='clearSearch'>&times;</span>
                  ) : ''}
                </div>
                <div className="mapTraktSearchResultOverlay">
                    <SearchResult
                      cityStore={cityStore}
                      show={this.state.showSearchResult}
                      counts={counts}
                      query={this.state.query}
                      districts={this.getSearchResult()}
                      activeStap={activeStap}
                      selected={districts}
                      districtsByTrakts={districtsByTrakts}
                      updateResult={this.props.updateResult}
                      updateUrlParams={this.updateUrlParams}
                      clearSearch={this.clearSearch.bind(this)}
                      changeView={this.changeViewSearch.bind(this)}
                    />
                </div>
                <div className="mapTraktTraktList">
                  <GeminiScrollbar>
                    {trakts}
                  </GeminiScrollbar>
                </div>
                <div className="mapTraktButtons">
                  <div className="mapTraktGreyBtns">
                    <a
                      href='#'
                      onClick={this.selectAll.bind(this)}>
                      {checkAllTraktsLabel}
                    </a>
                    <a
                      href='#'
                      onClick={this.clear.bind(this)}>
                      {clearAllTraktsLabel}
                    </a>
                  </div>
                  <div className="mapTraktSelectWrapper">
                    <Button
                      disabled={districts.length === 0}
                      onClick={this.changeView.bind(
                        this, 'list', null, null, 'all'
                      )}>
                      Выбранные районы
                      {districts.length > 0 ?
                        (<span className='mapTraktGreyBtns_chosen'>
                        {districts.length > 0 ? districts.length : ''}
                      </span>) : (<span />)
                      }
                    </Button>
                    <button
                      onClick={this.close.bind(this)}
                      className='btn btn-green mapTraktSelect'>
                      ВЫБРАТЬ
                      {districts.length > 0 ?
                        ` (${totalCount} ${declOfNum(totalCount,
                      ['объект','объекта','объектов'])})` : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

class MSearcherMapTrakts extends MapDistricts {
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
    const trakts = mss.get('collections')['trakt_id'];
    const districts = this.props.collection;
    const districtId = event.get('target').myDistrictsIds;
    const traktId = find(districts, {
      id: parseInt(districtId)
    })['trakt_id'];
    const currentTrakt = find(trakts, {
      id: parseInt(traktId)
    });
    let chosenTrakts = wss.get('chosenTrakts') ?
      clone(wss.get('chosenTrakts')) : [];

    // добавляем в trakts выбранный тракт
    if (!find(chosenTrakts, {id: currentTrakt.id})) {
      chosenTrakts.push(currentTrakt);
    }

    if (!wss.get('currentTrakt')) {
      wss.set('currentTrakt', {});
    }

    ModularSearcherActions.toggle(
      'district_id',
      districtId
    );
    // если в тракте не осталось выбранных районов,
    // убираем его из выбранных трактов
    const selected = clone(mss.get('district_id'));
    const dByT = this.props.districtsByTrakts[currentTrakt.id];

    if (intersection(dByT, selected).length === 0) {
      chosenTrakts = reject(chosenTrakts, trakt => {
        return trakt.id === currentTrakt.id;
      });

      // если не осталось выделенных трактов, выделяем первый
      if (chosenTrakts.length === 0) {
        WidgetActions.set('currentTrakt', mss.get('trakt_id')[0]);
      } else {
        WidgetActions.set('currentTrakt', chosenTrakts[0]);
      }
    }

    ModularSearcherActions.set(null, {
      'trakt_id': map(chosenTrakts, trakt => trakt.id.toString())
    });
    WidgetActions.set(null, {
      chosenTrakts: chosenTrakts,
      currentTrakt: currentTrakt
    });

    if (this.props.updateResult) {

      this.props.updateUrlParams();

      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

  }
}

export default MSearcherTrakts;
