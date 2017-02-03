/**
 * Modular Searcher Submit component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {generateSearchUrl} from '../../utils/Helpers';
import {extend, clone} from 'lodash';
import seoHelpers from '../../utils/seoHelpers';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
/**
 * React/Flux entities
 */

import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import withCondition from '../../decorators/withCondition';

@withCondition()
class MSearcherSubmit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }

  componentDidMount() {
    const {ignoreParams, extraParams, realtyClass} = this.props;
    const modelUrl = canUseDOM ?
      require('../../utils/Helpers').parseUrlObject(ignoreParams || []) : {};
    /* global data */
    const modelRequest = data.page.request || [];
    let model = extraParams;

    if (realtyClass !== 'auto') {
      model.class = realtyClass;
    }
    model = extend(model, modelRequest);
    model = extend(model, modelUrl);

    ModularSearcherActions.set(null, model);
    ModularSearcherActions.getCollections();
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      active: mss.get('count') > 0
    }));
  }

  submit() {
    if(canUseDOM) {
      const model = clone(mss.get());

      let qUrl = seoHelpers.getSeoUrl(model);

      delete model.currentPage;
      delete model.offset;

      qUrl = qUrl ? qUrl :
        generateSearchUrl(
          model, `${this.props.searchUrl}?`, true
        );

      window.location = qUrl;
    }
  }

  render() {
    const active = this.state.active;

    return (
      <div style={{
        margin: '1rem',
        marginTop: 0,
        marginBottom: '0'
      }}>
          <button
            disabled={active ?  false : 'disabled'}
            className='btn btn-green btn-searchform'
            onClick={this.submit.bind(this)}>
              {this.props.buttonText}
          </button>
      </div>
    );
  }
}

MSearcherSubmit.propTypes = {
  extraParams: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.array
  ]),
  ignoreParams: React.PropTypes.array,
  realtyClass: React.PropTypes.string,
  cid: React.PropTypes.string,
  searchUrl: React.PropTypes.string,
  buttonText: React.PropTypes.string
};

MSearcherSubmit.defaultProps = {
  buttonText: 'Найти',
  ignoreParams: []
};

export default MSearcherSubmit;
