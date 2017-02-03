import {priceCleanup} from 'etagi-helpers';
import {helpPrice} from './Helpers';

export const getHelpValue = (value, instance, type = 'min') => {
  const {helpDigit, isApplyCourse, secondValue} = instance.props;
  const course = instance.state.course;
  const digitCorrection = isApplyCourse ?
    Math.floor(Math.log(course) / Math.log(10)) : 0;
  let second = secondValue;

  value = priceCleanup(value);

  if(isApplyCourse) {
    second = Math.round(priceCleanup(second ? second : '') * course);
  } else {
    second = priceCleanup(second ? second : '');
  }
  second = second ? second.toString() : '';

  return helpPrice(value, type, second, helpDigit + digitCorrection);
};
