// Export for Select dropdown type
export type SelectOption<T> = {
  id: string | number;
  label: string;
  value: T;
};

// Exports for AlertDialog button
export type AlertDialogContinueBtn = {
  btnText?: string;
  handleClick: () => void;
  variant?: 'link' | 'secondary' | 'primary' | 'tertiary' | undefined;
};

export type AlertDialogCloseBtn = Partial<AlertDialogContinueBtn>;

export type AlertDialogExtraConfig = Required<AlertDialogContinueBtn>;
