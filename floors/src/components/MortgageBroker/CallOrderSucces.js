import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import s from './CallOrderSucces.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const CallOrderSucces = (props) => {
  return (
    <Row>
      <Col xs={8} xsOffset={2} className={s.formWrap}>
        <div className='clearfix'>
          <div className={s.modalIcon}>
            <i className='fa fa-phone' aria-hidden='true' />
          </div>
          <h3>Заказ обратного звонка</h3>
        </div>
        {props.children}
      </Col>
    </Row>
  );
};

CallOrderSucces.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
};

export default withStyles(s)(CallOrderSucces);
