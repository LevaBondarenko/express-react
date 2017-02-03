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
import createFragment from 'react-addons-create-fragment';
import withCondition from '../../decorators/withCondition';
import ContextType from '../../utils/contextType';
import {each, union} from 'lodash';
import s from './FilterGroupSwitcher2.scss';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';

class FilterGroupSwitcher2 extends Component {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    visibilityProperty: React.PropTypes.string,
    title: React.PropTypes.string,
    fields: React.PropTypes.string,
    actions: React.PropTypes.object,
    searcher: React.PropTypes.object,
    visible: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    let fields = props.fields ?
      props.fields.split(',') : [];
    const allFields = [];

    each(fields, field => {
      allFields.push(`${field}_min`);
      allFields.push(`${field}_max`);
    });

    fields = union(fields, allFields);

    this.state = {
      visible: false,
      fields: fields
    };
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
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
    // let hasChecked = false;
    //
    // each(this.state.fields, field => {
    //   if (hasChecked) {
    //     return false;
    //   }
    //   hasChecked = props.searcher[field];
    // });

    return {
      visible: props.visible || '',
      hasClear: false //hasChecked на текущем макете нет места для кнопки Очистить
    };
  }

  toggleFilterBlock = (event) => {
    event.preventDefault();
    const {visible, visibilityProperty} = this.props;

    this.props.actions.updateInUiState(
      [visibilityProperty], () => !visible);
  }

  onClickClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    each(this.state.fields, item => {
      this.props.actions.updateInObjectsState(
        ['searcher', item], () => null);
    });
  }

  render() {
    const {title} = this.props;

    const toggleArrow = this.state.visible ?
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-top"
                aria-hidden="true" />
        )
      }) :
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-bottom"
                aria-hidden="true" />
        )
      });

    return (
      <div className={s.root} onClick={this.toggleFilterBlock}>
        <h3 className='clearfix'>
          {toggleArrow}
          <span className={s.filterBlockTitle}>{title}</span>
          {
            this.state.hasClear ? (
              <a className="clear-filter-block"
                 href="#"
                 onClick={this.onClickClear}
                 title="Очистить данный блок">
                Очистить
              </a>
            ) : null
          }
        </h3>
      </div>
    );
  }
}

FilterGroupSwitcher2 = connect(
  (state, ownProps) => {
    return {
      searcher: state.objects.get('searcher').toJS(),
      visible: state.ui.get(ownProps.visibilityProperty)
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInUiState}, dispatch)
    };
  }
)(FilterGroupSwitcher2);
FilterGroupSwitcher2 = withCondition()(FilterGroupSwitcher2);

export default FilterGroupSwitcher2;
