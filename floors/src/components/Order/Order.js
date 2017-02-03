/**
 * Order widget class
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import React, {Component, PropTypes} from 'react';
import {map, merge} from 'lodash';
import {priceCleanup} from '../../utils/Helpers';

import OrderYarmarka from './OrderYarmarka';
import OrderFieldsInRow from './OrderFieldsInRow';
import OrderTemplate1 from './OrderTemplate1';
import OrderTemplate2 from './OrderTemplate2';
import OrderOpenCity from './OrderOpenCity';
import OrderIpoteka from './OrderIpoteka';
import OrderCallMe from './OrderCallMe';
import OrderMainPage from './OrderMainPage';
import OrderIpotekaLanding from './OrderIpotekaLanding';
import OrderMainPageOneField from './OrderMainPageOneField';
import OrderNhOneField from './OrderNhOneField';
import OrderNhOneFieldSale from './OrderNhOneFieldSale';
import OrderModal from './OrderModal';
import OrderLkSeller from './OrderLkSeller';
import Order2LkSeller from './Order2LkSeller';
import Order2Learn from './Order2Learn';
import Order2LearnPopup from './Order2LearnPopup';
import OrderLearning from './OrderLearning';
import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';

import {postOrder, sendExchibition} from '../../utils/requestHelpers';
import logger from '../../utils/logger';
import Helpers from '../../utils/Helpers';

import WidgetsActions from '../../actions/WidgetsActions';

/*global data*/
/*eslint camelcase: [2, {properties: "never"}]*/
class Order extends Component {
  static propTypes = {
    id: PropTypes.string,
    ticketType: PropTypes.string,
    orderType: PropTypes.string,
    'header_title': PropTypes.string,
    'footer_title': PropTypes.string,
    fields: PropTypes.object,
    bgColor: PropTypes.string,
    bgUrlColor: PropTypes.string,
    colorButton: PropTypes.string,
    descColor: PropTypes.string,
    titleColor: PropTypes.string,
    submitName: PropTypes.string,
    substituteCity: PropTypes.string
  }

  static defaultProps = {
    colorButton: 'btn-blue',
    titleColor: '#e31f30',
    descColor: '#999999',
    bgColor: '#ececec',
    bgUrlColor: '',
    submitName: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      sending: false,
      substituteCity: parseInt(props.substituteCity) ? true : false,
      text: '',
      value: {},
      data: {}
    };

