/**
 * Shared FavReviewButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import ga from '../utils/ga';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import userStore from '../stores/UserStore';
import UserActions from '../actions/UserActions';

class CompareButton extends Component {
  static propTypes = {
    oid: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    oclass: React.PropTypes.string,
    style: React.PropTypes.object,
    className: React.PropTypes.string,
    withTitle: React.PropTypes.bool,
    newBtn: React.PropTypes.bool,
  };

  static defaultProps = {
    style: null,
    className: null,
    withTitle: false
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.onChange();
  }

  componentDidMount() {
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      inCompare: UserActions.inCompare(this.props.oid, this.props.oclass)
    }));
  }

  toggle = () => {
    const {oid, oclass} = this.props;
    const {inCompare} = this.state;

    if (inCompare) {
      // google analytics event
      ga('button', data.object && data.object.info ?
        'site_compare_object_delete' :
        'site_compare_search_card_delete');

      UserActions.updateCompare(inCompare, oid, oclass);
    } else {
      // google analytics event
      /* global data */
      ga('button', data.object && data.object.info ?
        'site_compare_object_add' :
        'site_compare_search_card_add');

      UserActions.updateCompare(inCompare, oid, oclass);
    }
  }

  render() {
    const style = this.props.style;
    const {inCompare} = this.state;
    const title = inCompare ?
      'Удалить из списка объектов для сравнения' :
      'Добавить к списку объектов для сравнения';
    const modeClass = classNames(
      'btn-fav',
      {'on': inCompare},
      this.props.className
    );
    const compareClasses = classNames(
      'compareSpan',
      {'on': inCompare},
    );

    return (
      <div className={modeClass} style={style}>
        <Button
          title={title}
          bsStyle='default'
          bsSize='large'
          onClick={this.toggle}>
          {this.props.newBtn ?
            (<span className={compareClasses}>
              <i className='fa fa-list-ul'/>
              <span className='subIcon'>{inCompare ? '-' : '+'}</span>
            </span>) : <i className='fa fa-check-square-o' />}
            {this.props.withTitle ?
              (inCompare ?
                <span> В сравнении</span> :
                <span> К сравнению</span>) :
              null}
        </Button>
      </div>
    );
  }
}

export default CompareButton;
