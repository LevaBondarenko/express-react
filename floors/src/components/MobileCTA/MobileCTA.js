/**
 * MobileCTA widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {size} from 'lodash';
import ga from '../../utils/ga/';
import s from './MobileCTA.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {updateInUserDataState} from '../../actionCreators/UserDataActions';

import buttonTypes from './buttonTypes';

class MobileCTA extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    btnCount: PropTypes.number,
    buttons: PropTypes.array,
    actions: PropTypes.object,
    objectInfo: PropTypes.object,
    realtorInfo: PropTypes.object,
    inFavorites: PropTypes.bool,
    officePhone: PropTypes.string
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  onAction = e => {
    let ancestor = e.target;

    while(!ancestor.dataset.action && !ancestor.dataset.ga &&
      (ancestor = ancestor.parentElement)) {};
    const {action} = ancestor.dataset ? ancestor.dataset : {};
    const {ga: gaAction} = ancestor.dataset ? ancestor.dataset : {};

    size(gaAction) && ga('button', gaAction);

    switch(action) {
    case 'chatSS':
    case 'sendTicket':
    case 'extendedFilter':
      this.props.actions.updateInUiState(['mobileShow'], state => {
        return state === action ? null : action;
      });
      break;
    case 'addToFavorites':
      const {objectInfo: {object_id: objectId, class: objClass}} = this.props;

      this.props.actions.updateInUserDataState(['favorites'], state => {
        const existFavs = state || [];
        const exist = existFavs.find(item => {
          return item.id === objectId && item.class === objClass;
        });

        if(exist > -1) {
          existFavs.splice(exist, 1);
        } else {
          existFavs.push({id: objectId, class: objClass});
        }
        return existFavs;
      });
      break;
    default:
      //do nothing
    }
  }

  render() {
    const {buttons} = this.props;

    return (
      <div className={classNames(
        s.root,
        s[`buttons-${buttons.length}`]
      )}>
        {buttons.map((item, key) => {
          const buttonSettings = buttonTypes[item.action];
          const ga = item.ga;
          const className = item.action !== 'link' ? classNames(
            s.button,
            buttonSettings.className,
            {
              [buttonSettings.className]:
                item.action === 'addToFavorites' && this.props.inFavorites
            }
          ) : s.button;
          let link = null;

          switch(item.action) {
          case 'callOffice':
            link = `tel:${this.props.officePhone}`;
            break;
          case 'callRealtor':
            link = this.props.realtorInfo ?
              `tel:${this.props.realtorInfo.phone}` : '#';
            break;
          default:
            //don nothing
          };

          return item.action === 'link' ? (
            <div key={key} className={className} data-ga={ga}
              onClick={this.onAction}
              dangerouslySetInnerHTML={{__html: item.link}}/>
          ) : (link ? (
              <a
                key={key}
                className={className}
                data-ga={ga}
                onClick={this.onAction}
                href={link}>
                <span>{buttonSettings.titles[0]}</span>
              </a>
            ) : (
              <button
                key={key}
                className={className}
                data-action={item.action}
                data-ga={ga}
                onClick={this.onAction}>
                <span>
                  {item.action === 'addToFavorites' &&
                    this.props.inFavorites ?
                    buttonSettings.titles[1] : buttonSettings.titles[0]
                  }
                </span>
              </button>
            )
          );
        })}
      </div>
    );
  }

}

export default connect(
  state => {
    const favorites = state.userData.get('favorites') ?
      state.userData.get('favorites').toJS() : [];
    const {info: objectInfo, realtor} = state.objects.get('object') ?
        state.objects.get('object').toJS() : {};
    //@todo move to selectors
    const inFavorites = objectInfo && favorites && favorites.find(item => {
      return item.class === objectInfo.class &&
        item.id === objectInfo.object_id;
    }) > -1;

    return {
      officePhone: state.settings.get('selectedCity') ?
        state.settings.get('selectedCity').toJS().office_phone : '',
      objectInfo: objectInfo,
      realtorInfo: realtor,
      inFavorites: inFavorites
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState, updateInUserDataState
      }, dispatch)
    };
  }
)(MobileCTA);
