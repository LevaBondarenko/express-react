/**
 * Blog subscribe confirm form component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars


class BlogSubscribeConfirm extends Component {
  static propTypes = {
    subscribeClassName: PropTypes.string,
    subscribeClass: PropTypes.string,
    message: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      subscribeClassName,
      subscribeClass,
      message
    } = this.props;

    return (
      <div className={subscribeClassName} key={'subscribeConfirm'}>
        <div className={`${subscribeClass}--subscribed`}>
          <h3><b>СПАСИБО ЗА ПОДПИСКУ!</b></h3>
            <p>
              {message}
            </p>
        </div>
      </div>
    );
  }
}

export default BlogSubscribeConfirm;
