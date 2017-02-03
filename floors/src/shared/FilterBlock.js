/**
 * Searchform filter component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
/**
 * React/Flux entities
 */

class FilterBlock extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
    clearFilter: PropTypes.func,
    visibleClear: PropTypes.bool
  };

  static defaultProps = {
    visible: true,
    title: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible
    };
  }

  toggleFilterBlock(event) {
    event.preventDefault();
    if (this.state.visible === false) {
      this.setState(() => ({visible: true}));
    } else {
      this.setState(() => ({visible: false}));
    }
  }

  onClickClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.clearFilter();
  }

  render() {
    const {visible} = this.state;
    const {title, children, visibleClear} = this.props;
    const classSet = classNames({
      'filter--block__content': true,
      'visibleBlock': visible
    });

    const titleClassSet = classNames({
      'filter--block__title': true,
      'clearfix': true
    });

    const toggleArrow = visible ?
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-top pull-left"
            aria-hidden="true" />
        )
      }) :
      createFragment({
        toggleArrow: (
          <span className="glyphicon glyphicon-triangle-bottom pull-left"
            aria-hidden="true" />
        )
      });

    return (
        <div className='offset--top__15 filter--block'>
        <div className={titleClassSet}
        onClick={this.toggleFilterBlock.bind(this)}>
          <h3 className='clearfix'>
            {toggleArrow}
            <span className='pull-left filter-block-title'>{title}</span>
            {
              visibleClear ? (
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
        <div className={classSet}>
          {children}
        </div>
      </div>
    );
  }
}

export default FilterBlock;
