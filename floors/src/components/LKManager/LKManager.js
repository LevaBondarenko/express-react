/**
 * LK Menu component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import LKCompose from '../LKBody/LKMessages/LKCompose';
import LKManagerSelect from './LKManagerSelect';
import {phoneFormatter, declOfNum} from '../../utils/Helpers';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {map, mapKeys, size, filter, clone} from 'lodash';
import {sendOrder, getFromBack} from '../../utils/requestHelpers';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import wss from '../../stores/WidgetsStateStore';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';
import ReactDOM from 'react-dom';
/* global data */

const isMounted = (component) => {
  // exceptions for flow control
  try {
    ReactDOM.findDOMNode(component);
    return true;
  } catch (e) {
    // Error
    return false;
  }
};

class LKManager extends Component {
  static propTypes = {
    title: React.PropTypes.string,
    callMe: React.PropTypes.string,
    changeRealtor: React.PropTypes.string,
    evalRealtor: React.PropTypes.string,
    relation: React.PropTypes.string
  };
  static defaultProps = {
    title: 'Ваш специалист по недвижимости',
    callMe: '0',
    changeRealtor: '0',
    evalRealtor: '0',
    relation: null
  };
  constructor(props) {
    super(props);
    this.state = {
      isAuthorized: false,
      isLoading: false,
      user: {},
      manager: {},
      managers: [],
      selected: 0,
      messagesCnt: 0,
      showCompose: false,
      showList: false
    };
  }

