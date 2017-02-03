/**
 * AuthPanel Mobile Menu component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';// eslint-disable-line no-unused-vars
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {map, size} from 'lodash';// eslint-disable-line no-unused-vars
import s from './AuthPanelMobileDialog.scss';

const AuthPanelMobileRestore = (props) => {
  const {actions} = props;// eslint-disable-line no-unused-vars

  return (
    <div className={classNames('mobile-modal', s.root)}>
    </div>
  );
};

AuthPanelMobileRestore.propTypes = {
  actions: PropTypes.object.isRequired,
};

export default withStyles(s)(AuthPanelMobileRestore);
