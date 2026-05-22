const { pool, testConnection } = require("./db");

const createTables = async () => {
	await testConnection();

	const queries = [
		`CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      username    VARCHAR(100)  NOT NULL UNIQUE,
      email       VARCHAR(191)  NOT NULL UNIQUE,
      password    VARCHAR(255)  NOT NULL,
      created_at  DATETIME      DEFAULT NOW()
    )`,

		`CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT           NOT NULL,
      token       VARCHAR(512)  NOT NULL UNIQUE,
      expires_at  DATETIME      NOT NULL,
      created_at  DATETIME      DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

		`CREATE TABLE IF NOT EXISTS contacts (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      user_id           INT           NOT NULL,
      name              VARCHAR(100)  NOT NULL,
      surname           VARCHAR(100)  NOT NULL,
      email             VARCHAR(191)  NOT NULL,
      telegram_chat_id  BIGINT        DEFAULT NULL,
      invite_token      VARCHAR(64)   UNIQUE,
      invite_status     ENUM('pending','accepted') DEFAULT 'pending',
      created_at        DATETIME      DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

		`CREATE TABLE IF NOT EXISTS reports (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT           NOT NULL,
      category    ENUM('harassment','suspicious_person','dangerous_area','other') NOT NULL,
      description TEXT          DEFAULT NULL,
      location    VARCHAR(255)  NOT NULL,
      photo_url   VARCHAR(500)  DEFAULT NULL,
      created_at  DATETIME      DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

		`CREATE TABLE IF NOT EXISTS sos_events (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT           NOT NULL,
      session_id  VARCHAR(64)   NOT NULL UNIQUE,
      lat         DECIMAL(9,6)  DEFAULT NULL,
      lng         DECIMAL(9,6)  DEFAULT NULL,
      status      ENUM('active','resolved') DEFAULT 'active',
      created_at  DATETIME      DEFAULT NOW(),
      resolved_at DATETIME      DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
	];

	for (const query of queries) {
		await pool.query(query);
	}

	console.log("Все таблицы успешно созданы");
	process.exit(0);
};

createTables().catch((err) => {
	console.error("Миграция не удалась:", err);
	process.exit(1);
});
