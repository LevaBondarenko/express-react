import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {getNameFromCollection} from '../../utils/Helpers';
import {map, includes, isArray, size, keyBy, sortBy} from 'lodash';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import {declOfNum} from '../../utils/Helpers';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';

class SelectTemplate extends Component {
  static propTypes = {
    parentProps: PropTypes.object,
    parentState: PropTypes.object,
    handleSelect: PropTypes.func,
    handleClick: PropTypes.func,
    filterChange: PropTypes.func,
    filterClear: PropTypes.func,
    onKeyDown: PropTypes.func,
    clear: PropTypes.func,
    checkAll: PropTypes.func,
    title: PropTypes.string,
    activeStap: PropTypes.number,
    id: PropTypes.string,
    replacement: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      minWidth: 0
    };
  }

  filterChange(e) {
    const value = e.target.value.toLowerCase();
    const newWidth = ReactDOM.findDOMNode(this.refs.msearcherlist).offsetWidth;
    const oldWidth = this.state.minWidth;

    this.setState(() => ({
      minWidth: newWidth > oldWidth ? newWidth : oldWidth
    }));
    this.props.filterChange(value);
  }

  filterClick(e) {
    e.nativeEvent.stopImmediatePropagation();
  }

  render() {
    const {
      handleSelect, handleClick, clear, checkAll, activeStap, id: widgetId,
      parentProps: {
        showFilter, customLabel, showName, singleElementLabel, defaultLabel,
        replacement, searcherProperty, isMultiSelect
      },
      parentState: {
        selection, collection, open, filter, filterArr
      }
    } = this.props;
    const isMultiSelectInt = parseInt(isMultiSelect);
    const {minWidth} = this.state;

    const filterInput = parseInt(showFilter) ?
      (<div className='form-group msearcher-select-filter'>
        <input
          type="text"
          ref={`refSel${widgetId}`}
          placeholder="Поиск"
          className="form-control"
          data-filter={`input${widgetId}`}
          value={filter}
          onKeyDown={this.props.onKeyDown}
          onChange={this.filterChange.bind(this)}
          onClick={this.filterClick.bind(this)}/>
        <span className='msearcher-select-filter-clear'
              onClick={this.props.filterClear.bind(this)}>&times;
        </span>
      </div>) : null;
    let label, title = this.props.title;
    const show = !!open ? 'block' : 'none';
    const customLabelVal = customLabel ?
      customLabel : 'Выбрано';
    const isSelectionArray = isArray(selection);


    if (((isSelectionArray && selection.length === 1) ||
    !isSelectionArray) && parseInt(showName || 0)) {
      let selName = getNameFromCollection(
        collection, selection);

      selName = selName && singleElementLabel ?
        `${singleElementLabel}: ${selName}` : selName;
      label = selection.length && selName ? selName :
        defaultLabel;
      title = label;
    } else {
      const count = isMultiSelectInt ? selection.length : 1;
      const splitTitle = replacement ? replacement.split('|') : null;
      const replaceText = splitTitle ? declOfNum(count, splitTitle) : '';

      label = selection.length ?
       `${customLabelVal}: ${count} ${replaceText}` :
        defaultLabel;
      title = label;
    }

    const actualList = filter && parseInt(showFilter) ? filterArr : collection;
    const sortObj = keyBy(actualList, 'name');
    let sortArr = [];
    let countArr = 0;

    map(sortObj, (val, key) => {
      sortArr.push(key);
    });
    sortArr = sortBy(sortArr);

    const items = map(sortArr, (item) => {
      const {id, name} = sortObj[item];

      let active = (isMultiSelectInt &&
          (includes(selection, id) || includes(selection, id.toString()))) ||
          selection.toString() === id.toString() ?
          'active' : '';

      active += activeStap > -1 && activeStap === countArr ?
        ' focus' : '';
      countArr++;

      return (
        <li key={id} className={active} data-value={id} onClick={handleSelect}>
          <span data-value={id}>{name}</span>
          {active !== '' && isMultiSelectInt ?
            <span data-value={id} style={{paddingLeft: '1rem'}}>
              &times;
            </span> : null}
        </li>);
    });

    return(
        <div style={{position: 'relative'}} title={title}>
          <Button className={
                    classNames(
                      'btn-select',
                      {'disabled': size(collection) <= 0}
                    )
                  }
                  bsStyle='default'
                  data-field={searcherProperty}
                  onClick={handleClick}
                  onKeyDown={this.props.onKeyDown}
          >
            <span className="btn-label">{label}</span>
            <span className="caret" />
          </Button>
          <div ref='msearcherlist'
               className='msearcher-select'
               style={{
                 display: show,
                 minWidth: minWidth ? `${minWidth}px` : '100%'
               }}>
            <Button
              className='MSearcher__btn'
              style={{
                display: isMultiSelectInt ? 'inline-block' : 'none'
              }}
              bsStyle='default'
              bsSize='xsmall'
              onClick={clear}
              >
              Очистить
            </Button>
            <Button
              className='MSearcher__btn'
              style={{
                display: isMultiSelectInt && checkAll ? 'inline-block' : 'none'
              }}
              bsStyle='default'
              bsSize='xsmall'
              onClick={checkAll ? checkAll : null}
              >
              Выбрать все
            </Button>
              {filterInput}
            <ul id={`a${widgetId}`}>
              {items}
            </ul>
          </div>
        </div>
    );
  }
}

export default SelectTemplate;
