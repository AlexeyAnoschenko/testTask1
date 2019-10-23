const sortBanknotesByAsc = ({ value: a }, { value: b }) => (a > b ? 1 : -1);
const sortBanknotesByDesc = ({ value: a }, { value: b }) => (a > b ? -1 : 1);

const getAvailableCount = ({ count = 0, minCount = 0 }) =>
  count > minCount ? count - minCount : 0;
const hasAvailableCount = banknote => Boolean(getAvailableCount(banknote));

const getMinAvailableBanknote = banknotes =>
  banknotes.sort(sortBanknotesByAsc).find(hasAvailableCount);

const getMinAvailableValue = banknotes => {
  const minAvailableBanknote = getMinAvailableBanknote(banknotes);
  return minAvailableBanknote ? minAvailableBanknote.value : 0;
};

const getMaxAmount = banknotes =>
  banknotes.reduce((acc, banknote) => {
    const { value } = banknote;
    const availableCount = getAvailableCount(banknote);
    return acc + value * availableCount;
  }, 0);

const isValidAmount = (amount, banknotes) => {
  const minAvailableValue = getMinAvailableValue(banknotes);

  return amount > 0 && minAvailableValue > 0 && amount % minAvailableValue === 0;
};

const getValidAmounts = (amount, banknotes) => {
  const minAvailableValue = getMinAvailableValue(banknotes);
  if (!minAvailableValue) return { floor: 0, ceil: 0 };
  const remainder = amount % minAvailableValue;
  const floor = amount - remainder;
  const ceil = floor + minAvailableValue;

  return { floor, ceil };
};

const getBanknotes = ({ requestedAmount, availableBanknotes }) => {
  const result = availableBanknotes.sort(sortBanknotesByDesc).reduce(
    (acc, banknote) => {
      const { banknotes, remainder } = acc;
      const { value } = banknote;
      const availableCount = getAvailableCount(banknote);
      if (value > remainder || !availableCount) return acc;
      const neededCount = Math.floor(remainder / value);
      const count = neededCount > availableCount ? availableCount : neededCount;
      return {
        banknotes: [...banknotes, { value, count }],
        remainder: remainder - value * count,
      };
    },
    { banknotes: [], remainder: requestedAmount }
  );

  if (getMaxAmount(result.banknotes) !== requestedAmount) throw new Error('Not enought banknotes');

  return result.banknotes;
};

const getValidAmountUI = ({ availableBanknotes, floor = 0, ceil = 0 }) => {
  const availableAmounts = [ceil, floor].filter(Boolean).join(' or ');
  const message = availableAmounts
    ? `Choose available amounts: ${availableAmounts}`
    : 'Enter the amount';
  const requestedAmount = Number(prompt(message, ceil || ''));
  if (isValidAmount(requestedAmount, availableBanknotes)) return requestedAmount;
  return getValidAmountUI({
    availableBanknotes,
    ...getValidAmounts(requestedAmount, availableBanknotes),
  });
};

const runAtm = () => {
  const availableBanknotes = [
    { value: 5000, count: 40 },
    { value: 1000, count: 40 },
    { value: 200, count: 40, minCount: 2 },
    { value: 100, count: 40 },
  ];
  const requestedAmount = getValidAmountUI({ availableBanknotes });
  try {
    const result = getBanknotes({ requestedAmount, availableBanknotes });
    alert(JSON.stringify(result, null, '  '));
  } catch (error) {
    alert(error);
  }
};

const atmList = [
  [
    { value: 5000, count: 40 },
    { value: 1000, count: 40 },
    { value: 200, count: 40, minCount: 2 },
    { value: 100, count: 40 },
  ],
  [
    { value: 5000, count: 0 },
    { value: 1000, count: 0 },
    { value: 200, count: 0, minCount: 2 },
    { value: 100, count: 0 },
  ],
  [
    { value: 5000, count: 1 },
    { value: 1000, count: 1 },
    { value: 200, count: 2, minCount: 2 },
    { value: 100, count: 1 },
  ],
  [
    { value: 5000, count: 5 },
    { value: 1000, count: 7 },
    { value: 200, count: 23, minCount: 2 },
    { value: 100, count: 12 },
  ],
  [
    { value: 5000, count: 1 },
    { value: 1000, count: 2 },
    { value: 200, count: 3, minCount: 2 },
    { value: 100, count: 40 },
  ],
];

