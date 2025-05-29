export const appVersionVeify = (version, supportDouble) => {
  console.log('appVersionVeify', version, supportDouble);
  if (version >= '1.0.1.0' && supportDouble) {
    return true;
  }
  return false;
};
