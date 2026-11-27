# Campus Lost and Found Portal

## Project Overview

The **Campus Lost and Found Portal** is a full-stack web application developed for the **Web Technology and Internet Programming – Individual Project** at Sai University.

The application provides a centralized platform where students can report lost or found items, search and filter item listings, submit claims, and manage their reported items and claims.

The system uses a responsive frontend, a Node.js and Express.js backend, and MongoDB for persistent data storage.

---

## Problem Statement

Students often lose personal belongings on campus, while other students may find these items without knowing their owners.

The Campus Lost and Found Portal provides a centralized digital platform where users can:

- Report lost items
- Report found items
- Search available listings
- Filter items
- Submit claims
- Track claims
- Manage their personal listings

Administrators can review and manage claims and update item statuses.

---

## Objectives

- Provide a centralized platform for lost and found items.
- Allow users to register and log in securely.
- Allow users to report lost and found items.
- Provide search and filtering functionality.
- Allow users to submit claims for items.
- Allow administrators to approve or reject claims.
- Store application data using a persistent MongoDB database.
- Provide REST APIs for frontend-backend communication.
- Provide date-based sorting of item listings.

---

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript ES6+

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JSON Web Token (JWT)
- bcryptjs

### API Testing

- Postman

### Version Control

- Git
- GitHub

### Deployment

- Render

---

## Features

### 1. User Registration

Users can create an account by providing their name, email, and password.

### 2. User Login

Registered users can log in using their email and password.

JWT authentication is used for protected API operations.

### 3. Lost and Found Reporting

Users can report:

- Lost items
- Found items

Each item can contain:

- Item name
- Category
- Description
- Location
- Date
- Listing type
- Optional image

### 4. Search and Filtering

Users can search and filter item listings using:

- Keyword
- Category
- Location
- Listing type

### 5. Date Sorting

The application provides an additional date-sorting feature.

Users can sort items by:

- Newest
- Oldest

### 6. Claim Management

Users can submit claims for items.

Administrators can:

- Review claims
- Approve claims
- Reject claims
- Update item status

When a claim is approved, the corresponding item status is updated to **claimed**.

### 7. User Dashboard

Users can view their reported items and submitted claims.

### 8. Admin Dashboard

Administrators can manage claims and view basic information related to the application.

---

## Project Structure

```text
campus-lost-fount/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Claim.js
│   │   ├── Item.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminClaimRoutes.js
│   │   ├── authRoutes.js
│   │   ├── claimRoutes.js
│   │   └── itemRoutes.js
│   └── server.js
│
├── frontend/
│   ├── admin.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── report.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## REST API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Items

```text
POST /api/items
GET /api/items
GET /api/items/:id
PUT /api/items/:id
DELETE /api/items/:id
```

### Claims

```text
POST /api/claims
GET /api/claims/my
GET /api/claims
PUT /api/claims/:id/status
```

---

## Authentication and Security

The application implements authentication and authorization using JWT.

Passwords are hashed using bcryptjs before being stored in the database.

Protected API routes require a valid authentication token.

Administrative operations are restricted using role-based authorization.

Sensitive configuration such as database credentials and secret keys is stored using environment variables and should not be committed to GitHub.

---

## Database

MongoDB is used as the persistent database.

The main collections are:

### Users

Stores registered user information.

### Items

Stores lost and found item information.

### Claims

Stores claim requests submitted by users.

MongoDB ObjectId references are used to connect users, items, and claims.

---

## API Testing

The REST APIs were tested using **Postman**.

The testing includes:

- Invalid registration input
- Successful login
- Retrieving all items
- Retrieving a single item
- Claim submission
- Retrieving user claims
- Claim approval
- Protected API access

Both successful and error responses were tested.

---

## Sample Data

The application uses sample lost and found item records for testing features such as:

- Search
- Filtering
- Date sorting
- Item retrieval
- Claim management

At least 10 sample item records are used for project testing.

---

## Deployment

The application is deployed using **Render**.

### Deployed Application

https://campus-lost-and-found-portal-u942.onrender.com

### GitHub Repository

Paste your GitHub repository link here after creating the repository.

```text
YOUR GITHUB REPOSITORY LINK
```

---

## How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

### 2. Open the Project

```bash
cd campus-lost-fount
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file and configure the required environment variables such as:

```text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Do not upload the `.env` file containing real credentials to GitHub.

### 5. Start the Server

```bash
npm start
```

The application can then be accessed locally through the configured localhost port.

---

## Testing

The application was tested for:

- User registration
- User login
- Authentication
- Item creation
- Item retrieval
- Item search
- Item filtering
- Date sorting
- Claim submission
- Claim approval
- Claim rejection
- Protected API access

Postman was used for REST API testing.

---

## Project Requirements Covered

The project implements the following required functionality:

- Responsive home page
- User registration and login
- Protected user access
- Lost and found item reporting
- Search functionality
- Category filtering
- Location filtering
- Listing-type filtering
- Claim submission
- Claim approval/rejection
- User dashboard
- Admin dashboard
- MongoDB database
- REST APIs
- Authentication and authorization
- Postman API testing
- Additional date-sorting feature
- Sample item records
- GitHub version control
- Cloud deployment

---

## AI Use Disclosure

AI-assisted tools were used during the development and documentation process for activities such as understanding technical concepts, debugging, reviewing implementation approaches, generating or refining code examples, and preparing documentation.

The final implementation was reviewed and tested by the student. The student is responsible for understanding and explaining the submitted implementation during the individual demonstration and viva.

---

## Author

**A. Navya**

**Register Number:** 250200422

**Course:** B.Tech Computer Science

**University:** Sai University

**Academic Year:** 2026–2027

---

## License

This project was developed as an academic individual project for Sai University.
