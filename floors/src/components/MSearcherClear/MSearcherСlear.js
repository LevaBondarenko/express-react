/**
 * Modular Searcher Submit component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Url from '../../utils/Url';
import {getSearchResult} from '../../actions/SearchActions';
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';

class MSearcherClear extends Component {
  static propTypes = {
    title: React.PropTypes.string,
    url: React.PropTypes.string
  }

  static defaultProps = {
    title: 'Очистить все',
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.excludeFields = [
      'class',
      'collections',
      'limits',
      'or',
      'order',
      'array',
      'perPage',
      'city_id',
      'action_sl'
    ];
  }

  componentDidMount() {
    const model = mss.get();

    setTimeout(() => {
      this.setState({
        defaults: {
          'city_id': model['city_id'],
          'action_sl': model['action_sl']
        }
      });
    }, 100);
  }

  clear = (event) => {
    event.preventDefault();

    const excluded = {};
    const model = mss.get();
    const {defaults} = this.state;

    for (let i = 0; i < this.excludeFields.length; i++) {
      const field = this.excludeFields[i];

      if (model[field]) {
        excluded[field] = defaults[field] ? defaults[field] : model[field];
      }
    }

    const {perPage} = mss.get();

    ModularSearcherActions.smartFlush();
    ModularSearcherActions.set(null, excluded);
    getSearchResult(
      mss.get('class'),
      15,
      0,
      mss.get(),
      {}
    );
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    setTimeout(() => {
      Url.removeQuery();
      const tmpEl = document.createElement('a');

      tmpEl.href = window.location.href;

      const newPath = `/${tmpEl.pathname.split('/')[1]}/search/`;

      window.history.pushState({}, document.title, newPath);
    }, 500);
  }

  render() {

    return (
      <div className="msearcher-clearallwrapper">
        <a href="#" className="msearcher-clearall" onClick={this.clear}>
          {this.props.title}
        </a>
      </div>
    );
  }
}

export default MSearcherClear;
