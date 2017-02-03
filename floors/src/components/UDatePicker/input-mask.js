//Этой библиотеки нет в npm, поэтому будет тут, я её даже мигрировал на ES 6 и табуляцию кликами убирал
//gods forgives me
export const InputMaskDefaultMask = () => ({
  Date: '99/99/9999',
  DateTime: '99/99/9999 99:99:99',
  DateTimeShort: '99/99/9999 99:99',
  Time: '99:99:99',
  TimeShort: '99:99',
  Ssn: '999-99-9999',
  Phone: '(999) 999-9999'
});

export const InputMaskDataType = () => ({
  Date: 1,
  DateTime: 2,
  DateTimeShort: 3,
  Time: 4,
  TimeShort: 5
});

export const InputMask = () => {
  'use strict';

  const formatCharacters = ['-', '_', '(', ')', '[', ']', ':', '.', ',', '$',
    '%', '@', ' ', '/'];

  const maskCharacters = ['A', '9', '*'];

  let originalValue = '';

  let mask = null;

  let hasMask = false;

  let forceUpper = false;

  let forceLower = false;

  let useEnterKey = false;

  let validateDataType = false;

  let dataType = null;

  const keys = {
    asterisk: 42,
    zero: 48,
    nine: 57,
    a: 65,
    z: 90,
    backSpace: 8,
    tab: 9,
    delete: 46,
    left: 37,
    right: 39,
    end: 35,
    home: 36,
    numberPadZero: 96,
    numberPadNine: 105,
    shift: 16,
    enter: 13,
    control: 17,
    escape: 27,
    v: 86,
    c: 67,
    x: 88
  };

  const between = function(x, a, b) {
    return x && a && b && x >= a && x <= b;
  };

  const parseDate = function(value) {
    const now = new Date();

    let date = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    ));

    if (value) {
      if (between(dataType, 1, 3)) {
        const tempDate = new Date(value);

        if (!isNaN(tempDate.getTime())) {
          date = new Date(Date.UTC(
            tempDate.getFullYear(),
            tempDate.getMonth(),
            tempDate.getDate(),
            tempDate.getHours(),
            tempDate.getMinutes(),
            tempDate.getSeconds()
          ));
        }
      } else {
        const timeSegments = value.split(':');

        const utcHours = timeSegments.length > 0 ? timeSegments[0] : 0;
        const utcMinutes = timeSegments.length > 1 ? timeSegments[1] : 0;
        const utcSeconds = timeSegments.length > 2 ? timeSegments[2] : 0;

        date.setUTCHours(utcHours, utcMinutes, utcSeconds);
      }
    }

    return date;
  };

  const getFormattedDateTime = function(value) {
    const date = parseDate(value);

    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` :
     date.getUTCDate();
    const month = (date.getUTCMonth() + 1) < 10 ? `0${date.getUTCMonth() +
     1}` : (date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` :
     date.getUTCHours();
    const minutes = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` :
     date.getUTCMinutes();
    const seconds = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` :
     date.getUTCSeconds();

    switch (dataType) {
    case 1:
      return `${month}/${day}/${year}`;
    case 2:
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    case 3:
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    case 4:
      return `${hours}:${minutes}:${seconds}`;
    case 5:
      return `${hours}:${minutes}`;
    default:
      return '';
    }
  };

  const getCursorPosition = function(element) {
    let position = 0;

    if (document.selection) {
      element.focus();

      const selectRange = document.selection.createRange();

      selectRange.moveStart('character', -element.value.length);

      position = selectRange.text.length;
    } else if (element.selectionStart || element.selectionStart === '0') {
      position = element.selectionStart;
    }

    return position;
  };

  const isValidCharacter = function(keyCode, maskCharacter) {
    const maskCharacterCode = maskCharacter.charCodeAt(0);

    if (maskCharacterCode === keys.asterisk) {
      return true;
    }

    const isNumber = (keyCode >= keys.zero && keyCode <= keys.nine) ||
    (keyCode >= keys.numberPadZero && keyCode <= keys.numberPadNine);

    if (maskCharacterCode === keys.nine && isNumber) {
      return true;
    }

    if (maskCharacterCode === keys.a &&
       keyCode >= keys.a && keyCode <= keys.z) {
      return true;
    }

    return false;
  };

  const setCursorPosition = function(element, index) {
    if (element != null) {
      if (element.createTextRange) {
        const range = element.createTextRange();

        range.move('character', index);

        range.select();
      } else {
        if (element.selectionStart) {
          element.focus();

          element.setSelectionRange(index, index);
        } else {
          element.focus();
        }
      }
    }
  };

  const removeCharacterAtIndex = function(element, index) {
    if (element.value.length > 0) {
      const newElementValue = element.value.slice(0, index) +
       element.value.slice(index + 1);

      element.value = newElementValue;

      if (element.value.length > 0) {
        setCursorPosition(element, index);
      } else {
        element.focus();
      }
    }
  };

  const insertCharacterAtIndex = function(element, index, character) {
    const newElementValue = element.value.slice(0, index) + character +
     element.value.slice(index);

    element.value = newElementValue;

    if (element.value.length > 0) {
      setCursorPosition(element, index + 1);
    } else {
      element.focus();
    }
  };

  const checkAndInsertMaskCharacters = function(element, index) {
    while (true) {
      const isMaskCharacter = formatCharacters.indexOf(mask[index]) > -1;

      const maskAlreadyThere = element.value.charAt(index) === mask[index];

      if (isMaskCharacter && !maskAlreadyThere) {
        insertCharacterAtIndex(element, index, mask[index]);
      } else {
        return;
      }

      index += 1;
    }
  };

  const checkAndRemoveMaskCharacters = function(element, index, keyCode) {
    if (element.value.length > 0) {
      while (true) {
        const character = element.value.charAt(index);

        const isMaskCharacter = formatCharacters.indexOf(character) > -1;

        if (!isMaskCharacter || index === 0 || index === element.value.length) {
          return;
        }

        removeCharacterAtIndex(element, index);

        if (keyCode === keys.backSpace) {
          index -= 1;
        }

        if (keyCode === keys.delete) {
          index += 1;
        }
      }
    }
  };

  const validateDataEqualsDataType = function(element) {
    if (element == null || element.value === '') {
      return;
    }

    const date = parseDate(element.value);

    if (between(dataType, 1, 3)) {
      if (isNaN(date.getDate()) || date.getFullYear() <= 1000) {
        element.value = '';

        return;
      }
    }

    if (dataType > 1) {
      if (isNaN(date.getTime())) {
        element.value = '';

        return;
      }
    }
  };

  const onLostFocus = function(element) {
    if (element.value.length > 0) {
      if (element.value.length !== mask.length) {
        element.value = '';

        return;
      }

      for (let i = 0; i < element.value; i++) {
        const elementCharacter = element.value.charAt(i);
        const maskCharacter = mask[i];

        if (maskCharacters.indexOf(maskCharacter) > -1) {
          if (elementCharacter === maskCharacter ||
             maskCharacter.charCodeAt(0) === keys.asterisk) {
            continue;
          } else {
            element.value = '';

            return;
          }
        } else {
          if (maskCharacter.charCodeAt(0) === keys.a) {
            if (elementCharacter.charCodeAt(0) <= keys.a ||
             elementCharacter >= keys.z) {
              element.value = '';

              return;
            }
          } else if (maskCharacter.charCodeAt(0) === keys.nine) {
            if (elementCharacter.charCodeAt(0) <= keys.zero ||
             elementCharacter >= keys.nine) {
              element.value = '';

              return;
            }
          }
        }
      }

      if (validateDataType && dataType) {
        validateDataEqualsDataType(element);
      }
    }
  };

  const onKeyDown = function(element, event) {
    let key = event.which;

    const copyCutPasteKeys = [keys.v, keys.c, keys.x].indexOf(key) > -1 &&
     event.ctrlKey;

    const movementKeys = [keys.left, keys.right, keys.tab].indexOf(key) > -1;

    const modifierKeys = event.ctrlKey || event.shiftKey;

    if (copyCutPasteKeys || movementKeys || modifierKeys) {

      return true;
    }

    if (element.selectionStart === 0 &&
       element.selectionEnd === element.value.length) {
      originalValue = element.value;

      element.value = '';
    }

    if (key === keys.escape) {
      if (originalValue !== '') {
        element.value = originalValue;
      }

      return true;
    }

    if (key === keys.backSpace || key === keys.delete) {
      if (key === keys.backSpace) {
        checkAndRemoveMaskCharacters(element, getCursorPosition(element) - 1,
         key);

        removeCharacterAtIndex(element, getCursorPosition(element) - 1);
      }

      if (key === keys.delete) {
        checkAndRemoveMaskCharacters(element, getCursorPosition(element), key);

        removeCharacterAtIndex(element, getCursorPosition(element));
      }

      event.preventDefault();

      return false;
    }

    if (dataType && useEnterKey && key === keys.enter) {
      if (dataType >= 1 && dataType <= 5) {
        element.value = getFormattedDateTime();
      }

      event.preventDefault();

      return false;
    }

    if (element.value.length === mask.length) {
      event.preventDefault();

      return false;
    }

    if (hasMask) {
      checkAndInsertMaskCharacters(element, getCursorPosition(element));
    }

    if (isValidCharacter(key, mask[getCursorPosition(element)])) {
      if (key >= keys.numberPadZero && key <= keys.numberPadNine) {
        key = key - 48;
      }

      let character = event.shiftKey ?
       String.fromCharCode(key).toUpperCase() :
       String.fromCharCode(key).toLowerCase();

      if (forceUpper) {
        character = character.toUpperCase();
      }

      if (forceLower) {
        character = character.toLowerCase();
      }

      insertCharacterAtIndex(element, getCursorPosition(element), character);

      if (hasMask) {
        checkAndInsertMaskCharacters(element, getCursorPosition(element));
      }
    }

    event.preventDefault();

    return false;
  };

  const onPaste = function(element, event, data) {
    let pastedText = '';

    if (data != null && data !== '') {
      pastedText = data;
    } else if (event != null && window.clipboardData &&
       window.clipboardData.getData) {
      pastedText = window.clipboardData.getData('text');
    } else if (event != null && event.clipboardData &&
       event.clipboardData.getData) {
      pastedText = event.clipboardData.getData('text/plain');
    }

    if (pastedText != null && pastedText !== '') {
      for (let j = 0; j < formatCharacters.length; j++) {
        pastedText.replace(formatCharacters[j], '');
      }

      for (let i = 0; i < pastedText.length; i++) {
        if (formatCharacters.indexOf(pastedText[i]) > -1) {
          continue;
        }

        const keyDownEvent = document.createEventObject ?
         document.createEventObject() : document.createEvent('Events');

        if (keyDownEvent.initEvent) {
          keyDownEvent.initEvent('keydown', true, true);
        }

        keyDownEvent.keyCode = keyDownEvent.which = pastedText[i].charCodeAt(0);

        onKeyDown(element, keyDownEvent);
      }
    }

    return false;
  };

  const formatWithMask = function(element) {
    let value = element.value;

    if (between(dataType, 1, 5)) {
      value = getFormattedDateTime(element.value);
    }

    element.value = '';

    if (value != null && value !== '') {
      onPaste(element, null, value);
    }
  };

  return {
    Initialize: function(elements, options) {
      if (!elements || !options) {
        return;
      }

      if (options.mask && options.mask.length > 0) {
        mask = options.mask.split('');
        hasMask = true;
      }

      if (options.forceUpper) {
        forceUpper = options.forceUpper;
      }

      if (options.forceLower) {
        forceLower = options.forceLower;
      }

      if (options.validateDataType) {
        validateDataType = options.validateDataType;
      }

      if (options.dataType) {
        dataType = options.dataType;
      }

      if (options.useEnterKey) {
        useEnterKey = options.useEnterKey;
      }

      [].forEach.call(elements, (element) => {
        element.onblur = function() {
          if (!element.getAttribute('readonly') && hasMask) {
            return onLostFocus(element);
          }

          return true;
        };

        element.onkeydown = function(event) {
          if (!element.getAttribute('readonly')) {
            return onKeyDown(element, event);
          }

          return true;
        };

        element.onpaste = function(event) {
          if (!element.getAttribute('readonly')) {
            return onPaste(element, event, null);
          }

          return true;
        };

        if (options.placeHolder) {
          element.setAttribute('placeholder', options.placeHolder);
        }

        if (element.value.length > 0 && hasMask) {
          formatWithMask(element);
        }
      });

      document.documentElement.scrollTop = 0;
    }
  };
};
