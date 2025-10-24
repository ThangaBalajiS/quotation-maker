# Quotation Maker

A multi-tenant Next.js application for creating and managing quotations and invoices for businesses.

## Features

- **Multi-tenant Architecture**: Each user gets their own isolated workspace
- **Authentication**: Email/password based authentication using NextAuth.js
- **Customer Management**: Add, edit, and manage customer information
- **Product Catalog**: Maintain a comprehensive product database with pricing and tax information
- **Quotation Management**: Create, edit, and track quotations
- **Invoice Management**: Generate and manage invoices
- **Business Settings**: Configure business details, logo, and signature
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quotation-maker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/quotation-maker

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── customers/     # Customer management
│   │   ├── products/      # Product management
│   │   ├── quotations/    # Quotation management
│   │   └── invoices/      # Invoice management
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── types/                # TypeScript type definitions
```

## Database Models

- **User**: User accounts with business details
- **Customer**: Customer information and contact details
- **Product**: Product catalog with pricing and tax information
- **Quotation**: Quotation documents with line items
- **Invoice**: Invoice documents with payment tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User sign in
- `GET /api/auth/session` - Get current session

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Quotations
- `GET /api/quotations` - Get all quotations
- `POST /api/quotations` - Create new quotation

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice

### Business Settings
- `GET /api/business-settings` - Get business details
- `PUT /api/business-settings` - Update business details

## Multi-tenant Architecture

The application uses a tenant-based isolation system where:
- Each user gets a unique `tenantId` upon registration
- All data is filtered by `tenantId` to ensure complete isolation
- Users can only access their own data

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- PDF generation for quotations and invoices
- Email sending capabilities
- Advanced reporting and analytics
- Payment tracking
- Multi-currency support
- API rate limiting
- Advanced search and filtering
- Bulk operations
- Data export/import