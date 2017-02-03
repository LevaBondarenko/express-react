import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {getNameFromCollection} from '../../utils/Helpers';
import {map, includes, isArray, size, keyBy, sortBy, find} from 'lodash';
import classNames from 'classnames';
import Modal from 'react-bootstrap/lib/Modal';
import Tabs from 'react-bootstrap/lib/Tabs'; //TabbedArea
import Tab from 'react-bootstrap/lib/Tab'; //tab
import Badge from 'react-bootstrap/lib/Badge';
import mss from '../../stores/ModularSearcherStore';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';

const ModalBody = Modal.Body;

class SelectTemplate extends Component {
  static propTypes = {
    parentProps: PropTypes.object,
    parentState: PropTypes.object,
    handleSelect: PropTypes.func,
    handleClick: PropTypes.func,
    filterChange: PropTypes.func,
    filterClear: PropTypes.func,
    onKeyDown: PropTypes.func,
    searcherProperty: PropTypes.string,
    clear: PropTypes.func,
    checkAll: PropTypes.func,
    title: PropTypes.string,
    activeStap: PropTypes.number,
    id: PropTypes.string
  }



  constructor(props) {
    super(props);
    this.state = {
      minWidth: 0,
      showModal: false,
      height: ''
    };
  }

  open = () => {
    this.setState(() => ({
      showModal: true,
      height: window.innerHeight - 300
    }));
  }

  close = () => {
    this.setState(() => ({
      showModal: false
    }));
  }

  filterChange(e) {
    const value = e.target.value.toLowerCase();

    this.props.filterChange(value);
  }

  filterClick(e) {
    e.nativeEvent.stopImmediatePropagation();
  }

  render() {
    const {
      handleSelect,  clear, checkAll, activeStap, id: widgetId,
      parentProps: {
        showFilter, customLabel, showName, singleElementLabel, defaultLabel,
         isMultiSelect
      },
      parentState: {
        selection, collection,  filter, filterArr
      }
    } = this.props;
    const isMultiSelectInt = parseInt(isMultiSelect);
    const showModal = this.state.showModal;
    const maxHeight = this.state.height != '' ? this.state.height : '400px';



    const jk =  parseInt(showFilter) ? mss.get('newcomplex_id') : [];

    const filterInput = parseInt(showFilter) ?
      (<div className='form-group clearfix searchform--input__form'>
        <input
          type="text"
          ref={`refSel${widgetId}`}
          placeholder="Поиск"
          className="form-etagi form-bordered col-md-12"
          data-filter={`input${widgetId}`}
          value={filter}
          onKeyDown={this.props.onKeyDown}
          onChange={this.filterChange.bind(this)}
          onClick={this.filterClick.bind(this)}/>
      </div>) : null;
    let label, title = this.props.title;
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

      label = selection.length ? `${customLabelVal}: ${count}` :
        defaultLabel;
    }

    const actualList = filter && parseInt(showFilter) ? filterArr : collection;
    const sortObj = keyBy(actualList, 'name');
    let sortArr = [];
    let countArr = 0;


    map(sortObj, (val, key) => {
      sortArr.push(key);
    });
    sortArr = sortBy(sortArr);

    const jkTitle = (
      <div>Жилой комплекс { selection.length > 0 ? (
        <Badge className="tabbedBadge">
           {selection.length}
         </Badge>
       ) :
       null}
      </div>
    );

    const items = map(sortArr, (item) => {
      const {id, name} = sortObj[item];

      let active = (isMultiSelectInt &&
          (includes(selection, id) || includes(selection, id.toString()))) ||
          selection.toString() === id.toString() ?
          'activeItem' : '';

      active += activeStap > -1 && activeStap === countArr ?
        ' focus' : '';
      countArr++;

      return (
        <li key={id}>
          <span className={active}
            onClick={handleSelect}
            data-value={id}>
            {name}
          </span>
          {active !== '' && isMultiSelectInt ? (
            <span aria-hidden="true"
              onClick={handleSelect}
              data-value={id} style={{paddingLeft: '1rem'}}>
              &times;
            </span>
          ) : null}
        </li>
      );
    });

