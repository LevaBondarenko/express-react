/**
 * Created by tatarchuk on 30.04.15.
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import {getUser} from '../../utils/requestHelpers';
import {map} from 'lodash';
import ga from '../../utils/ga';

import Helpers from '../../utils/Helpers';
import Image from '../../shared/Image';
import classNames from 'classnames';

import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';

/*global data*/
class RieltorTab extends Component {
  static propTypes = {
    wssSettings: PropTypes.string,
    defaultPhone: PropTypes.string
  };

  static defaultProps = {
    wssSettings: '',
    defaultPhone: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      active: 0
    };
  }

  componentDidMount() {
    const arrAgent = [];
    const {wssSettings} = this.props;

    if (data.object && data.object.info && data.object.info.info) {
      const {info} = data.object.info;

      parseInt(info.agent_id) > 0 && arrAgent.push(info.agent_id);
      parseInt(info.agent2_id) > 0 && arrAgent.push(info.agent2_id);
      parseInt(info.agent3_id) > 0 && arrAgent.push(info.agent3_id);

      if (arrAgent && arrAgent.length > 0) {
        const rieltorList = arrAgent.length ? map(arrAgent, (userId) => {
          const dataUser = {
            action: 'get_user',
            userId: userId
          };

          return getUser(dataUser).then(response => {
            return parseInt(response.ajax.id) > 0 ?
              this.rieltorInfo(response.ajax) : null;
          });
        }) : null;

        rieltorList && Promise.all(rieltorList).then(
          response => {
            const list = JSON.parse(JSON.stringify(response));
            const listValid = [];

            map(list, (val) => {
              val && listValid.push(val);
            });

            const listCopy = JSON.parse(JSON.stringify(listValid));

            WidgetsActions.set(wssSettings,
              listCopy.length ? listCopy[0] : this.rieltorDefault);

            if (listValid.length) {
              this.setState({
                list: listValid,
                active: 0
              });
            }
          }
        );
      } else {
        WidgetsActions.set(wssSettings, this.rieltorDefault);
      }
    }
  }

  get rieltorDefault() {
    const {defaultPhone} = this.props;

    return {
      userId: -100,
      agentName: 'Консультант по новостройкам',
      phoneNum: defaultPhone ? defaultPhone : '+7(800)510-2-510',
      photoAgentName: 'https://cdn-media.etagi.com/static/site/d/dc/dc8fe03733545f4cbdd728e5e7b461294f127c83.png',
      specifications: '',
      social: {
        socialLinkVK: ''
      }
    };
  };

  rieltorInfo = (info) => {
    const {selectedCity} = wss.get();
    const specifications =  info.specifications ?
          info.specifications : '';

    return {
      userId: info.id,
      agentName: info.fio,
      phoneNum: info.phone ? Helpers.phoneFormatter(
        info.phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : selectedCity.office_phone,
      photoAgentName: (info.photo ? info.photo : '/no_photo'),
      specifications: specifications
    };
  }

  handleChange(event) {
    event.preventDefault();

    const {wssSettings} = this.props;
    const {list} = this.state;
    const active = event.currentTarget.dataset.active;
    const listJson = JSON.parse(JSON.stringify(list));

    WidgetsActions.set(wssSettings, listJson[active]);

    this.setState(() => ({
      active: active
    }));
    ga('button', 'zastr_Smena_rijeltora');
  }

  render() {
    const {list, active} = this.state;
    const renderList = list && list.length ? map(list, (val, key) => {
      const arrPath = val.photoAgentName.split('/');
      const photoFileName = arrPath[arrPath.length - 1];
      const imageProps = {
        image: photoFileName,
        visual: 'profile',
        width: 160,
        height: 160
      };

      const classRieltor = classNames({
        'rieltorTab-ico': true,
        active: key === parseInt(active) ? true : false
      });

      return (<a key={key}
                 href="#"
                   className={classRieltor}
                   data-active={key}
                   onClick={this.handleChange.bind(this)}>
        <Image {...imageProps} alt={val.agentName} />
      </a>);
    }) : null;

    return list && list.length > 1 ? (<div className="rieltorTab">
      {renderList}
      <div className="text-center">
        <i className="fa fa-angle-double-up" aria-hidden="true" />
        <p className="noticeRieltorTab">
          Чтобы выбрать специалиста кликните по фотографии
        </p>
      </div>
    </div>) : null;
  }
}

export default RieltorTab;