const testCases = [
  {
    requestedAmount: 251600,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 5000,
            count: 40,
          },
          {
            value: 1000,
            count: 40,
          },
          {
            value: 200,
            count: 38,
          },
          {
            value: 100,
            count: 40,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: 'Error: Not enought banknotes',
      },
    ],
  },
  {
    requestedAmount: 100000,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 5000,
            count: 20,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: 'Error: Not enought banknotes',
      },
    ],
  },
  {
    requestedAmount: 5400,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
          {
            value: 200,
            count: 2,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
          {
            value: 200,
            count: 2,
          },
        ],
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
          {
            value: 200,
            count: 1,
          },
          {
            value: 100,
            count: 2,
          },
        ],
      },
    ],
  },
  {
    requestedAmount: 5000,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: [
          {
            value: 5000,
            count: 1,
          },
        ],
      },
    ],
  },
  {
    requestedAmount: 1000,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 1000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: [
          {
            value: 1000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: [
          {
            value: 1000,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: [
          {
            value: 1000,
            count: 1,
          },
        ],
      },
    ],
  },
  {
    requestedAmount: 200,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 200,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: [
          {
            value: 200,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: [
          {
            value: 200,
            count: 1,
          },
        ],
      },
    ],
  },
  {
    requestedAmount: 100,
    cases: [
      {
        availableBanknotes: atmList[0],
        expectedResult: [
          {
            value: 100,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[1],
        expectedResult: 'Error: Not enought banknotes',
      },
      {
        availableBanknotes: atmList[2],
        expectedResult: [
          {
            value: 100,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[3],
        expectedResult: [
          {
            value: 100,
            count: 1,
          },
        ],
      },
      {
        availableBanknotes: atmList[4],
        expectedResult: [
          {
            value: 100,
            count: 1,
          },
        ],
      },
    ],
  },
];

const getBanknotesTestWrap = (...args) => {
  try {
    return getBanknotes(...args);
  } catch (error) {
    return String(error);
  }
};

const runTests = () => {
  console.group('Tests');
  let isAllTestsPassed = true;
  testCases.forEach(({ requestedAmount, cases }) => {
    cases.forEach(({ availableBanknotes, expectedResult }) => {
      const result = getBanknotesTestWrap({ requestedAmount, availableBanknotes });
      const isTestPassed = JSON.stringify(result) === JSON.stringify(expectedResult);
      if (!isTestPassed) isAllTestsPassed = false;
      console.assert(isTestPassed, {
        requestedAmount,
        availableBanknotes,
        failedResult: result,
        expectedResult,
      });
    });
  });
  if (isAllTestsPassed) console.log('All tests passed');
  console.groupEnd();
};

console.info(
  'Check `atm.` for available methods.\nUse `atm.{methodName}.toString()` to check method details.\nOr `atm.toString()` to check all methods.'
);

runTests();
runAtm();

const allAtmMethods = {
  sortBanknotesByAsc,
  sortBanknotesByDesc,
  getAvailableCount,
  hasAvailableCount,
  getMinAvailableBanknote,
  getMinAvailableValue,
  getMaxAmount,
  isValidAmount,
  getValidAmounts,
  getBanknotes,
  runTests,
  getBanknotesTestWrap,
  runAtm,
  getValidAmountUI,
};

window.atm = {
  ...allAtmMethods,
  toString: () =>
    Object.entries(allAtmMethods)
      .map(([key, value]) => `\nconst ${key} = ${value.toString()};\n`)
      .join(''),
};
