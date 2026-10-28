import { GenerateResponse, SQLDialect } from '@/types/sqlflow';

// Helper to check if a query is destructive
export function detectDestructiveOperation(sql: string): { isDestructive: boolean; action?: string } {
  const upper = sql.trim().toUpperCase();
  if (upper.startsWith('DELETE') || upper.includes(' DELETE FROM ')) {
    return { isDestructive: true, action: 'DELETE' };
  }
  if (upper.startsWith('DROP') || upper.includes(' DROP TABLE ') || upper.includes(' DROP DATABASE ')) {
    return { isDestructive: true, action: 'DROP' };
  }
  if (upper.startsWith('TRUNCATE') || upper.includes(' TRUNCATE TABLE ')) {
    return { isDestructive: true, action: 'TRUNCATE' };
  }
  if (upper.startsWith('UPDATE') || upper.includes(' UPDATE ')) {
    return { isDestructive: true, action: 'UPDATE' };
  }
  if (upper.startsWith('ALTER') || upper.includes(' ALTER TABLE ')) {
    return { isDestructive: true, action: 'ALTER' };
  }
  return { isDestructive: false };
}

// Dialect-specific limit formatting
export function formatLimitClause(dialect: SQLDialect, count: number, offset?: number): { prefix?: string; suffix?: string } {
  switch (dialect) {
    case 'sqlserver':
      return { prefix: `TOP (${count}) ` };
    case 'oracle':
      return { suffix: `\nFETCH FIRST ${count} ROWS ONLY` };
    case 'mysql':
    case 'sqlite':
    case 'postgresql':
    default:
      return { suffix: offset ? `\nLIMIT ${count} OFFSET ${offset}` : `\nLIMIT ${count}` };
  }
}

