const { createConnection } = require("mysql");

module.exports = class MysqlManager {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.db = createConnection({
      host: this.config.database.host,
      port: this.config.database.port,
      user: this.config.database.user,
      password: this.config.database.password,
      database: this.config.database.name,
      charset: "utf8mb4",
    });
    this.client.db = this.db;
    this.client.db.connect();
  }
};
