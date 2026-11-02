# Task Manager (Full-Stack)

A full-stack task manager where you can add, complete, and delete tasks. Data is stored in PostgreSQL.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL

## Features

- Create, read, update, and delete tasks through a REST API
- Mark tasks as done with a checkbox
- Data persists in a PostgreSQL database
- Database password kept out of the code with a `.env` file

## API endpoints

| Method | Route        | Description        |
|--------|--------------|--------------------|
| GET    | /tasks       | List all tasks     |
| GET    | /tasks/:id   | Get one task       |
| POST   | /tasks       | Create a task      |
| PUT    | /tasks/:id   | Update a task      |
| DELETE | /tasks/:id   | Delete a task      |

## How to run it

### 1. Database

Create a PostgreSQL database named `taskdb`, then run:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false
);
```

### 2. Backend

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend`:

```
DB_PASSWORD=your_postgres_password
```

Then start the server:

```bash
npm run dev
```

The API runs on http://localhost:3000.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## What I learned

Building this project refreshed my JavaScript fundamentals (async/await, array methods) and covered REST API design, SQL with parameterized queries, CORS, environment variables, and Git workflow.