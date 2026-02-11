# 📁 Appointment Booking Application

A robust full-stack solution designed to streamline the scheduling process between service providers and clients. This application provides a seamless interface for managing bookings, preventing scheduling conflicts, and maintaining role-based access for various service industries like healthcare, wellness, and consulting.

---

## 🚀 Key Features

- **👤 Client Features**

Secure Authentication: User registration and login functionality.

Service Discovery: Browse available services offered by various providers.

Seamless Booking: Schedule appointments with real-time availability checks.

Booking Management: View upcoming or past appointments and cancel bookings if necessary.

- **💼 Provider Features**

Service Management: Create and update service offerings.

Availability Control: Set and manage professional schedules.

Appointment Oversight: View, accept, or reject incoming client bookings.

Dashboard: Centralized view of all scheduled sessions.

- **⚙️ System Features**

Conflict Resolution: Sophisticated logic to prevent double bookings.

Role-Based Access Control (RBAC): Distinct permissions for Clients and Providers.

Responsive UI: Fully optimized for mobile, tablet, and desktop views.


---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, React Router DOM, TailwindCSS, Lucide React 
- **Backend**: Java 17 , Springboot 3.5  
- **Database**: PostgreSQL  
- **Deployment**: Vercel , Render

---

## ⚡ Quick Start

### 1. Database Setup

Ensure you have PostgreSQL installed and running. Create a new database and execute the following schema:

```sql
-- 1. Users Table (Core Auth & Roles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CLIENT', 'PROVIDER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services Table (Provider Offerings)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 30,
    price DECIMAL(10, 2)
);

-- 3. Availability Table (Weekly Schedule Template)
-- day_of_week: 0 (Sun) to 6 (Sat)
CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(provider_id, day_of_week) -- One schedule per day per provider
);

-- 4. Appointments Table (The Booking Engine)
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES users(id),
    service_id INT REFERENCES services(id),
    provider_id INT REFERENCES users(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Simple constraint to prevent the same provider being booked at the same time/date
    UNIQUE(provider_id, appointment_date, start_time)
);

```

### 2. Backend Configuration

- **Navigate to the backend directory**: cd scheduler-api
- **Install dependencies**: mvn clean install
- **Create a .env file in the backend/ root**: update env varibales in application.properties
- **Start the server**:./mvnw spring-boot:run

### 3. Frontend Configuration
- **Open a new terminal and navigate to the frontend directory**: cd Frontend/appointment-ui
- **Install dependencies**: npm install
- **Create a .env file in the frontend/ root**:
VITE_API_BASE_URL=http://localhost:8080
- **Start the development server**: npm run dev

```text
📂 Project Structure
├── scheduler-api/             # Spring Boot Backend
│   ├── src/main/java          # Business logic & Controllers
│   ├── src/main/resources     # Configurations
│   └── pom.xml                # Maven Dependencies
└── Frontend/appointment-ui/   # React Frontend
    ├── src/components         # Reusable UI components
    ├── src/pages              # Page views (Login, Dashboard)
    ├── src/context            # Auth & State management
    └── tailwind.config.js     # Styling configurations                # Frontend environment variables

```
---

## 🛡️ Validation Rules
The application implements validation rules across both its backend and frontend layers to ensure data integrity and security. These rules are defined through Spring Boot validation annotations in the Java backend and managed via React hooks and specific dependencies in the frontend.

## 📌 Future Improvements
- **Email Notifications**
- **Tag-based filtering system**
- **Pagination for large contact lists**
- **Dark mode support**
- **Deployment automation (CI/CD)**

## 🙌 Acknowledgements
Built as a full-stack learning project using the PSRJ stack.









