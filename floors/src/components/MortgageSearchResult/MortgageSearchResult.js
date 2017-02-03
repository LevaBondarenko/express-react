/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {findPos, scrollTo} from '../../utils/Helpers';
import mediaHelpers from '../../utils/mediaHelpers';
import mortgageHelpers from '../../utils/mortgageHelpers';
import {indexOf, size, clone, difference} from 'lodash';
import UserAgentData from 'fbjs/lib/UserAgentData';
/**
 * components
 */
import MortgageTableMObject from './MortgageTableMObject';
import MortgageTableM from './MortgageTableM';
import MortgageTableExtended from './MortgageTableExtended';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMortgagePrograms} from '../../selectors/';
import {
  updateInObjectsState, mergeInObjectsState
} from '../../actionCreators/ObjectsActions';
/**
 * React/Flux entities
 */
import FilterQuarterStore from '../../stores/FilterQuarterStore';
/**
 *  styles
 */
import s from './MortgageSearchResult.scss';

class MortgageSearchResult extends Component {
  static defaultProps = {
    hidePrograms: 1,
    defaultCount: 3,
    recomendedCount: 3,
    howMuchToAdd: 10,
    expireDays: 7,
    linkProgram: 'oldPage',
    linkBank: 'oldPage',
  }

  static propTypes = {
    defaultCount: React.PropTypes.number,
    recomendedCount: React.PropTypes.number,
    howMuchToAdd: React.PropTypes.number,
    hidePrograms: React.PropTypes.number,
    hideBanksFilter: React.PropTypes.number,
    hideBankLogo: React.PropTypes.number,
    expireDays: React.PropTypes.number,
    scrollToElement: React.PropTypes.string,
    linkProgram: React.PropTypes.string,
    linkBank: React.PropTypes.string,
    recomendedOld: React.PropTypes.bool,
    context: React.PropTypes.shape(ContextType).isRequired,
    actions: React.PropTypes.object,
    mortgage: React.PropTypes.object,
    objectInfo: React.PropTypes.object,
    dolshikRealtyPrograms: React.PropTypes.number,
    mediaSource: React.PropTypes.number,
    mode: React.PropTypes.number,
    cityId: React.PropTypes.number
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      count: props.mortgage.count,
      programs: props.mortgage.filteredPrograms,
      showMore: 0,
      recomendedPrograms: props.mortgage.recomendedPrograms,
      checkedPrograms: props.mortgage.checkedPrograms,
      checkedPercents: props.mortgage.checkedPercents,
      checkedPayments: props.mortgage.checkedPayments
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    const {mortgage, objectInfo, dolshikRealtyPrograms, mode} = this.props;
    let dataToSet = {};

    // на странице банка
    if(mortgage.bank) {
      dataToSet.bank_id = mortgage.bank.id; //eslint-disable-line camelcase
      dataToSet.onBankPage = true;
      mortgage.checkedPrograms === undefined ||
        (dataToSet.checkedPrograms = []);
    } else if(objectInfo) {
      if (typeof objectInfo.gp === 'object') { // на странице ЖК
        if (!FilterQuarterStore.myFlat.dolshik || !dolshikRealtyPrograms) {
          dataToSet.newhouses_id = objectInfo.id; //eslint-disable-line camelcase
        } else {
          dataToSet.program_types = [2]; //eslint-disable-line camelcase
        }
      }
    } else { // на странице выдачи
      const dataCookie = mortgageHelpers.getCookieMortgage();

      if (dataCookie.city_id === this.props.cityId) {
        dataToSet = dataCookie;
      }
    }
    if (mode === 2 || mode === 1) {
      dataToSet.isMobile = true;
    }

    dataToSet.recomendedCount = this.props.recomendedCount;
    mortgage.recomendedOld = this.props.recomendedOld;
    this.props.actions.mergeInObjectsState({mortgage: {...dataToSet}});
    this.props.actions.updateInObjectsState(
      ['mortgage', 'extraRequest'], () => (true));
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidUpdate() {
    if (this.state.adding) {
      setTimeout(() => {
        this.setState(() => ({
          adding: false
        }));
      }, 10);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const programsChanged = this.state.count !== nextState.count ||
      size(difference(
        this.state.programs.map(item => item.value),
        nextState.programs.map(item => item.value)
      )) > 0;
    const paramsChanged =
      this.props.mortgage.price !== nextProps.mortgage.price ||
      this.props.mortgage.avanse !== nextProps.mortgage.avanse ||
      this.props.mortgage.years !== nextProps.mortgage.years ||
      this.props.mortgage.bank_id !== nextProps.mortgage.bank_id;
    const checkedChanged =
      size(this.state.checkedPrograms) !== size(nextState.checkedPrograms) ||
      size(difference(
        this.state.checkedPrograms.map(item => item.value),
        nextState.checkedPrograms.map(item => item.value)
      )) > 0;
    const stateChanged = this.state.showMore !== nextState.showMore ||
      this.state.adding !== nextState.adding;

    return programsChanged || paramsChanged || checkedChanged || stateChanged;
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {mortgage} = props;

    if (mortgage) {
      const {
        checkedPrograms, checkedPercents, checkedPayments,
        mortgageRequestId: oldMortgageRequestId,
        recomendedPrograms, filteredPrograms
      } = mortgage;
      const {
        showMore, checkedPrograms: oldCheckedPrograms, programs
      } = this.state;
      const programsUpdated = size(programs) !== size(filteredPrograms);

      size(checkedPrograms) !== size(oldCheckedPrograms) &&
        mortgageHelpers.setCookieMortgageRequest(
          mortgage, this.props.expireDays
        ).then(mortgageRequestId => {
          oldMortgageRequestId !== mortgageRequestId &&
            this.props.actions.updateInObjectsState(
              ['mortgage', 'mortgageRequestId'], () => (mortgageRequestId));
        });

      this.setState(() => ({
        count: size(filteredPrograms) + size(recomendedPrograms),
        programs: filteredPrograms || [],
        showMore: programsUpdated ? 0 : showMore,
        checkedPrograms: checkedPrograms,
        checkedPercents: checkedPercents,
        checkedPayments: checkedPayments,
        recomendedPrograms: recomendedPrograms || []
      }));
    }
  }

  addMorePrograms = () => {
    this.setState(() => ({
      showMore: this.state.showMore + this.props.howMuchToAdd,
      adding: true
    }));
  }

  turnPrograms = () => {
    this.setState(() => ({
      showMore: 0
    }));

    const elementScrollTop = findPos(this.props.scrollToElement);

    if (elementScrollTop) {
      const elementTop = UserAgentData.browserName === 'Firefox' ?
          document.documentElement :
          document.body;

      setTimeout(() => {
        scrollTo(elementTop, elementScrollTop,
         600).then(() => {}, () => {});
      }, 0);
    }
  }

  toggleCheck = (event) => {
    const {program: programId, payment, percent} = event.currentTarget.dataset;
    const {nodeName} = event.target;
    const programs = clone(this.state.checkedPrograms) || [];
    const payments = clone(this.state.checkedPayments) || [];
    const percents = clone(this.state.checkedPercents) || [];
    const index = indexOf(programs, programId);
    const {mortgage} = this.props;
    const {disableAutoSelect} = mortgage;
    const mortgageInCookie = mortgageHelpers.getCookieMortgage();

    //проверим не по сслыке ли на программу или банк кликнули
    if(['A', 'IMG'].indexOf(nodeName) === -1) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();

      if (programId) {
        if (index > -1) {
          programs.splice(index, 1);
          percents.splice(index, 1);
          payments.splice(index, 1);
        } else {
          programs.push(programId);
          percents.push(percent);
          payments.push(payment);
        }
      }

      mortgage.checkedPrograms = programs;
      mortgage.checkedPercents = percents;
      mortgage.checkedPayments = payments;

      this.props.actions.updateInObjectsState(
        ['mortgage', 'checkedPrograms'], () => (programs));
      disableAutoSelect || this.props.actions.updateInObjectsState(
        ['mortgage', 'disableAutoSelect'], () => (true));

      size(mortgageInCookie) ||
        mortgageHelpers.setCookieMortgageRequest(
          mortgage,
          this.props.expireDays
        ).then(mortgageRequestId => {
          this.props.actions.updateInObjectsState(
            ['mortgage', 'mortgageRequestId'], () => (mortgageRequestId));
        });
    }
  }

  showPrograms = () => {
    mortgageHelpers.setCookieMortgageRequest(
      this.props.mortgage, this.props.expireDays
    );
  }

  getBankImage = (image) => {
    const {mediaSource} = this.props;

    return mediaSource ?
      mediaHelpers.getApiMediaUrl('240160', 'banks', image, mediaSource) :
      image;
  }

  render() {
    const {
      defaultCount, howMuchToAdd, hidePrograms, hideBanksFilter, hideBankLogo,
      linkProgram, linkBank, mode
    } = this.props;
    const {
      showMore, adding, count, programs, checkedPrograms,
      recomendedPrograms
    } = this.state;
    const recomendedCount = size(recomendedPrograms);
    const filteredPrograms = programs ? (hidePrograms ?
      programs.slice(0, defaultCount + showMore) : programs) : [];

    return (mode === 2 ?
      <MortgageTableMObject
        linkBank={linkBank}
        linkProgram={linkProgram}
        getBankImage={this.getBankImage}
        recomendedPrograms={recomendedPrograms}
        count={count}
        showPrograms={this.showPrograms}
        /> :
      mode === 1 ?
      <MortgageTableM
        linkBank={linkBank}
        linkProgram={linkProgram}
        getBankImage={this.getBankImage}
        recomendedPrograms={recomendedPrograms}
        filteredPrograms={filteredPrograms}
        count={count}
        defaultCount={defaultCount}
        showMore={showMore}
        howMuchToAdd={howMuchToAdd}
        addMorePrograms={this.addMorePrograms}
        turnPrograms={this.turnPrograms}
        hidePrograms={hidePrograms}
        recomendedCount={recomendedCount}
        hideBankLogo={hideBankLogo}
        /> :
      <MortgageTableExtended
        howMuchToAdd={howMuchToAdd}
        adding={adding}
        count={count}
        checkedPrograms={checkedPrograms}
        filteredPrograms={filteredPrograms}
        recomendedPrograms={recomendedPrograms}
        defaultCount={defaultCount}
        showMore={showMore}
        getBankImage={this.getBankImage}
        toggleCheck={this.toggleCheck}
        addMorePrograms={this.addMorePrograms}
        turnPrograms={this.turnPrograms}
        hidePrograms={hidePrograms}
        linkProgram={linkProgram}
        linkBank={linkBank}
        recomendedCount={recomendedCount}
        hideBanksFilter={hideBanksFilter}
        hideBankLogo={hideBankLogo}
        context={this.props.context}/>
    );
  }
}

export default connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state),
      objectInfo: state.objects.get('object') ?
        state.objects.get('object').toJS().info : null,
      mediaSource: state.settings.get('mediaSource'),
      cityId: state.settings.get('cityId'),
      dolshikRealtyPrograms: state.settings.get('dolshikRealtyPrograms')
    };
  },
  dispatch => {
    return {actions: bindActionCreators(
      {updateInObjectsState, mergeInObjectsState},
      dispatch
    )};
  }
)(MortgageSearchResult);
