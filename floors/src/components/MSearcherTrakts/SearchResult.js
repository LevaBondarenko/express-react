import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {clone, find, intersection, reject,
  map, sortBy, includes} from 'lodash';
import mss from '../../stores/ModularSearcherStore';
import wss from '../../stores/WidgetsStateStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import WidgetActions from '../../actions/WidgetsActions';
import {declOfNum} from '../../utils/Helpers';
import {getSearchResult} from '../../actions/SearchActions';

class SearchResult extends Component {
  static propTypes = {
    districtsByTrakts: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    districts: PropTypes.array,
    activeStap: PropTypes.number,
    show: PropTypes.bool,
    selected: PropTypes.array,
    changeView: PropTypes.func,
    query: PropTypes.string,
    clearSearch: PropTypes.func,
    updateUrlParams: PropTypes.func,
    counts: PropTypes.object,
    cityStore: PropTypes.string,
    updateResult: PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  handleSelectItem(event) {
    const {value, type, traktid, traktname} = event.target.dataset;
    let chosenTrakts = wss.get('chosenTrakts') ?
      clone(wss.get('chosenTrakts')) : [];
    const currentTrakt = {
      id: parseInt(traktid),
      name: traktname
    };

    // добавляем в trakts выбранный тракт
    if (!find(chosenTrakts, {id: currentTrakt.id})) {
      chosenTrakts.push(currentTrakt);
    }

    ModularSearcherActions.toggle(type, value);

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

  render() {

    const {show, selected, cityStore, counts, activeStap} = this.props;
    const cityName = wss.get(cityStore).name;
    let districts = this.props.districts || [];
    const query = this.props.query ? this.props.query : '';

    if (districts.length === 0) {
      const text = 'Ничего не найдено';

      return (
        <div
          style={{display: show ? 'block' : 'none'}}
          className='mapTraktSearchResult'>
          <div className="noResult">
            {text}
          </div>
        </div>
      );
    }

    districts = sortBy(districts, distr => {
      const objCounts = counts[distr.id];
      let total = 0;

      for (const objType in objCounts) {
        if (objCounts.hasOwnProperty(objType)) {
          total += parseInt(objCounts[objType]);
        }
      }
      return total * -1;
    });

    const forOutput = clone(districts).splice(0, 13);
    let output;

    if (forOutput) {
      output = map(forOutput, (distr, key) => {
        const {id, name, trakt: {name: traktName, id: traktId}} = distr;
        let count = 0;
        const curCounts = counts[id];
        const traktNameVal = traktName === cityName ?
            'В черте города' : traktName;

        for (const t in curCounts) {
          if (curCounts.hasOwnProperty(t)) {
            count += parseInt(curCounts[t]);
          }
        }

        const distrName = (
          <span className='foundDistrict'>
            <span className="queryHighlight">
              {query.charAt(0).toUpperCase() + query.slice(1)}
            </span>
            <span>{name.slice(query.length, name.length)}, </span>
            <span className='distrObjCount'>
              {`    ${count} ${declOfNum(count,
                ['объект', 'объекта', 'объектов'])}`}
            </span>
          </span>
        );

        const classLabel = `checkbox_arrow arrow_extend ${activeStap === key ?
          'active' : ''
          }`;

        return (
          <div
            className="searchResultItem form-group"
            key={`b_${id}`}>
            <input type='checkbox'
              id={`res_${id}`}
              onChange={this.handleSelectItem.bind(this)}
              checked={includes(selected, id.toString())}
              className='form-etagi input_arrow'
              data-type='district_id'
              data-traktid={traktId}
              data-traktname={traktName}
              data-value={id}/>
            <label htmlFor={`res_${id}`}
              className={classLabel}>
              <i className='icon_arrow'> </i>
              <span className='mapTraktSearchText'>
                {`${traktNameVal}, `}{distrName}
              </span>
            </label>
          </div>
        );
      });
    }
    return (
      <div
        style={{display: show ? 'block' : 'none'}}
        className="mapTraktSearchResult">
        {output}
        <div className="searchFooter">
          <a
            href='javascript:void(0)'
            onClick={this.props.clearSearch}
            className="closeSearch">
            Закрыть
          </a>
        {districts.length > 14 ? (
            <a
              className="showAllSearchResults"
              onClick={this.props.changeView()}
              href='javascript:void(0)'
              >
              Показать все результаты ({districts.length})
            </a>

        ) : (<span />)}
      </div>
      </div>
    );
  }
}

export default SearchResult;
