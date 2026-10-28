import { DialectInfo, ExamplePrompt, SchemaPreset, SQLDialect } from '@/types/sqlflow';

export const SQL_DIALECTS: DialectInfo[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    version: '16.x',
    description: 'Modern standard SQL with robust JSON, CTEs, and window functions',
    badge: 'PG 16'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    version: '8.0+',
    description: 'Fast, ubiquitous web database with standard ANSI/ISO compliance',
    badge: 'MySQL 8'
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    version: '3.40+',
    description: 'Embedded, serverless SQL engine perfect for apps and analytics',
    badge: 'SQLite 3'
  },
  {
    id: 'sqlserver',
    name: 'Microsoft SQL Server',
    version: 'T-SQL 2022',
    description: 'Enterprise relational database using Transact-SQL syntax & TOP clauses',
    badge: 'MS SQL'
  },
  {
    id: 'oracle',
    name: 'Oracle Database',
    version: '23c / 19c',
    description: 'Enterprise high-scale database using PL/SQL conventions & FETCH FIRST',
    badge: 'Oracle'
  }
];

export const SCHEMA_PRESETS: SchemaPreset[] = [
  {
    id: 'students',
    name: 'University & Students',
    description: 'Students, courses, grades, and department relationships',
    ddl: `-- Table: students
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  age INT,
  department_id INT,
  gpa DECIMAL(3, 2),
  enrolled_date DATE
);

-- Table: departments
CREATE TABLE departments (
  department_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  faculty_lead VARCHAR(100),
  budget DECIMAL(12, 2)
);

-- Table: grades
CREATE TABLE grades (
  grade_id INT PRIMARY KEY,
  student_id INT REFERENCES students(id),
  course_code VARCHAR(10),
  score INT, -- 0 to 100
  semester VARCHAR(20)
);`
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Customers, orders, products, and order items',
    ddl: `-- Table: customers
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  city VARCHAR(50),
  created_at TIMESTAMP
);

-- Table: orders
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  order_date TIMESTAMP,
  status VARCHAR(20), -- 'pending', 'completed', 'cancelled'
  total_amount DECIMAL(10, 2)
);

-- Table: order_items
CREATE TABLE order_items (
  item_id INT PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  product_name VARCHAR(100),
  quantity INT,
  unit_price DECIMAL(10, 2)
);`
  },
  {
    id: 'hr_company',
    name: 'Company & Employees',
    description: 'Employees, departments, job titles, and compensation',
    ddl: `-- Table: employees
CREATE TABLE employees (
  emp_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  department_id INT,
  salary DECIMAL(10, 2),
  hire_date DATE
);

-- Table: departments
CREATE TABLE departments (
  department_id INT PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL,
  location VARCHAR(100)
);`
  }
];

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'ex-1',
    category: 'Reporting',
    title: 'Top scoring students',
    prompt: 'Show all students who scored above 80.',
    dialect: 'postgresql',
    schemaContext: 'students'
  },
  {
    id: 'ex-2',
    category: 'Analytics',
    title: 'Top 10 spending customers',
    prompt: 'Find the top 10 customers by total spending.',
    dialect: 'postgresql',
    schemaContext: 'ecommerce'
  },
  {
    id: 'ex-3',
    category: 'Analytics',
    title: 'Department employee headcount',
    prompt: 'Count employees in each department.',
    dialect: 'postgresql',
    schemaContext: 'hr_company'
  },
  {
    id: 'ex-4',
    category: 'Clean-up',
    title: 'Find duplicate emails',
    prompt: 'Find duplicate email addresses.',
    dialect: 'postgresql',
    schemaContext: 'students'
  },
  {
    id: 'ex-5',
    category: 'Clean-up',
    title: 'Delete rows with missing values',
    prompt: 'Delete rows with missing values from the students table.',
    dialect: 'postgresql',
    schemaContext: 'students',
    isDestructive: true
  },
  {
    id: 'ex-6',
    category: 'Updates',
    title: 'Update pending orders',
    prompt: 'Update the status of all pending orders to completed.',
    dialect: 'postgresql',
    schemaContext: 'ecommerce',
    isDestructive: true
  },
  {
    id: 'ex-7',
    category: 'Joins',
    title: 'Join students with departments',
    prompt: 'Join students with their department names.',
    dialect: 'postgresql',
    schemaContext: 'students'
  },
  {
    id: 'ex-8',
    category: 'Analytics',
    title: 'Customers without orders',
    prompt: 'Find customers who have never placed an order.',
    dialect: 'postgresql',
    schemaContext: 'ecommerce'
  }
];
