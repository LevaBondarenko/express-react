/**
 * LKConversation component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size} from 'lodash';
import classNames from 'classnames';
import GeminiScrollbar from 'react-gemini-scrollbar';
import SearchPaging from '../SearchPaging/SearchPaging';
import LKManagerSelectItem from './LKManagerSelectItem';
import {getFromBack} from '../../utils/requestHelpers';
import {scrollTo} from '../../utils/Helpers';
import createFragment from 'react-addons-create-fragment';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Modal from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

class LKManagerSelect extends Component {
  static propTypes = {
    close: React.PropTypes.func,
    showList: React.PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.searchDelay = null;
    this.state = {
      type: 'flats',
      searchText: '',
      currentPage: 0,
      perPage: 48,
      pageNum: 0,
      offset: 0,
      managers: [],
      managersCount: 0,
      isLoading: false,
      showList: props.showList,
      selected: null
    };
    if(!size(this.state.managers) && !this.state.isLoading && props.showList) {
      this.loadManagers(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      showList: nextProps.showList
    }));
    if(!size(this.state.managers) &&
      !this.state.isLoading &&
      nextProps.showList) {
      this.loadManagers(true);
    }
  }

  loadManagers(count = null) {
    setTimeout(() => {
      getFromBack({
        action: 'load_managers',
        department: this.state.type,
        limit: this.state.perPage,
        offset: this.state.offset,
        filter: this.state.searchText,
        count: count
      }).then(response => {
        const data = {
          isLoading: false,
          managers: response.users
        };

        if(response.count !== undefined) {
          data.managersCount = response.count;
          data.pageNum = response.count / this.state.perPage | 0;
        }
        this.setState(() => (data));
      }, error => {
        error;
        this.setState(() => ({isLoading: false}));
      });
    }, 0);
  }

  onTypeChange(e) {
    const type = e.target.dataset.type;

    e.target.blur();
    this.setState(() => ({
      type: type,
      currentPage: 0,
      offset: 0,
      selected: null
    }));
    this.loadManagers(true);
  }

  onPageChange(data) {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.perPage);
    const element = this.refs.managersBlock ?
      ReactDOM.findDOMNode(this.refs.managersBlock)
        .getElementsByClassName('gm-scroll-view') : [];

    this.setState(() => ({
      offset: offset,
      currentPage: selected,
      selected: null
    }));
    this.loadManagers();
    if(element.length) {
      setTimeout(() => {
        scrollTo(element[0], 0, 600).then(() => {}, () => {});
      }, 0);
    }
  }

  seacrhChange(e) {
    const {value} = e.target;

    this.setState(() => ({
      searchText: value,
      currentPage: 0,
      offset: 0,
      selected: null
    }));
    if(this.searchDelay) {
      clearTimeout(this.searchDelay);
    }
    if(parseInt(value) || value.length > 2 || !value.length) {
      this.searchDelay = setTimeout(() => {
        this.searchDelay = null;
        this.loadManagers(true);
      }, 500);
    }
  }

  onManagerSelect(id) {
    this.setState(() => ({selected: id}));
  }

  apply() {
    UserActions.deleteFromLocalCachedData('manager');
    UserActions.set('manager', []);
    UserActions.updateUser({personalManager: this.state.selected});
    this.props.close();
  }

  render() {
    const {type, searchText, showList, managers, selected} = this.state;
    const searchPlaceholder = 'Введите имя, фамилию  (3 и более символа) или персональный код риэлтора для поиска'; //eslint-disable-line max-len
    const typesArr = {
      flats: 'Вторичной',
//      nh_flats: 'Новостройкам', // eslint-disable-line camelcase
      rent: 'Аренде',
      cottages: 'Загородной',
      offices: 'Коммерческой'
    };
    const scrollHeight = canUseDOM && window.innerHeight > 800 ?
      window.innerHeight - 400 : 300;
    let typeSelector = map(typesArr, (item, key) => {
      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames('pull-left', {'active': type === key})
          }
          data-type={key}
          onClick={this.onTypeChange.bind(this)}>
          {item}
        </Button>
      );
    });
    let managersBlock = map(managers, (item, key) => {
      return(
        <LKManagerSelectItem
          key={key}
          manager={item}
          selected={selected}
          onSelect={this.onManagerSelect.bind(this)}/>
      );
    });

    typeSelector = createFragment({
      typeSelector: typeSelector
    });
    managersBlock = createFragment({
      managersBlock: managersBlock
    });

    return (
      <Modal
        className='lkform select-manager'
        show={showList}
        onHide={this.props.close}>
          <ModalHeader closeButton></ModalHeader>
          <ModalBody>
            <Row className='lkform-header'>
              <Col xs={12} className='lkform-header-title'>
                <span>Выбрать специалиста</span>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <small>По следующим направлениям:</small>
              </Col>
              <Col xs={9} className='lkbody-typeselector compact'>
                <ButtonGroup>
                  {typeSelector}
                </ButtonGroup>
              </Col>
            </Row>
            <div className='lkbody-searchbox'>
              <FormControl
                type='text'
                bsSize='small'
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={this.seacrhChange.bind(this)}/>
              <i className='fa fa-search' />
            </div>
            <Row>
              <Col xs={12}>
                <GeminiScrollbar
                  style={{height: `${scrollHeight}px`}}
                  ref='managersBlock'>
                  {managersBlock}
                </GeminiScrollbar>
                <SearchPaging
                  handlePageClick={this.onPageChange.bind(this)}
                  {...this.state}
                  layoutMap={false}
                  bottom={true}/>
              </Col>
            </Row>
            <Row>
              <Col xsOffset={4} xs={4}>
                <Button
                  disabled={!selected}
                  bsStyle='primary'
                  onClick={this.apply.bind(this)}>
                  Выбрать специалиста
                </Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
      </Modal>
    );
  }
}

export default LKManagerSelect;
