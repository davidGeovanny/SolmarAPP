export interface LoginScreenProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
}

export interface LoginFormProps {
  onForgotPassword: () => void;
}

export interface CaptchaFieldProps {
  value: string;
  onChange: (text: string) => void;
  onBlur: () => void;
  onRefresh: () => void;
  operandA: number;
  operandB: number;
  hasError: boolean;
  errorMessage?: string;
}

export interface Captcha {
  a: number;
  b: number;
}