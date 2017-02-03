import React, {Component, PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Image from '../../shared/Image';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageBrokerLinearView.scss';
import {phoneFormatter} from '../../utils/Helpers';
import {take, takeRight, drop} from 'lodash';
import MortgageQuery from './MortgageQuery';

/* global data */
class MortgageBrokerLinearView extends Component {

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

    this.state = {
      queryTemplate: 'linear'
    };
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
    const {selectedBroker} = this.props;
    const linear = this.state.queryTemplate;

    return (
      <Row className={s.rowPadding}>
          <MortgageQuery linear={linear} query={this.props.mortgageQuery} />
        <Col xs={4} className={s.phoneBlock}>
          <p>Вопросы? <span className={s.queryText}>Закажите звонок</span></p>
          <a className={s.agentPhone} href={`tel:${this.phone}`}>
          {this.phone}</a>
        </Col>
        <Col xs={4} className={s.imageWrapper}>
            <div className='img-circle center-block' style={{
              width: '70px',
              height: '70px',
              overflow: 'hidden',
              margin: '5px 0'
            }}>
              <Image {...this.imageProps}/>
            </div>
        </Col>
        <Col xs={4} className={s.agentCardBlock}>
            <Col xs={12} className={s.agentCard}>
              <p className={s.agentName}>
                {take(selectedBroker.fio.split(' '), 2).join(' ')}<br/>
                {drop(selectedBroker.fio.split(' '), 2).join(' ')}
              </p>
              <p className={s.agentTitle}>
                {this.props.agentTitle}
              </p>
            </Col>
        </Col>
        <div className="clearfix"></div>
      </Row>
    );
  }
}

export default withStyles(s)(MortgageBrokerLinearView);
