import { z } from 'zod';

// Define the schema for the contact form without verification
export const DirectMessageSchema = z.object({
  email: z.string().email({ message: "Invalid email address. Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters long." }).max(5000, { message: "Message must be at most 5000 characters long." }),
});

export type DirectMessageSchemaType = z.infer<typeof DirectMessageSchema>;

// Define the state for the form submission result
export type DirectMessageFormState = {
  message: string;
  success: boolean;
  errors?: {
    email?: string[];
    message?: string[];
    _form?: string[]; // For general form errors
  };
};
