
export const filterSocdAndRsKey = (keyboards, keyValue) => {
  let unBinding = false;

  for (let row = 0; row < keyboards.length; row++) {
    for (let col = 0; col < keyboards[row].length; col++) {
      if (keyboards[row][col].keyValue !== keyValue) continue;
      const { advancedKeys } = keyboards[row][col];
      if (
        advancedKeys.advancedType &&
        (advancedKeys.advancedType === 8 ||
          advancedKeys.advancedType === 6 ||
          advancedKeys.advancedType === 7 ||
          advancedKeys.advancedType === 9)
      ) {
        unBinding = true;
      }
    }
  }

  return unBinding;
};
