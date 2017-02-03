/**
 * MortgagePercent widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './MortgagePercent.scss';
import classNames from 'classnames';
import ModalWindow from '../../shared/ModalWindow/';
import MortgageParamsForm from './MortgageParamsForm';
import OrderForm from './OrderForm';
import {size, filter, orderBy, intersection, difference} from 'lodash';
import {getCookieMortgage} from '../../utils/mortgageHelpers';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
/**
 * React/Flux entities
 */
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMortgagePrograms} from '../../selectors/';
import {mergeInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';

class MortgagePercent extends Component {

  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    singleBlock: PropTypes.bool,
    dontHideOnNoPercent: PropTypes.bool,
    actions: PropTypes.object,
    mortgage: PropTypes.object
  };

  static defaultProps = {
    singleBlock: false,
    dontHideOnNoPercent: false
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      fromCalc: false,
      minPerc: 0,
      minPref: 0,
      showModal: false
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    const {singleBlock} = this.props;
    const savedData = singleBlock ? {} : getCookieMortgage();

    if(size(savedData)) {
      this.setState(() => ({
        fromCalc: true
      }));
      this.props.actions.mergeInObjectsState({mortgage: {...savedData}});
    } else {
      this.processProps(this.props);
    }
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {singleBlock, mortgage} = props;
    const {fromCalc} = this.state;
    const {
      avanse, credit, years, program_types, program_types_strict, income, stage, //eslint-disable-line camelcase
      program: {percents: percs}
    } = mortgage || {};
    const curPerc = singleBlock || fromCalc ? filter(orderBy(percs, item => {
      return item.percent - item.pref;
    }), item => {
      const byAvanse = avanse >= item.avanse_min && avanse <= item.avanse_max;
      const byCredit = credit >= item.credit_min && credit <= item.credit_max;
      const byYears = years >= item.years_min && years <= item.years_max;
      const byProgramTypes = size(program_types) > 0  ? (size(intersection(
        program_types,
        item.program_types.slice(1, -1).split(',')
      )) > 0) : true;
      const byProgramTypesStrict = size(program_types_strict) > 0 ? (
        size(difference(
          program_types_strict,
          item.program_types.slice(1, -1).split(',')
        ))
      ) === 0 : true;

      const byIncome = income ?
        item.income.slice(1, -1).split(',').indexOf(income) !== -1 : true;
      const byStage = stage ? (parseInt(stage) >= parseInt(item.stage)) : true;

      return (
        byAvanse &&
        byCredit &&
        byYears &&
        byProgramTypes &&
        byProgramTypesStrict &&
        byIncome &&
        byStage
      );
    }) : orderBy(percs, item => {
      return item.percent - item.pref;
    });

    this.setState(() => ({
      minPerc: size(curPerc) > 0 ? curPerc[0].percent : 0,
      minPref: size(curPerc) > 0 && curPerc[0].pref ?
        (curPerc[0].percent - curPerc[0].pref) : 0
    }));
  }

  toggle = () => {
    this.setState(() => ({showModal: !this.state.showModal}));
  }

  render() {
    const {singleBlock, dontHideOnNoPercent, mortgage} = this.props;
    const {fromCalc, minPerc, minPref, showModal} = this.state;
    const {program: {info: {program_title: programTitle}}} = mortgage;

    return size(mortgage) > 0 ? (
      <div className={s.root}>
        {minPerc === 0 && dontHideOnNoPercent ? (
          <div className={s.block}>
            <div className={s.oupsBlock}>
              <span>
                <span className={s.exclamation}>!</span>
              </span>
              <span className={s.oups}>ОЙ!</span>
            </div>
            <div onClick={this.toggle} className={s.detailBlock}>
              Подробно о ставке
            </div>
          </div>
        ) : null}
        {singleBlock && minPref > 0 || minPerc === 0 ? null : (
          <div className={s.block}>
            <div className={s.percBlock}>
              <span>Ставка по программе:</span>
              <span className={s.borderBlock}/>
              <span className={s.percentBlock}>{`${minPerc}%`}</span>
            </div>
            {fromCalc && !singleBlock ? (
              <div onClick={this.toggle} className={s.detailBlock}>
                Подробно о ставке
              </div>
            ) : null}
          </div>
        )}
        {minPref > 0 ? (
          <div className={s.block}>
            <div className={s.prefBlock}>
              <span>Ставка со скидкой:</span>
              <span className={s.borderBlock}/>
              <span className={s.percentBlock}>{`${minPref}%`}</span>
            </div>
            {fromCalc && !singleBlock ? (
              <div onClick={this.toggle} className={s.detailBlock}>
                Подробно о ставке
              </div>
            ) : null}
          </div>
        ) : null}
        <ModalWindow
          show={showModal}
          onHide={this.toggle}
          className={minPerc === 0 ?
            s.modalDialogOupsForm : s.modalDialogMortgageForm}>
          {minPerc === 0 ? (
            <Row>
              <Col xs={2}>
                <div className={s.modalExclamationIcon}>
                  !
                </div>
              </Col>
              <Col xs={8}>
                <div className={s.formTitle}>Ой</div>
                <div className={s.formText}>
                  Указанные в калькуляторе значения не соответствуют условиям
                  выбранной ипотечной программы
                </div>
              </Col>
            </Row>
          ) : (
            <MortgageParamsForm
              mortgageParams={mortgage}
              perc={minPerc}
              pref={minPref}
              programTitle={programTitle}/>
          )}
          {minPerc === 0 ? (
            <ButtonToolbar className={s.orderToolbar}>
              <div className='pull-right'>
                <Button
                  className={classNames(
                    'form-control',
                    'modal-button'
                  )}
                  bsStyle='success'
                  onClick={this.toggle}>
                  Ok
                </Button>
              </div>
            </ButtonToolbar>
          ) : (
            <OrderForm
              context={this.props.context}
              modalToggle={this.toggle}/>
          )}
        </ModalWindow>
      </div>
    ) : null;
  }

}

MortgagePercent = connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state)
    };
  },
  dispatch => {
    return {actions: bindActionCreators({mergeInObjectsState}, dispatch)};
  }
)(MortgagePercent);
MortgagePercent = withCondition()(MortgagePercent);

export default MortgagePercent;
