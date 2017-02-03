/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withCondition from '../../decorators/withCondition';
import UserAgentData from 'fbjs/lib/UserAgentData';
import Helpers from '../../utils/Helpers';
import classNames from 'classnames';
import ga from '../../utils/ga';

@withCondition()
class ScrollPointer extends Component {
  static propTypes = {
    target: PropTypes.string,
    animation: PropTypes.string,
    tag: PropTypes.string,
    cssClass: PropTypes.string,
    gaEventShortcut: PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  scrollTo(event) {
    const {gaEventShortcut} = this.props;

    event.preventDefault();

    const target = document.getElementById(this.props.target.replace('#', ''));
    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;
    const top = target ? $(target).offset().top : 0;

    Helpers.scrollTo(elementTop, top - 50, 500);
    gaEventShortcut && gaEventShortcut.length > 0 &&
      ga('button', gaEventShortcut);
  }

  render() {
    const {animation, tag, cssClass} = this.props;
    const classes = classNames({
      'pointer-wrapper': true,
      'bouncing': !!animation
    });

    return (tag ?
        <a onClick={this.scrollTo.bind(this)}
           href="#"
           className={cssClass || ''}
           dangerouslySetInnerHTML={{__html: (tag)}} /> :
      <div className={classes}>
        <a
          onClick={this.scrollTo.bind(this)}
          href="#" className="landingtop_arrowDown">&nbsp;</a>
      </div>
    );
  }
}
//<a  class="findFlat-href" href="#rr">Выбрать квартир <div class="bouncing"><span class="arrowDown"> </span></div></a>

//<a  class="findFlat-href" href="#rr"></a>

export default ScrollPointer;
