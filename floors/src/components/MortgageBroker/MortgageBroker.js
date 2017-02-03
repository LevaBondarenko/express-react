/**
 * MortgageBroker widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './MortgageBroker.scss';
import MortgageBrokerTopView from './MortgageBrokerTopView';
import MortgageBrokerBottomView from './MortgageBrokerBottomView';
import MortgageBrokerLinearView from './MortgageBrokerLinearView';
import MortgageBrokerInLKModalView from './MortgageBrokerInLKModalView';
import MortgageBrokerWideView from './MortgageBrokerWideView';
import MortgageBrokerMobileView from './MortgageBrokerMobileView';
import userStore from '../../stores/UserStore';
import ga from '../../utils/ga';
import yaCounter from '../../utils/yaCounter';
import WidgetsActions from '../../actions/WidgetsActions'; //@todo: remove after refactoring Notify component
import {postOrder, getFromBack} from '../../utils/requestHelpers';
import shallowEqual from 'fbjs/lib/shallowEqual';
import {testPhone, phoneCleanup} from '../../utils/Helpers';
import {sample, isEmpty, size, take, find} from 'lodash';
import classNames from 'classnames';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  updateInObjectsState, mergeInObjectsState
} from '../../actionCreators/ObjectsActions';

class MortgageBroker extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    template: PropTypes.string,
    agentTitle: PropTypes.string,
    agentText: PropTypes.string,
    agentFio: PropTypes.string,
    mobileTitle: PropTypes.string,
    staticPhone: PropTypes.string,
    saveStaffId: PropTypes.bool,
    actions: React.PropTypes.object,
    mortgage: React.PropTypes.object,
    objectInfo: React.PropTypes.object,
    orderStatus: React.PropTypes.bool,
    cityId: React.PropTypes.number
  };

  static defaultProps = {
    template: 'top',
    agentTitle: 'Ваш личный специалист по ипотеке.',
    agentText: 'Я могу перезвонить, если Вам потребуется моя помощь.',
    agentFio: 'Специалист по ипотеке',
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isAuthorized: false,
      userName: '',
      userPhone: '',
      showModal: false,
      orderStatus: false,
      phoneCorrect: false,
      phoneError: '',
      showBrokerModal: false,
      isLoading: false,
      mortgageQuery: false,
      isOrderSending: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    userStore.onChange(this.processProps);
  }

  componentDidMount() {
    const {orderStatus} = this.state;

    this.loadBrokers();
    this.props.actions.updateInObjectsState(
      ['orderStatus'], () => (orderStatus));
  }

  componentWillUnmount() {
    this.removeCss();
    userStore.offChange(this.processProps);
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  toggleBrokerModal = () => {
    this.setState({
      showBrokerModal: !this.state.showBrokerModal
    });
  };

  getLKBroker = users => {
    const {6: relationId} = userStore.get('ticketTypes') || {};
    const {personalManagers} = userStore.get('userInfo') || {};
    const mortgageLKManager = relationId ? find(personalManagers, item => {
      return item.relationId === relationId;
    }) : false;
    const lkBroker = mortgageLKManager ? find(users, item => {
      return parseInt(item.id) === mortgageLKManager.managerId;
    }) : false;

    return lkBroker;
  }

  loadBrokers = () => {
    this.setState({isLoading: true});
    getFromBack({
      action: 'load_users',
      department: 'mortgage',
      limit: 50,
      'city_id': this.props.cityId
    }, 'post', '/msearcher_ajax.php').then(response => {
      const lkBroker = this.getLKBroker(response.users);
      const selectedBroker = lkBroker ? lkBroker : sample(response.users);
      const {mortgage} = this.props;
      const {
        selectedBroker: brokerInMortgage, brokers, brokersCount
      } = mortgage;
      const newData = {};

      if(!brokers || !shallowEqual(brokers, response.users)) {
        newData.brokers = response.users;
      }
      if(!brokersCount || !shallowEqual(brokersCount, response.usersCount)) {
        newData.brokersCount = response.usersCount;
      }
      if(!brokerInMortgage || lkBroker) {
        newData.selectedBroker = selectedBroker;
        this.props.saveStaffId && selectedBroker &&
          (newData.staff_id = selectedBroker.id); //eslint-disable-line camelcase
      } else {
        this.props.saveStaffId && brokerInMortgage &&
          (newData.staff_id = brokerInMortgage.id); //eslint-disable-line camelcase
      }

      if(size(newData)) {
        this.props.actions.mergeInObjectsState({mortgage: {...newData}});
      }
      this.setState({isLoading: false});
    }, error => {
      error;
      this.setState(() => ({isLoading: false}));
    });
  };

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {mortgage, orderStatus} = props || this.props;
    const lkBroker = this.getLKBroker(mortgage.brokers);

    if(userStore.get('isAuthorized')) {
      this.setState({
        isAuthorized: userStore.get('isAuthorized'),
        userPhone: userStore.get('userInfo').phone,
        userName: userStore.get('userInfo').i,
        orderStatus: orderStatus || false,
        brokers: mortgage.brokers || [],
        brokersCount: mortgage.brokersCount || 0,
        selectedBroker: lkBroker || mortgage.selectedBroker || {},
        mortgageQuery: mortgage.mortgageRequestId ?
          mortgage.mortgageRequestId : false
      });
    } else {
      this.setState({
        isAuthorized: userStore.get('isAuthorized'),
        orderStatus: orderStatus || false,
        brokers: mortgage.brokers || [],
        brokersCount: mortgage.brokersCount || 0,
        selectedBroker: lkBroker || mortgage.selectedBroker || {},
        mortgageQuery: mortgage.mortgageRequestId ?
          mortgage.mortgageRequestId : false
      });
    }
  };

  handleChange = (event) => {
    let value;

    if(event.target.dataset.name === 'userPhone') {
      value = phoneCleanup(event.target.value);
      value = size(value) > 12 ? take(value.split(''), 12).join('') : value;
    } else {
      value = event.target.value;
    }

    this.setState({
      [event.target.dataset.name]: value
    });
  };

  handleOrderSubmit = () => {
    const {userPhone, userName} = this.state;
    const broker = this.state.selectedBroker && this.state.selectedBroker.fio ? `брокер - ${this.state.selectedBroker.fio} (${this.state.selectedBroker.id})` : ''; //eslint-disable-line max-len
    const orderData = {
      action: 'create_ticket',
      phone: userPhone,
      name: userName,
      message: `Заказ обратного звонка, клиент - имя: ${userName}, телефон:  ${userPhone}; ${broker}`, //eslint-disable-line max-len
      source: 'Web',
      advanced_source: 'CallOrderForm Mortgage', //eslint-disable-line
      type_id: 6,  //eslint-disable-line camelcase
      city_id: this.props.cityId,  //eslint-disable-line camelcase
    };
    const cleanedPhone = userPhone.replace(/[^0-9+]*/g, '')
      .replace('+8', '8')
      .replace('+7', '8');

    if((!cleanedPhone || !cleanedPhone.length) ||
      !testPhone(cleanedPhone, true)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      this.setState(() => ({isOrderSending: true}));
      postOrder(orderData).then(response => {
        if (response.ok) {
          ga('pageview', '/virtual/thank-you/?from=' +
              'ipoteka_main_popup_zakaz_obratnogo_zvonka');
          yaCounter('ipoteka');
          this.props.actions.updateInObjectsState(
            ['orderStatus'], () => (true));
          this.setState(() => ({isOrderSending: false}));
        } else {
          this.errorNotify();
        }
      }).catch(() => {
        this.errorNotify();
      });
    }


  };

  errorNotify = () => {
    WidgetsActions.set('notify',[{
      msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
      type: 'dang'
    }]);
  };

  handleChangeBroker = () => {
    //console.log('change');
  };

  getViewTemplate = (position) => {
    const {selectedBroker, isLoading} = this.state;
    const templates = {
      top: MortgageBrokerTopView,
      bottom: MortgageBrokerBottomView,
      linear: MortgageBrokerLinearView,
      inLKModal: MortgageBrokerInLKModalView,
      wide: MortgageBrokerWideView,
      mobile: MortgageBrokerMobileView
    };
    let component;

    if(!isLoading && (selectedBroker && !isEmpty(selectedBroker))) {
      component = React.createElement(templates[position], {
        ...this.props,
        ...this.state,
        toggleModal: this.toggleModal,
        handleChange: this.handleChange,
        handleOrderSubmit: this.handleOrderSubmit,
        toggleBrokerModal: this.toggleBrokerModal
      });
    } else if(!isLoading && (selectedBroker && isEmpty(selectedBroker))) {
      component = React.createElement(templates[position], {
        ...this.props,
        ...this.state,
        selectedBroker: {
          fio: this.props.agentFio,
          image: 'http://cdn-media.etagi.com/static/site/b/b4/b4a1865d2c26082fca5e5002c145b39bb11d3868.jpg'
        },
        toggleModal: this.toggleModal,
        handleChange: this.handleChange,
        handleOrderSubmit: this.handleOrderSubmit,
        toggleBrokerModal: this.toggleBrokerModal
      });
    } else {
      component = (
        <div className='loader-inner ball-clip-rotate'>
          <div />
        </div>
      );
    }

    return component;
  };

  render() {
    const {template: templateType} = this.props;

    const template = (
      <div className={classNames({
        [s.rootLinear]: templateType === 'linear',
        [s.root]: templateType !== 'linear' && templateType !== 'mobile'
      })}>
        {this.getViewTemplate(templateType)}
      </div>
    );

    return template;
  }
}

export default connect(
  state => {
    return {
      orderStatus: state.objects.get('orderStatus'),
      mortgage: state.objects.get('mortgage') ?
        state.objects.get('mortgage').toJS() : {},
      cityId: state.settings.get('cityId')
    };
  },
  dispatch => {
    return {actions: bindActionCreators(
      {updateInObjectsState, mergeInObjectsState},
      dispatch
    )};
  }
)(MortgageBroker);
