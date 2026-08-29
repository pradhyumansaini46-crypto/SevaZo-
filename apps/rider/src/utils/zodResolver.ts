import { ZodSchema, ZodError } from 'zod';
import { FieldValues, Resolver } from 'react-hook-form';

/**
 * Lightweight native Zod Resolver for React Hook Form
 */
export const zodResolver =
  <T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> =>
  async (values) => {
    try {
      const parsedValues = schema.parse(values);
      return {
        values: parsedValues,
        errors: {},
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors = error.errors.reduce((acc: Record<string, any>, curr) => {
          const path = curr.path.join('.');
          if (!acc[path]) {
            acc[path] = {
              type: curr.code,
              message: curr.message,
            };
          }
          return acc;
        }, {});

        return {
          values: {},
          errors: formErrors,
        };
      }

      return {
        values: {},
        errors: {
          root: {
            type: 'validate',
            message: 'Validation failed',
          },
        },
      };
    }
  };

export default zodResolver;
