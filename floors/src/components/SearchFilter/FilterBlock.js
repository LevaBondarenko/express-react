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
    children: PropTypes.any
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

  render() {
    const {visible} = this.state;
    const {title, children} = this.props;
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
        <div className='offset--top__15 filter--block'>
        <div className={titleClassSet}
        onClick={this.toggleFilterBlock.bind(this)}>
          <h3 className='clearfix'>
            <span className='pull-left'>{title}</span>
            {toggleArrow}
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
