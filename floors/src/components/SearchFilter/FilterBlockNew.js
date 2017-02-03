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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FilterBlock.scss';
/**
 * React/Flux entities
 */

class FilterBlockNew extends Component {
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

  toggleFilterBlock = (event) => {
    event.preventDefault();
    this.setState(() => ({visible: !this.state.visible}));
  }

  render() {
    const {visible} = this.state;
    const {title, children} = this.props;
    const classSet = classNames({
      'visibleBlock': visible
    });

    const toggleArrow = visible ?
      createFragment({
        toggleArrow: (
          <i className="fa fa-caret-down" aria-hidden="true" />
        )
      }) :
      createFragment({
        toggleArrow: (
          <i className="fa fa-caret-right"
            style={{marginRight: '0.9rem'}}
            aria-hidden="true" />
        )
      });

    return (
      <div className='offset--top__15 filter--block'>
        <div className={`${s.title} clearfix`}
        onClick={this.toggleFilterBlock}>
          <h3 className='clearfix'>
            <span className='pull-left'>{toggleArrow} {title}</span>
          </h3>
        </div>
        <div className={`${s.content} ${classSet}`}>
          {children}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(FilterBlockNew);
