import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Image from '../../shared/Image';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import s from './ModalFlatMedia.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {size} from 'lodash';
import Sprite from './Sprite';
import FilterQuarterStore from '../../stores/FilterQuarterStore';
import MiniSprite from './MiniSprite';

const ModalFlatMedia = ({layout, toggleLayout,
  toggleLayoutSprite, ...layouts}) => {
  const {
    layout2d,
    layoutFloor,
    layout3d,
    sprite,
    spriteStyles,
    favBtn,
    compareBtn,
    avaliable3d,
    objectId,
    hash
  } = layouts;
  const image = layout === 'layout2d' ? layout2d : layoutFloor;
  const src = `${window.location.protocol}//model.etagi.com/Viewer/index?obj_id=${objectId}&proj_id=${layout3d}&mode=3d&hash=${hash}&format=1`; //eslint-disable-line max-len

  return (
    <Row className={s.modalFlatMedia}>
      <Col xs={12}>
        <Row>
          <Col xs={8} xsOffset={2}>
            {layout2d || layoutFloor ? (
              <ButtonToolbar>
                <ButtonGroup>
                  {layout2d ? (
                    <Button
                      active={layout === 'layout2d' ? true : false}
                      className={s.toggleLayout}
                      onClick={toggleLayout}
                      data-target='layout2d'>
                      Планировка квартиры
                    </Button>
                  ) : false}
                  {layout3d && avaliable3d === '1' ? (
                    <Button
                      active={layout === 'layout3d' ? true : false}
                      className={s.toggleLayout}
                      onClick={toggleLayout}
                      data-target='layout3d'>
                      3D планировка
                    </Button>
                  ) : false}
                  {layoutFloor ? (
                    <Button
                      active={layout === 'layoutFloor' ? true : false}
                      className={s.toggleLayout}
                      onClick={toggleLayout}
                      data-target='layoutFloor'>
                      План этажа
                    </Button>
                  ) : false}
                </ButtonGroup>
              </ButtonToolbar>
            ) : false}
          </Col>
        </Row>
      </Col>
      <Col xs={12}>
        <Row>
          <Col xs={8} xsOffset={2}>
            {size(sprite.percent) > 0 && layout === 'layoutFloor' ? (
              <Sprite image={layoutFloor}
                      coords={sprite.percent}
                      flat={FilterQuarterStore.myFlat}
                      toggleLayout={toggleLayoutSprite}
                      showHint={true}
                      styles={spriteStyles}
                      house={FilterQuarterStore.myHouse}
                      blockId='bigSprite'
                      trackFloor={true}/>
            ) : layout === 'layout3d' ? (
              <div
                style={{
                  background: 'none',
                  height: '480px',
                  width: '665px'
                }}>
                <iframe
                  id='frm'
                  width='100%'
                  height='100%'
                  style={{
                    borderWidth: '0'
                  }}
                  src={src}/>
              </div>
            ) : (
              <Image image={image} className='img-responsive center-block' />
            )}
          </Col>
        </Row>
      </Col>
      <Col xs={12}>
        {size(sprite.percent) > 0 && layout === 'layout2d' ? (
          <MiniSprite
            image={layoutFloor}
            coords={sprite.percent}
            flat={FilterQuarterStore.myFlat}
            toggleLayout={toggleLayoutSprite}
            styles={spriteStyles}
            house={FilterQuarterStore.myHouse}
            blockId='miniSprite'
            height={80}
          />
        ) : null}
        <Row>
          <Col xs={4} xsOffset={3} className={`${s.buttonsWrap} clearfix`}>
            {favBtn(true)}
            {compareBtn(true)}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

ModalFlatMedia. propTypes = {
  className: PropTypes.string,
  toggleLayout: PropTypes.func,
  toggleLayoutSprite: PropTypes.func,
  layout: PropTypes.string,
  layouts: PropTypes.object,
};

export default withStyles(s)(ModalFlatMedia);
