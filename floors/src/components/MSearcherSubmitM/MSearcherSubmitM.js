/**
 * MSearcherSubmitM widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import classNames from 'classnames';
import {declOfNum, priceFormatter} from '../../utils/Helpers';
import s from './MSearcherSubmitM.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {getSearcherUrl} from '../../selectors/';

class MSearcherSubmitM extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    isSubmitting: PropTypes.bool,
    isLoading: PropTypes.bool,
    count: PropTypes.string,
    countHouses: PropTypes.string,
    uri: PropTypes.string,
    actions: PropTypes.object
  };

  static defaultProps = {
    isSubmitting: false
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
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

  onClick = () => {
    this.props.actions.updateInUiState(['mobileShow'], () => (null));
  }

  get title() {
    const {count, countHouses, isLoading} = this.props;

    return isLoading ? (
      <div className={classNames(s.loader, 'loader-inner', 'ball-pulse')}>
        <div/><div/><div/>
      </div>
    ) : (
      <span>
        Показать&nbsp;
        {priceFormatter(count)}&nbsp;
        {declOfNum(count, ['предложение', 'предложения', 'предложений'])}
        {countHouses ? (
          <span><br/>
            в {priceFormatter(countHouses)}&nbsp;
            {declOfNum(countHouses, ['доме', 'домах', 'домах'])}
          </span>
        ) : null}
      </span>
    );
  }

  render() {
    const {uri, isSubmitting} = this.props;

    return (
      <div className={s.root}>
        {isSubmitting ? (
          <a href={uri} onClick={this.onClick}
            className='mobile-primary-button'>
            {this.title}
          </a>
        ) : (
          <button onClick={this.onClick} className='mobile-primary-button'>
            {this.title}
          </button>
        )}
      </div>
    );
  }

}

export default connect(
  state => {
    const searcher = state.objects.get('searcher').toJS();

    return {
      isLoading: searcher.isLoading,
      count: searcher.count,
      countHouses: searcher.count_houses,
      uri: getSearcherUrl(state)
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInUiState}, dispatch)
    };
  }
)(MSearcherSubmitM);
