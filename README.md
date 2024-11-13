# Expense_Tracker_API
(https://roadmap.sh/projects/expense-tracker-api)  
A RESTful API for managing personal expenses, built with Node.js, Express, and TypeORM.  

## Features

- User authentication and authorization
- Create, read, update, and delete expenses
- Categorize expenses
- Filter expenses by time periods (week, month, 3 months)
- Custom date range filtering
- Secure API endpoints
- TypeScript type safety

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

## Installation 
```sh
git clone https://github.com/garyeung/Expense_Tracker_API.git

cd Expense_Tracker_API

npm install 
```
After connecting your own database, creating your .env file according to the .env.example file

## Usage
```sh
npm run dev
npm run build
npm run start
npm run test
```
## API Endpoints
### Authentication
```sh

    POST /users/register - Register a new user
    POST /users/login - Login user
```

### Expenses
```sh
    POST /expenses - Create a new expense
    GET /expenses - Get all expenses
    GET /expenses/:id - Get specific expense
    PUT /expenses/:id - Update specific expense
    DELETE /expenses/:id - Delete specific expense
```

### Query Parameters for GET /expenses
```sh

    period: 'week' | 'month' | '3months'
    start: Start date (YYYY-MM-DD)
    end: End date (YYYY-MM-DD)
```

## Request & Response Examples
### Create Expense
```json

// POST /expenses
// Request
{
    "description": "Grocery shopping",
    "amount": 50.25,
    "category": "Food"
}

// Response
{
    "id": 1,
    "description": "Grocery shopping",
    "amount": 50.25,
    "category": "Food"
}
```

### Get Expenses
```json

// GET /expenses?period=week
// Response
[
    {
        "id": 1,
        "description": "Grocery shopping",
        "amount": 50.25,
        "category": "Food"
    },
    // ...
]
```

## Projet Structure
```
/api
  .env: port, jwt_secret, database config
  /src
    server: load routers, start server 
    /routes
      userRoute: Routing login, register
      expenseRoute: Routing expense CRUD with verifytoken

    /controllers
      userController: 
        register: create user in database and return a token
        login: authentication then return a token or not

      expenseController:
        createExpense
        updateExpense
        deleteExpense
        getExpenses
        getExpense
       
    /models
        all kinds of types and interfaces

    /services
        db.service: database connection 
        hash.service:  hashing password and compare passwords
        expense.server: expense table manipulation
        user.server: user table manipulation
        token.service: generate token and verify token
        env.service: environment validation

    /__tests__

    /@types
        express.d: declare request with payload called user

```

