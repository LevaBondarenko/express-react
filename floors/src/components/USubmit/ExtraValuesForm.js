import React, {PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import {map, size} from 'lodash';
import {phoneFormatter} from '../../utils/Helpers';
import s from './ExtraValuesForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/* global data */

const ExtraValuesForm = (props) => {
  const {handleChange, reqValues, title} = props;
  const titleArr = title ? title.split('->') : null;
  let fields = map(reqValues, (item, key) => {
    const value = key !== 'phone' ? item.value :
      phoneFormatter(
        item.value,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );

    return (
      <FormGroup
        key={key}
        className={s.formGroup}
        controlId={key}>
        <ControlLabel className={s.label}>
          {item.icon ? (
            <i className={`fa fa-${item.icon}`} aria-hidden='true' />
          ) : null}
        </ControlLabel>
        <FormControl type='text'
          className={item.icon ? s.withIcon : null}
          data-field={key}
          value={value}
          onChange={handleChange}
          placeholder={item.title} />
        <HelpBlock />
      </FormGroup>
    );
  });

  fields = size(fields) > 0 ?
    createFragment({fields: fields}) :
    createFragment({fields: <div/>});

  return (
    <Row>
      <Col xs={2}>
        {titleArr[1] ? (
          <div className={s.modalIcon}>
            <i className={`fa fa-${titleArr[1]}`} aria-hidden='true' />
          </div>
        ) : null}
      </Col>
      <Col xs={8} className={s.formWrap}>
        {titleArr ? (
          <h3>{titleArr[0]}</h3>
        ) : null}
        {fields}
      </Col>
    </Row>
  );
};

ExtraValuesForm.propTypes = {
  handleChange: PropTypes.func,
  reqValues: PropTypes.object,
  title: PropTypes.string,
};

export default withStyles(s)(ExtraValuesForm);
