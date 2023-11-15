const mysql = require("mysql");

module.exports = class MysqlManager {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.db = null;
    this.init();
    this.loadEvents();
  }
  init() {
    this.db = mysql.createConnection({
      host: this.config.database.host,
      port: this.config.database.port,
      user: this.config.database.user,
      password: this.config.database.password,
      database: this.config.database.name,
      charset: "utf8mb4",
    });
    this.client.db = this.db;
    this.client.db.connect();

    setInterval(() => {
      console.log("[MYSQL] Ping!");
      this.reconectar();
    }, 4 * 60 * 60 * 1000);
  }
  reconectar() {
    this.db.destroy();
    this.init();
  }
  loadEvents() {
    this.db.on("connect", () => console.log("[MYSQL] Conectado!"));
    this.db.on("error", (erro) =>
      console.error("[MYSQL] Erro: " + erro.message)
    );
    this.db.on("end", () => this.reconectar());
  }
};
