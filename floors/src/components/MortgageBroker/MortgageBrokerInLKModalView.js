import React, {Component, PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Image from '../../shared/Image';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageBrokerInLKModalView.scss';
import {phoneFormatter} from '../../utils/Helpers';
import {take, takeRight, drop} from 'lodash';

/* global data */
class MortgageBrokerInLKModalView extends Component {
  static propTypes = {
    agentTitle: PropTypes.string,
    phone: PropTypes.string,
    showModal: PropTypes.bool,
    handleChange: PropTypes.func,
    userName: PropTypes.string,
    userPhone: PropTypes.string,
    orderStatus: PropTypes.bool,
    handleOrderSubmit: PropTypes.func,
    selectedBroker: PropTypes.object,
    staticPhone: PropTypes.string,
    isOrderSending: PropTypes.bool
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
    const {selectedBroker, userPhone, isOrderSending, orderStatus} = this.props;

    return (
      <Row className={s.root}>
        <Col xs={12} className={s.title}>
          Если у вас возникли вопросы, свяжитесь со своим личным помощником
          по ипотеке
        </Col>
        <Col xs={3} className={s.imageWrapper}>
          <div className='img-circle center-block' style={{
            width: '70px',
            height: '70px',
            overflow: 'hidden'
          }}>
            <Image {...this.imageProps}/>
          </div>
        </Col>
        <Col xs={9} className={s.agentCard}>
          <p className={s.agentName}>
            {take(selectedBroker.fio.split(' '), 2).join(' ')}<br/>
            {drop(selectedBroker.fio.split(' '), 2).join(' ')}
          </p>
          <p className={s.agentTitle}>
            {this.props.agentTitle}
          </p>
        </Col>
        <Col xsOffset={3} xs={9} className={s.agentPhone}>
          <i className='fa fa-phone' aria-hidden='true' />
          <a href={`tel:${this.phone}`}> {this.phone}</a>
        </Col>
        <Col xsOffset={3} xs={9}>
          <FormGroup
            className={s.formGroup}
            controlId='userPhone'>
            <FormControl type='text'
              data-name='userPhone'
              value={phoneFormatter(
                userPhone,
                data.options.countryCode.current,
                data.options.countryCode.avail
              )}
              onChange={this.props.handleChange}
              placeholder='Телефон'/>
          </FormGroup>
          <ButtonToolbar className={s.agentToolbar}>
            <Button
              disabled={isOrderSending || orderStatus}
              onClick={this.props.handleOrderSubmit}>
                {isOrderSending ? (
                  <i className='fa fa-spin fa-spinner'/>
                ) : (orderStatus ? 'Заявка отправлена' : 'Заказать звонок')}
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }

};

export default withStyles(s)(MortgageBrokerInLKModalView);
