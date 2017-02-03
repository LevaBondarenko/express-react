/**
 * Modular Searcher Range component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map, without, size, keyBy, sortBy} from 'lodash';
import ReactDOM from 'react-dom';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import SelectTemplate from '../MSearcherSelect/SelectTemplate';
import SwitcherTemplate from '../MSearcherSelect/SwitcherTemplate';
import ModalTemplate from '../MSearcherSelect/ModalTemplate';
/**
 * Bootstrap 3 elements
 */
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';
import withCondition from '../../decorators/withCondition';

/* global data */
@withCondition()
class MSearcherSelect extends Component {
  static defaultProps = {
    collection: false,
    collectionDefault: false,
    showCheckAll: true
  };

  static propTypes = {
    collection: PropTypes.array,
    collectionDefault: PropTypes.array,
    id: PropTypes.string,
    defaultLabel: PropTypes.string,
    customLabel: PropTypes.string,
    filterObjects: PropTypes.string,
    singleElementLabel: PropTypes.string,
    searcherProperty: PropTypes.string,
    isMultiSelect: PropTypes.string,
    showFilter: PropTypes.string,
    isDefault: PropTypes.string,
    updateResult: PropTypes.string,
    showName: PropTypes.string,
    showCheckAll: PropTypes.any,
    template: PropTypes.string,
    replacement: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      filter: '',
      justLoaded: true,
      activeStap: -1,
      filterArr: [],
      flats: false
    };
    this.cityChanged = false;
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
    mss.offChange(this.onChange);
  }

  onChange = () => {
    const {collection, searcherProperty, collectionDefault,
     filterObjects} = this.props;
    const {collections: collectionsMSS} = mss.get();
    const collectionObj = size(collection) ? collection :
    collectionsMSS[searcherProperty] || [];
    const collectionDefaultObj = collectionDefault || [];
    const {'city_id': cityId} = mss.get();

    if (cityId !== null && !this.cityChanged) {
      this.cityChanged = true;
      ModularSearcherActions.getCollections();
    }
    if(collection) {
      collection.find(item => {
        item.id === 'flats' ? this.setState(() => ({
          flats: true
        })) : null;
      });
    }

    const actualCollection = data.page.qUrl[1]  === 'analytics' &&
     !this.state.flats ?
      collectionsMSS[searcherProperty] :
      collectionObj || collectionsMSS[searcherProperty];
    let modCollection = false;

    if (filterObjects && actualCollection) {
      const filterObjectsArr = filterObjects.split(',');

      modCollection = Object.keys(actualCollection).reduce((result, key) => {
        const val = actualCollection[key];

        if (!filterObjectsArr.includes(val.id.toString())) {
          result.push(val);
        }

        return result;
      }, []);
    }

    this.setState(() => ({
      collection: modCollection ? modCollection : actualCollection,
      collectionDefault: mss.get('collections')[this.props.searcherProperty] ||
       collectionDefaultObj,
      selection: mss.get(searcherProperty) || []
    }));

    if(this.state.justLoaded) {
      this.setState(() => ({
        justLoaded: false
      }));
      if(size(mss.get(searcherProperty)) === 0) {
        setTimeout(() => {this.setDefault();}, 0);
      }
    }
  }

  handleSelect(e) {
    const {isMultiSelect, searcherProperty} = this.props;
    const key = e.target.dataset.value;
    let mssSearchProperty = mss.get(searcherProperty);

    if (key) {
      if(parseInt(isMultiSelect)) {

        // свойство, которое настраивается для данного виджета,
        // как правило является массивом, соответственно, если значение св-ва строка,
        // то пробуем преобразовать его в массив на лету
        if (typeof mssSearchProperty === 'string') {
          const tmp = mssSearchProperty;

          mssSearchProperty = [];
          mssSearchProperty.push(tmp);
          mss.data[searcherProperty] = mssSearchProperty;
        }

        if(size(mssSearchProperty) === 1 && key === mssSearchProperty) {
          this.setDefault();
        } else {
          ModularSearcherActions.toggle(searcherProperty, key);
          ModularSearcherActions.set(null, {
            offset: this.props.updateResult ? 0 : mss.get()['offset'],
            currentPage: this.props.updateResult ? 0 : mss.get()['currentPage'],
          });
          if (this.props.updateResult) {
            Url.updateSearchParam(
              searcherProperty, mss.get(searcherProperty)
            );
            Url.updateSearchParam(
              'currentPage', undefined
            );

            const perPage = mss.get('perPage');

            getSearchResult(
              mss.get('class'),
              mss.get('perPage'),
              0,
              mss.get(),
              {}
            );

            ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
            ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
            ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
            ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
          }
        }
        e.nativeEvent.stopImmediatePropagation();
      } else {
        if (key === mssSearchProperty) {
          this.setDefault();
        } else {
          ModularSearcherActions.set(searcherProperty, key);
          if (this.props.updateResult) {
            Url.updateSearchParam(
              searcherProperty, key
            );
            getSearchResult(
              mss.get('class'),
              mss.get('perPage'),
              0,
              mss.get(),
              {}
            );
          }
        }
        this.setState(() => ({
          open: false
        }));
        e.nativeEvent.stopPropagation();
      }
    }
  }

  handleClick(e) {
    const {showFilter, id} = this.props;
    const className = e.target.className ?
        e.target.className : e.target.parentElement.className;
    const openstate = !this.state.open;

    if(openstate) {
      if (parseInt(showFilter)) {
        setTimeout(() => {
          ReactDOM
              .findDOMNode(this.refs[`ref${id}`]
                  .refs[`refSel${id}`])
              .focus();
        }, 50);
      }

      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
    }

    if(className.indexOf('disabled') === -1) {
      this.setState(() => ({
        open: openstate,
        filter: ''
      }));
    }
  }

  checkAll(e) {
    const collection = size(this.props.collection) ? this.props.collection :
     mss.get('collections')[this.props.searcherProperty];
    let ids = map(collection, item => {
      const {filter} = this.state;
      const itemName = item.name.toString().toLowerCase();
      const filtered = (itemName.indexOf(filter) !== -1 ||
      itemName.indexOf(filter.replace(' ', '-')) !== -1 ||
      itemName.indexOf(filter.replace('-', ' ')) !== -1);

      return filtered ? item.id.toString() : null;
    });

    ids = without(ids, null);
    ModularSearcherActions.set(this.props.searcherProperty, ids);

    if (this.props.updateResult) {
      Url.updateSearchParam(
        this.props.searcherProperty, ids
      );
      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

    e.nativeEvent.stopImmediatePropagation();
  }

  clear(e) {
    const multiSelect = parseInt(this.props.isMultiSelect);

    this.setDefault();

    if (this.props.updateResult) {
      Url.updateSearchParam(
        this.props.searcherProperty, undefined
      );
      getSearchResult(
        mss.get('class'),
        mss.get('perPage'),
        0,
        mss.get(),
        {}
      );
    }

    if(multiSelect) {
      e.nativeEvent.stopImmediatePropagation();
    } else {
      e.nativeEvent.stopPropagation();
    }
  }

  close = () => {
    this.setState(() => ({
      open: false,
      activeStap: -1,
      filter: ''
    }));
    document.removeEventListener('click', this.close);
  }

  filterChange(value) {
    const filterArr = [];
    const {collection} = this.state;

    map(collection, (val) => {
      const itemName = val.name.toString().toLowerCase();
      const filtered = (itemName.indexOf(value) !== -1 ||
      itemName.indexOf(value.replace(' ', '-')) !== -1 ||
      itemName.indexOf(value.replace('-', ' ')) !== -1);

      if (filtered) {
        filterArr.push(val);
      }
    });

    this.setState(() => ({
      filter: value,
      filterArr: filterArr
    }));
  }

  filterClear(e) {
    this.setState(() => ({filter: ''}));
    e.nativeEvent.stopImmediatePropagation();
  }

  setDefault() {
    const collection = size(this.props.collection) ? this.props.collection :
       mss.get('collections')[this.props.searcherProperty] || [];
    const collectionDefault = this.props.collectionDefault || [];
    const defaultSet = parseInt(this.props.isDefault);
    const defaultValues = {};
    const cityId = [data.options.cityId.toString()];
    const {searcherProperty} = this.props;
    const ids = map(collection, val => val.id.toString());
    const isSuperset = collectionDefault.every(val => ids.indexOf(val.id) >= 0);

    if(size(searcherProperty)) {
      if(defaultSet && isSuperset) {
        defaultValues[searcherProperty] = [];
        collectionDefault.forEach(item => {
          defaultValues[searcherProperty].push(item.id);
        });
        ModularSearcherActions.set(null, defaultValues);
      } else if(searcherProperty === 'city_id') {
        const def = {};

        def[searcherProperty] = cityId;
        ModularSearcherActions.set(null, def);
        ModularSearcherActions.getCollections();
      } else {
        ModularSearcherActions.set(searcherProperty, []);
      }
    }
  }

  handleKeyDown = (event) => {
    const {
        id, isMultiSelect, searcherProperty, showFilter
    } = this.props;
    const {activeStap, collection, filter, filterArr, open} = this.state;
    let openState = !!this.state.open;
    const mssSearchProperty = mss.get(searcherProperty);
    const actualList = filter && parseInt(showFilter) ?
        filterArr : collection;
    const sortObj = keyBy(actualList, 'name');
    const matchinLength = size(sortObj);
    let newActiveStap = -1;

    switch(event.which) {
    case 13:
      if (parseInt(showFilter)) {
        setTimeout(() => {
          ReactDOM
                .findDOMNode(this.refs[`ref${id}`]
                    .refs[`refSel${id}`])
                .focus();
        }, 50);
      }

      if (activeStap > -1) {
        let sortArr = [];
        let countArr = 0;
        let enterId;

        map(sortObj, (val, key) => {
          sortArr.push(key);
        });
        sortArr = sortBy(sortArr);
        map(sortArr, (item) => {
          if (activeStap === countArr) {
            enterId = sortObj[item].id.toString();
          }
          countArr++;
        });

        if(parseInt(isMultiSelect)) {
          if(size(mssSearchProperty) === 1 && enterId === mssSearchProperty) {
            this.setDefault();
          } else {
            ModularSearcherActions.toggle(searcherProperty, enterId);
          }
          newActiveStap = activeStap;
          event.preventDefault();
        } else {
          if (enterId === mssSearchProperty) {
            this.setDefault();
          } else {
            ModularSearcherActions.set(searcherProperty, enterId);
          }

          newActiveStap = -1;
        }
      }
      break;
    case 40:
      event.preventDefault();
      newActiveStap = activeStap >= -1 ? activeStap + 1 : -1;
      newActiveStap = matchinLength - 1 > newActiveStap ? newActiveStap :
        matchinLength - 1;

      break;
    case 38:
      event.preventDefault();
      newActiveStap = activeStap > -1 ? activeStap - 1 : -1;
      break;
    case 9: //tab
    case 27: //esc
      openState = false;
      document.removeEventListener('click', this.close);
      newActiveStap = -1;
      break;
    default:
      newActiveStap = -1;
    }

    newActiveStap = open ? newActiveStap : -1;

    if (newActiveStap !== activeStap || open != openState) {
      const elem = document.getElementById(`a${this.props.id}`);

      elem.scrollTop = newActiveStap > 8 ? newActiveStap * 19 - 76 : 0;

      this.setState(() => ({
        open: openState,
        activeStap: newActiveStap
      }));
    }
  }

  render() {

    let template;
    const showCheckAll = this.props.showCheckAll === '0' ? false : true;
    const searchProp = this.props.searcherProperty;
    const defaultTitle = {
      'keep': 'Тип ремонта',
      'wall_id': 'Тип стен',
      'class': 'Класс недвижимости',
      'type': 'Тип недвижимости',
      'typesAnalytics': 'Тип недвижимости для аналитики',
      'furniture': 'Укомплектованность',
      'series_id': 'Серия строения',
      'city_id': 'Город',
      'trakt_id': 'Тракт',
      'district_id': 'Район',
      'street_id': 'Улица',
      'builder_id': 'Застройщик',
      'newcomplex_id': 'ЖК',
      'action_sl': 'Тип сделки'
    };

    switch (this.props.template) {
    case 'switcher':
      template = (
            <SwitcherTemplate
                parentProps={this.props}
                parentState={this.state}
                handleSelect={this.handleSelect.bind(this)}
                handleClick={this.handleClick.bind(this)}
                clear={this.clear.bind(this)}
            />
        );
      break;
    case 'select':
      template = (
            <SelectTemplate
                ref={`ref${this.props.id}`}
                parentProps={this.props}
                parentState={this.state}
                handleSelect={this.handleSelect.bind(this)}
                handleClick={this.handleClick.bind(this)}
                filterChange={this.filterChange.bind(this)}
                filterClear={this.filterClear.bind(this)}
                clear={this.clear.bind(this)}
                activeStap={this.state.activeStap}
                onKeyDown={this.handleKeyDown.bind(this)}
                checkAll={showCheckAll ? this.checkAll.bind(this) : null}
                title={defaultTitle[searchProp]}
                id={this.props.id}
            />
        );
      break;
    case 'modal':
    default :
      template = (
        <ModalTemplate
          ref={`ref${this.props.id}`}
          parentProps={this.props}
          parentState={this.state}
          handleSelect={this.handleSelect.bind(this)}
          handleClick={this.handleClick.bind(this)}
          filterChange={this.filterChange.bind(this)}
          filterClear={this.filterClear.bind(this)}
          clear={this.clear.bind(this)}
          activeStap={this.state.activeStap}
          checkAll={showCheckAll ? this.checkAll.bind(this) : null}
          title={defaultTitle[searchProp]}
          id={this.props.id}
        />
    );
      break;
    }

    return (
        <div className="clearfix msearcher">
          {template}
        </div>
    );
  }
}

export default MSearcherSelect;
