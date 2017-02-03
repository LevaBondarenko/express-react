/**
 * MortgageBanksFilter widget class
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */
/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import {
  intersectionWith, differenceWith, uniqBy, indexOf, map, size, values, clone
} from 'lodash';
import mediaHelpers from '../../utils/mediaHelpers';
/**
 * styles
 */
import s from './MortgageBanksFilter.scss';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMortgagePrograms} from '../../selectors/';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';
import ContextType from '../../utils/contextType';
/**
 * components
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import MortgageActiveBanks from './MortgageActiveBanks';
import MortgageDisabledBanks from './MortgageDisabledBanks';
import FooterControls from './FooterControls';
import GeminiScrollbar from 'react-gemini-scrollbar';

const ModalHeader = Modal.Header;
const ModalBody = Modal.Body;
const ModalFooter = Modal.Footer;

class MortgageBanksFilter extends Component {

  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    linkBank: PropTypes.string,
    actions: PropTypes.object,
    mortgage: PropTypes.object
  };

  static defaultProps = {
    linkBank: 'oldPage'
  }

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      showDisabled: false,
      checkedBanks: [],
      tempCheckedBanks: [],
      activeBanks: [],
      disabledBanks: []
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    const {mortgage} = nextProps;

    if (mortgage) {
      const {programs, banks, banksFilter} = mortgage;
      const uniqProgramsBanks = uniqBy(
        values(programs), program => program.bank_id
      );
      const activeBanks = intersectionWith(banks, uniqProgramsBanks,
        (a, b) => {
          return a.id === b.bank_id;
        });
      const disabledBanks = differenceWith(banks, uniqProgramsBanks,
        (a, b) => {
          return a.id === b.bank_id;
        });
      const allActiveBanks = map(activeBanks, bank => bank.id);
      const checkedBanks = size(banksFilter) ? banksFilter : allActiveBanks;

      this.setState({
        collections: mortgage.banks,
        activeBanks: activeBanks,
        disabledBanks: disabledBanks,
        checkedBanks: checkedBanks,
        tempCheckedBanks: checkedBanks
      });
    }
  }

  toggleFilter = () => {
    const {isOpen, checkedBanks} = this.state;

    this.setState(() => ({
      tempCheckedBanks: clone(checkedBanks),
      isOpen: !isOpen,
      showDisabled: false
    }));
  }

  applyFilter = () => {
    const {isOpen, tempCheckedBanks} = this.state;

    this.setState(() => ({
      isOpen: !isOpen
    }));

    this.props.actions.updateInObjectsState(
      ['mortgage', 'banksFilter'], () => (tempCheckedBanks));
  }

  toggleBank = (event) => {
    const {tempCheckedBanks} = this.state;
    const bankId = event.target.dataset.bank;
    const banks = tempCheckedBanks;
    const index = indexOf(banks, bankId);

    if (index >= 0) {
      banks.splice(index, 1);
    } else {
      banks.push(bankId);
    }

    this.setState(() => ({
      tempCheckedBanks: banks
    }));
  }

  checkAllBanks = () => {
    const activeBanks = this.state.activeBanks;

    this.setState(() => ({
      tempCheckedBanks: map(activeBanks, bank => bank.id)
    }));
  }

  clearCheckedBanks = () => {
    this.setState(() => ({
      tempCheckedBanks: []
    }));
  }

  showDisabledBanks = () => {
    this.setState(() => ({
      showDisabled: !this.state.showDisabled
    }));
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

  render() {
    const {activeBanks, disabledBanks, tempCheckedBanks, isOpen, showDisabled} =
      this.state;

    return (
      <div>
        <Button
          ref='showFilterButton'
          className={s.showFilterButton}
          bsStyle='default'
          onClick={this.toggleFilter}>
            <i className='fa fa-eye-slash'></i>
            <span>Скрыть лишнее</span>
        </Button>
        <Modal
          show={isOpen}
          onHide={this.toggleFilter}
          className={s.modal}>
          <ModalHeader closeButton className={s.modalHeader}>
            Выберите банки, чьи программы Вам интересны.
            Неотмеченные банки будут скрыты в списке программ.
          </ModalHeader>
          <ModalBody>
            <div className={s.banksWrapper}>
              <GeminiScrollbar>
                <MortgageActiveBanks
                  activeBanks={activeBanks}
                  checkedBanks={tempCheckedBanks}
                  getBankImage={this.getBankImage}
                  toggleCheck={this.toggleBank}
                  showDisabledBanks={this.showDisabledBanks}
                  showDisabled={showDisabled} />
                {showDisabled &&
                  <MortgageDisabledBanks
                    disabledBanks={disabledBanks}
                    getBankImage={this.getBankImage}
                    linkBank={this.props.linkBank} />}
              </GeminiScrollbar>
            </div>
          </ModalBody>
          <ModalFooter>
            <FooterControls
              checkAllBanks={this.checkAllBanks}
              clearCheckedBanks={this.clearCheckedBanks}
              applyFilter={this.applyFilter} />
          </ModalFooter>
        </Modal>
      </div>
    );
  }

}

export default connect(
  state => {
    return {
      mortgage: getMortgagePrograms(state)
    };
  },
  dispatch => {
    return {actions: bindActionCreators({updateInObjectsState}, dispatch)};
  }
)(MortgageBanksFilter) ;
