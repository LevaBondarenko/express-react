/**
 * processRealtorsData selector
 *
 * @ver 0.0.1
 *
 */
import {createSelector} from 'reselect';
import {phoneFormatter} from '../../utils/Helpers';
import {getFilename} from '../../utils/mediaHelpers';

const getCountryCode = state => state.settings.get('countryCode').toJS();
const getRealtorsList = state => state.objects.get('realtorsList') ?
  state.objects.get('realtorsList').toJS() : {};

const getProcessedRealtorsData = createSelector(
  [getCountryCode, getRealtorsList],
  (countryCode, realtorsList) => {
    const {filter, settings, ...rest} = realtorsList; // eslint-disable-line no-unused-vars
    const pureList = Object.assign({}, rest);
    const processedRealtorsList =
      Object.keys(pureList).reduce((result, key) => {
        const val = realtorsList[key];
        const {
          f: familyName,
          fMaiden,
          i: name,
          id,
          o: patronymic,
          phone,
          photo
        } = val;
        const phoneString = phoneFormatter(
          phone,
          countryCode.current,
          countryCode.avail
        );
        const lastName = !fMaiden ?
          familyName :
          `${familyName} ${fMaiden}`;
        const nameString = `${name} ${patronymic}`;
        let filtered = false;

        if (filter) {
          const familyNameCheck = familyName.substr(0, filter.length)
           .toLowerCase() === filter.toLowerCase() ?
            true :
            false;
          const fMaidenCheck = fMaiden && fMaiden.substr(1, filter.length)
           .toLowerCase() === filter.toLowerCase() ?
            true :
            false;
          const nameCheck = name.substr(0, filter.length).toLowerCase() ===
           filter.toLowerCase() ?
            true :
            false;
          const idCheck = id.substr(0, filter.length).toLowerCase() ===
           filter.toLowerCase() ?
            true :
            false;
          const phoneCheck = phone.substr(0, filter.length).toLowerCase() === // 89821122333
           filter.toLowerCase() || phone.substr(1, filter.length)
           .toLowerCase() === filter.toLowerCase() || phoneString // 9821122333
           .substr(0, filter.length).toLowerCase() === filter.toLowerCase() ? // +7 (982) 112-23-33
            true :
            false;
          const fullNameCheck = `${lastName} ${nameString}`
           .substr(0, filter.length).toLowerCase() === filter.toLowerCase() ||  // lastName (maidenName) name patronymic
           `${familyName} ${nameString}`.substr(0, filter.length)
           .toLowerCase() === filter.toLowerCase() || (fMaiden && // lastName name patronymic
           `${fMaiden.substr(1, fMaiden.length - 2)} ${nameString}`
           .substr(0, filter.length).toLowerCase() === filter.toLowerCase()) || // maidenName name patronymic
           nameString.substr(0, filter.length).toLowerCase() ===
           filter.toLowerCase() ? // name patronymic
            true :
            false;

          filtered = familyNameCheck || fMaidenCheck || nameCheck || idCheck ||
           phoneCheck || fullNameCheck ?
            true :
            false;
        }

        if (filtered || !filter) {
          const photoString = photo ?
            `//cdn-media.etagi.com/100100/photos/${getFilename(photo)}` :
            null;

          const userData = {
            lastName: lastName,
            nameString: nameString,
            phone: phone,
            phoneString: phoneString,
            photo: photoString
          };

          result.push(userData);
        }

        return result;
      }, []);

    return processedRealtorsList;
  }
);

export default getProcessedRealtorsData;
