import { z } from 'zod'

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * Validation schema for signup form
 */
export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Validation schema for transfer form
 */
export const transferSchema = z.object({
  recipientAccount: z.string().min(10, 'Please enter a valid account number'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  note: z.string().optional(),
})

/**
 * Validation schema for profile update
 */
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  bvn: z.string().length(11, 'BVN must be 11 digits').optional(),
  nin: z.string().length(11, 'NIN must be 11 digits').optional(),
})