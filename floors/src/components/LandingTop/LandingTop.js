/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Helpers from '../../utils/Helpers';
import UserAgentData from 'fbjs/lib/UserAgentData';
import withCondition from '../../decorators/withCondition';
import ga from '../../utils/ga';

@withCondition()
class LandingTop extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    scrollTarget: React.PropTypes.string
  }

  static defaultProps = {
    title: `Личный кабинет - новый инструмент поиска и продажи недвижимости в 40
            городах России`,
    scrollTarget: 'landingOurServicesWrapper'
  }

  constructor(props) {
    super(props);
  }

  scrollTo(event) {
    event.preventDefault();

    const target = document.getElementsByClassName(this.props.scrollTarget)[0];
    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;

    Helpers.scrollTo(elementTop, target.offsetTop, 500);

  }

  trackLink = () => {
    ga('button', 'landing_tyumen_lk_signup');
  };

  render() {

    return (
      <div className='landingtop'>

        <div className="landingtop_bgscroll">
          <div className="landingtop_bgscrollImg"></div>
        </div>

        <div className="landingtop_promo">
          <h1 className="landingtop_title">
            {this.props.title}
          </h1>
          <div className="landingtop_regBtnWrapper">
            <a href='#register'
              onClick={this.trackLink}
              className="landingtop_regBtn">
              Зарегистрироваться
            </a>
          </div>
          <div className="landingtop_arrowDownWrapper bouncing">
            <a href='#' className="landingtop_arrowDown"
               onClick={this.scrollTo.bind(this)
               }>
              &nbsp;
            </a>
          </div>
          <div className="landingtop_macBookWrapper">
            <div className="landingtop_macBookScreen"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default LandingTop;
