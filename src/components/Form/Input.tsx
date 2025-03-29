import { type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import { FormField } from './FormField';

interface InputProps<TFormValues extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<TFormValues>;
  form: UseFormReturn<TFormValues>;
  label?: string;
  helperText?: string;
}

export function Input<TFormValues extends FieldValues>({
  name,
  label,
  form,
  type = 'text',
  className = '',
  required,
  helperText,
  ...rest
}: InputProps<TFormValues>): JSX.Element {
  const { register } = form;

  return (
    <FormField
      name={name}
      label={label}
      form={form}
      required={required}
      helperText={helperText}
    >
      <input
        id={name}
        type={type}
        className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400 ${className}`}
        {...register(name)}
        aria-invalid={form.formState.errors[name] ? 'true' : 'false'}
        {...rest}
      />
    </FormField>
  );
} 