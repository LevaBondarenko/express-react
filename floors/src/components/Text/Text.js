/**
 * Created by tatarchuk on 30.04.15.
 */
/*global data*/
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import classNames from 'classnames';
import wss from '../../stores/WidgetsStateStore';

class Text extends Component {
  static propTypes = {
    text: PropTypes.node.isRequired,
    wssSettings: PropTypes.string,
    wssSettingsValue: PropTypes.string
  };

  static defaultProps = {
    wssSettings: '',
    wssSettingsValue: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      store: wss,
      show: props.wssSettings ? false : true
    };
  }

  componentWillMount() {
    this.state.store.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
    const money = ' руб';


    document.getElementById('phoneRentOnlineData') ?
        document.getElementById('phoneRentOnlineData')
            .innerHTML = data.options.rentOnline.workPhone : null;
    document.getElementById('priceRentOnlineData') ?
        document.getElementById('priceRentOnlineData')
            .innerHTML = data.options
                .rentOnline.comission + money : null;
  }

  componentWillUnmount() {
    this.state.store.offChange(this.onChange);
  }

  onChange = () => {
    const {wssSettings, wssSettingsValue} = this.props;
    const curValue = wssSettings ? this.state.store.get()[wssSettings] : '';

    this.setState(() => ({
      show: curValue ===  wssSettingsValue
    }));
  }

  render() {
    const {text, wssSettings} = this.props;
    const showBlock = classNames({
      hide: !this.state.show
    });

    return wssSettings && this.state.show || !wssSettings ?
      (<div className={showBlock}
                 dangerouslySetInnerHTML={{__html: (text ? text : '')}} />) :
      null;
  }
}

export default Text;
