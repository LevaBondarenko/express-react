
import React, {PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import s from './ModalFlatInfo.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const ModalFlatInfo = ({floor, section}) => {
  return (
    <div className={s.modalFlatInfo}>
      <div className={s.floor}>
        {floor}
        <p>этаж</p>
      </div>
      <div className={s.section}>
        {section} подъезд
      </div>
    </div>
  );
};

ModalFlatInfo.propTypes = {
  className: PropTypes.string,
  floor: PropTypes.number,
  section: PropTypes.number
};

export default withStyles(s)(ModalFlatInfo);
