import React, {Component, PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Image from '../../shared/Image';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageBrokerBottomView.scss';
import {phoneFormatter} from '../../utils/Helpers';
import ModalWindow from '../../shared/ModalWindow/';
import CallOrderForm from './CallOrderForm';
import CallOrderSucces from './CallOrderSucces';
import {take, takeRight, drop} from 'lodash';

/* global data */
class MortgageBrokerBottomView extends Component {

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
    staticPhone: PropTypes.string,
    mortgageQuery: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
    ])
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
      width: 160,
      height: 160,
      className: 'img-responsive'
    };
  }

  render() {
    const {selectedBroker, mortgageQuery} = this.props;

    return (
      <Row className={s.root}>
        <Col xs={12} className={s.cardTitle}>
          <h3 className='text-center'>
            {mortgageQuery ?
              'Оформите ипотеку с Вашим экспертом' :
              'Возникли вопросы? Закажите обратный звонок'
            }
          </h3>
        </Col>
        <Col xs={4} className={s.imageWrapper}>
          <Row>
            <div className='img-circle center-block' style={{
              width: `${this.imageProps.width}px`,
              height: `${this.imageProps.height}px`,
              overflow: 'hidden'
            }}>
              <Image {...this.imageProps}/>
            </div>
          </Row>
        </Col>
        <Col xs={8} style={{marginTop: '20px'}}>
          <Row>
            <Col xs={12} className={s.cardTitle}>
              <p className={s.agentName}>
                {take(selectedBroker.fio.split(' '), 1).join(' ')}<br/>
                {drop(selectedBroker.fio.split(' '), 1).join(' ')}
              </p>
              <p className={s.agentTitle}>
                {this.props.agentTitle}
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className={s.cardTitle}>
              <p className={s.agentName}>Ваш номер: <b>
                {mortgageQuery}</b>
              </p>
            </Col>
          </Row>
            <Row className='ipotekaBanks'>
              <Col xs={6} className={s.agentPhone}>
                <a href={`tel:${this.phone}`}> {this.phone}</a>
              </Col>
              <Col xs={6}>
                <ButtonToolbar className={s.agentToolbar}>
                  <Button onClick={this.props.toggleModal}>
                  <i className='fa fa-phone' aria-hidden='true' />
                    Заказать звонок
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
        </Col>
          <Row className='ipotekaNoBanks'>
            <Col xs={6} className={s.agentPhone}>
              <a href={`tel:${this.phone}`}> {this.phone}</a>
            </Col>
            <Col xs={6}>
              <ButtonToolbar className={s.agentToolbar}>
                <Button onClick={this.props.toggleModal}>
                <i className='fa fa-phone' aria-hidden='true' />
                  Заказать звонок
                </Button>
              </ButtonToolbar>
            </Col>
          </Row>
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
}

export default withStyles(s)(MortgageBrokerBottomView);
