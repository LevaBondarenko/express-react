import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import s from './BookingForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {phoneFormatter} from '../../utils/Helpers';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import FormHeader from './FormHeader';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Slider from 'react-slick';
import NextArrow from './NextArrow';
import PrevArrow from './PrevArrow';

/*global data*/

const ReviewForm = ({handleReviewSubmit, handleChange, ...state}) => {

  const settings = {
    className: s.sliderWrap,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    swipe: true,
    autoplay: false,
    swipeToSlide: true,
    arrows: true,
    draggable: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />
  };

  return (
    <div className={s.root}>
      <FormHeader />
      <Row>
        <Col xs={12}>
          <h3>Запишитесь на просмотр</h3>
          <Row className={s.orderForm}>
            <Col xs={6} xsOffset={3} style={{'minWidth': '499px'}}>
              <div className={s.orderWrap}>
                <form onSubmit={handleReviewSubmit}>
                  <Row>
                    <Slider {...settings}>
                      {state.avaliableDays.map((item, key) => {
                        const slideItem = item.split(',');
                        let className = 'slideItem';

                        if(parseInt(state.date.day) ===
                          parseInt(slideItem[1])) {
                          className = `${className} active`;
                        }
                        return (
                          <Col xs={4} key={key}
                            onClick={state.setDate}
                            data-date={JSON.stringify({
                              day: slideItem[1],
                              weekDay: slideItem[2],
                              month: slideItem[0]
                            })}>
                            <div className={className}>
                              <div className='slideHead'>
                                {slideItem[2]}
                              </div>
                              <div className='slideContent'>
                                {slideItem[1]}
                              </div>
                              <div className='slideFooter'>
                                {slideItem[0]}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Slider>
                  </Row>
                  <Row>
                    <Col xs={5} style={{'paddingRight': 0}}>
                      <FormGroup controlId='formControlsSelect'>
                        <ControlLabel>Выберите время</ControlLabel>
                        <FormControl
                          componentClass='select'
                          className={s.timeSelect}
                          onChange={handleChange}
                          data-name='hour'
                          placeholder='час'>
                            <option value=''>час</option>
                            {[...Array(24)].map((x, i) =>
                              <option key={i} value={i}>{i}</option>
                            )}
                        </FormControl>
                        <FormControl
                          componentClass='select'
                          className={s.timeSelect}
                          onChange={handleChange}
                          style={{'float': 'right'}}
                          data-name='min'
                          placeholder='мин'>
                            <option value=''>мин</option>
                            <option value='00'>00</option>
                            <option value='15'>15</option>
                            <option value='30'>30</option>
                            <option value='45'>45</option>
                        </FormControl>
                      </FormGroup>
                    </Col>
                    <Col xs={7}>
                      <FormGroup controlId='formPhone' >
                        <ControlLabel>Телефон</ControlLabel>
                        <FormControl
                          type='text'
                          value={phoneFormatter(
                            state.phone,
                            data.options.countryCode.current,
                            data.options.countryCode.avail
                          )}
                          data-name='phone'
                          placeholder='Введите номер телефона'
                          onChange={handleChange} />
                          <Feedback>
                            <span>*</span>
                          </Feedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Button type='submit'
                      className='btn btn-green-mono'>
                      Записаться на просмотр
                    </Button>
                  </FormGroup>
                </form>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

ReviewForm.propTypes = {
  handleReviewSubmit: PropTypes.func,
  handleChange: PropTypes.func,
};

export default withStyles(s)(ReviewForm);
