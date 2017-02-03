/**
 * Gallery Uploader File component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {size, chain} from 'lodash';
import {rulesUploaderForm} from './validationRules';
import HelpIcon from '../../shared/HelpIcon';
import UInput from '../UInput';
import USelect from '../USelect';
import UCheckBox from '../UCheckBox';
import UValidator from '../UValidator';

import s from './GalleryUploaderForm.scss';

/*global data*/

const GalleryUploaderForm = ({
  context, objectName, rulesLink, takeCities, skipCities
}) => {
  const citiesCollection = chain(data.collections.cities)
    .filter(item => {
      const byTakeCities = size(takeCities) ?
        (takeCities.indexOf(item.id.toString()) !== -1) : true;
      const bySkipCities = size(skipCities) ?
        (skipCities.indexOf(item.id.toString()) === -1) : true;

      return (
        byTakeCities && bySkipCities && item.country_name && item.country_name
      );
    })
    .sortBy('name')
    .map(item => {
      const cityNameArr = item.name.split(',');
      const itemName = `${cityNameArr[0]}, ${item.country_name}`;

      return {value: item.id.toString(), title: itemName};
    })
    .value();
  const confirmTitle = size(rulesLink) ? (
    <span>
      Мне более 18 лет и я согласен(а) с&nbsp;
      <span dangerouslySetInnerHTML={{__html: rulesLink}}/>
    </span>
  ) : (
    <span>
      Мне более 18 лет
    </span>
  );

  return (
    <div className={s.root}>
      <div className={s.title}>
        Напишите нам о себе
        <HelpIcon
          id={`${objectName}-help`}
          closeButton={true}
          className='help-border-circle help-text-left'
          placement='top'
          helpText={(
            <span>
              Эта информация нужна нам для того, чтобы<br />
              мы могли связаться с вами
            </span>
          )}/>
      </div>
      <div className={s.form} id={`${objectName}-form`}>
        <UInput
          mountNode={`${objectName}-form`}
          context={context}
          objectName={objectName}
          fieldName='i'
          className={classNames(s.input, s.required)}
          placeholder='Имя'
          refreshOn='change'
          maxLength={32}/>
        <USelect
          mountNode={`${objectName}-form`}
          context={context}
          objectName={objectName}
          fieldName='city'
          className={classNames(s.select, s.required)}
          placeholder='Город'
          values={citiesCollection}/>
        <UInput
          mountNode={`${objectName}-form`}
          context={context}
          objectName={objectName}
          fieldName='phone'
          isPhone={true}
          className={classNames(s.input, s.required)}
          placeholder='Телефон'
          refreshOn='change'/>
        <UInput
          mountNode={`${objectName}-form`}
          context={context}
          objectName={objectName}
          fieldName='email'
          className={classNames(s.input, s.required)}
          placeholder='Email'
          refreshOn='change'
          maxLength={32}/>
        <UCheckBox
          mountNode={`${objectName}-form`}
          context={context}
          objectName={objectName}
          fieldName='confirm'
          className={s.checkBox}
          onValue='1'
          defaultValue='1'
          label={confirmTitle}
          isRadio={false}/>
        <UValidator
          context={context}
          objectName={objectName}
          validateOnChange={false}
          blockHeight={-1}
          displayErrors='disabled'
          dumpToConsole={false}
          rules={rulesUploaderForm}/>
      </div>
    </div>
  );
};

GalleryUploaderForm.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func
  }),
  objectName: PropTypes.string,
  takeCities: PropTypes.array,
  skipCities: PropTypes.array,
  rulesLink: PropTypes.string
};

export default withStyles(s)(GalleryUploaderForm);
