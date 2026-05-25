import { Toast } from 'primereact/toast';
import { createRef } from 'react';

export const toastRef = createRef<Toast>();

export function showError(summary: string, detail: string) {
  toastRef.current?.show({
    severity: 'error',
    summary,
    detail,
    life: 3000,
  });
}

export function showSuccess(summary: string, detail: string) {
  toastRef.current?.show({
    severity: 'success',
    summary,
    detail,
    life: 3000,
  });
}

export function showWarn(summary: string, detail: string) {
  toastRef.current?.show({
    severity: 'warn',
    summary,
    detail,
    life: 3000,
  });
}