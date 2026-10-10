export type AuthValues = Record<string, string>;

export function isValidEmail(value: string): boolean {
  const email: string = value.trim();
  const separator: number = email.lastIndexOf('@');
  if (separator < 1 || email.length > 254) return false;
  const localPart: string = email.slice(0, separator);
  const labels: string[] = email.slice(separator + 1).split('.');
  return (
    localPart.length <= 64 &&
    /^[A-Za-z\d!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z\d!#$%&'*+/=?^_`{|}~-]+)*$/.test(
      localPart,
    ) &&
    labels.length >= 2 &&
    labels.every((label: string): boolean =>
      /^[A-Za-z\d](?:[A-Za-z\d-]{0,61}[A-Za-z\d])?$/.test(label),
    )
  );
}

export function validateAuth(
  values: AuthValues,
  isRegistration: boolean,
): AuthValues {
  const errors: AuthValues = {
    ...(!isValidEmail(values.email ?? '') && {
      email: 'Enter a valid email address.',
    }),
  };
  const password: string = values.password ?? '';
  if (password.length < 6) errors.password = 'Use at least 6 characters.';
  if (isRegistration) {
    if (!/^[A-Z][A-Za-z\d]{1,29}$/.test(values.username ?? ''))
      errors.username =
        'Use 2–30 English letters or digits, starting with an uppercase letter.';
    if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[\u{21}-\u{7E}]{6,}$/u.test(
        password,
      )
    )
      errors.password =
        'Use 6+ characters with an uppercase letter, digit and special character.';
    if (!values['confirm-password'] || values['confirm-password'] !== password)
      errors['confirm-password'] = 'Passwords must match.';
  }
  return errors;
}
