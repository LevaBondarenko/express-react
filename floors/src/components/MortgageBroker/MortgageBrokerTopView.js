import React, {Component, PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Image from '../../shared/Image';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageBrokerTopView.scss';
import ModalWindow from '../../shared/ModalWindow/';
import CallOrderForm from './CallOrderForm';
import CallOrderSucces from './CallOrderSucces';
import {phoneFormatter} from '../../utils/Helpers';
import {take, takeRight, drop} from 'lodash';
//import MortgageBrokerModal from './MortgageBrokerModal';

/* global data */
class MortgageBrokerTopView extends Component {
  static propTypes = {
    agentTitle: PropTypes.string,
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
    const {selectedBroker} = this.props;

    return (
      <Row className={s.root}>
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
        <Col xs={12} className={s.agentPhone}>
          <i className='fa fa-phone' aria-hidden='true' />
          <a href={`tel:${this.phone}`}> {this.phone}</a>
        </Col>
        <Col xs={12}>
          <ButtonToolbar className={s.agentToolbar}>
            <Button onClick={this.props.toggleModal}>
              Заказать звонок
            </Button>
          </ButtonToolbar>
        </Col>
        <ModalWindow
          show={this.props.showModal}
          onHide={this.props.toggleModal}>
            {this.props.orderStatus ? (
              <CallOrderSucces>
                <p>Успешно отправлен, ожидайте звонка специалиста.</p>
              </CallOrderSucces>
            ) : (
              <CallOrderForm
                handleChange={this.props.handleChange}
                userName={this.props.userName}
                userPhone={this.props.userPhone} />
            )}
            <ButtonToolbar className={s.orderToolbar}>
              <div>
                <Col xs={10}>
                  {this.props.orderStatus ? (
                    <div className='pull-right'>
                      <Button onClick={this.props.toggleModal}>
                        Ок
                      </Button>
                    </div>
                  ) : (
                    <div className='pull-right'>
                      <Button onClick={this.props.toggleModal}>
                        Отмена
                      </Button>
                      <Button onClick={this.props.handleOrderSubmit}>
                        Заказать
                      </Button>
                    </div>
                  )}
                </Col>
              </div>
            </ButtonToolbar>
          </ModalWindow>
      </Row>
    );
  }

};

export default withStyles(s)(MortgageBrokerTopView);
