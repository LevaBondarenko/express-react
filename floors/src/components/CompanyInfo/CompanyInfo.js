/**
  * CompanyInfo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
import {connect} from 'react-redux';
import Helpers from '../../utils/Helpers';

class CompanyInfo extends Component {

  static propTypes = {
    city: React.PropTypes.string,
    address: React.PropTypes.string,
    phone: React.PropTypes.string,
    fax: React.PropTypes.string,
    copyright: React.PropTypes.string,
    className: React.PropTypes.string,
    selectedCity: React.PropTypes.object
  };

  static defaultProps = {
    copyright: '',
    city: '',
    address: '',
    phone: '',
    fax: ''
  };

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (typeof callibriInit === 'function') {
      callibriInit(); // eslint-disable-line no-undef
    }
  }

  render() {
    let phone, fax;

    const city = (this.props.city.charAt(0) === '.') &&
      size(this.props.selectedCity) ?
      this.props.selectedCity[this.props.city.substring(1)] :
      this.props.city;

    const address = (this.props.address.charAt(0) === '.') &&
      size(this.props.selectedCity)  ?
      this.props.selectedCity[this.props.address.substring(1)] :
      this.props.address;

    phone = (this.props.phone.charAt(0) === '.') &&
      size(this.props.selectedCity)  ?
      this.props.selectedCity[this.props.phone.substring(1)] :
      this.props.phone;
    phone = phone ? `тел. ${phone}` : '';

    fax = (this.props.fax.charAt(0) === '.') &&
      size(this.props.selectedCity)  ?
      this.props.selectedCity[this.props.fax.substring(1)] :
      this.props.fax;
    fax = fax ? `факс. ${fax}` : '';

    return (
      <div>
        <span className="footer--link__main">&nbsp;</span>
        <p className="footer--copyright footer--copyright__padding">
          ©{this.props.copyright}
        </p>
        <p className="footer--copyright">
          Все права защищены.
          При использовании материалов гиперссылка обязательна.
        </p>
        <p className="footer--adress">
          {city}{city ? <br/> : ''}
          {address}{address ? <br/> : ''}
          <a className={this.props.className || ''}
            href={`tel:${Helpers.phoneCleanup(phone)}`}>
          {phone}</a>{phone ? <br/> : ''}
          {fax}
        </p>
      </div>
    );
  }
}

export default connect(state => {
  return {
    selectedCity: state.settings.get('selectedCity') ?
      state.settings.get('selectedCity').toJS() : {},
  };
})(CompanyInfo);