// Offline heuristic SQL synthesizer
export function generateHeuristicSql(
  prompt: string,
  dialect: SQLDialect,
  schema?: string
): GenerateResponse {
  const cleanPrompt = prompt.trim().toLowerCase();
  const rawPrompt = prompt.trim();

  // 1. Missing values / Delete rows with missing values
  if (cleanPrompt.includes('missing') && (cleanPrompt.includes('delete') || cleanPrompt.includes('remove') || cleanPrompt.includes('clean'))) {
    const isStudents = cleanPrompt.includes('student') || (schema && schema.toLowerCase().includes('students'));
    const isCustomers = cleanPrompt.includes('customer') || (schema && schema.toLowerCase().includes('customers'));
    const isOrders = cleanPrompt.includes('order') || (schema && schema.toLowerCase().includes('orders'));

    let tableName = 'students';
    let columns = ['name', 'email', 'age'];

    if (isCustomers) {
      tableName = 'customers';
      columns = ['first_name', 'email', 'city'];
    } else if (isOrders) {
      tableName = 'orders';
      columns = ['customer_id', 'total_amount', 'status'];
    }

    // Check if user specified a specific column
    if (cleanPrompt.includes('where email') || cleanPrompt.includes('with missing email')) {
      columns = ['email'];
    } else if (cleanPrompt.includes('where age') || cleanPrompt.includes('with missing age')) {
      columns = ['age'];
    }

    const whereClauses = columns.map((col, idx) => `  ${idx === 0 ? 'WHERE' : '   OR'} ${col} IS NULL`).join('\n');
    const sql = `DELETE FROM ${tableName}\n${whereClauses};`;

    return {
      sql,
      explanation: `Permanently deletes records from the '${tableName}' table where any of the critical columns (${columns.join(', ')}) contain a NULL value.`,
      assumptions: [
        `Assumed target table is '${tableName}' based on context.`,
        `Identified nullable attributes (${columns.join(', ')}) to check for missing values. Not all table columns were assumed missing to prevent accidental mass deletion.`,
        `Assumed missing values are represented as database NULLs rather than empty strings ('') or whitespace.`
      ],
      risks: [
        'DESTRUCTIVE: This query deletes rows permanently from your database.',
        'Ensure you have a recent backup or run a corresponding SELECT query first to inspect affected rows before executing DELETE.'
      ],
      isDestructive: true,
      destructiveAction: 'DELETE',
      dialect,
      engine: 'heuristic-engine',
      tableReferences: [tableName]
    };
  }

  // 2. Students scored above 80
  if (cleanPrompt.includes('student') && (cleanPrompt.includes('above 80') || cleanPrompt.includes('> 80') || cleanPrompt.includes('marks') || cleanPrompt.includes('score'))) {
    let sql = '';
    const hasGrades = schema && schema.toLowerCase().includes('grades');

    if (hasGrades || cleanPrompt.includes('grade')) {
      sql = `SELECT \n  s.id,\n  s.name,\n  s.email,\n  g.course_code,\n  g.score\nFROM students s\nINNER JOIN grades g ON s.id = g.student_id\nWHERE g.score > 80\nORDER BY g.score DESC;`;
    } else {
      sql = `SELECT \n  id,\n  name,\n  email,\n  gpa\nFROM students\nWHERE gpa > 3.2 OR score > 80\nORDER BY id ASC;`;
    }

    return {
      sql,
      explanation: 'Retrieves all student records whose assessment score or performance exceeds 80, ordered from highest score to lowest.',
      assumptions: [
        'Assumed grades are stored either in a related `grades` table joined on `student_id` or an attribute on `students`.',
        'Filtered strictly using score > 80 (exclusive). If 80 should be included, change to >= 80.'
      ],
      risks: [
        'Ensure an index exists on the score column to prevent a sequential full table scan on large student cohorts.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['students', hasGrades ? 'grades' : '']
    };
  }

  // 3. Top 10 customers by total spending
  if (cleanPrompt.includes('top 10') && (cleanPrompt.includes('customer') || cleanPrompt.includes('spending') || cleanPrompt.includes('spent'))) {
    let sql = '';
    if (dialect === 'sqlserver') {
      sql = `SELECT TOP (10)\n  c.customer_id,\n  c.first_name,\n  c.last_name,\n  c.email,\n  SUM(o.total_amount) AS total_spending\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.first_name, c.last_name, c.email\nORDER BY total_spending DESC;`;
    } else if (dialect === 'oracle') {
      sql = `SELECT \n  c.customer_id,\n  c.first_name,\n  c.last_name,\n  c.email,\n  SUM(o.total_amount) AS total_spending\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.first_name, c.last_name, c.email\nORDER BY total_spending DESC\nFETCH FIRST 10 ROWS ONLY;`;
    } else {
      sql = `SELECT \n  c.customer_id,\n  c.first_name,\n  c.last_name,\n  c.email,\n  SUM(o.total_amount) AS total_spending\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.first_name, c.last_name, c.email\nORDER BY total_spending DESC\nLIMIT 10;`;
    }

    return {
      sql,
      explanation: 'Aggregates historical order totals per customer using an INNER JOIN, sorts by aggregate spending in descending order, and caps the result set to the top 10.',
      assumptions: [
        'Filtered by `o.status = \'completed\'` to prevent cancelled or pending orders from artificially inflating customer lifetime value.',
        'Assumed monetary amounts reside in `orders.total_amount`.'
      ],
      risks: [
        'Grouping by non-indexed customer attributes across millions of order records may require a temporary hash table; an index on `orders(customer_id, total_amount)` is recommended.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['customers', 'orders']
    };
  }

  // 4. Count employees in each department
  if (cleanPrompt.includes('count') && cleanPrompt.includes('employee') && cleanPrompt.includes('department')) {
    const sql = `SELECT \n  d.department_id,\n  d.dept_name,\n  COUNT(e.emp_id) AS employee_count\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nGROUP BY d.department_id, d.dept_name\nORDER BY employee_count DESC;`;

    return {
      sql,
      explanation: 'Counts active employees associated with each department using a LEFT JOIN to ensure departments with zero employees are still reported with a count of 0.',
      assumptions: [
        'Used a LEFT OUTER JOIN rather than INNER JOIN so newly created departments with zero staff remain visible.',
        'Used `COUNT(e.emp_id)` rather than `COUNT(*)` so null employee rows contribute 0 instead of 1.'
      ],
      risks: [
        'Ensure `employees.department_id` is indexed for optimal join performance.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['departments', 'employees']
    };
  }

  // 5. Find duplicate email addresses
  if (cleanPrompt.includes('duplicate') && cleanPrompt.includes('email')) {
    let tableName = 'students';
    if (cleanPrompt.includes('customer') || (schema && schema.toLowerCase().includes('customers'))) {
      tableName = 'customers';
    } else if (cleanPrompt.includes('employee') || (schema && schema.toLowerCase().includes('employees'))) {
      tableName = 'employees';
    } else if (cleanPrompt.includes('user') || (schema && schema.toLowerCase().includes('users'))) {
      tableName = 'users';
    }

    const sql = `SELECT \n  email,\n  COUNT(*) AS occurrences\nFROM ${tableName}\nWHERE email IS NOT NULL\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC;`;

    return {
      sql,
      explanation: `Identifies non-null email addresses that appear more than once in the '${tableName}' table by aggregating rows and filtering with a HAVING clause.`,
      assumptions: [
        `Assumed target table is '${tableName}'.`,
        'Excluded NULL email records from grouping to focus solely on duplicate registered values.',
        'Assumed case-insensitive or normalized email storage.'
      ],
      risks: [
        'If email strings have differing casing (e.g. John@test.com vs john@test.com), consider wrapping in `LOWER(email)` if the collation is case-sensitive.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: [tableName]
    };
  }

  // 6. Update the status of all pending orders to completed
  if (cleanPrompt.includes('update') && cleanPrompt.includes('pending') && cleanPrompt.includes('order')) {
    const sql = `UPDATE orders\nSET status = 'completed'\nWHERE status = 'pending';`;

    return {
      sql,
      explanation: 'Updates all order records currently tagged with status \'pending\' to \'completed\'.',
      assumptions: [
        'Assumed status column is a string / varchar type named `status`.',
        'Targeted only rows where `status = \'pending\'` to prevent overwriting cancelled or archived orders.'
      ],
      risks: [
        'DESTRUCTIVE / MODIFICATION: This query updates existing database rows.',
        'If timestamps must be updated upon completion, consider appending `, updated_at = CURRENT_TIMESTAMP`.'
      ],
      isDestructive: true,
      destructiveAction: 'UPDATE',
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['orders']
    };
  }

  // 7. Join students with their department names
  if (cleanPrompt.includes('join') && cleanPrompt.includes('student') && cleanPrompt.includes('department')) {
    const sql = `SELECT \n  s.id AS student_id,\n  s.name AS student_name,\n  s.email,\n  d.name AS department_name,\n  d.faculty_lead\nFROM students s\nLEFT JOIN departments d ON s.department_id = d.department_id\nORDER BY s.name ASC;`;

    return {
      sql,
      explanation: 'Retrieves student details alongside their associated academic department name using a LEFT JOIN.',
      assumptions: [
        'Used a LEFT JOIN so undeclared or unassigned students without an active department are still included.',
        'Assumed foreign key relationship `students.department_id = departments.department_id`.'
      ],
      risks: [],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['students', 'departments']
    };
  }

  // 8. Find customers who have never placed an order
  if (cleanPrompt.includes('customer') && (cleanPrompt.includes('never') || cleanPrompt.includes('no order') || cleanPrompt.includes('without order'))) {
    let sql = '';
    // Provide clean LEFT JOIN with IS NULL
    sql = `SELECT \n  c.customer_id,\n  c.first_name,\n  c.last_name,\n  c.email,\n  c.created_at\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL\nORDER BY c.created_at DESC;`;

    return {
      sql,
      explanation: 'Finds customers with no associated order records by performing a LEFT JOIN to the orders table and filtering for rows where the foreign key remains NULL.',
      assumptions: [
        'Assumed customer identifier is `customer_id` present in both `customers` and `orders`.',
        'Utilized an anti-join pattern (`LEFT JOIN ... WHERE o.order_id IS NULL`) which database query planners optimize efficiently.'
      ],
      risks: [
        'Ensure an index exists on `orders(customer_id)` so the anti-join scan avoids iterating the entire orders table.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: ['customers', 'orders']
    };
  }

  // 9. Generic query synthesis for custom inputs
  const isSelect = !cleanPrompt.startsWith('delete') && !cleanPrompt.startsWith('update') && !cleanPrompt.startsWith('insert') && !cleanPrompt.startsWith('drop');
  
  if (isSelect) {
    // Determine inferred table
    let inferredTable = 'records';
    if (cleanPrompt.includes('student')) inferredTable = 'students';
    else if (cleanPrompt.includes('order')) inferredTable = 'orders';
    else if (cleanPrompt.includes('customer') || cleanPrompt.includes('user')) inferredTable = 'customers';
    else if (cleanPrompt.includes('employee') || cleanPrompt.includes('salary')) inferredTable = 'employees';
    else if (cleanPrompt.includes('product') || cleanPrompt.includes('item')) inferredTable = 'products';
    else if (schema) {
      const match = schema.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)/i);
      if (match && match[1]) inferredTable = match[1];
    }

    // Check limit
    let limitCount = 0;
    const limitMatch = cleanPrompt.match(/(?:top|limit|first)\s+(\d+)/);
    if (limitMatch && limitMatch[1]) {
      limitCount = parseInt(limitMatch[1], 10);
    }

    // Build dialect-specific query
    let sql = '';
    if (limitCount > 0) {
      if (dialect === 'sqlserver') {
        sql = `SELECT TOP (${limitCount}) *\nFROM ${inferredTable}\nORDER BY 1 DESC;`;
      } else if (dialect === 'oracle') {
        sql = `SELECT *\nFROM ${inferredTable}\nORDER BY 1 DESC\nFETCH FIRST ${limitCount} ROWS ONLY;`;
      } else {
        sql = `SELECT *\nFROM ${inferredTable}\nORDER BY 1 DESC\nLIMIT ${limitCount};`;
      }
    } else {
      sql = `SELECT *\nFROM ${inferredTable}\nLIMIT 50;`;
    }

    return {
      sql,
      explanation: `Generates a query to retrieve data from the '${inferredTable}' table based on your instruction: "${rawPrompt}".`,
      assumptions: [
        `Inferred target entity '${inferredTable}' from the natural language description.`,
        'Used wildcard `*` projection; in production environments, explicitly selecting specific columns is recommended for performance.'
      ],
      risks: [
        'Review the WHERE and ORDER BY clauses before running against large production tables.'
      ],
      isDestructive: false,
      dialect,
      engine: 'heuristic-engine',
      tableReferences: [inferredTable]
    };
  }

  // Generic fallback
  return {
    sql: `-- Query generated for: ${rawPrompt}\nSELECT * \nFROM my_table \nWHERE 1 = 1;`,
    explanation: `Interpreted instruction: "${rawPrompt}". Please refine your prompt or provide table schema to generate a more specific SQL query.`,
    assumptions: ['A generic template was generated because specific table or column entities could not be definitively matched.'],
    isDestructive: false,
    dialect,
    engine: 'heuristic-engine'
  };
}
