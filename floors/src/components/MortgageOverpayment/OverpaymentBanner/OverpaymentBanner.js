/**
 * OverpaymentBanner stateless component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OverpaymentBanner.scss';

const OverpaymentBanner = (props) => {
  const {error, children, step} = props;

  return (
    <div className={`${s.root} ${error ? s.bgError : s.bgGreen}`}>
      <h3>
        Ипотека на Ваших условиях.
      </h3>
      {error ? (
        <p>
          Указанные в калькуляторе значения не соответствуют
          условиям выбранной ипотечной программы
        </p>
      ) : (
        <span>
          <p>
            Прибавляйте к своему ежемесячному платежу по <b>{step} </b>
            и смотрите, как изменятся условия погашения кредита.
          </p>
          {children}
        </span>
      )}

    </div>
  );
};

OverpaymentBanner.propTypes = {
  error: PropTypes.bool,
  children: PropTypes.any,
  step: PropTypes.any
};

export default withStyles(s)(OverpaymentBanner);
