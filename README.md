# MedSync - Clinic Appointment and Treatment Management System (CATMS)

A comprehensive web-based management system for MedSync, a multi-specialty clinic operating across Colombo, Kandy, and Galle branches in Sri Lanka.

## 🏥 Project Overview

MedSync CATMS is designed to digitize and streamline clinic operations, replacing paper records and Excel sheets with an integrated system for:
- Patient registration and management
- Appointment scheduling and tracking
- Treatment recording and billing
- Insurance claim processing
- Multi-branch operations management

## 🚀 Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Backend**: Node.js/SvelteKit API routes
- **Database**: PostgreSQL/MySQL
- **Styling**: Tailwind CSS
- **Package Manager**: npm/pnpm

## 📦 Project Structure

```
DATABASE_PROJECT/
├── .storybook/          # Storybook configuration for component testing
├── .svelte-kit/         # SvelteKit build artifacts (auto-generated)
├── messages/            # i18n message files
├── node_modules/        # Dependencies
├── project.inlang/      # Internationalization configuration
├── src/
│   ├── lib/            # Shared utilities and components
│   ├── routes/         # SvelteKit routes (pages and API endpoints)
│   └── app.html        # Root HTML template
├── static/             # Static assets (images, icons, etc.)
├── docker-compose.yml  # Docker configuration for development
├── package.json        # Project dependencies and scripts
├── svelte.config.js    # SvelteKit configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🛠️ Essential SvelteKit Commands

### Development
```bash
# Start development server
npm run dev
# or with host binding for network access
npm run dev -- --host

# Start development server with specific port
npm run dev -- --port 4173
```

### Building
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Testing & Quality
```bash
# Run Storybook for component development
npm run storybook

# Type checking
npm run check

# Type checking in watch mode
npm run check:watch

# Linting
npm run lint

# Format code
npm run format
```

### Package Management
```bash
# Install dependencies
npm install

# Add new dependency
npm install <package-name>

# Add dev dependency
npm install -D <package-name>

# Update dependencies
npm update
```

### Database (if using Prisma or similar)
```bash
# Generate database client
npm run db:generate

# Run database migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database with dummy data
npm run db:seed
```

## 🏗️ Key Features

### Patient Management
- Multi-branch patient registration
- Cross-branch record accessibility
- Emergency contact management
- Insurance information tracking

### Appointment System
- Doctor-patient appointment scheduling
- Conflict prevention (no overlapping appointments)
- Status tracking (Scheduled, Completed, Cancelled)
- Emergency walk-in support
- Appointment rescheduling

### Treatment & Billing
- Treatment catalogue management
- Price and service code tracking
- Invoice generation
- Partial/full payment tracking
- Outstanding balance management

### Insurance Integration
- Insurance claim processing
- Policy-based reimbursement calculation
- Coverage vs. out-of-pocket reporting

### Reporting Dashboard
- Branch-wise appointment summaries
- Doctor revenue reports
- Outstanding balance tracking
- Treatment category analytics
- Insurance coverage analysis

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DATABASE_PROJECT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other config
   ```

4. **Set up database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed with dummy data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗃️ Database Schema

The system includes the following main entities:
- **Branches**: Clinic locations with managers and staff
- **Users**: Doctors, staff, and administrators
- **Patients**: Cross-branch patient records
- **Appointments**: Scheduling and status tracking
- **Treatments**: Service catalogue and pricing
- **Billing**: Invoices, payments, and outstanding dues
- **Insurance**: Policies and claim processing

## 🔧 Development Guidelines

### Code Organization
- Use TypeScript for type safety
- Follow SvelteKit conventions for routing
- Keep components in `src/lib/components`
- Store utilities in `src/lib/utils`
- Use proper error handling in API routes

### Database Best Practices
- Implement proper indexing for performance
- Use transactions for data consistency
- Add triggers for automatic updates
- Maintain referential integrity with foreign keys

### API Design
- RESTful endpoints in `src/routes/api`
- Proper HTTP status codes
- Input validation and sanitization
- Error handling and logging

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions, please contact the development team or create an issue in the repository.