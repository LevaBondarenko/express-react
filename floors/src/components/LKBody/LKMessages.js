/**
 * LK Messages component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import UserAgentData from 'fbjs/lib/UserAgentData';
import {union, map, includes} from 'lodash';
import HelpIcon from '../../shared/HelpIcon';
import LKManager from '../LKManager/LKManager';
import LKMessage from '../LKBody/LKMessages/LKMessage';
import LKConversation from '../LKBody/LKMessages/LKConversation';
import LKMessagesList from '../LKBody/LKMessages/LKMessagesList';
import SearchPaging from '../SearchPaging/SearchPaging';
import Helpers from '../../utils/Helpers';
import createFragment from 'react-addons-create-fragment';
import ga from '../../utils/ga';
/**
 * Bootstrap 3 elements
 */
import FormControl from 'react-bootstrap/lib/FormControl';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

class LKMessages extends Component {
  static propTypes = {
    messages: React.PropTypes.array,
    user: React.PropTypes.object,
    msgId: React.PropTypes.string,
    mode: React.PropTypes.string,
    trackEvent: React.PropTypes.bool
  };
  static defaultProps = {
    trackEvent: true
  };
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      msgType: 'all',
      messages: this.prepare(props.messages),
      viewMsg: props.msgId && props.msgId.length ?
        this.getMsg(props.messages, props.msgId) : 0,
      perPage: props.mode === 'last' ? 3 : 15,
      currentPage: 0,
      offset: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      messages: this.prepare(nextProps.messages),
      perPage: nextProps.mode === 'last' ? 3 : 15,
      viewMsg: nextProps.msgId && nextProps.msgId.length ?
        this.getMsg(nextProps.messages, nextProps.msgId) : null,
      currentPage: 0,
      offset: 0
    }));
  }

  getMsg(messages, msgid) {
    let message = null;

    for(const i in messages) {
      if(messages[i] &&
        parseInt(messages[i].id) === parseInt(msgid)) {
        message = messages[i];
      }
    }

    return message;
  }

  seacrhChange(e) {
    const value = e.target.value;

    this.setState(() => ({searchText: value}));
  }

  onMsgTypeChange(e) {
    const msgType = e.target.dataset.msgtype ? e.target.dataset.msgtype :
      e.target.parentElement.dataset.msgtype;

    e.target.blur();
    e.target.parentElement.blur();
    this.setState(() => ({msgType: msgType, offset: 0, currentPage: 0}));
    window.location.hash = '#/messages/';
  }

  onPageChange(data) {
    const selected = data.selected;
    const offset = Math.ceil(selected * this.state.perPage);
    const element = document.getElementsByClassName('lkbody-messages')[0];

    this.setState(() => ({
      offset: offset,
      currentPage: selected
    }));
    if(element && element.offsetTop < window.pageYOffset) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
        document.documentElement :
        document.body;

      Helpers.scrollTo(elementTop, element.scrollTop, 600);
    }
  }

  prepare(msgs) {
    const unreaded = [], readed = [];
    const msgTypesArr = {
      all: {name: 'все', count: 0},
      favorites: {name: 'избранное', count: 0},
      searches: {name: 'подписки', count: 0},
      auctions: {name: 'торги', count: 0},
      msgs: {name: 'диалоги', count: 0},
    };

    for(const i in msgs) {
      if(msgs[i]) {
        if(msgs[i].readed || msgs[i].from_id === this.props.user.id) {
          readed.push(msgs[i]);
        } else {
          unreaded.push(msgs[i]);
          msgTypesArr.all.count++;
          (msgs[i].type === 1) && msgTypesArr.favorites.count++;
          (msgs[i].type === 2) && msgTypesArr.searches.count++;
          (msgs[i].type === 3) && msgTypesArr.auctions.count++;
          (msgs[i].from_id !== 0) && msgTypesArr.msgs.count++;
        }
      }
    }
    return {msgTypes: msgTypesArr, messages: union(unreaded, readed)};
  }

  filter(msgType, offset) {
    const {perPage} = this.state;
    const {id} = this.props.user;
    const {messages} = this.state.messages;
    const searchText = this.state.searchText.toLowerCase();
    const filtered = [], persons = [];
    let c = 0;

    for(const i in messages) {
      if(messages[i]) {
        let msg = false;

        if(msgType === 'all' ||
          (msgType === 'favorites' && messages[i].type === 1) ||
          (msgType === 'searches' && messages[i].type === 2) ||
          (msgType === 'auctions' && messages[i].type === 3) ||
          (msgType === 'msgs' && messages[i].from_id !== 0)) {
          if(!searchText.length ||
            messages[i].subj.toLowerCase().indexOf(searchText) !== -1 ||
            (!messages[i].from_id && 'система'.indexOf(searchText) !== -1) ||
            (messages[i].from &&
              (messages[i].from.i.toLowerCase().indexOf(searchText) !== -1 ||
              messages[i].from.o.toLowerCase().indexOf(searchText) !== -1)
            )) {
            if(messages[i].from_id !== 0) {
              if(!includes(persons, messages[i].from_id) &&
                 messages[i].from_id !== id) {
                msg = messages[i];
                persons.push(messages[i].from_id);
              }
              if(msgType === 'msgs' &&
                messages[i].from_id === id &&
                !includes(persons, messages[i].to_id)) {
                msg = messages[i];
                persons.push(messages[i].to_id);
              }
            } else {
              msg = messages[i];
            }
          }
        }

        if(msg) {
          c++;
          if(c > offset && c <= offset + perPage || offset < 0) {
            filtered.push(msg);
          }
        }
      }
    }

    return filtered;
  }

  trackEvent = () => {
    this.props.trackEvent ? ga('pageview', '/virtual/lk/messages') : null;

    this.trackEvent = () => {};
  }

  render() {
    const {msgType, offset, perPage, messages, viewMsg} = this.state;
    const filteredMessages = this.filter(msgType, offset);
    const pageNum = 1 +
      this.filter(msgType, -1).length / perPage | 0;

    this.trackEvent();

    let msgTypeSelector = map(messages.msgTypes, (item, key) => {
      return(
        <Button
          key={key}
          bsSize='small'
          className={
            classNames({'active': msgType === key})
          }
          data-msgtype={key}
          onClick={this.onMsgTypeChange.bind(this)}>
          <span>{item.name}</span>&nbsp;
          <span className='lkbody-typeselector-count'>
            {`(${item.count})`}
          </span>
        </Button>
      );
    });

    msgTypeSelector = createFragment({
      msgTypeSelector: msgTypeSelector
    });
    const messagesItems = viewMsg ?
      (viewMsg.from_id ?
        <LKConversation {...this.state} {...this.props} message={viewMsg} /> :
        <LKMessage {...this.state} {...this.props} message={viewMsg} />) :
      (<div className='lkbody-messages-wrapper'>
        <SearchPaging
          handlePageClick={this.onPageChange.bind(this)}
          pageNum={pageNum}
          {...this.state}
          layoutMap={false}
          bottom={true}/>
            <LKMessagesList
              filteredMessages={filteredMessages}
              {...this.state}
              {...this.props}
            />
        <SearchPaging
          handlePageClick={this.onPageChange.bind(this)}
          pageNum={pageNum}
          {...this.state}
          layoutMap={false}
          bottom={true}/>
      </div>);

    const messagesBlock = this.props.mode === 'last' ?
      (<div className='lkbody-messages'>
        <div className='lkbody-messages-wrapper-last'>
          <LKMessagesList
            filteredMessages={filteredMessages}
            {...this.state}
            {...this.props}
          />
        </div>
      </div>) :
      (<Row>
        <Col xs={10} className='lkbody-mainblock'>
          <div className='lkbody-messages'>
            <Row>
              <Col xs={3}>
                <div className='lkbody-pagetitle'>
                  Уведомления
                  <HelpIcon
                    placement='top'
                    className='help-text-left'
                    helpText={(
                      <span>
                        Будьте в курсе всего. Проверяйте уведомления, чтобы не
                        упустить важную новость или ценное предложение!
                      </span>
                    )}/>
                </div>
              </Col>
              <Col xs={9} className='lkbody-typeselector'>
                <ButtonGroup>
                  {msgTypeSelector}
                </ButtonGroup>
              </Col>
            </Row>
            <div className='lkbody-searchbox'>
              <FormControl
                type='text'
                bsSize='small'
                placeholder='Поиск уведомлений'
                value={this.state.searchText}
                onChange={this.seacrhChange.bind(this)}
              />
              <i className='fa fa-search' />
            </div>
            {messagesItems}
          </div>
        </Col>
        <Col xs={2} className='lkbody-sideblock'>
          <LKManager/>
        </Col>
      </Row>);

    return messagesBlock;
  }
}

export default LKMessages;
