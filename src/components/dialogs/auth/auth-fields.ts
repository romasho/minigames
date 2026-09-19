import { AuthMode, type FieldDefinition } from './auth-types';

export const fieldsByMode: Readonly<
  Record<AuthMode, readonly FieldDefinition[]>
> = {
  [AuthMode.Login]: [
    {
      autocomplete: 'email',
      icon: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'e.g. alex@minigames.com',
      type: 'email',
    },
    {
      autocomplete: 'current-password',
      icon: 'lock',
      label: 'Password',
      name: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  ],
  [AuthMode.Register]: [
    {
      autocomplete: 'username',
      icon: 'user',
      label: 'Username',
      name: 'username',
      placeholder: 'e.g. CozyGamer_99',
      type: 'text',
    },
    {
      autocomplete: 'email',
      icon: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'your.email@domain.com',
      type: 'email',
    },
    {
      autocomplete: 'new-password',
      icon: 'lock',
      label: 'Password',
      name: 'password',
      placeholder: 'Min. 8 characters',
      type: 'password',
    },
    {
      autocomplete: 'new-password',
      icon: 'lock',
      label: 'Confirm Password',
      name: 'confirm-password',
      placeholder: 'Repeat your password',
      type: 'password',
    },
  ],
};