  componentWillMount() {
    userStore.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  componentWillUnmount() {
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    const messages = userStore.get('messages') || [];
    const user = userStore.get('userInfo') || {};
    const manager = userStore.get('manager') || {};
    const lastEval = userStore.get('realtorsevals') || null;
    const ticketTypes = userStore.get('ticketTypes') || {};
    let messagesCnt = 0, isLoading = this.state.isLoading, hasManager;

    if(user.personalManager) {
      for(const i in messages) {
        if(messages[i] && !messages[i].readed && messages[i].from &&
          messages[i].from.ries_id === user.personalManager) {
          messagesCnt++;
        }
      }
      hasManager = true;
      isLoading = size(manager) < 1;
    } else if(!size(this.state.managers) && !isLoading) {
      this.loadManagers();
      isLoading = true;
      hasManager = false;
    }

    isMounted(this) && this.setState(() => ({
      isAuthorized: userStore.get('isAuthorized'),
      user: user,
      lastEval: lastEval,
      manager: manager,
      messagesCnt: messagesCnt,
      messages: messages,
      isLoading: isLoading,
      hasManager: hasManager,
      ticketTypes: ticketTypes
    }));
  }

  loadManagers = () => {
    getFromBack({
      action: 'load_users',
      department: 'all',
      limit: 50,
      'city_id': wss.get('selectedCity').city_id
    }, 'post', '/msearcher_ajax.php').then(response => {
      isMounted(this) && this.setState(() => ({
        isLoading: false,
        managers: response.users,
        managersCount: response.usersCount
      }));
    }, error => {
      error;
      isMounted(this) && this.setState(() => ({isLoading: false}));
    });
  }

  compose = () => {
    this.setState(() => ({showCompose: !this.state.showCompose}));
  }

  closeCompose = () => {
    this.setState(() => ({showCompose: false}));
  }

  callMe = () => {
    const {user} = this.state;
    const ufio = user.i ? user.i + (user.o ? ` ${user.o}` : '') : user.f;
    const dataSend = {
      action: 'create_ticket',
      phone: user.phone,
      message: `Запрос на звонок от риэлтора ID:${user.personalManager} пользователю ЛК`, //eslint-disable-line max-len
      source: 'Web',
      advancedSource: 'LK Personal Manager Call Request',
      typeId: 3,
      cityId: data.options.cityId,
      objectId: 0
    };

    sendOrder(dataSend).then(response => {
      if (response.ajax.success) {
        WidgetsActions.set('notify',[{
          msg: `Заявка отправлена, ${ufio}. В ближайшее время риэлтор перезвонит Вам.`, //eslint-disable-line max-len
          type: 'info'
        }]);
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      }
    }, error => {
      error;
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
  }

  evaluate = e => {
    const evaluation = e.target.dataset.eval || null;
    const {user} = this.state;
    const ufio = user.i ? user.i + (user.o ? ` ${user.o}` : '') : user.f;

    UserActions.create(
      {
        eval: evaluation
      },
      'realtorsevals'
    );
    WidgetsActions.set('notify',[{
      msg: `Спасибо за Ваш оценку, ${ufio}. Она очень важна для нас`,
      type: 'info'
    }]);
  }

  showAll = () => {
    this.setState(() => ({showList: !this.state.showList}));
  }

  closeList = () => {
    this.setState(() => ({showList: false}));
  }

  select = () => {
    const {managers, selected} = this.state;

    UserActions.updateUser({personalManager: managers[selected].id});
  }

  next = () => {
    let selected = this.state.selected + 1;

    if(selected >= size(this.state.managers)) {
      selected = 0;
    }
    this.setState(() => ({selected: selected}));
  }

  prev = () => {
    let selected = this.state.selected - 1;

    if(selected <= 0) {
      selected = size(this.state.managers) - 1;
    }
    this.setState(() => ({selected: selected}));
  }

  get evalBlock() {
    const {lastEval, hasManager} = this.state;
    const evalTooltip = <Tooltip id='managerTip'>Оценить менеджера</Tooltip>;
    const evals = hasManager ?
      map([1,2,3,4,5], item => {
        const icon =
          (lastEval && lastEval.eval && item <= lastEval.eval) ?
          'fa fa-star' : 'fa fa-star-o';

        return (
          <i
            key={item}
            className={icon}
            title={`Оценить на ${item}`}
            data-eval={item}
            onClick={this.evaluate}/>
        );
      }) : null;
    const evalBlock =
      (<div className='lkmanager-info-eval'>
        {hasManager ? (
          <OverlayTrigger placement='top' overlay={evalTooltip}><div>
            {evals}
          </div></OverlayTrigger>
        ) : null}
        <div
          className='lkmanager-info-change'
          title={hasManager ? 'сменить менеджера' : 'Выбрать менеджера'}
          onClick={this.showAll}>
          {hasManager ? 'Сменить специалиста' : 'Посмотреть всех'}
        </div>
      </div>);

    return evalBlock;
  }

  get managerData() {
    const {
      manager, managers, selected, isLoading, hasManager, ticketTypes, user
    } = this.state;
    const {relation} = this.props;
    const relations = mapKeys(user.personalManagers, 'managerId');
    const filteredManagers = hasManager && !isLoading ?
      filter(manager, item => {
        return !relation || !ticketTypes[relation] ?
          relations[item.id].relationId === null :
          relations[item.id].relationId === ticketTypes[relation];
      }) : [];
    const currentManager = isLoading ? null :
      (hasManager || relation ?
        (size(filteredManagers) ? filteredManagers[0] : manager[0]) :
        managers[selected]
      );

    if(currentManager) {
      currentManager.photo = getApiMediaUrl(
        '160160',
        'profile',
        currentManager.photo ? currentManager.photo : 'no_photo',
        data.options.mediaSource);
      currentManager.phoneFormatted =
        phoneFormatter(
          currentManager.phone,
          data.options.countryCode.current,
          data.options.countryCode.avail
        );
      currentManager.lkId = relations[currentManager.id] ?
        relations[currentManager.id].lKid : null;
    }
    return currentManager;
  }

  getTitleByRelation = relation => {
    let res = clone(this.props.title);

    switch(relation) {
    case '6':
      res = <span>Ваш эксперт<br/>по ипотеке</span>;
      break;
    default:
      //do nothing
    }

    return res;
  }

  render() {
    const {showCompose, isLoading, hasManager, managersCount} =
      this.state;
    const {title, relation} = this.props;
    const manager = this.managerData || {};
    const managersCountTitle = managersCount ?
      declOfNum(managersCount, ['специалист', 'специалиста', 'специалистов']) :
      null;
    const titleDisplayed = relation ?
      this.getTitleByRelation(relation) :
      title;
    const opponentId = size(manager.lkId) ? manager.lkId[0].id : null;

    return isLoading ? (
        <div className='lkmanager'>
          <div className='lkmanager-loader'>
            <i className='fa fa-spinner fa-spin'/>
          </div>
        </div>
      ) :
      (
        <div className='lkmanager'>
          {hasManager || relation ? null : (
            <div className='lkmanager-needhelp'>
              Нужна помощь?
            </div>
          )}
          <div className='lkmanager-avatar'>
            <img src={manager.photo} />
            {hasManager || relation ? null : (
                <span
                  className='lkmanager-avatar-paging-prev fa fa-angle-left'
                  onClick={this.prev}/>
            )}
            {hasManager || relation ? null : (
                <span
                  className='lkmanager-avatar-paging-next fa fa-angle-right'
                  onClick={this.next}/>
            )}
          </div>
          <div className='lkmanager-info'>
            <div className='lkmanager-info-name'>
              {manager.fio}
            </div>
            <div className='lkmanager-position'>
              {titleDisplayed}
            </div>
            {relation ? (
              <div className='lkmanager-info-eval-dummy'/>
            ) : this.evalBlock}
          </div>
          <div className='lkmanager-phone'>
            <a href={`tel:${manager.phone}`}
              title={`Позвонить: ${manager.phoneFormatted}`}>
              {manager.phoneFormatted}
            </a>&nbsp;
          </div>
          {hasManager || relation ? (
            <div className='lkmanager-comms'>
              <a href={`sms:${manager.phone}`}
                title={`Написать СМС: ${manager.phoneFormatted}`}>
                <i className='fa fa-comment-o' />
              </a>&nbsp;
              <a href={`mailto:${manager.email}`}
                title={`Написать EMail: ${manager.email}`}>
                <i className='fa fa-envelope-o' />
              </a>
            </div>
          ) : (
            <div className='lkmanager-count'>
              {managersCount ? (
                <span>
                  {`${managersCount} ${managersCountTitle}`}<br/>
                  на рынке недвижимости готовы Вам помочь!
                </span>
              ) : null}
            </div>
          )}
          {hasManager || relation ? (opponentId ? (
              <Button bsStyle='primary' onClick={this.compose}>
                Связаться со специалистом
              </Button>
            ) : <div className='dummy-button'/>
          ) : (
            <Button bsStyle='primary' onClick={this.select}>
              Выбрать специалиста
            </Button>
          )}
          <LKCompose
            {...this.props}
            {...this.state}
            toId={opponentId}
            toData={manager}
            showCompose={showCompose}
            close={this.closeCompose}/>
          <LKManagerSelect
            {...this.props}
            {...this.state}
            close={this.closeList}/>
        </div>
      );
  }
}

export default LKManager;
