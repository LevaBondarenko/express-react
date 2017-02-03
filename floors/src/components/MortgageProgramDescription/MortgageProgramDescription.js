/**
 * MortgageProgramDescription widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import GeminiScrollbar from 'react-gemini-scrollbar';

import ContextType from '../../utils/contextType';
import s from './MortgageProgramDescription.scss';
import mediaHelpers from '../../utils/mediaHelpers';
import CompactDropdown from '../../shared/CompactDropdown';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {getMortgagePrograms} from '../../selectors/';

class MortgageProgramDescription extends Component {

  static propTypes = {
    linkBank: PropTypes.string,
    context: React.PropTypes.shape(ContextType).isRequired,
    mortgage: PropTypes.object,
    noticeError: PropTypes.string,
    isMobile: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    title: PropTypes.string
  };

  static defaultProps = {
    title: 'Описание программы',
    linkBank: 'oldPage'
  }

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

  getBankImage = (image) => {
    /*global data*/
    return data.options.mediaSource ?
      mediaHelpers.getApiMediaUrl(
        '240160',
        'banks',
        image,
        data.options.mediaSource) : image;
  }

  get bankLink() {
    const {bank} = this.props.mortgage;

    return this.props.linkBank === 'oldPage' ?
      `/ipoteka_banks/${bank.id}.html` :
      `/ipoteka/${bank.name_tr}/`;
  }

  render() {
    const {mortgage, noticeError} = this.props;
    const {bank, minPercent, minPercent2, program} = mortgage;

    return this.props.isMobile ? (<div className={s.root}>
        <div className={s.programTitleM}>
          {program.info.program_title}
        </div>
        <div className={s.percentsWrapper}>
          {minPercent2 ? (<div>
            <div>Ставка банка:</div>
            <div>{minPercent2}%</div>
          </div>) : (
            <div className={s.noticeError}>{noticeError}</div>
          )}
          {minPercent2 !== minPercent ?
            (<div>
              <div>Ставка с Этажами:</div>
              <div className={s.companyPercent}>{minPercent}%</div>
            </div>) : null}
        </div>
        <CompactDropdown
          collapsed={this.props.isCollapsed}
          context={this.props.context}
          title={this.props.title}
          titleClassName={s.titleItemContainer}>
          <div className={s.descriptionTextM}>
            {program.info.program_text}
          </div>
        </CompactDropdown>
      </div>
    ) : (
      <div className={s.root}>
        <div className={s.bankLogo}>
          <a href={this.bankLink}>
            <img
              src={this.getBankImage(bank.image)}
              title={bank.name} />
          </a>
        </div>

        <div className={s.programTitle}>
          {program.info.program_title}
        </div>

        <div className={s.descriptionContainer}>
          <div className={s.descriptionTitle}>
            {this.props.title}
          </div>
          <GeminiScrollbar className={s.textScroll}>
            <div className={s.descriptionText}>
              {program.info.program_text}
            </div>
          </GeminiScrollbar>
        </div>

      </div>
    );
  }

}

export default connect(
  state => {
    const mortgage = getMortgagePrograms(state);

    return {
      mortgage: mortgage
    };
  }
)(MortgageProgramDescription);
