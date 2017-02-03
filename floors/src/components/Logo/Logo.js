/**
  * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './Logo.scss';

class Logo extends Component {
  static propTypes = {
    'img_src': PropTypes.string,
    'img_alt': PropTypes.string,
    'img_hrf': PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    })
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const {
        'img_src': imgSrc,
        'img_alt': imgAlt,
        'img_hrf': imgHrf,
      } = this.props;

    return (
      <div className={s.root}>
        <a className='header--logo' href={imgHrf}>
          <img src={imgSrc} alt={imgAlt}/>
        </a>
      </div>
    );
  }
}

export default Logo;
