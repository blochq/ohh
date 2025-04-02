# Payment Platform

A modern payment platform for international transfers with user authentication, KYC verification, and payment processing.

## Features

### Authentication
- User registration and login
- Email verification with OTP
- Profile management

### Onboarding
- Multi-step onboarding process
- Personal information collection
- Address verification
- Phone verification

### KYC (Know Your Customer)
- Document upload (passport, ID card, driver's license)
- Selfie with document verification
- KYC status tracking

### Payments
- Currency conversion
- Collection account generation
- Payment verification
- Beneficiary management
- Payout initiation
- Transaction history

## API Endpoints

### Authentication APIs
- `POST /v1/users/register` - Register a new user
- `POST /v1/users/verify-email` - Verify user email with OTP
- `POST /v1/users/resend-verification` - Resend verification code
- `POST /v1/users/login` - User login
- `GET /v1/users/profile` - Get user profile
- `PUT /v1/users/profile` - Update user profile

### KYC APIs
- `POST /v1/kyc/documents` - Upload KYC documents
- `GET /v1/kyc/status` - Check KYC verification status
- `POST /v1/kyc/verify` - Submit KYC verification data

### Payment APIs
- `POST /v1/auth` - Authentication for payment APIs
- `POST /v1/conversions` - Calculate currency conversion
- `POST /v1/collection-accounts` - Generate collection account
- `POST /v1/payment-verification` - Verify payment
- `POST /v1/beneficiaries` - Create beneficiary
- `POST /v1/payouts` - Initiate payout
- `GET /v1/transactions` - Get transaction history
- `GET /v1/transactions/:id` - Get transaction details

## Pages

### Authentication Pages
- `/auth/signup` - User registration
- `/auth/verify-email` - Email verification
- `/auth/login` - User login

### Onboarding Pages
- `/onboarding` - Multi-step onboarding process

### KYC Pages
- `/kyc` - Document upload and verification

### Payment Pages
- `/payment` - Payment initiation
- `/payment/collection-account` - Collection account details
- `/payment/verify` - Payment verification

### Dashboard Pages
- `/dashboard` - User dashboard
- `/transactions` - Transaction history
- `/transactions/:id` - Transaction details

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_API_BASE_URL=https://api.example.com
```

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- React Hooks
- Fetch API

## Conclusion

This payment platform provides a complete solution for international money transfers with a focus on security and user experience. The application includes a comprehensive user journey from registration and KYC verification to payment processing and transaction tracking. The modular architecture allows for easy maintenance and future enhancements.
