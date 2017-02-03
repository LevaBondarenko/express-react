import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Modal, {Body} from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import s from './NewhousesModalWindow.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ModalFlatInfo from './ModalFlatInfo';
import ModalFlatMain from './ModalFlatMain';
import ModalFlatMedia from './ModalFlatMedia';
import BookingForm from './BookingForm';
import ReviewForm from './ReviewForm';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Tab, {Container, Content, Pane} from 'react-bootstrap/lib/Tab'; //eslint-disable-line no-unused-vars
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Rieltor2 from '../Rieltor2/';


const NewhousesModalWindow = ({toggleModal, flat, toggleLayout,
  toggleLayoutSprite, trackInfo, trackZapis, trackKv, ...props}) => {
  const {
    floor,
    section,
    layout2d,
    layout3d,
    layout_floor: layoutFloor,
    layout_sprite: sprite
  } = flat;

  return (
    <Modal className={s.modal} show={props.showModal} onHide={toggleModal}>
      <Body>
        <Button onClick={toggleModal}
                bsSize='large'
                className={s.closeButton}>
          <span aria-hidden="true">&times;</span>
        </Button>
        <Container id="left-tabs" defaultActiveKey={props.activeKey}>
          <Row>
            <Col xs={2} style={{width: '20%', background: '#e9e9e9'}}>
              <ModalFlatInfo
                floor={parseInt(floor)}
                section={parseInt(section)} />
              <Nav stacked>
                <NavItem eventKey="info" onClick={trackInfo}>
                  <i className={`${s.icon} ${s.info}`} />
                  Информация<br/>о квартире
                </NavItem>
                <NavItem eventKey="review" onClick={trackZapis}>
                  <hr className={s.navItemHr} />
                  <i className={`${s.icon} ${s.review}`} />
                  Записаться на<br/>просмотр
                </NavItem>
                <NavItem eventKey="book" onClick={trackKv}>
                  <hr className={s.navItemHr} />
                  <i className={`${s.icon} ${s.book}`} />
                  Забронировать<br/> квартиру
                  <hr className={s.navItemHrBottom} />
                </NavItem>
              </Nav>
              <div className="modalWindowRieltor" style={{margin: '0 -1.5rem'}}>
                <Rieltor2 position='jk'
                          btnName={props.btnName}
                          rieltorId={props.rieltorId}
                          fio={props.fio}
                          agentPhoto={props.agentPhoto}
                          agentPhone={props.agentPhone}
                          orderType={props.orderType}
                          wssSettings='rieltorZ'
                          description1={props.description1}
                          description2={props.description2}
                          description3={props.description3}
                          googleEvent={'pageview'}
                          placeholder={props.placeholder}/>

              </div>
            </Col>
            <Col xs={10} style={{width: '80%'}}>
              <ModalFlatMain flat={flat}/>
              <Content animation>
                <Pane eventKey="info">
                  <ModalFlatMedia
                    layout={props.layout}
                    toggleLayout={toggleLayout}
                    toggleLayoutSprite={toggleLayoutSprite}
                    layout2d={layout2d}
                    layoutFloor={layoutFloor}
                    layout3d={layout3d}
                    sprite={sprite}
                    avaliable3d={props.avaliable3d}
                    spriteStyles={props.spriteStyles}
                    favBtn={props.favBtn}
                    objectId={flat.id}
                    hash={props.hash}
                    compareBtn={props.compareBtn}/>
                </Pane>
                <Pane eventKey="review">
                  <ReviewForm
                    handleReviewSubmit={props.handleReviewSubmit}
                    handleChange={props.handleChange}
                    name={props.name}
                    phone={props.phone}
                    setDate={props.setDate}
                    date={props.date}
                    avaliableDays={props.avaliableDays} />
                </Pane>
                <Pane eventKey="book">
                  <BookingForm
                    flat={flat}
                    handleBookingSubmit={props.handleBookingSubmit}
                    handleChange={props.handleChange}
                    name={props.name}
                    phone={props.phone} />
                </Pane>
              </Content>
            </Col>
          </Row>
        </Container>
      </Body>
    </Modal>
  );
};

NewhousesModalWindow.propTypes = {
  props: PropTypes.object,
  toggleModal: PropTypes.func,
  flat: PropTypes.object,
  toggleLayout: PropTypes.func,
  toggleLayoutSprite: PropTypes.func,
  handleChange: PropTypes.func,
  name: PropTypes.string,
  phone: PropTypes.string,
  showModal: PropTypes.bool,
  activeKey: PropTypes.string,
  btnName: PropTypes.string,
  rieltorId: PropTypes.string,
  fio: PropTypes.string,
  agentPhoto: PropTypes.string,
  agentPhone: PropTypes.string,
  orderType: PropTypes.string,
  description1: PropTypes.string,
  description2: PropTypes.string,
  description3: PropTypes.string,
  placeholder: PropTypes.string,
  layout: PropTypes.string,
  avaliable3d: PropTypes.string,
  spriteStyles: PropTypes.object,
  favBtn: PropTypes.func,
  compareBtn: PropTypes.func,
  handleReviewSubmit: PropTypes.func,
  setDate: PropTypes.func,
  date: PropTypes.object,
  avaliableDays: PropTypes.array,
  handleBookingSubmit: PropTypes.func,
  hash: PropTypes.string,
  trackZapis: PropTypes.func,
  trackInfo: PropTypes.func,
  trackKv: PropTypes.func,
  googleEvent: PropTypes.func
};

export default withStyles(s)(NewhousesModalWindow);
