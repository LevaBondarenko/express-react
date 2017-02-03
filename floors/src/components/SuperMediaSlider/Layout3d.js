/**
 * Slide stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slide.scss';

import userStore from '../../stores/UserStore';

const Layout3d = ({layout3d, sliderHeight}) => {
  const oid = layout3d.object_id;
  const user = userStore.get();
  const hash = user.isAuthorized ? user.userInfo.authHash : '';
  const src = `${window.location.protocol}//model.etagi.com/Viewer/index?obj_id=${oid}&hash=${hash}&mode=3d`; //eslint-disable-line max-len

  return (<div
      style={{
        background: 'none',
        height: sliderHeight
      }}>
      <iframe
        id='frm'
        height='100%'
        width='100%'
        src={src}/>
    </div>);
};

Layout3d.propTypes = {
  layout3d: React.PropTypes.object,
  sliderHeight: React.PropTypes.number
};

export default withStyles(s)(Layout3d);
