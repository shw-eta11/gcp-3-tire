-- Drop existing tables to start fresh
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS categories;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table with foreign key relationship
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(500) NOT NULL,
    category_id INT NOT NULL,
    author VARCHAR(100) DEFAULT 'System',
    status ENUM('active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message (message, category_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
);

-- Insert Categories
INSERT INTO categories (id, name, description, color) VALUES
(1, 'General', 'General announcements and discussions', '#3498db'),
(2, 'Tech', 'Technology and development topics', '#e74c3c'),
(3, 'DevOps', 'DevOps and deployment topics', '#2ecc71'),
(4, 'Demo', 'Demo and example content', '#f39c12');

-- Insert Sample Messages
INSERT INTO messages (message, category_id, author) VALUES
('Welcome to our 3-tier app!', 1, 'System'),
('React + Node + MySQL is amazing!', 2, 'System'),
('Deploy me on ECS!', 3, 'System'),
('This is a sample message', 4, 'System'),
('Have fun with AWS ECS!', 3, 'System');
