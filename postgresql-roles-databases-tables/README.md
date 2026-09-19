# PostgreSQL Practice Assignment — Roles, Authentication, Databases & Table Creation

## Task 1 — `library_guest`

### Question

Why did the connection fail when trying to connect as `library_guest`?

### Answer

The connection failed because the `library_guest` role was created without the `LOGIN` attribute. Therefore, this role cannot log in to PostgreSQL.

---

## Task 2 — `library_staff`

### Question

What is the difference between `library_guest` and `library_staff`?

### Answer

`library_guest` was created without the `LOGIN` attribute, so it cannot log in to PostgreSQL.

`library_staff` was created with the `LOGIN` attribute and a `PASSWORD`, so it can log in to PostgreSQL. It was also granted `SELECT` permission on the `books` table, allowing it to read the table's data.

### Result

The login attempt for `library_guest` failed because the role does not have the `LOGIN` privilege. The login for `library_staff` was successful, and its `SELECT` privilege allowed it to read the data from the `books` table.

---

## Task 4 — Data Type Justification

### Question

Why were these data types selected for `price`, `in_stock`, and `added_at`?

### Answer

**`price` — `NUMERIC(10,2)`**
I selected this type because the price should be stored as an exact dollar/cent value without floating-point rounding errors. `10` represents the maximum total number of digits, while `2` represents the number of digits after the decimal point. Therefore, it can store up to 8 digits before the decimal point and 2 digits after it.

**`in_stock` — `BOOLEAN`**
I selected this type because the column is intended to store only two logical values: available (`true`) or unavailable (`false`).

**`added_at` — `TIMESTAMP WITH TIME ZONE`**
I selected this type because it is used to store the exact date and time when a book was added, together with its time zone information.

---

## Task 6 — Privileges

### Question

How is the result related to the privilege granted to `library_staff`?

### Answer

Only the `SELECT` privilege was granted to `library_staff`. Therefore, the role was able to read the data from the `books` table, but the `INSERT` command failed with a `permission denied` error.

### Result

The role has only the necessary **read access** and cannot modify the data in the `books` table. This demonstrates the **principle of least privilege**.
