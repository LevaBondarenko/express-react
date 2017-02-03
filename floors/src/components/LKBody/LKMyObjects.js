/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, find} from 'lodash';
import LKMyObjectsAdd from './LKMyObjects/LKMyObjectsAdd';
import LKMyObjectsEmpty from './LKMyObjects/LKMyObjectsEmpty';
import LKMyObjectsList from './LKMyObjects/LKMyObjectsList';
import ga from '../../utils/ga';


import withStyles from '../../decorators/withStyles';
import styles from './LKMyObjects/style.css';

@withStyles(styles)
class LKMyObjects extends Component {
  static propTypes = {
    action: PropTypes.string,
    objectId: PropTypes.string,
    myobjects: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.myObjectsRedirects(props);
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/myobjects');

    this.trackEvent = () => {};
  }

  componentWillReceiveProps(nextProps) {
    this.myObjectsRedirects(nextProps);
  }

  myObjectsRedirects(props) {
    const {myobjects, objectId, action} = props;
    const selectedObject = objectId && size(myobjects) ?
      find(myobjects, {id: parseInt(objectId)}) : {};

    if(size(myobjects) && !action) {
      if(!objectId || !selectedObject) {
        window.location.hash = myobjects[0].status === 0 ?
          `/myobjects/${myobjects[0].id}/edit` :
          `/myobjects/${myobjects[0].id}`;
      } else {
        if(selectedObject.status === 0) {
          window.location.hash = `/myobjects/${selectedObject.id}/edit`;
        }
      }
    } else if(size(selectedObject) &&
      action === 'edit' && selectedObject.status === 1) {
      window.location.hash = `/myobjects/${selectedObject.id}`;
    }
  }

  render() {
    const {action, objectId} = this.props;

    this.trackEvent();
    return (
      <div>
        {(!action && !objectId ?
          <LKMyObjectsEmpty /> : false
        )}
        {(action === 'add' ?
          <LKMyObjectsAdd {...this.props} /> : false
        )}
        {(parseInt(objectId) && objectId.length > 0 ?
          <LKMyObjectsList {...this.props} /> : false
        )}
      </div>
    );
  }
}

export default LKMyObjects;
