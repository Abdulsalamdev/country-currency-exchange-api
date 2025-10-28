CREATE TABLE IF NOT EXISTS countries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_lc VARCHAR(255) NOT NULL,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT UNSIGNED NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DOUBLE,
  estimated_gdp DOUBLE,
  flag_url VARCHAR(1024),
  last_refreshed_at DATETIME,
  UNIQUE KEY unique_name (name_lc),
  INDEX idx_region (region),
  INDEX idx_currency (currency_code)
);
