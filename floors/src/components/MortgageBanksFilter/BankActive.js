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
import s from './BankActive.scss';

const BankActive = ({id, imgSrc, title, checked, toggleCheck}) => {
  return (<div className={`${s.activeBank} form-group`}>
      <input type='checkbox'
        id={`bank-${id}`}
        data-bank={id}
        onChange={toggleCheck}
        checked={checked}
        className='form-etagi input_arrow'/>

      <label htmlFor={`bank-${id}`} className='checkbox_arrow arrow_extend'>
        <i className='icon_arrow'> </i>
        <img
          className={checked ? s.checkedLogo : s.logo}
          title={title}
          src={imgSrc} />
      </label>
    </div>
  );
};

BankActive.propTypes = {
  id: React.PropTypes.string,
  title: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  checked: React.PropTypes.bool,
  toggleCheck: React.PropTypes.func
};

export default withStyles(s)(BankActive);