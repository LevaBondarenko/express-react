/**
 * MortgageProgramDescription test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgageProgramDescription from './MortgageProgramDescription';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';

describe('<MortgageProgramDescription />', () => {
  let component;
  let initialData;
  let props;

  before(() => {
    /* global data*/
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      redux: {
        mortgage: {
          program: {
            info: {
              'program_title': 'some title',
              'program_text': 'some text'
            }
          },
          bank: {
            id: 1,
            name: 'bank name',
            'name_tr': 'bank name_tr',
            image: 'src'
          }
        }
      },
      options: {
        mediaSource: 2
      }
    };

    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = mount(<MortgageProgramDescription {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