    return(
        <div style={{position: 'relative'}} title={title}>
          <Modal className='etagi--modal wide modal-districts'
            show={showModal}
            onHide={this.close}
            animate>
            <Button onClick={this.close}
              bsSize='large'
              className="etagi--closeBtn">
              <span aria-hidden="true">&times;</span>
            </Button>
            <ModalBody className='padding-bottom-75'>
              <Tabs id='mSearcherDistricts-tabs' activeKey={this.state.key}
                onSelect={this.handleSelect}>
                <Tab
                  eventKey={1}
                  title={jkTitle}
                  className="clearfix">
                  <MSearcherDistrictsTab
                    selectedData={jk}
                    tabType="newcomplex_id"
                    collection={actualList}
                    handleSelect={handleSelect}/>
                    {filterInput}
                    <div style={{maxHeight: maxHeight, overflowY: 'auto'}}>
                      <ul className="searchform--tab__list clearfix col-md-12">
                        {items}
                      </ul>
                    </div>
                    <Button
                      className='etagi--clearBtn etagi--clearBtn__hi'
                      style={{
                        display: isMultiSelectInt ? 'inline-block' : 'none'
                      }}
                      bsStyle='default'
                      bsSize='xsmall'
                      onClick={clear}
                      >
                      Очистить запрос
                    </Button>
                    <Button
                      className='etagi--clearBtn etagi--clearBtn__hi'
                      style={{
                        right: '27rem',
                        display:
                        isMultiSelectInt && checkAll ? 'inline-block' : 'none'
                      }}
                      bsStyle='default'
                      bsSize='xsmall'
                      onClick={checkAll ? checkAll : null}
                      >
                      Выбрать все
                    </Button>
                    <button onClick={this.close}
                            className="btn-abs-modal
                            btn btn-green btn-modal
                            btn-modal__hi">
                      Выбрать
                    </button>
                    <Button
                      className='etagi--clearBtn'
                      style={{
                        display: isMultiSelectInt ? 'inline-block' : 'none'
                      }}
                      bsStyle='default'
                      bsSize='xsmall'
                      onClick={clear}
                      >
                      Очистить запрос
                    </Button>
                    <Button
                      className='etagi--clearBtn'
                      style={{
                        right: '27rem',
                        display:
                        isMultiSelectInt && checkAll ? 'inline-block' : 'none'
                      }}
                      bsStyle='default'
                      bsSize='xsmall'
                      onClick={checkAll ? checkAll : null}
                      >
                      Выбрать все
                    </Button>
                    <button onClick={this.close}
                            className="btn-abs-modal
                            btn btn-green btn-modal">
                      Выбрать
                    </button>
                </Tab>
              </Tabs>
            </ModalBody>
          </Modal>
          <Button className={
                    classNames(
                      'btn-select',
                      {'disabled': size(collection) <= 0}
                    )
                  }
                  bsStyle='default'
                  onClick={this.open}>
            <span className="btn-label">{label}</span>
            <span className="caret" />
          </Button>
        </div>
    );
  }
}


class MSearcherDistrictsTab extends Component {
  static propTypes = {
    selectedData: React.PropTypes.array,
  };


  render() {


    return (
        <div>
          <MSearcherTags {...this.props} key='1'/>
        </div>
    );
  }
}

class MSearcherTags extends Component {
  static propTypes = {
    selectedData: React.PropTypes.array,
    collection: React.PropTypes.array,
    tabType: React.PropTypes.string,
    searcherProperty: PropTypes.string,
    handleSelect: PropTypes.func
  };


  render() {
    const selectedData = this.props.selectedData;
    const collection = this.props.collection;
    const handleSelect = this.props.handleSelect;
    const tags = selectedData.map((tag) => {

      tag = tag.toString();

      const tagFull = find(collection, {id: tag});

      tag = parseInt(tag);
      return (
        <li className="searchform--tag__item"
          data-value={tag}
          key={tag}>
          {tagFull.name}
          <button type="button" className="close"
            aria-label="Close"
            data-value={tag}>
              <span
                data-value={tag}
                onClick={handleSelect}
                aria-hidden="true">
                &times;
              </span>
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

export default SelectTemplate;
