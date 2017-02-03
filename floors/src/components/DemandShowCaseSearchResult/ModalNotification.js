import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import Modal, {Header, Body, Footer} from 'react-bootstrap/lib/Modal'; // eslint-disable-line no-unused-vars
import Button from 'react-bootstrap/lib/Button';

class ModalNotification extends Component {

  static propTypes = {
    visible: React.PropTypes.bool,
    modalConfirmTitle: React.PropTypes.string,
    modalConfirmText: React.PropTypes.string,
    action: React.PropTypes.func
  }

  static defaultProps = {
    modalConfirmTitle: 'Заявка успешно отправлена',
    modalConfirmText: 'Наш специалист свяжется с вами в течение 15 минут'
  }

  constructor(props) {
    super(props);
  }

  close = () => {
    // сбрасываем параметры при закрытии окна с подтверждением отправки
    this.props.action(['demandShowCase'], {
      _orderSent: false,
      checked: []
    });
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.modalConfirmTitle}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.props.modalConfirmText}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Закрыть</Button>
          </Modal.Footer>
        </Modal>
    );
  }
}

export default ModalNotification;
