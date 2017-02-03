/**
 * USubmit widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import {postOrder, getFromBack} from '../../utils/requestHelpers';
import {testPhone, phoneCleanup, phoneFormatter} from '../../utils/Helpers';
import s from './USubmit.scss';
import HelpIcon from '../../shared/HelpIcon';
import ModalWindow from '../../shared/ModalWindow/';
import ExtraValuesForm from './ExtraValuesForm';
import classNames from 'classnames';
import {size, forEach, omit, clone, cloneDeep, union} from 'lodash';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  updateInObjectsState, mergeInObjectsState
} from '../../actionCreators/ObjectsActions';
import objectsRemap from '../../selectors/objectsRemap';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';
import withCondition from '../../decorators/withCondition';

class USubmit extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    objectName: React.PropTypes.string,
    typeId: React.PropTypes.string,
    className: React.PropTypes.string,
    extValues: React.PropTypes.array,
    reqValues: React.PropTypes.array,
    reqValuesTitle: React.PropTypes.string,
    skipValues: React.PropTypes.array,
    label: React.PropTypes.string,
    help: React.PropTypes.string,
    validateMode: React.PropTypes.string,
    sendedRedirect: React.PropTypes.string,
    redirectDelay: React.PropTypes.number,
    redirectModal: React.PropTypes.string,
    sendedTitle: React.PropTypes.string,
    onSubmitSuccess: React.PropTypes.func,
    noModalRequest: React.PropTypes.bool,
    autoRegister: React.PropTypes.bool,
    needAuthorization: React.PropTypes.bool,
    doNotBlockOrder: React.PropTypes.bool,
    attachTicketId: React.PropTypes.bool,
    actions: PropTypes.object,
    obj: React.PropTypes.object,
    objectInfo: React.PropTypes.object,
    countryCode: React.PropTypes.object,
    cityId: React.PropTypes.number,
    constructMessage: PropTypes.array
  };

  static defaultProps = {
    label: 'Отправить',
    validateMode: 'disabled',
    blockOrder: false
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isValid: false,
      isValidating: false,
      isSended: false,
      showModal: false,
      reqValues: {},
      submitData: null,
      redirectCountdown: 0
    };
    this.timer = null;
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    const {extValues, objectName, cityId, obj} = this.props;
    const extValuesObj = {};

    forEach(extValues, item => {
      extValuesObj[item.field] = item.value;
    });

    obj.city_id || extValuesObj.city_id ||
      (extValuesObj.city_id = cityId); //eslint-disable-line camelcase

    size(extValuesObj) &&
      this.props.actions.mergeInObjectsState({[objectName]: {...extValuesObj}});
    userStore.onChange(this.userStoreChange);
    this.processProps(this.props);
  }

  componentWillUnmount() {
    this.removeCss();
    userStore.offChange(this.userStoreChange);
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {objectName, obj} = props;
    const {isValidating} = this.state;
    const {
      _needValidate, _validationStatus, _orderResult, _delayedOrderTrigger
    } = obj ? obj : {};

    if(isValidating && !_needValidate && _validationStatus) {
      this.submit();
    }
    this.setState(() => ({
      isValid: _validationStatus,
      isValidating: _needValidate
    }));

    if(_orderResult) {
      if(_orderResult.success) {
        setTimeout(() => { this.orderSuccess(_orderResult.ticketId); }, 10);
      } else {
        setTimeout(() => { this.orderFailed(); }, 10);
      }
      this.props.actions.updateInObjectsState(
        [objectName, '_orderResult'], () => (null));
    }

    if(_delayedOrderTrigger) {
      this.props.actions.updateInObjectsState(
        [objectName, '_delayedOrderTrigger'], () => (null));
      setTimeout(() => { this.onClick(); }, 100);
    }
  }

  userStoreChange = () => {
    const {submitData} = this.state;

    if(submitData) {
      this.submitOrder(submitData);
    }
  }

  onClick = () => {
    const {objectName, validateMode, doNotBlockOrder} = this.props;
    const {isValid, isValidating, isLoading, isSended} = this.state;

    if((isValid || validateMode === 'disabled') && !isLoading &&
       !isValidating && (!isSended || doNotBlockOrder)) {
      if(validateMode === 'onSend') {
        this.props.actions.updateInObjectsState(
          [objectName, '_needValidate'], () => (true));
      } else {
        this.submit();
      }
    }
  }

  getAutoType = () => {
    let res = null;
    const {objectInfo} = this.props;

    if(objectInfo) {
      if(objectInfo.table === 'rent') {
        res = 5;
      } else if(objectInfo.gp) {
        res = 7;
      } else {
        switch(objectInfo.class) {
        case 'flats':
          res = 3;
          break;
        case 'cottages':
          res = 11;
          break;
        case 'offices':
          res = 14;
          break;
        default:
          //do nothing
        }
      }
    }

    return res;
  }

  submit = () => {
    const alwaysSkip = [
      '_hidden',
      '_needValidate',
      '_readonly',
      '_validationMsgs',
      '_validationStates',
      '_validationStatus',
      '_orderResult',
      '_delayedOrderTrigger',
      'brokersCount',
      'brokers',
      'selectedBroker'
    ];
    const {
      objectName, skipValues, typeId, reqValues, autoRegister, noModalRequest,
      needAuthorization, countryCode, obj
    } = this.props;
    const {reqValues: stateValues} = this.state;
    const dataSend = omit(clone(obj), union(skipValues, alwaysSkip));
    const userInfo = userStore.get('userInfo');
    const isAuthorized = userStore.get('isAuthorized');
    const valuesToRequest = {};
    const requested = {};

    forEach(reqValues, item => {
      const {field, lkField} = item;

      if(!obj || !obj[field]) {
        let fromLK = null;

        if(field === 'name') {
          fromLK = '';
          size(userInfo.i) > 0 && userInfo.i !== 'Пользователь' &&
            (fromLK += userInfo.i);
          size(userInfo.o) > 0  && (fromLK += ` ${userInfo.o}`);
          size(userInfo.f) > 0  && (fromLK += ` ${userInfo.f}`);
          size(fromLK) < 1 && (fromLK = null);
        } else {
          fromLK = userInfo[lkField];
        }

        if(fromLK) {
          dataSend[field] = fromLK;
        } else {
          const exist = stateValues[field];

          if(exist && size(exist.value) && (field !== 'phone' || testPhone(
            phoneCleanup(exist.value),
            true,
            countryCode.avail
          ))) {
            dataSend[field] = exist.value;
            requested[field] = exist.value;
          } else {
            valuesToRequest[field] = {
              title: item.title,
              icon: item.icon,
              value: exist ? exist.value : ''
            };
          }
        }
      }
    });

    if(size(valuesToRequest) > 0 && (!needAuthorization || isAuthorized)) {
      if(noModalRequest) {
        this.setState(() => ({
          isLoading: false
        }));
      } else {
        this.setState(() => ({
          isLoading: false,
          showModal: true,
          reqValues: valuesToRequest
        }));
      }
      setTimeout(() => {
        this.props.actions.mergeInObjectsState({[objectName]: {...requested}});
      }, 0);
    } else if(needAuthorization && !isAuthorized) {
      setTimeout(() => {
        const invite = userStore.get('invite');
        const savedObjectData = cloneDeep(obj);

        savedObjectData._delayedOrderTrigger = true;
        UserActions.addDelayedAction({
          method: 'putToReduxObjects',
          data: {[objectName]: savedObjectData}
        });
        WidgetsActions.set('notify', [{
          msg: 'Для продолжения работы Вы должны быть авторизованы',
          type: 'info'
        }]);
        if(invite.enabled) {
          UserActions.showInvite();
        } else {
          UserActions.showLogin();
        }
      }, 0);
    } else {
      this.setState(() => ({
        isLoading: true,
        showModal: false,
        reqValues: valuesToRequest
      }));

      if(typeId === 'auto_by_realty') {
        dataSend.type_id = this.getAutoType(); //eslint-disable-line camelcase
      } else if(typeId !== 'from_storage') {
        dataSend.type_id = typeId; //eslint-disable-line camelcase
      }

      dataSend.phone && (dataSend.phone = phoneCleanup(dataSend.phone));

      if(autoRegister && !isAuthorized && dataSend.phone) {
        UserActions.register(
          dataSend.phone,
          null,
          -1,
          false,
          false,
          dataSend.i ? dataSend.i : (dataSend.name ? dataSend.name : false)
        );
        this.setState(() => ({
          submitData: dataSend
        }));
      } else {
        this.submitOrder(dataSend);
      }
    }
  }

  submitOrder = dataSend => {
    const {objectName, constructMessage} = this.props;

    if(size(constructMessage)) {
      let constructedMessage = '<br/>';

      constructMessage.forEach(item => {
        if(dataSend[item.field]) {
          constructedMessage +=
            `${item.title}: ${dataSend[item.field]}<br/>`;
        }
      });
      if(size(dataSend.message)) {
        dataSend.message += constructedMessage;
      } else {
        dataSend.message = constructedMessage;
      }
    }

    postOrder(dataSend).then(response => {
      let orderResult = {success: false};

      if (response.ok) {
        orderResult = {success: true, ticketId: response.ticket_id};
      }
      this.props.actions.updateInObjectsState(
        [objectName, '_orderResult'], () => (orderResult));
    }, error => {
      error;
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    });
    this.setState(() => ({
      submitData: null
    }));
  }

  orderSuccess = (ticketId = 0) => {
    const {sendedRedirect, sendedTitle, objectName} = this.props;

    this.props.actions.mergeInObjectsState(
      {[objectName]: {_orderResult: null, _orderSent: true}});
    if(ticketId && ticketId > 0) {
      const notifyBlock = (
        <div>
          <div className='notify-header'>Заявка отправлена</div>
          <div className='notify-body'>
            <span>
              Номер созданной заявки <b>{ticketId}</b>
            </span>
          </div>
        </div>
      );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 30
      }]);
      getFromBack({
        action: 'user_get_all'
      }).then(response => {
        if(response.ok) {
          UserActions.deleteFromLocalCachedData('manager');
          UserActions.fill(response.data);

          if(sendedTitle) {
            this.setState(() => ({
              isSended: true,
              isLoading: false
            }));
          }
          if(sendedRedirect) {
            this.initRedirect(ticketId);
          }
          this.props.onSubmitSuccess && this.props.onSubmitSuccess();
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
            type: 'warn'
          }]);
        }
      });
    } else {
      if(sendedTitle) {
        this.setState(() => ({
          isSended: true,
          isLoading: false
        }));
      }
      if(sendedRedirect) {
        this.initRedirect(ticketId);
      }
      this.props.onSubmitSuccess && this.props.onSubmitSuccess();
    }
  }

  orderFailed = () => {
    const {objectName} = this.props;

    this.props.actions.mergeInObjectsState(
      {[objectName]: {_orderResult: null, _orderSent: true}});
    WidgetsActions.set('notify',[{
      msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
      type: 'dang'
    }]);
  }

  initRedirect = (ticketId = 0) => {
    const {sendedRedirect, redirectDelay, attachTicketId} = this.props;
    const {hostname, protocol} = window.location;
    const redirectUri = ticketId && attachTicketId ?
      `${protocol}//${hostname}${sendedRedirect}?ticket_id=${ticketId}` :
      `${protocol}//${hostname}${sendedRedirect}`;
    const virtualRedirect = sendedRedirect.indexOf('_virtual:') > -1;

    if(virtualRedirect) {
      const virtualPage = sendedRedirect.split(':')[1];

      size(virtualPage) && ga('pageview', virtualPage);
    } else if(redirectDelay > 0) {
      this.setState(() => ({
        redirectCountdown: redirectDelay,
        orderTicketId: ticketId
      }));
      if(this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        const {redirectCountdown} = this.state;

        if(redirectCountdown > 0) {
          this.setState(() => ({redirectCountdown: redirectCountdown - 1}));
        } else {
          clearInterval(this.timer);
          this.timer = null;
          window.location.assign(redirectUri);
        }
      }, 1000);
    } else {
      window.location.assign(redirectUri);
    }
  }

  toggleModal = () => {
    this.setState(() => ({showModal: !this.state.showModal}));
  }

  handleFormChange = e => {
    const {value} = e.target;
    const {field} = e.target.dataset;
    const {reqValues} = this.state;
    const {countryCode} = this.props;

    reqValues[field].value = field === 'phone' ?
      phoneFormatter(
        value,
        countryCode.current,
        countryCode.avail
      ) : value;
    this.setState(() => ({reqValues: reqValues}));
  }

  toggleRedirect = () => {
    this.setState(() => ({redirectCountdown: 1}));
  }

  get redirectModal() {
    const {redirectCountdown, orderTicketId} = this.state;
    let redirectModal = this.props.redirectModal;

    redirectModal = redirectModal ?
      redirectModal
        .replace('${ticketid}', orderTicketId)
        .replace('${countdown}', redirectCountdown) : '';

    return (
      <div dangerouslySetInnerHTML={{__html: redirectModal}}/>
    );
  }

  render() {
    const {
      isValid, isValidating, isLoading, isSended, showModal, reqValues,
      redirectCountdown
    } = this.state;
    const {
      objectName, className, label, help, validateMode, reqValuesTitle,
      sendedTitle, redirectModal, doNotBlockOrder
    } = this.props;
    const disabled = (validateMode !== 'disabled' && !isValid) ||
      isLoading || isValidating || (isSended && !doNotBlockOrder);

    return (
      <div className={classNames(className, s.USubmit, 'clearfix')}>
        <div className='usubmit-container row'>
          <Button
            className={classNames('form-control', {'disabled': disabled})}
            bsStyle='success'
            onClick={this.onClick}>
            {isLoading || isValidating ? (
              <span className='btn-label'>
                <i className='fa fa-spin fa-spinner'/>
              </span>
            ) : ((isSended && !doNotBlockOrder) ? (
              <span className='btn-label'>{sendedTitle}</span>
            ) : (
              <span className='btn-label'>{label}</span>
            ))}
          </Button>
          {help ? (
            <HelpIcon
              id={`usubmit-${objectName}`}
              closeButton={true}
              className='help-text-left'
              placement='top'
              helpText={help}/>
          ) : null}
          <ModalWindow
            show={showModal}
            onHide={this.toggleModal}>
              <ExtraValuesForm
                handleChange={this.handleFormChange}
                title={reqValuesTitle}
                reqValues={reqValues} />
              <ButtonToolbar className={s.orderToolbar}>
                <div className='pull-right'>
                  <Button
                    className={classNames(
                      'form-control',
                      'modal-button',
                      {'disabled': (validateMode !== 'disabled' && !isValid) ||
                        isLoading || isValidating}
                    )}
                    bsStyle='success'
                    onClick={this.onClick}>
                    {isLoading || isValidating ? (
                      <i className='fa fa-spin fa-spinner'/>
                    ) : (
                      <span className="btn-label">{label}</span>
                    )}
                  </Button>
                </div>
              </ButtonToolbar>
            </ModalWindow>
            <ModalWindow
              show={redirectCountdown > 0 && size(redirectModal)}
              onHide={this.toggleRedirect}
              className={s.redirectModal}>
              {this.redirectModal}
            </ModalWindow>
        </div>
      </div>
    );
  }

}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(
    {updateInObjectsState, mergeInObjectsState},
    dispatch
  )};
}

function mapStateToProps(state, ownProps) {
  const {
    objectName
  } = ownProps;

  return {
    obj: objectsRemap[objectName] ?
      objectsRemap[objectName](state) :
      (state.objects.get(objectName) ?
        state.objects.get(objectName).toJS() : {}),
    objectInfo: state.objects.get('object') ?
      state.objects.get('object').toJS().info : {},
    cityId: state.settings.get('cityId'),
    countryCode: state.settings.get('countryCode').toJS()
  };
}


USubmit = connect(mapStateToProps, mapDispatchToProps)(USubmit);
USubmit = withCondition()(USubmit);

export default USubmit;
