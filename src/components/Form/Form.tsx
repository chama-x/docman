import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode } from 'react';
import { type z } from 'zod';

interface FormProps<TFormValues, TSchema extends z.ZodType<TFormValues>> {
  schema: TSchema;
  defaultValues?: Partial<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => ReactNode;
  className?: string;
}

export function Form<
  TFormValues extends Record<string, unknown>,
  TSchema extends z.ZodType<TFormValues>
>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<TFormValues, TSchema>): JSX.Element {
  const methods = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <form
      className={className}
      onSubmit={methods.handleSubmit(onSubmit)}
      noValidate
    >
      {children(methods)}
    </form>
  );
} 