    this.validationState = this.validationState.bind(this);
  }

  componentWillMount() {
    const {fields} = this.props;
    const state = this.state;

    map(fields, (val) => {
      if (parseInt(val.important)) {
        state.data[val.field] = {
          style: '',
          error: val.imp_text
        };
      }
    });

    this.setState(state);
  }

  componentDidMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    const {city_id: cityId} = mss.get();

    this.setState({
      mssCityId: cityId
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const elBtn = document.getElementById(`submit_${this.props.id}`);
    const {state, props} = this;
    const self = this;
    const source = props.source;
    const advancedSource = props.advanced_source;
    const objectData = data.object ? data.object.info.info ||
       data.object.info || data.object : null;
    const {
      mssCityId,
      substituteCity
    } = this.state;

    elBtn.setAttribute('disabled', 'disabled');

    let strMessage = '';
    let typeId;
    let cityId = parseInt(props.cityId) ? props.cityId : '23';

    if (substituteCity) {
      if (mssCityId && mssCityId.length > 0) {
        cityId = Array.isArray(mssCityId) ?
          mssCityId[0] :
          mssCityId;
      } else if (objectData && objectData.city_id) {
        cityId = objectData.city_id;
      }
    }

    map(props.fields, val => {
      strMessage += `${val.text} : ${(
          val.field === 'buy' || val.field === 'sale' ?
          val.options[state.value[val.field]] :
          state.value[val.field]
        )}; `;
    });

    if (props.orderType === '3' || props.orderType === '6' ||
      props.orderType === '11' || props.orderType === '12') {
      const phone = state.value.phone ? state.value.phone.toString() : (
       state.value.custom ? state.value.custom.toString() : '');
      const nameVal = `${props.deskTicket} ${state.value.name}`;

      if (!self.validationState()) {
        elBtn.removeAttribute('disabled');
        return;
      }

      if(phone.length >= 17 || (
          (props.orderType === '11' || props.orderType === '12') &&
          state.value.custom
        )) {

        const data = {
          action: 'create_exhibition',
          name: nameVal,
          phone: phone,
          cityId: cityId
        };

        logger('/reserved/blank.gif', data);
        sendExchibition(data).then(response => {
          if (response.ajax.success) {
            logger('/reserved/blank.gif', merge(data, {succes: 1}));
            const resetState = {
              value: {},
              text: ''
            };

            map(props.fields, val => {
              resetState.value[val.field] = '';
            });

            resetState.text = 'Сообщение отправлено!';

            self.setState(() => (resetState));

            let href = window.location.pathname.substr(1);

            href = href ? href.split('/')[0] : 'main';
            document.location.href =
              `${window.location.origin}/thank-you/?from=${href}`;
          }
        });

      } else {
        self.setState(() => ({text: 'Введите телефон!'}));
        elBtn.removeAttribute('disabled');
        return;
      }
    } else {

      if (!self.validationState()) {
        elBtn.removeAttribute('disabled');
        return;
      }

      let rieltor;

      if (objectData) {
        strMessage +=  ` Код объекта ${objectData.gp ? (!objectData.id ?
           `${ objectData.gp  || objectData.info.gp} (${objectData.object_id ||
              objectData.info.object_id})` : objectData.object_id ||
               objectData.info.id) : objectData.object_id ||
                objectData.info.object_id};`;

        rieltor = wss.data.rieltorZ ?
         `${wss.get('rieltorZ').agentName} (${wss.get('rieltorZ').userId})` :
        (objectData.user_id ? objectData.user_id ||
           objectData.info.user_id : null);

        strMessage += rieltor ? ` ответственный риэлтор: ${rieltor};` : '';
      }

      if(props.ticketType && props.ticketType === 'auto') {
        const objectDataTicket = data.object.info;
        const realtyTypes = {
          'flats': 3,
          'rent': 5,
          'cottages': 11,
          'offices': {'sale': 14, 'lease': 16}
        };

        typeId = objectDataTicket.table === 'offices' ?
        realtyTypes[objectDataTicket.table][objectDataTicket.action_sl] :
        realtyTypes[objectDataTicket.table];
      } else {
        typeId = this.props.ticketType ? parseInt(this.props.ticketType) : 7;
      }

      typeId =
        +state.value.buy > 0 ?
          +state.value.buy : (
        +state.value.sale > 0 ?
          +state.value.sale :
          typeId
      );
      const dataSend = {
        action: 'create_ticket',
        name: state.value.name,
        phone: priceCleanup(state.value.phone),
        message: `${strMessage}${Helpers.getUtmParams()}`,
        source: source ? source : 'Web',
        'city_id': cityId,
        'advanced_source': advancedSource,
        'type_id': typeId
      };

      logger('/reserved/blank.gif', dataSend);

      postOrder(dataSend).then(response => {
        if (response.ok) {
          logger('/reserved/blank.gif', merge(dataSend, {succes: 1}));
          const resetState = {
            value: {}
          };

          map(props.fields, val => {
            resetState.value[val.field] = '';
          });

          self.setState({resetState});

          let href = window.location.pathname.substr(1);

          href = href ? href.split('/')[0] : 'main';
          if(response.ticket_id) {
            document.location.href =
              `${window.location.origin}/thank-you/?from=${href}&ticket_id=${response.ticket_id}`; //eslint-disable-line max-len
          } else {
            WidgetsActions.set('notify', [{
              msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
              type: 'dang'
            }]);
          }
        } else {
          WidgetsActions.set('notify', [{
            msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
            type: 'dang'
          }]);
        }
      }, error => {
        WidgetsActions.set('notify', [{
          msg: `Ошибка отправки кода подтверждения: ${error.code}`,
          type: 'dang'
        }]);
      });
    }
    this.setState(() => ({sending: false}));

  }

  validationState() {
    const state = this.state;
    let validation = true;

    map(state.data, (val, key) => {
      if (state.value[key]) {
        if (key === 'phone') {
          const phone = state.value[key] ? state.value[key].toString() : '';

          if (phone.length >= 17) {
            state.data[key].style = 'success';
          } else {
            state.data[key].style = 'error';
            validation = false;
          }
        } else {
          state.data[key].style = 'success';
        }
      } else {
        state.data[key].style = 'error';
        validation = false;
      }
    });
    this.setState(state);

    return validation ? true : false;
  }

  handleChange(event) {
    const state = this.state;

    state.value[event.target.dataset.name] = event.target.value;
    this.setState(state);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const {
      orderType,
      header_title: headerTitle,
      footer_title: footerTitle,
      fields: formsArray,
      bgColor,
      bgUrlColor,
      colorButton,
      descColor,
      titleColor
    } = this.props;
    const orderChange = this.handleChange.bind(this);
    const handleSubmit = this.handleSubmit.bind(this);
    const htmlGenerator =
      orderType === '17' ? (
        <OrderLearning
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '16' ? (
        <OrderFieldsInRow
          id={props.id}
          bgColor={bgColor}
          fields={formsArray}
          colorButton={colorButton}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '15' ? (
        <OrderTemplate2
          id={props.id}
          bgColor={bgColor}
          fields={formsArray}
          colorButton={colorButton}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '14' ? (
        <OrderTemplate1
          id={props.id}
          bgColor={bgColor}
          fields={formsArray}
          colorButton={colorButton}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '12' ? (
        <Order2LearnPopup
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          colorButton={colorButton}
          descColor={descColor}
          titleColor={titleColor}
          submitName={this.props.submitName}
        />
      ) : orderType === '11' ? (
        <Order2Learn
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          colorButton={colorButton}
          descColor={descColor}
          titleColor={titleColor}
          submitName={this.props.submitName}
        />
      ) : orderType === '10' ? (
        <Order2LkSeller
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '9' ? (
        <OrderLkSeller
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
        />
      ) : orderType === '8' ? (
        <OrderModal
          id={props.id}
          fields={formsArray}
          submitName={this.props.submitName}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          colorButton={colorButton}
          descColor={descColor}
          titleColor={titleColor}
          url={props.url}
          showBtn={props.showBtn}
        />
      ) : orderType === '18' ? (
        <OrderNhOneField
          id={props.id}
          fields={formsArray}
          submitName={this.props.submitName}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
        />
      ) : orderType === '19' ? (
          <OrderNhOneFieldSale
          id={props.id}
          fields={formsArray}
          submitName={this.props.submitName}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
        />
      ) : orderType === '7' ? (
        <OrderMainPageOneField
          id={props.id}
          fields={formsArray}
          submitName={this.props.submitName}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
        />
      ) : orderType === '6' ? (
        <OrderOpenCity
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          colorButton={colorButton}
          descColor={descColor}
          submitName={this.props.submitName}
          titleColor={titleColor}
        />
      ) : orderType === '5' ? (
        <OrderIpotekaLanding
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          submitName={this.props.submitName}
        />
      ) : orderType === '4' ? (
        <OrderMainPage
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          submitName={this.props.submitName}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          />
      ) : orderType === '3' ? (
        <OrderYarmarka
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          text={state.text}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          bgColor={bgColor}
          bgUrlColor={bgUrlColor}
          colorButton={colorButton}
          descColor={descColor}
          titleColor={titleColor}
          submitName={this.props.submitName}
        />
      ) : orderType === '2' ? (
        <OrderIpoteka
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          submitName={this.props.submitName}
          footerTitle={footerTitle}
          />
      ) : orderType === '1' ? (
        <OrderCallMe
          id={props.id}
          fields={formsArray}
          orderChange={orderChange}
          handleSubmit={handleSubmit}
          validate={state.data}
          value={state.value}
          headerTitle={headerTitle}
          footerTitle={footerTitle}
          user={props.user}
          submitName={this.props.submitName}
          showPhone={props.showPhone}
          />
        ) : <div>Нет такого типа заявки</div>;

    return htmlGenerator;
  }
}

export default Order;
