/**
 * Rieltor Cloud Container
 */
import React, {Component, PropTypes} from 'react';


class RieltorCloudContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    subtitle: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {title, subtitle, children} = this.props;

    return (
      <div className='rieltorCloud'>
        <div className='rieltorCloud_title'>
          {title}
        </div>
        <div className='rieltorCloud_subtitle'>
          {subtitle}
        </div>
        <div className='rieltorCloud_content'>
          {children}
        </div>
      </div>
    );
  }
}

export default RieltorCloudContainer;
