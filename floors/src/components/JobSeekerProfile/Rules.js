
const rules = {
  birthday: {
    day: {
      required: true,
      min: 1,
      max: 31,
      regex: new RegExp(/^\d+$/)
    },
    month: {
      required: true,
      min: 1,
      max: 12
    },
    year: {
      required: true,
      min: 1920,
      max: (new Date()).getFullYear() - 18 // только совершеннолетние
    },
  },
  vacancy: {
    required: true,
  },
  fullName: {
    required: true,
    regex: new RegExp(
      /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я\s]+[a-zA-Zа-яА-Я]\s*$/
    )
  },
  phone: {
    required: true,
    testPhone: true
  },
  institutions: {
    graduateYear: {
      required: true,
      min: 1920,
      max: (new Date()).getFullYear()
    },
    speciality: {
      required: true,
    },
    institution: {
      required: true,
    },
  },
  jobs: {
    company: {
      required: true,
    },
    job: {
      required: true,
    },
    responsibility: {
      required: true,
    },
    monthStart: {
      required: true,
      min: 1,
      max: 12,
    },
    monthEnd: {
      min: 1,
      max: 12,
    },
    yearStart: {
      required: true,
      min: 1920,
      max: (new Date()).getFullYear(),
    },
    yearEnd: {
      min: 1920,
      max: (new Date()).getFullYear(),
    }
  }
};

export default rules;