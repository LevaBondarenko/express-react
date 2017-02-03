/**
 * Modular Searcher Count component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {priceFormatter} from '../../utils/Helpers';
import classNames from 'classnames';
import FilterSettingsStore from '../../stores/FilterSettingsStore';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import withCondition from '../../decorators/withCondition';

@withCondition()
class MSearcherCount extends Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      isLoading: true,
      countMode: parseInt(props.countMode) ? 'count_houses' : 'count'
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
    FilterSettingsStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
    FilterSettingsStore.offChange(this.onChange);
  }

  onChange = () => {
    this.setState({
      count: mss.get(this.state.countMode),
      isLoading: mss.get('isLoading')
    });
  }

  get parentNode() {
    const {mountNode} = this.props;

    return canUseDOM ? document.getElementById(mountNode).parentNode : false;
  }

  render() {
    const {count, isLoading, countMode} = this.state;
    const {padding, alignMode, labelText, loaderColor} = this.props;
    const parentCell = this.parentNode;

    if(this.parentNode) {
      if(this.props.alignMode === 'right') {
        parentCell.style.paddingRight = `${padding}px`;
      } else {
        parentCell.style.paddingLeft = `${padding}px`;
      }
    }

    return (
      <div className="msearcher">
        <div
          className={classNames({
            'msearcher--count': true,
            'pull-left': alignMode === 'left',
            'pull-right': alignMode === 'right',
          })}>
          <span className="pull-left count--labels"
            style={{'marginRight': '.5rem'}}>{labelText}</span>
          {(isLoading ?
            <div
              className="loader-inner ball-clip-rotate searchform--preloader">
              <div style={{
                borderColor: `${loaderColor} !important`,
                borderBottomColor: 'transparent !important'
              }} />
            </div> :
            <div className='msearchercounter-right'>
              <span className='pull-left'>
                <span data-field={countMode}>
                  {priceFormatter(count)}
                </span>
                &nbsp;
              </span>
              <span
                className={classNames({
                  'count--labels': true,
                  'pull-left': !isLoading
                })}
                style={{'marginRight': '.5rem'}}
              >
                {this.props.labelTextAfter}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

MSearcherCount.propTypes = {
  countMode: React.PropTypes.string,
  alignMode: React.PropTypes.string,
  padding: React.PropTypes.string,
  labelText: React.PropTypes.string,
  labelTextAfter: React.PropTypes.string,
  loaderColor: React.PropTypes.string,
  mountNode: React.PropTypes.string
};
MSearcherCount.defaultProps = {
  countMode: '0',
  alignMode: 'right',
  padding: '15',
  labelText: '',
  labelTextAfter: ''
};

export default MSearcherCount;
