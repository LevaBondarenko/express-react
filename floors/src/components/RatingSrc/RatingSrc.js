/**
 * RatingSrc widget class
 *
 * @ver 0.0.1
 * @author tatarchuk
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ga from '../../utils/ga';

class RatingSrc extends Component {
  static propTypes = {
    text: React.PropTypes.string,
    path: React.PropTypes.string
  };

  static defaultProps = {
    text: ''
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {text, path} = this.props;
    /* global data */
    const urlReplace = data.object.info.info ?
      `jk/${data.object.info.info.gp_url}-` : '';
    const srcText = path.replace('rating/', urlReplace);

    return (
      <a
        onClick={() => {
          ga('link', 'site_rating_about_detail');
        }}
        href={srcText}
        className="btn btn-rating">
        {text}
      </a>
    );
  }
}


export default RatingSrc;
