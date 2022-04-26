export const authErrors = {
  InvalidCredentials: {
    code: 'AUTH001',
    msg: 'invalid_credentials',
  },
  AlreadyExist: {
    code: 'AUTH002',
    msg: 'user_already_exist',
  },
  ConfirmTokenExpire: {
    code: 'AUTH003',
    msg: 'confirm_token_expired',
  },
  NotActive: {
    code: 'AUTH004',
    msg: 'user_not_active',
  },
  ResetTokenExpire: {
    code: 'AUTH007',
    msg: 'reset_token_expires',
  },
};
