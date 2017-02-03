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
import {extend, clone} from 'lodash';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import FilterSettingsStore from '../../stores/FilterSettingsStore';
import mss from '../../stores/ModularSearcherStore';
import userStore from '../../stores/UserStore';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Panel from 'react-bootstrap/lib/Panel';
import moment from 'moment/moment';
import withStyles from '../../decorators/withStyles';
import styles from '../SearchPaging/SearchPaging.css';

/* global data */

@withStyles(styles)
class MSearcherSave extends Component {
  static propTypes = {
    buttonText: React.PropTypes.any,
    classCss: React.PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      collapsible: false,
      name: '',
      successSave: false
    };
  }

  componentWillMount() {
    userStore.onChange(this.onChange);
  }

  get placeholderTitle() {
    const dateFormatted =
      (new Date(
        `${moment().format('YYYY-MM-DD')}T10:00:00+0500`
      ))
        .toLocaleString('ru', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

    return `Подписка от ${dateFormatted}`;
  }

  close = () => {
    this.setState(() => ({
      collapsible: !this.state.collapsible,
      successSave: !this.state.successSave,
    }));
  };

  change = (e) => {
    const value = e.target.value;

    this.setState(() => ({name: value}));
  };

  save = (e) => {
    const model = clone(extend(
      mss.get(), FilterSettingsStore.get('filterFields')
    ));
    const objClass = model.class;
    const subscriptionName = this.state.name === '' ?
      this.placeholderTitle : this.state.name;

    model.city_id = model.city_id || data.options.cityId || 23; // eslint-disable-line camelcase
    model.count = null;
    model.count_houses = null; // eslint-disable-line camelcase
    model.collections = null;
    model.count = null;
    model.order = null;
    model.class = null;
    model.isLoading = null;
    model.date_create_min = null; // eslint-disable-line camelcase

    e.preventDefault();
    UserActions.create(
      {
        filter: JSON.stringify(model, (key, value) => {
          if(typeof value === 'number') {
            return value.toString();
          }
          if(value) {
            return value;
          }
        }),
        name: subscriptionName,
        class: objClass,
        notifications: 1,
        notifications_email: 1 //eslint-disable-line camelcase
      },
      'searches'
    );
    this.setState(() => ({
      successSave: true
    }));
    setTimeout(() => {
      this.setState(() => ({
        collapsible: false
      }));
    }, 3000);
    setTimeout(() => {
      this.setState(() => ({
        successSave: false,
        name: ''
      }));
    }, 3100);
  };

  togglePane = () => {
    this.setState(() => ({collapsible: !this.state.collapsible}));
  };

  getPaneContent = () => {
    let content;


    if(userStore.get('isAuthorized')) {
      if(this.state.successSave) {
        content = (
          <div className='text-center'>
            <p>Теперь вы не пропустите выгодные предложения</p>
            <Button
              className='subscription--save center-block'
              data-link='searches'
              onClick={this.goto}>
              К подписке
            </Button>
          </div>
        );
      } else {
        content = (
          <div  className='subscription--pane-block'>
            <span>
              <FormControl
                type='text'
                className='subscription--pane__input col-xs-6'
                placeholder={this.placeholderTitle}
                ref='name'
                id='name'
                data-name='name'
                required='on'
                onChange={this.change}
                value={this.state.name}
              />
            </span>
            <Button
              className='subscription--save'
              onClick={this.save}
              style={{width: '140px'}}>
              Сохранить подписку
            </Button>
        </div>
        );

      }
    } else {
      content = (
        <p className='text-center'>
          Для сохранения запроса Вы должны быть <a href='#'
          className='subscription--login'
          onClick={this.login}>
            авторизованы
          </a>
        </p>
      );
    }

    return content;
  };

  login = (event) => {
    event.preventDefault();
    UserActions.showLogin();
  };

  onChange = () => {
    this.setState(() => ({
      isAuthorized: userStore.get('isAuthorized'),
    }));
  }

  goto = (event) => {
    const loc = window.location;
    const path = '/my/';
    const hash = event.target.dataset.link ?
      event.target.dataset.link : event.target.parentElement.dataset.link;

    if(loc.pathname !== path) {
      window.location.href = `${loc.origin}${path}#/${hash}/`;
    } else {
      window.location.hash = `#/${hash}/`;
    }
  };

  render() {
    const classBtn = this.props.classCss ? this.props.classCss :
      'subscription--btn';

    return (
      <span>
      {(this.state.successSave ?
        (<h3 className='subscription--saved'>
           Вы создали подписку
         </h3>) :
        (<Button
          className={classBtn}
          onClick={this.togglePane}>
            {this.props.buttonText}
        </Button>)
        )}
        <Panel className='subscription--pane'
          collapsible
          expanded={this.state.collapsible}>
          {(this.state.successSave ?
            <Button onClick={this.close}
              className="etagi--closeBtn subscribe-close">
              <span aria-hidden="true">&times;</span>
            </Button> : null)}
          <Row>
            <Col xs={12}>
              {this.getPaneContent()}
            </Col>
          </Row>
        </Panel>
      </span>
    );
  }
}

MSearcherSave.defaultProps = {
  buttonText: 'Подписаться',
  classCss: ''
};

export default MSearcherSave;
