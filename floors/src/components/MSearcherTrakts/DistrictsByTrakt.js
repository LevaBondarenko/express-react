import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, find, intersection, difference,
  reject, map, filter, sortBy, includes} from 'lodash';
import GeminiScrollbar from 'react-gemini-scrollbar';
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import Button from 'react-bootstrap/lib/Button';
import classNames from 'classnames';
import wss from '../../stores/WidgetsStateStore';
import WidgetActions from '../../actions/WidgetsActions';
import {declOfNum} from '../../utils/Helpers';
import {getSearchResult} from '../../actions/SearchActions';

class DistrictsByTrakt extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collection: []
    };
  }

  componentWillMount() {
    wss.onChange(this.onChange);
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      currentTrakt: wss.get('currentTrakt')
    }));
  }

  handleSelectItem(district, event) {
    const {value, type} = event.target.dataset;
    let chosenTrakts = wss.get('chosenTrakts') ?
      clone(wss.get('chosenTrakts')) : [];
    const currentTrakt = district.trakt ? {
      id: district.trakt.id,
      name: district.trakt.name
    } : clone(wss.get('currentTrakt'));

    if (!wss.get('currentTrakt')) {
      wss.set('currentTrakt', {});
    }
    // добавляем в trakts выбранный тракт
    if (!find(chosenTrakts, {id: parseInt(currentTrakt.id)})) {
      chosenTrakts.push(currentTrakt);
    }

    ModularSearcherActions.toggle(type, value.toString());

    // если в тракте не осталось выбранных районов,
    // убираем его из выбранных трактов
    const selected = clone(mss.get('district_id'));
    const dByT = this.props.districtsByTrakts[currentTrakt.id];

    if (intersection(dByT, selected).length === 0) {
      chosenTrakts = reject(chosenTrakts, trakt => {
        return trakt.id === currentTrakt.id;
      });

      // если не осталось выделенных трактов, выделяем первый
      if (selected.length > 0) {
        if (chosenTrakts.length === 0) {
          WidgetActions.set('currentTrakt', mss.get('trakt_id')[0]);
        } else {
          WidgetActions.set('currentTrakt', chosenTrakts[0]);
        }
      }
    }

    if (mss.get('trakt_id').length !== chosenTrakts.length) {
      ModularSearcherActions.set(null, {
        'trakt_id': map(chosenTrakts, trakt => trakt.id.toString())
      });
    }
    WidgetActions.set(null, {'chosenTrakts': chosenTrakts});

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

  selectAll() {
    const collection = this.props.districts;
    const currentTrakt = clone(wss.get('currentTrakt'));
    let all = filter(collection, distr => {
      return distr.trakt_id === currentTrakt.id;
    });
    const chosenTrakts = wss.get('chosenTrakts');

    // добавляем в trakts выбранный тракт
    if (!find(chosenTrakts, {id: parseInt(currentTrakt.id)})) {
      chosenTrakts.push(currentTrakt);
    }

    all = map(all, distr => distr.id.toString());
    WidgetActions.set(null, {'chosenTrakts': chosenTrakts});
    ModularSearcherActions.set(null, {
      'trakt_id': map(chosenTrakts, trakt => trakt.id.toString()),
      'district_id': all
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

  unselectByTrakt(event) {
    const collection = this.props.districts;
    const selected = mss.get('district_id');
    const stayActive = event.target.dataset.stayactive === '1' ? true : false;
    const currentTrakt = event.target.dataset.trakt ?
      parseInt(event.target.dataset.trakt) :
      clone(wss.get('currentTrakt'))['id'];

    let chosenTrakts = clone(wss.get('chosenTrakts'));
    let all = filter(collection, distr => {
      return distr.trakt_id === currentTrakt;
    });


    // удаляем тракт из выбранных в state.trakts
    chosenTrakts = reject(chosenTrakts, trakt => {
      return trakt.id === parseInt(currentTrakt);
    });
    // если удаляется активный (выделенный тракт), то делаем активным первый в списке
    if (chosenTrakts.length > 0) {
      if (currentTrakt === wss.get('currentTrakt')['id'] && !stayActive) {
        wss.set('currentTrakt', chosenTrakts[0]);
      }
    }
    all = map(all, distr => distr.id.toString());
    all = difference(selected, all);
    ModularSearcherActions.set(null, {
      'district_id': all,
      'trakt_id': map(chosenTrakts, trakt => trakt.id.toString())
    });
    WidgetActions.set(null, {
      chosenTrakts: chosenTrakts
    });

    if (this.props.updateResult) {
      this.props.updateUrlParams();
    }
  }

  // переключение по трактам. Выделенный тракт помечается классом active
  changeCurrentTrakt(trakt) {
    WidgetActions.set('currentTrakt', trakt);
  }

  searchFilter(event) {
    const q = event.target.value || '';

    this.setState(() => ({
      query: q
    }));
  }

  getFilterResult() {
    const query = this.state.query || '';
    const collection = this.props.districts;
    const currentTrakt = wss.get('currentTrakt') || {};
    const thisTraktDistricts = filter(collection, district => {
      return district.trakt_id === parseInt(currentTrakt.id);
    });
    const matching = filter(thisTraktDistricts, distr => {
      const nameStart = distr.name ?
        distr.name.toString().slice(0, query.length) : false;

      return nameStart && nameStart
          .toLocaleLowerCase()
          .search(query.toLocaleLowerCase()) !== -1;
    });

    return (query.length > 0) ? matching : thisTraktDistricts;
  }

  render() {
    const {show, checkAllTraktLabel, traktSearchPlaceholder} = this.props;
    const cityName = wss.get(this.props.cityStore).name;
    const currentTrakt = wss.get('currentTrakt');
    const placeholderText = currentTrakt.name === cityName ?
        'Искать в черте города' :
        `${traktSearchPlaceholder}: ${currentTrakt.name}`;
    const currentTraktName = currentTrakt.name === cityName ?
        'В черте города' : currentTrakt.name;
    const selected = this.props.selected;
    const listDisplayType = this.props.listDisplayType;
    const chosenTrakts = clone(wss.get('chosenTrakts'));
    const self = this;
    const counts = this.props.counts;
    let collection = listDisplayType !== 'search' ?
      this.getFilterResult() :
      this.props.matching;
    const total = {
      districts: 0,
      objects: 0
    };

    if (!currentTrakt && listDisplayType !== 'search' && show) {
      return (
        <div></div>
      );
    }

    if (currentTrakt && listDisplayType !== 'search') {
      collection = filter(collection, district => {
        // считаем кол-во объектов в выбранных районах
        const objCounts = counts[district.id];

        if (includes(selected, district.id.toString())) {
          for (const objType in objCounts) {
            if (objCounts.hasOwnProperty(objType)) {
              total.objects += parseInt(objCounts[objType]);
            }
          }
          total.districts++;
        }
        return true;
      });
    }

    // сортируем районы по названию
    collection = sortBy(collection, distr => distr.name);

    let cnt = 0;
    const districts = map(collection, district => {
      cnt++;
      return (
        <div className="districtItem form-group" key={`distr_${district.id}`}>
          <input type='checkbox'
                 id={`district_${district.id}`}
                 className='form-etagi input_arrow'
                 checked={includes(selected, district.id.toString())}
                 onChange={self.handleSelectItem.bind(self, district)}
                 data-type='district_id'
                 data-value={district.id}/>
          <label htmlFor={`district_${district.id}`}
                 className='checkbox_arrow arrow_extend'>
            <i className='icon_arrow'> </i>
            <span>{district.name}</span>
          </label>
        </div>
      );
    });

    // Для flex разметки. Если кол-во элементов меньше, чем должно быть в строке,
    // дописываем пустые блоки.
    if (cnt % 4 !== 0) {
      while (cnt % 4 !== 0) {
        districts.push((
          <div className="districtItem form-group" key={`dummy_${cnt}`}></div>
        ));
        cnt++;
      }
    }

    // если нажата кнопка "Выбранные", то отображаем
    // все выбранные тракты
    let trakts;

    if (listDisplayType === 'all') {
      trakts = map(chosenTrakts, trakt => {
        const labelClassName = classNames({
          'traktLabel': true,
          'active': trakt.id === currentTrakt.id
        });
        const traktName = trakt.name === cityName ?
          'В черте города' : trakt.name;

        return (
          <div className={labelClassName}
               key={`trakt1_${trakt.id}`}
               onClick={self.changeCurrentTrakt.bind(self, trakt)}>
            <span>
              {traktName}
            </span>
            <span
              className='deleteTraktBtn'
              data-trakt={trakt.id}
              onClick={self.unselectByTrakt.bind(self)}>
              Х
            </span>
          </div>
        );
      });
    }

    let title = '';

    if (listDisplayType === 'trakt') {
      title = (
        <div className="listTitle">
          <h3 className="traktTitle">
            {currentTraktName}
            {total.districts > 0 ? (
              <div className="selectedTraktsCount">
                {`(Выбрано ${total.objects} ${declOfNum(total.objects,
                  ['объект', 'объекта', 'объектов'])} в ${total.districts}
                   ${declOfNum(total.districts,
                  ['районе', 'районах', 'районах'])})`}
              </div>
            ) : ''}
          </h3>
        </div>
      );
    } else if (listDisplayType === 'search') {
      title = (
        <h3 className="traktTitle">Результат поиска</h3>
      );
    } else {
      title = (
        <div className='traktList'>
          <GeminiScrollbar>
            {trakts}
          </GeminiScrollbar>
        </div>
      );
    }

    const distrByTraktClassName = classNames({
      districtsByTrakt: true,
      hidden: !show
    });

    return (
      <div
        className={distrByTraktClassName}>
        {title}
        {listDisplayType !== 'search' ? (
          <div className="textSearchTrakt">
            <input
              className='textSearchTraktInput'
              placeholder={placeholderText}
              onChange={this.searchFilter.bind(this)}
              type='text'/>
          </div>
        ) : ''}
        <div className="districtList">
          <GeminiScrollbar>
            {districts}
          </GeminiScrollbar>
        </div>
        <div className="showOnMap">
          {total.districts > 0 && this.props.mapVisible === 'yes' ? (
            <Button
              className='btn-green'
              onClick={this.props.showMap}>
              Показать на карте
            </Button>
          ) : ''}
        </div>
        <div className="traktButtons">
          {listDisplayType === 'trakt' ? (
            <Button onClick={this.selectAll.bind(this)}>
              {checkAllTraktLabel}
            </Button>
          ) : <span></span>}
          {listDisplayType !== 'search' ? (
            <Button
              className='clear'
              data-stayactive={listDisplayType !== 'all' ? '1' : '0'}
              onClick={this.unselectByTrakt.bind(this)}>
              Очистить
            </Button>
          ) : ''}
        </div>
      </div>
    );
  }
}

DistrictsByTrakt.defaultProps = {
  show: false,
  counts: [],
  mapVisible: 'yes'
};

DistrictsByTrakt.propTypes = {
  districtsByTrakts: React.PropTypes.object,
  districts: React.PropTypes.array,
  show: React.PropTypes.bool,
  mapVisible: React.PropTypes.string,
  selected: React.PropTypes.array,
  matching: React.PropTypes.array,
  listDisplayType: React.PropTypes.string,
  counts: React.PropTypes.object,
  showMap: React.PropTypes.func,
  updateUrlParams: React.PropTypes.func,
  cityStore: React.PropTypes.string,
  updateResult: React.PropTypes.string,
  checkAllTraktLabel: React.PropTypes.string,
  traktSearchPlaceholder: React.PropTypes.string
};

export default DistrictsByTrakt;
