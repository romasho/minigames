export enum AuthMode {
  Login = 'login',
  Register = 'register',
}

export interface AuthDialogController {
  readonly element: HTMLDialogElement;
  close(): void;
  destroy(): void;
  open(mode: AuthMode): void;
  setMode(mode: AuthMode): void;
}

export type FieldIcon = 'email' | 'lock' | 'user';

export interface FieldDefinition {
  readonly autocomplete: AutoFill;
  readonly icon: FieldIcon;
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type: 'email' | 'password' | 'text';
}
