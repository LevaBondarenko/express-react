/**
 * LK Booking help
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import _faq from './config/faq';
import s from './LKBookingFAQ.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {size} from 'lodash';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class LKBookingFAQ extends Component {
  static propTypes = {
    currentStep: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
  };

  constructor(props) {
    super(props);
    this.state = {
      currentStep: props.currentStep ? props.currentStep : 0,
      faq: _faq
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.currentStep &&
      this.state.currentStep !== nextProps.currentStep) {
      this.setState(() => ({currentStep: nextProps.currentStep}));
    }
  }

  generateFaq = () => {
    const {currentStep, faq} = this.state;
    const childrens = [];

    for (let i = 0; i < 3; i++) {
      if(size(faq[currentStep]) <= i) {
        break;
      }
      const item = (
        <Col xs={size(faq[currentStep]) === 2 ? 6 : 4}
          key={`step${i}`}
          className={s.faqBox}>
          <h4>{faq[currentStep][i].question}</h4>
          <div>
            <p>
              {this.state.faq[currentStep][i].answer}
            </p>
          </div>
        </Col>
      );

      childrens.push(item);
    }
    return childrens;
  };

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h3 className={s.faqTitle}>Часто задаваемые вопросы</h3>
          </Col>
          <Row>
            {this.generateFaq()}
          </Row>
        </Row>
      </div>
    );
  }
}

export default withStyles(s)(LKBookingFAQ);
