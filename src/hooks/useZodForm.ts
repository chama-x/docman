import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

export function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> = {}
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });
} 