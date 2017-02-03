import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import {phoneFormatter} from '../../utils/Helpers';
import s from './CallOrderForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/* global data */

const CallOrderForm = (props) => {
  const {handleChange, userName, userPhone} = props;

  return (
    <Row>
      <Col xs={8} xsOffset={2} className={s.formWrap}>
        <div className='clearfix'>
          <div className={s.modalIcon}>
            <i className='fa fa-phone' aria-hidden='true' />
          </div>
          <h3>Заказ обратного звонка</h3>
        </div>
        <FormGroup
          className={s.formGroup}
          controlId='userName'>
          <ControlLabel className={s.label}>
            <i className='fa fa-user' aria-hidden='true' />
          </ControlLabel>
          <FormControl type='text'
            data-name='userName'
            value={userName}
            onChange={handleChange}
            placeholder='Имя' />
          <HelpBlock />
        </FormGroup>
        <FormGroup
          className={s.formGroup}
          controlId='userPhone'>
          <ControlLabel className={s.label}>
            <i className='fa fa-phone' aria-hidden='true' />
          </ControlLabel>
          <FormControl type='text'
            data-name='userPhone'
            value={phoneFormatter(
              userPhone,
              data.options.countryCode.current,
              data.options.countryCode.avail
            )}
            onChange={handleChange}
            placeholder='Телефон'/>
        </FormGroup>
      </Col>
    </Row>
  );
};

CallOrderForm.propTypes = {
  handleChange: PropTypes.func,
  userName: PropTypes.string,
  userPhone: PropTypes.string,
};

export default withStyles(s)(CallOrderForm);
