CREATE DATABASE IF NOT EXISTS timebarrier_ts
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE timebarrier_ts;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  nick_name VARCHAR(255) NULL,
  signature TEXT NULL,
  avatar_url TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS target_subjects (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_target_subjects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_target_subjects_user_order (user_id, order_index, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('temporary', 'daily') NOT NULL,
  target_count INT NULL,
  deadline DATETIME(3) NULL,
  is_actived TINYINT(1) NOT NULL DEFAULT 1,
  is_finished TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_plans_user_type_finished_order (user_id, type, is_finished, order_index, created_at),
  INDEX idx_plans_user_finished_updated (user_id, is_finished, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS abilities (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  color VARCHAR(32) NULL,
  is_actived TINYINT(1) NOT NULL DEFAULT 1,
  is_finished TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_abilities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_abilities_user_finished_active_order (user_id, is_finished, is_actived, order_index, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS targets (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  target_subject_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  validity_type ENUM('time-bound', 'indefinite') NULL,
  validity DATETIME(3) NULL,
  color VARCHAR(32) NULL,
  is_actived TINYINT(1) NOT NULL DEFAULT 1,
  is_finished TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_targets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_targets_subject FOREIGN KEY (target_subject_id) REFERENCES target_subjects(id) ON DELETE SET NULL,
  INDEX idx_targets_user_finished_subject_order (user_id, is_finished, target_subject_id, order_index, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tomatoes (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_time DATETIME(3) NOT NULL,
  duration_ms BIGINT NOT NULL DEFAULT 0,
  color VARCHAR(32) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tomatoes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tomatoes_user_start (user_id, start_time),
  INDEX idx_tomatoes_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ability_plans (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  ability_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_ability_plans_ability FOREIGN KEY (ability_id) REFERENCES abilities(id) ON DELETE CASCADE,
  CONSTRAINT fk_ability_plans_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE KEY uk_ability_plans_pair (ability_id, plan_id),
  INDEX idx_ability_plans_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ability_targets (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  ability_id VARCHAR(64) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_ability_targets_ability FOREIGN KEY (ability_id) REFERENCES abilities(id) ON DELETE CASCADE,
  CONSTRAINT fk_ability_targets_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE,
  UNIQUE KEY uk_ability_targets_pair (ability_id, target_id),
  INDEX idx_ability_targets_target (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS target_plans (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  target_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_target_plans_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE,
  CONSTRAINT fk_target_plans_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE KEY uk_target_plans_pair (target_id, plan_id),
  INDEX idx_target_plans_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tomato_plans (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  tomato_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tomato_plans_tomato FOREIGN KEY (tomato_id) REFERENCES tomatoes(id) ON DELETE CASCADE,
  CONSTRAINT fk_tomato_plans_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE KEY uk_tomato_plans_pair (tomato_id, plan_id),
  INDEX idx_tomato_plans_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS milestones (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  target_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(32) NULL,
  is_finished TINYINT(1) NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_milestones_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE,
  INDEX idx_milestones_target_order (target_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS level_rules (
  level INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tomato_number INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS global_settings (
  name VARCHAR(191) NOT NULL PRIMARY KEY,
  value_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO level_rules (level, name, tomato_number)
VALUES
  (1, 'Novice', 0),
  (2, 'Apprentice', 5),
  (3, 'Practitioner', 20),
  (4, 'Expert', 60),
  (5, 'Master', 120),
  (6, 'Legend', 300),
  (7, 'Sentinel', 1000000)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  tomato_number = VALUES(tomato_number);

INSERT INTO global_settings (name, value_json)
VALUES ('closedBeta', CAST('true' AS JSON))
ON DUPLICATE KEY UPDATE value_json = VALUES(value_json);
