import {
  type FieldValues,
  type UseFormReturn,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { type ReactNode } from 'react';

interface FormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label?: string;
  children: ReactNode;
  form: UseFormReturn<TFormValues>;
  rules?: RegisterOptions;
  className?: string;
  required?: boolean;
  helperText?: string;
}

export function FormField<TFormValues extends FieldValues>({
  name,
  label,
  children,
  form,
  className = '',
  required = false,
  helperText,
}: FormFieldProps<TFormValues>): JSX.Element {
  const { formState } = form;
  const error = formState.errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      {children}
      
      {(errorMessage || helperText) && (
        <div className="mt-1 text-sm">
          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : helperText ? (
            <p className="text-gray-500">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
} 