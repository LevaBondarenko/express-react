
const validationRules = {
  rulesUploaderFile: [
    {
      field: 'file',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Необходимо загрузить файл'
    }
  ],
  rulesUploaderForm: [
    {
      field: 'phone',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Телефон обязателен'
    },
    {
      field: 'phone',
      rule: 'phone',
      param: 0,
      err: 'error',
      msg: 'Телефон введен неправильно'
    },
    {
      field: 'i',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Имя обязательно'
    },
    {
      field: 'city',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Выберите город'
    },
    {
      field: 'email',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Email обязателен'
    },
    {
      field: 'email',
      rule: 'email',
      param: 0,
      err: 'error',
      msg: 'Email введен неправильно'
    },
    {
      field: 'confirm',
      rule: 'required',
      param: 0,
      err: 'error',
      msg: 'Вы должны согласиться с условиями'
    }
  ]
};

export default validationRules;
