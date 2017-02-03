/**
 * Modular Searcher Input component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ReactCssTransitionGroup from 'react-addons-css-transition-group';
import {declOfNum, priceFormatter} from '../utils/Helpers';
/**
 * React/Flux entities
 */
class Hint extends Component {
  static propTypes = {
    type: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    let hintText = props.template.replace('count', priceFormatter(props.count));
    const matches = hintText.match(new RegExp(/{([^$]*)}/));

    if (!props.count || !matches) {
      return null;
    }

    const variants = matches[1].split('|');

    hintText = hintText.replace(/{([^$]*)}/, declOfNum(props.count, variants));

    return (
      <div>
        <ReactCssTransitionGroup
          transitionName='filterhint'
          transitionEnter={false}
          transitionLeave={true}
          transitionLeaveTimeout={1000}
          component='div'>
          {props.display ? (
            <div className="filtercheckbox-hint"
                 data-prop={props.onValue}
                 key="filter_hint"
                 style={{
                   top: `${props.top - 10}px`,
                   left: `${props.left + 10}px`,
                   width: props.loading ? '150px' : '250px'
                 }}>
              {props.loading ? (
                <div
                  className='loader-inner ball-clip-rotate filterhint-rotator'>
                  <div></div>
                </div>
              ) : <span dangerouslySetInnerHTML={{__html: hintText}} />}
            </div>
          ) : <div key="empty_hint"/>}
        </ReactCssTransitionGroup>
    </div>
    );
  }
}

export default Hint;
