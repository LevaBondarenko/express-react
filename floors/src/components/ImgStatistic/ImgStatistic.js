/**
 * ImgStatistic widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import ContextType from '../../utils/contextType';
import {connect} from 'react-redux';

class ImgStatistic extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    link: PropTypes.string,
    objectClass: PropTypes.string,
    objectId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    realtorPhone: PropTypes.string
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {link, objectId, realtorPhone, objectClass} = this.props;
    const imageLink = link
      .replace('${rnd}', Math.random())
      .replace('${object_id}', objectId)
      .replace('${phone_number}', realtorPhone)
      .replace(
        '${object_class}',
        `${objectClass === 'nh_flats' ? 'newhouses_' : 'objects'}.site_view`
      );

    return (
      <img src={imageLink}/>
    );
  }

}

export default connect(
  state => {
    const {info: objectInfo, realtor} = state.objects.get('object') ?
        state.objects.get('object').toJS() : {};

    return {
      objectId: objectInfo ? (
        objectInfo.class ? objectInfo.object_id : objectInfo.id
      ) : null,
      objectClass: objectInfo.class ? objectInfo.class : 'nh_flats',
      realtorPhone: realtor ? realtor.phone : null
    };
  }
)(ImgStatistic);
