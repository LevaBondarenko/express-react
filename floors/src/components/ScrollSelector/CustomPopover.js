import ScrollerTarget from './ScrollerTarget';
import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars

const CustomPopover = (props) => (
  <div className='lkscroller-overlay'>
    {props.fields.map((target, key) => {
      return (<ScrollerTarget
        target={target}
        setTarget={props.setTarget}
        scrollTo={props.scrollTo}
        key={`target_${key}`}
      />);
    })}
  </div>
);

CustomPopover.propTypes = {
  fields: PropTypes.array,
  setTarget: PropTypes.func,
  scrollTo: PropTypes.func
};

export default CustomPopover;
