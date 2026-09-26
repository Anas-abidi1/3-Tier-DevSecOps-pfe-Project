# Setup MySQL in LINUX

```bash
sudo apt install mysql-server -y

sudo mysql -u root -p
```

Set a strong, unique root password (do not reuse this anywhere else, and don't commit it to any file or doc):

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'REPLACE_WITH_A_STRONG_UNIQUE_PASSWORD';
FLUSH PRIVILEGES;
EXIT;
```

Then create the database and a dedicated, least-privilege application user — the app should never connect as `root`:

```sql
-- Create the database if not already exists
CREATE DATABASE IF NOT EXISTS crud_app;

-- Create a dedicated user for the app instead of using root
CREATE USER 'crud_app_user'@'%' IDENTIFIED BY 'REPLACE_WITH_A_DIFFERENT_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON crud_app.* TO 'crud_app_user'@'%';
FLUSH PRIVILEGES;

-- Switch to the database
USE crud_app;

-- Drop table if needed (optional safety cleanup)
-- DROP TABLE IF EXISTS users;

-- Create the `users` table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Use the `crud_app_user` credentials (not root) in your `.env` / `api/.env` files as `DB_USER` / `DB_PASSWORD`.
