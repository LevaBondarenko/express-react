/**
 * Mortgage Bank Active stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FooterControls.scss';
/**
 * components
 */
import Button from 'react-bootstrap/lib/Button';

const FooterControls = ({checkAllBanks, clearCheckedBanks, applyFilter}) => {
  return (<div className={s.modalFooter}>
      <a onClick={checkAllBanks}>
        Выбрать все
      </a>
      <a onClick={clearCheckedBanks}>
        Очистить все
      </a>
      <Button
        className={s.applyFilterButton}
        bsStyle='default'
        onClick={applyFilter}>
          <span>Показать программы только выбранных банков</span>
      </Button>
    </div>
  );
};

FooterControls.propTypes = {
  checkAllBanks: React.PropTypes.func,
  clearCheckedBanks: React.PropTypes.func,
  applyFilter: React.PropTypes.func
};

export default withStyles(s)(FooterControls);
