import React, {Component, PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Image from '../../shared/Image';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageBrokerMobileView.scss';
import {phoneFormatter} from '../../utils/Helpers';
import {take, takeRight, drop} from 'lodash';
import UInput from '../UInput/UInput';
import USubmit from '../USubmit/USubmit';
import UValidator from '../UValidator/UValidator';

/* global data */
class MortgageBrokerMobileView extends Component {
  static propTypes = {
    agentTitle: PropTypes.string,
    agentText: PropTypes.string,
    phone: PropTypes.string,
    toggleModal: PropTypes.func,
    showModal: PropTypes.bool,
    handleChange: PropTypes.func,
    userName: PropTypes.string,
    userPhone: PropTypes.string,
    orderStatus: PropTypes.bool,
    handleOrderSubmit: PropTypes.func,
    selectedBroker: PropTypes.object,
    showBrokerModal: PropTypes.bool,
    toggleBrokerModal: PropTypes.func,
    staticPhone: PropTypes.string,
    mobileTitle: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
  }

  get phone() {
    const {selectedBroker, staticPhone} = this.props;
    let phone;

    if(staticPhone && staticPhone !== '') {
      phone = staticPhone;
    } else if(selectedBroker.officePhone && selectedBroker.officePhone !== '') {
      phone = selectedBroker.officePhone;
    } else {
      phone = phoneFormatter(
        selectedBroker.phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
    }

    return phone;
  }

  get imageProps() {
    const {selectedBroker} = this.props;

    return {
      image: selectedBroker.photo ?
        takeRight(selectedBroker.photo.split('/'))[0] : selectedBroker.image,
      visual: 'photo',
      width: 100,
      height: 100,
      className: 'img-responsive'
    };
  }

  render() {
    const {selectedBroker, agentText, context, mobileTitle} = this.props;

    return (
      <Row className={s.root}>
        <Col xs={12}>
          <div className={s.brokerTitle}>{mobileTitle}</div>
          <div className={s.agentText}>{agentText}</div>
        </Col>
        <Col xs={12} className={s.imageWrapper}>
          <div className='img-circle center-block' style={{
            width: `${this.imageProps.width}px`,
            height: `${this.imageProps.height}px`,
            overflow: 'hidden'
          }}>
            <Image {...this.imageProps}/>
          </div>
        </Col>
        <Col xs={12} className={s.agentCard}>
          <p className={s.agentName}>
            {take(selectedBroker.fio.split(' '), 2).join(' ')}<br/>
            {drop(selectedBroker.fio.split(' '), 2).join(' ')}
          </p>
          <p className={s.agentTitle}>
            {this.props.agentTitle}
          </p>
        </Col>
        <div className={s.agentPhone}>
          <a href={`tel:${this.phone}`}> {this.phone}</a>
        </div>
        <Col xs={12}>
          <div className={s.formControl} id='brokerTicket-name'>
            <UInput
              id='brokerTicket-uinput-name'
              mountNode='brokerTicket-name'
              context={context}
              objectName='brokerTicket'
              fieldName='name'
              placeholder='Ваше имя'
              refreshOn='change'
              maxLength={64}/>
          </div>

          <div className={s.formControl} id='brokerTicket-phone'>
            <UInput
              id='brokerTicket-uinput-phone'
              mountNode='brokerTicket-phone'
              context={context}
              objectName='brokerTicket'
              fieldName='phone'
              isPhone={true}
              placeholder='Введите номер телефона'
              refreshOn='change'
              maxLength={64}/>
          </div>

          <div className={s.formControl}>
            <USubmit
              context={context}
              objectName='brokerTicket'
              typeId={'6'}
              label='Получить консультацию'
              validateMode='onSend'
              sendedTitle='Заявка отправлена'
              skipValues={[]}
              extValues={[
                {field: 'source', value: 'Web'}
              ]}/>
            <UValidator
              context={context}
              objectName='brokerTicket'
              validateOnChange={false}
              blockHeight={-1}
              displayErrors='disabled'
              dumpToConsole={false}
              rules={[
                {
                  field: 'phone',
                  rule: 'required',
                  param: 0,
                  err: 'error',
                  msg: 'Телефон обязателен'
                },
                {
                  field: 'phone',
                  rule: 'phone',
                  param: 0,
                  err: 'error',
                  msg: 'Телефон введен не правильно'
                }
              ]}/>
          </div>
        </Col>
      </Row>
    );
  }

};

export default withStyles(s)(MortgageBrokerMobileView);
