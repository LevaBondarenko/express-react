/**
 * LK Booking Settle comfirm component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import s from './style.scss';
import ga from '../../../utils/ga';

class LKBookingSettleConfirm extends Component {
  static propTypes = {
    book: PropTypes.object,
    requestSended: PropTypes.bool,
    onBookingUpdate: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  onSettle = () => {
    this.props.onBookingUpdate('settle', this.props.book.objectId);
    ga('button', 'rent_online_LK_step3_Podtverdite_zaselenie');
  }

  onProblem = () => {
    this.props.onBookingUpdate('not_settle', this.props.book.objectId);
    ga('button', 'rent_online_LK_step3_problemy_s_zaseleniem');
  }

  render() {
    const {requestSended} = this.props;

    return (
      <div className={s.lkBodyBookingSettleConfirm}>
        <Col xs={12}>
          Если вы успешно заселились и довольны выбранной квартирой,
          пожалуйста, нажмите <strong>«Подтвердить заселение»</strong><br/>
          Если у вас возникли сложности с заселением или вам не понравилась
          квартира, нажмите <strong>«У меня проблемы с заселением»</strong><br/>
          Наш администратор свяжется с вами и поможет решить проблему.
          Помните, что вы можете рассмотреть еще 2 варианта для заселения
          в счет уже оплаченной комиссии или мы вернем вам деньги.
        </Col>
        <Col xs={3} xsOffset={3}>
          <Button
            bsStyle='primary'
            disabled={requestSended}
            onClick={this.onSettle}>
            {requestSended ?
              <i className='fa fa-spin fa-spinner'/> :
              'Подтвердить заселение'}
          </Button>
        </Col>
        <Col xs={3}>
          <Button
            bsStyle='default'
            disabled={requestSended}
            onClick={this.onProblem}>
            {requestSended ?
              <i className='fa fa-spin fa-spinner'/> :
              'У меня проблемы с заселением'}
          </Button>
        </Col>
      </div>
    );
  }
}

export default withStyles(s)(LKBookingSettleConfirm);
