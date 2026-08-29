// Authentication-related constants.

export const PASSWORD_MIN_LENGTH = 8;

// Password must contain a number and a letter (PRD §5.1 bcrypt security baseline).
export const PASSWORD_NUMBER_REGEX = /\d/;
export const PASSWORD_LETTER_REGEX = /[a-zA-Z]/;

export const EMAIL_MAX_LENGTH = 254;
export const OTP_CODE_FORMAT = /^\d{6}$/;
