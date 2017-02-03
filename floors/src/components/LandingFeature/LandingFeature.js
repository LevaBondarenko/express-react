import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import classNames from 'classnames';
import UserAgentData from 'fbjs/lib/UserAgentData';
import Helpers from '../../utils/Helpers';
import ga from '../../utils/ga';

@withCondition()
class LandingFeature extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    subTitle: React.PropTypes.string,
    imagePath: React.PropTypes.string,
    showArrow: React.PropTypes.string,
    titleColor: React.PropTypes.string,
    subTitleColor: React.PropTypes.string,
    btnText: React.PropTypes.string,
    textPadding: React.PropTypes.string,
    btnColor: React.PropTypes.string,
    btnTextColor: React.PropTypes.string,
    scrollTarget: React.PropTypes.string,
    position: React.PropTypes.string,
    url: React.PropTypes.string
  }

  static defaultProps = {
    scrollTarget: '3d-costructor',
    url: '#register'
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
    ga('button', 'landing_tyumen_lk_get_access');
  };

  render() {
    const wrapperClasses = classNames({
      landingFeatureWrapper: true,
      'landingFeatureWrapper_reverse': this.props.position === 'left',
      'landingFeatureWrapper_normal': this.props.position === 'right'
    });
    const titleStyle = {
      color: this.props.titleColor ? this.props.titleColor : '#000',
    };
    const subTitleStyle = {
      color: this.props.subTitleColor ? this.props.subTitleColor : '#000',
    };
    const textStyle = {
      'paddingTop': this.props.textPadding ?
      `${this.props.textPadding}px` :
        '80px'
    };
    const btnStyle = {
      'backgroundColor': this.props.btnColor,
      color: this.props.btnTextColor ? this.props.btnTextColor : '#000'
    };

    return (
      <div className='landingfeature'>
        {this.props.showArrow === 'yes' ? (
        <div className="landingtop_arrowDownWrapper bouncing">
          <a href="#"
             onClick={this.scrollTo.bind(this)}
             className="landingtop_arrowDown">&nbsp;</a>
        </div>
        ) : ''}
        <div className={wrapperClasses}>
          <div className="landingfeature_text" style={textStyle}>
            <h2 className="landingfeature_title"
                style={titleStyle}>
              {this.props.title}
            </h2>
            <div className="landingfeature_subTitle"
                 style={subTitleStyle}>
              {this.props.subTitle}
            </div>

            <a
              href={this.props.url}
              onClick={this.trackLink}
              className="landingfeature_btn"
              style={btnStyle}
            >
              {this.props.btnText}</a>

          </div>

          <div className="landingfeature_image">
            <img src={this.props.imagePath} alt={this.props.title} />
          </div>
        </div>
      </div>
    );
  }
}

export default LandingFeature;
