/**
 * Searchform modal component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {sortBy, includes} from 'lodash';

/**
 * React/Flux entities
 */
import ModularSearcherActions from '../../actions/ModularSearcherActions';

class TabList extends Component {
  static propTypes = {
    selectedData: PropTypes.array,
    tabType: PropTypes.string,
    filterString: PropTypes.string,
    streetsByDistricts: PropTypes.array,
    collection: PropTypes.array,
    showMap: PropTypes.string
  };

  static defaultProps = {
    filterString: '',
  };

  handleSelectItem(event) {
    const {value, type} = event.target.dataset;
    const className = event.target.className;

    if(className !== ' disabledItem') {
      ModularSearcherActions.toggle(type, value);
    }
  }

  render() {
    const {selectedData, tabType, filterString,
      streetsByDistricts} = this.props;
    const collection = sortBy(this.props.collection, 'name');
    const handleSelectItem = this.handleSelectItem;
    const  maxHeight =
      (this.props.showMap && this.props.tabType === 'district_id') ?
      '20rem' : '60rem';

    const dataList = collection.map((listItem) => {
      const itemName = listItem.name.toString().toLowerCase();
      let  activeItem = '';

      if (includes(selectedData, listItem.id.toString())) {
        activeItem = 'activeItem';
      }

      if(tabType === 'street_id' &&
        streetsByDistricts.length &&
        !includes(streetsByDistricts, listItem.id.toString())) {
        activeItem += ' disabledItem';
      }

      const title = tabType === 'district_id' ?
        'Нажмите для добавления района в фильтр' :
          (activeItem === ' disabledItem' ||
          activeItem === 'activeItem disabledItem' ?
          'Улица не входит в выбранные районы' :
          'Нажмите для добавления улицы в фильтр');

      if (itemName.indexOf(filterString) !== -1) {
        return (
            <li key={listItem.id}>
                <span className={activeItem}
                  title={title}
                  onClick={handleSelectItem}
                  data-type={tabType}
                  data-value={listItem.id}>{listItem.name}</span>
                {(activeItem === 'activeItem' ||
                  activeItem === 'activeItem disabledItem' ?
                  <span className="item-closeBtn"
                    onClick={handleSelectItem}
                    data-type={tabType}
                    data-value={listItem.id}
                    aria-hidden="true">&times;</span> : '')}
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

export default TabList;
