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
import s from './BankDisabled.scss';

const BankDisabled = ({imgSrc, title, link}) => {
  return (<div className={s.disabledBank}>
      <a
        href={link}
        target='_blank'>
        <img
          title={title}
          src={imgSrc} />
      </a>
    </div>
  );
};

BankDisabled.propTypes = {
  id: React.PropTypes.string,
  title: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  link: React.PropTypes.string
};

export default withStyles(s)(BankDisabled);