/**
 * ShowCaseActionButton widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import emptyFunction from 'fbjs/lib/emptyFunction';
import {declOfNum} from '../../utils/Helpers';
import s from './ShowCaseAltCountText.scss';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import ContextType from '../../utils/contextType';

class ShowCaseAltCountText extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    title: PropTypes.string,
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
    this.state = this.processProps(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.processProps(nextProps));
  }

  processProps = (props) => {
    const obj = props.demandShowCase;
    const {count} = obj;
    const altPriceCount = obj.altPriceCount ?
      obj.altPriceCount - count : 0;
    const altSquareCount = obj.altSquareCount ?
      obj.altSquareCount - count : 0;
    const altDistrictsCount = obj.altDistrictsCount || 0;
    const title = props.title;
    const replace = altPriceCount + altSquareCount +
      altDistrictsCount;
    const regexp = new RegExp('\\{([^$]*)}', 'ig');
    const vars = regexp.exec(title)[1].split(',');
    const strEnding = declOfNum(title, vars);

    return {
      title: replace ?
        title
          .replace('count', replace)
          .replace(regexp, strEnding) : null
    };
  }

  render() {

    return (
      <div className={s.root}>
        {this.state.title ? (
          <div dangerouslySetInnerHTML={{__html: this.state.title}} />
        ) : null}
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    demandShowCase: state.objects.get('demandShowCase').toJS() || null
  };
}

ShowCaseAltCountText =
  connect(mapStateToProps)(ShowCaseAltCountText);
ShowCaseAltCountText = withCondition()(ShowCaseAltCountText);

export default ShowCaseAltCountText;
