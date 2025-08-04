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

## 1. Introduction

SUPER DELIVERY aims to revolutionize the food delivery experience by offering a user-friendly platform that prioritizes speed, efficiency, and customer satisfaction. The application supports various user roles, including customers, restaurant owners, and delivery drivers, each with tailored functionalities to streamline the ordering and delivery process. From browsing diverse cuisines to real-time order tracking, SUPER DELIVERY provides a complete solution for modern food delivery needs.

## 2. Features

### Customer Features:

*   **Intuitive Food Discovery:** Browse a wide selection of restaurants and cuisines.
*   **Advanced Search & Filtering:** Easily find desired meals by restaurant name, cuisine type, or dish.
*   **Real-time Order Tracking:** Monitor order status from preparation to delivery.
*   **Order Management:** View past orders and reorder favorite meals.
*   **Restaurant & Driver Reviews:** Provide feedback on food quality and delivery service.
*   **Secure Payment Options:** (Planned for future development) Integration with popular payment gateways.

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
*   **SQLite:** A lightweight, file-based SQL database used for development and testing. (Recommended to use PostgreSQL or MySQL for production).
*   **Flask-CORS:** A Flask extension for handling Cross-Origin Resource Sharing (CORS), enabling secure communication between frontend and backend.

### Other Tools & Libraries:

*   **Git:** Version control system for tracking changes and collaboration.
*   **GitHub:** Web-based platform for version control and collaborative software development.
*   **pnpm:** A fast, disk space efficient package manager for JavaScript.

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
│   └── requirements.txt          # Python dependencies
├── super_delivery_frontend/      # React Frontend Application
│   ├── public/
│   ├── src/
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
    The Flask application will automatically create the SQLite database (`app.db`) and tables when it runs for the first time. If you modify the database models, you might need to delete the `app.db` file to recreate the database with the new schema.
    ```bash
    rm src/database/app.db # Use with caution, this deletes all data
    ```

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

For production deployment, the React frontend needs to be built and served by the Flask backend.

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

4.  **Deploy the Full-Stack Application:**
    The application can be deployed using a WSGI server (e.g., Gunicorn) in a production environment. For simple deployments or testing, you can run the Flask app directly. The `main.py` is configured to serve the static files from the `src/static` directory.

    **Example (using Flask's built-in server for demonstration - NOT recommended for production):**
    ```bash
    cd SUPERDELIVERY/super_delivery_backend
    source venv/bin/activate
    python src/main.py
    ```
    The application will be accessible on the server's IP address and port 5000.

    **Note:** For a robust production deployment, consider using a production-ready WSGI server like Gunicorn or uWSGI, and a reverse proxy like Nginx.

## 6. API Endpoints

The backend provides a comprehensive set of RESTful API endpoints to manage users, restaurants, menu items, orders, and reviews.

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

## 7. Database Schema

The database schema is designed to support the core functionalities of the food delivery application. The main entities and their relationships are as follows:

*   **User:** Represents customers, restaurant owners, drivers, and administrators. Includes fields for authentication, personal information, and role-specific attributes.
*   **Restaurant:** Stores information about registered restaurants, including name, address, cuisine type, ratings, and owner details.
*   **MenuItem:** Contains details about food items offered by restaurants, such as name, description, price, category, and dietary information.
*   **Order:** Tracks customer orders, including status, delivery address, pricing, and associated customer, restaurant, and driver.
*   **OrderItem:** Represents individual items within an order, linking to menu items and specifying quantity and customizations.
*   **Review:** Stores customer feedback and ratings for restaurants and delivery drivers.

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

---

**Author:** Manus AI
**Live Application:** [https://mzhyi8cdq7qq.manus.space](https://mzhyi8cdq7qq.manus.space)




