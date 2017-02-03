/**
 * LK LayoutModels component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import ga from '../../utils/ga';

class LKLayoutModels extends Component {
  static propTypes = {
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/contructor');

    this.trackEvent = () => {};
  }

  componentDidMount() {
    document
      .getElementById('frm')
      .addEventListener('mousewheel', this.onMouseWheel, false);
    document
      .getElementById('frm')
      .removeEventListener('DOMMouseScroll', this.onMouseWheel, false); // firefox
  }

  componentWillUnmount() {
    document
      .getElementById('frm')
      .addEventListener('mousewheel', this.onMouseWheel);
    document
      .getElementById('frm')
      .removeEventListener('DOMMouseScroll', this.onMouseWheel); // firefox
  }

  onMouseWheel(e) {
    e.preventDefault();
  }

  render() {
    const {authHash} = this.props.user;
    const src = `${window.location.protocol}//model.etagi.com/Editor/index?hash=${authHash}`; //eslint-disable-line max-len

    this.trackEvent();
    return (
      <div className='lkbody-layoutmodel'>
        <h2 className='result--control__title'>Редактор планировок</h2>
        <div className='lkbody-layoutmodel-container'>
          <iframe
            id='frm'
            height='600'
            width='100%'
            src={src}
          />
        </div>
      </div>
    );
  }
}

export default LKLayoutModels;
