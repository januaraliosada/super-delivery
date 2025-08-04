# SUPER DELIVERY - Food Delivery Web Application

This repository contains the source code for the **SUPER DELIVERY** web application, a comprehensive food delivery platform designed to connect customers with their favorite restaurants for fast and convenient meal delivery. The application features a modern frontend built with React and a robust backend powered by Flask, providing a seamless experience for ordering, managing restaurants, and tracking deliveries.

## Table of Contents

1.  [Introduction](#introduction)
2.  [Features](#features)
3.  [Technical Stack](#technical-stack)
4.  [Project Structure](#project-structure)
5.  [Deployment Guide](#deployment-guide)
    *   [Prerequisites](#prerequisites)
    *   [Backend Setup](#backend-setup)
    *   [Frontend Setup](#frontend-setup)
    *   [Running Locally](#running-locally)
    *   [Deployment to Production](#deployment-to-production)
6.  [API Endpoints](#api-endpoints)
7.  [Database Schema](#database-schema)
8.  [Contributing](#contributing)
9.  [License](#license)
10. [Recent Improvements](#recent-improvements)
11. [Future Improvements and Remaining Limitations](#future-improvements-and-remaining-limitations)

## 1. Introduction

SUPER DELIVERY aims to revolutionize the food delivery experience by offering a user-friendly platform that prioritizes speed, efficiency, and customer satisfaction. The application supports various user roles, including customers, restaurant owners, and delivery drivers, each with tailored functionalities to streamline the ordering and delivery process. From browsing diverse cuisines to real-time order tracking, SUPER DELIVERY provides a complete solution for modern food delivery needs.

## 2. Features

### Customer Features:

*   **Intuitive Food Discovery:** Browse a wide selection of restaurants and cuisines.
*   **Advanced Search & Filtering:** Easily find desired meals by restaurant name, cuisine type, or dish.
*   **Real-time Order Tracking:** Monitor order status from preparation to delivery.
*   **Order Management:** View past orders and reorder favorite meals.
*   **Restaurant & Driver Reviews:** Provide feedback on food quality and delivery service.
*   **Secure Payment Options:** Integration with popular payment gateways.
*   **User Authentication:** Secure login, registration, and profile management.
*   **Persistent Cart:** Shopping cart that saves items across sessions.

### Restaurant Owner Features:

*   **Menu Management:** Add, update, and remove menu items with detailed descriptions and pricing.
*   **Order Management:** Receive and process incoming orders, update order statuses.
*   **Restaurant Profile Management:** Update restaurant information, opening hours, and delivery settings.
*   **Performance Analytics:** (Planned for future development) Track sales and popular dishes.

### Delivery Driver Features:

*   **Available Order Listing:** View and accept new delivery requests.
*   **Navigation Assistance:** (Planned for future development) In-app navigation to pickup and delivery locations.
*   **Status Updates:** Update order delivery status in real-time.
*   **Earnings Tracking:** (Planned for future development) Monitor delivery earnings.

### Admin Features:

*   **User Management:** Manage customer, restaurant owner, and driver accounts.
*   **Content Moderation:** Oversee restaurant listings, menu items, and reviews.
*   **System Monitoring:** (Planned for future development) Monitor overall application performance and health.

## 3. Technical Stack

SUPER DELIVERY is built using a robust and scalable technology stack:

### Frontend:

*   **React 18:** A popular JavaScript library for building user interfaces.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui:** A collection of reusable UI components built with Radix UI and Tailwind CSS.
*   **Lucide React:** A set of beautiful and customizable open-source icons.
*   **JavaScript (JSX):** The primary language for frontend development.

### Backend:

*   **Flask:** A lightweight Python web framework for building robust APIs.
*   **SQLAlchemy:** An SQL toolkit and Object-Relational Mapper (ORM) that provides a flexible way to interact with databases.
*   **PostgreSQL:** (Recommended for production) A powerful, open-source object-relational database system.
*   **SQLite:** A lightweight, file-based SQL database used for development and testing.
*   **Flask-CORS:** A Flask extension for handling Cross-Origin Resource Sharing (CORS), enabling secure communication between frontend and backend.

### Other Tools & Libraries:

*   **Git:** Version control system for tracking changes and collaboration.
*   **GitHub:** Web-based platform for version control and collaborative software development.
*   **pnpm:** A fast, disk space efficient package manager for JavaScript.
*   **Stripe:** For secure payment processing.
*   **Gunicorn:** A production-ready WSGI HTTP server for Python web applications.
*   **PyJWT:** For JSON Web Token (JWT) authentication.

## 4. Project Structure

The project is organized into two main directories: `super_delivery_backend` and `super_delivery_frontend`.

```
SUPERDELIVERY/
├── super_delivery_backend/       # Flask Backend Application
│   ├── src/
│   │   ├── models/               # Database Models (SQLAlchemy)
│   │   ├── routes/               # API Endpoints (Flask Blueprints)
│   │   ├── static/               # Frontend build files (served by Flask)
│   │   ├── database/             # SQLite database file (app.db)
│   │   └── main.py               # Main Flask application entry point
│   ├── venv/                     # Python Virtual Environment
│   ├── config.py                 # Environment-based configuration
│   ├── wsgi.py                   # WSGI entry point for production
│   ├── gunicorn.conf.py          # Gunicorn configuration
│   └── requirements.txt          # Python dependencies
├── super_delivery_frontend/      # React Frontend Application
│   ├── public/
│   │   ├── assets/               # Static assets like images
│   │   ├── components/           # Reusable React components
│   │   ├── App.jsx               # Main React App component
│   │   ├── index.css             # Global CSS styles
│   │   └── main.jsx              # React application entry point
│   ├── node_modules/             # Node.js dependencies
│   ├── package.json              # Node.js project metadata and scripts
│   └── vite.config.js            # Vite configuration
└── README.md                     # Project README and Deployment Guide
```

## 5. Deployment Guide

This guide provides instructions on how to set up, run, and deploy the SUPER DELIVERY web application.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Python 3.8+:** For the Flask backend.
*   **Node.js 18+:** For the React frontend and `pnpm`.
*   **pnpm:** A fast, disk space efficient package manager for JavaScript. Install it globally:
    ```bash
    npm install -g pnpm
    ```
*   **Git:** For cloning the repository.
*   **PostgreSQL:** (Recommended for production) A robust relational database.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd SUPERDELIVERY/super_delivery_backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Initialize the database:**
    For development with SQLite, the Flask application will automatically create the `app.db` file and tables when it runs for the first time. If you modify the database models, you might need to delete the `app.db` file to recreate the database with the new schema.
    ```bash
    rm src/database/app.db # Use with caution, this deletes all data
    ```
    For production with PostgreSQL, ensure your PostgreSQL server is running and you have created a database and user (e.g., `super_delivery` database and `super_delivery_user` user with password `super_delivery_pass`). Update the `DATABASE_URL` environment variable or `config.py` accordingly.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd SUPERDELIVERY/super_delivery_frontend
    ```

2.  **Install Node.js dependencies using pnpm:**
    ```bash
    pnpm install
    ```

### Running Locally

To run the full-stack application locally, you need to start both the backend and frontend development servers.

1.  **Start the Backend Server:**
    Open a new terminal, navigate to the `super_delivery_backend` directory, activate the virtual environment, and run the Flask app:
    ```bash
    cd SUPERDELIVERY/super_delivery_backend
    source venv/bin/activate
    python src/main.py
    ```
    The backend server will run on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    Open another new terminal, navigate to the `super_delivery_frontend` directory, and run the React app:
    ```bash
    cd SUPERDELIVERY/super_delivery_frontend
    pnpm run dev
    ```
    The frontend development server will typically run on `http://localhost:5173`.

3.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:5173` to access the SUPER DELIVERY application. The frontend will communicate with the backend running on port 5000.

### Deployment to Production

For production deployment, the React frontend needs to be built and served by the Flask backend using a production-ready WSGI server like Gunicorn.

1.  **Build the Frontend for Production:**
    Navigate to the `super_delivery_frontend` directory and build the React application:
    ```bash
    cd SUPERDELIVERY/super_delivery_frontend
    pnpm run build
    ```
    This will create a `dist` directory containing the optimized production build of your frontend.

2.  **Copy Frontend Build to Backend Static Folder:**
    Copy the contents of the `dist` folder into the `src/static` directory of your Flask backend:
    ```bash
    cp -r dist/* ../super_delivery_backend/src/static/
    ```

3.  **Update Backend Dependencies (if necessary):**
    Ensure your `requirements.txt` in the backend is up-to-date:
    ```bash
    cd ../super_delivery_backend
    source venv/bin/activate
    pip freeze > requirements.txt
    ```

4.  **Deploy the Full-Stack Application with Gunicorn:**
    Navigate to the `super_delivery_backend` directory, activate the virtual environment, and run Gunicorn:
    ```bash
    cd SUPERDELIVERY/super_delivery_backend
    source venv/bin/activate
    gunicorn --config gunicorn.conf.py wsgi:app
    ```
    The application will be accessible on the server's IP address and port 5000 (or as configured in `gunicorn.conf.py`).

    **Note:** For a robust production deployment, consider using a reverse proxy like Nginx in front of Gunicorn for SSL termination, load balancing, and serving static files more efficiently.

## 6. API Endpoints

The backend provides a comprehensive set of RESTful API endpoints to manage users, restaurants, menu items, orders, reviews, payments, authentication, cart, and order tracking.

### User Management:

*   `GET /api/users`: Retrieve a list of all users.
*   `POST /api/users`: Create a new user.
*   `GET /api/users/<int:user_id>`: Retrieve details of a specific user.
*   `PUT /api/users/<int:user_id>`: Update an existing user.
*   `DELETE /api/users/<int:user_id>`: Delete a user.

### Restaurant Management:

*   `GET /api/restaurants`: Retrieve a list of restaurants (with optional filtering by `cuisine_type` or `search` query).
*   `POST /api/restaurants`: Create a new restaurant.
*   `GET /api/restaurants/<int:restaurant_id>`: Retrieve details of a specific restaurant.
*   `PUT /api/restaurants/<int:restaurant_id>`: Update an existing restaurant.
*   `DELETE /api/restaurants/<int:restaurant_id>`: Delete a restaurant.
*   `GET /api/restaurants/<int:restaurant_id>/menu`: Retrieve the menu items for a specific restaurant (with optional filtering by `category`).
*   `POST /api/restaurants/<int:restaurant_id>/menu`: Add a new menu item to a restaurant.
*   `PUT /api/menu-items/<int:item_id>`: Update an existing menu item.
*   `DELETE /api/menu-items/<int:item_id>`: Delete a menu item.

### Order Management:

*   `GET /api/orders`: Retrieve a list of orders (with optional filtering by `customer_id`, `restaurant_id`, `driver_id`, or `status`).
*   `POST /api/orders`: Create a new order.
*   `GET /api/orders/<int:order_id>`: Retrieve details of a specific order.
*   `PUT /api/orders/<int:order_id>/status`: Update the status of an order.
*   `PUT /api/orders/<int:order_id>/assign-driver`: Assign a driver to an order.
*   `POST /api/orders/<int:order_id>/review`: Add a review for a delivered order.
*   `GET /api/orders/available`: Retrieve a list of orders available for pickup by drivers.

### Payment Management:

*   `POST /api/create-payment-intent`: Creates a Stripe payment intent for an order.
*   `POST /api/confirm-payment`: Confirms payment and updates order status.
*   `POST /api/webhook`: Handles Stripe webhooks for payment status updates.
*   `GET /api/payment-methods`: Returns available payment methods.

### Authentication:

*   `POST /api/register`: Register a new user.
*   `POST /api/login`: Authenticate user and return JWT token.
*   `GET /api/profile`: Retrieve user profile based on JWT token.

### Cart Management:

*   `GET /api/cart`: Retrieve user's current cart.
*   `POST /api/cart/add`: Add item to cart.
*   `PUT /api/cart/update/<int:cart_item_id>`: Update cart item quantity.
*   `DELETE /api/cart/remove/<int:cart_item_id>`: Remove item from cart.
*   `DELETE /api/cart/clear`: Clear all items from cart.
*   `GET /api/cart/count`: Get total number of items in cart.

### Order Tracking:

*   `GET /api/orders/<int:order_id>/track`: Get real-time status of a specific order.
*   `GET /api/orders/active`: Get all active orders for a user.

## 7. Database Schema

The database schema is designed to support the core functionalities of the food delivery application. The main entities and their relationships are as follows:

*   **User:** Represents customers, restaurant owners, drivers, and administrators. Includes fields for authentication, personal information, and role-specific attributes.
*   **Restaurant:** Stores information about registered restaurants, including name, address, cuisine type, ratings, and owner details.
*   **MenuItem:** Contains details about food items offered by restaurants, such as name, description, price, category, and dietary information.
*   **Order:** Tracks customer orders, including status, delivery address, pricing, and associated customer, restaurant, and driver. Now includes enhanced payment fields (`payment_method`, `payment_status`, `payment_transaction_id`).
*   **OrderItem:** Represents individual items within an order, linking to menu items and specifying quantity and customizations.
*   **Review:** Stores customer feedback and ratings for restaurants and delivery drivers.
*   **Cart:** Stores user's active shopping cart, linked to a user and a restaurant.
*   **CartItem:** Represents individual items within a cart, linking to menu items and specifying quantity and customizations.

For detailed schema definitions, refer to the model files in `super_delivery_backend/src/models/`.

## 8. Contributing

We welcome contributions to the SUPER DELIVERY project! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

## 9. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (Note: A `LICENSE` file is not included in this repository by default. You may need to create one.)

## 10. Recent Improvements

This section highlights the significant enhancements made to the Super Delivery system across three phases of development.

### Phase 1: Core Functionality and Stability Enhancements

*   **Secure Payment Options**: Integrated Stripe for secure online payments, including API endpoints for payment intents, confirmations, and webhooks. The `Order` model was updated to track payment details.
*   **Payment Methods API**: Added a new API endpoint (`/api/payment-methods`) to list available payment options (credit/debit card, cash on delivery).
*   **Scalability and Production Readiness**: Configured the backend to use PostgreSQL for production environments and implemented Gunicorn for robust WSGI server deployment. Refactored the Flask application to use an application factory pattern and introduced `config.py` for environment-based configuration.
*   **New Files**: `super_delivery_backend/src/routes/payment.py`, `super_delivery_backend/config.py`, `super_delivery_backend/wsgi.py`, `super_delivery_backend/gunicorn.conf.py`.

### Phase 2: User Experience and System Reliability Improvements

*   **Enhanced Search Functionality**: Implemented a real-time `SearchBar` component with debounced search, auto-complete suggestions, and robust error handling.
*   **Interactive Order Management**: Developed a comprehensive order modal for menu browsing and placement, featuring quantity controls, client-side form validation, and real-time order summaries.
*   **Enhanced User Interface Components**: Introduced toast notifications for user feedback, loading spinners for better visual cues, and improved responsive design.
*   **Backend Error Handling System**: Created a centralized error handling blueprint with custom API error classes, structured logging, and graceful degradation mechanisms.
*   **Enhanced API Endpoints**: Improved restaurant routes with better error handling, pagination, and enhanced search capabilities with multiple criteria.

### Phase 3: Advanced Features and User Authentication

*   **Real-Time Order Tracking System**: Implemented backend API endpoints (`order_tracking.py`) for order status management and frontend components (`OrderTracking.jsx`, `ActiveOrders.jsx`) for real-time status display, estimated delivery times, and comprehensive order visibility.
*   **User Authentication and Authorization**: Developed a secure authentication system using JWT for stateless authentication. The `auth.py` blueprint provides endpoints for registration, login, logout, and profile management. Frontend includes a sophisticated `AuthModal` and `AuthContext` for state management.
*   **Persistent Cart Management**: Introduced dedicated database models (`Cart`, `CartItem`) and backend API endpoints (`cart.py`) for persistent shopping cart functionality. Frontend includes a comprehensive `CartModal` and `CartContext` for managing cart items, quantities, customizations, and real-time price calculations.
*   **Technical Architecture**: Significant database schema enhancements for cart and order tracking, adhering to RESTful API principles, and utilizing React context for efficient frontend state management.

## 11. Future Improvements and Remaining Limitations

While significant progress has been made, the Super Delivery system can be further enhanced with the following improvements and addresses some remaining limitations:

### Immediate Enhancement Opportunities:

*   **Database Schema Resolution**: Ensure robust database schema management for production deployment, especially concerning foreign key dependencies and initial data seeding.
*   **Comprehensive Error Logging**: Implement more detailed and centralized error logging for easier debugging and monitoring in production environments.
*   **Advanced Cart Features**: Add functionalities such as saved items, wish lists, and promotional code support to enhance the shopping experience.
*   **Real-time Notifications**: Enhance the order tracking system with real-time push notifications for status updates, beyond polling.
*   **Delivery Driver Integration**: Integrate with actual delivery driver systems or a dedicated driver app for real-time GPS tracking and efficient dispatch.
*   **Social Media Login**: Implement social media login options (e.g., Google, Facebook) for user convenience.
*   **Two-Factor Authentication (2FA)**: Enhance security with 2FA for user accounts.
*   **Advanced Profile Management**: Allow users to manage saved addresses, payment methods, and dietary preferences.
*   **Bulk Ordering Capabilities**: For business or large family orders.

### Long-term Strategic Developments:

*   **Mobile Application Development**: Create native iOS and Android applications for a richer mobile experience.
*   **Advanced Analytics and Reporting**: Implement dashboards for restaurant owners and administrators to track sales, popular dishes, and delivery performance.
*   **Integration with External Services**: Connect with inventory management systems, CRM platforms, and third-party logistics providers.
*   **Machine Learning Capabilities**: Introduce ML for personalized restaurant/dish recommendations, demand forecasting, and optimized delivery routes.
*   **Restaurant-Specific Features**: Implement features like dynamic pricing, specific delivery zones, and advanced menu customization options for restaurant owners.
*   **Comprehensive Testing**: Develop extensive unit, integration, and end-to-end tests to ensure system stability and reliability.
*   **Caching Mechanisms**: Implement caching at various layers (database, API, frontend) to improve performance and reduce load.
*   **Scalability Enhancements**: Further optimize the backend for high traffic, including load balancing and database replication strategies.

### Current Limitations:

*   **Initial Data Population**: The database currently lacks initial data for restaurants, menus, and users, requiring manual population for full functionality. This was a challenge during testing and needs a robust seeding mechanism.
*   **Payment Gateway Configuration**: While Stripe is integrated, it requires actual API keys and webhook setup for live transactions.
*   **Limited Admin/Driver Features**: The current focus has been on customer-facing features. Admin and driver functionalities are conceptualized but not fully implemented.
*   **No Real-time Communication**: Order tracking currently relies on polling; a WebSocket-based solution would provide true real-time updates.
*   **No User Interface for Order Creation (Admin/Restaurant)**: Orders can only be created via API for now, a UI for restaurant owners to manage incoming orders is needed.
*   **No Password Reset/Forgot Password Functionality**: This is a critical security feature missing from the authentication system.

This document will be updated as new features are implemented and the system evolves.

