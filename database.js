const { createConnection } = require('mysql');
const { promisify } = require('util');

module.exports = class Database {
  constructor(data) {
    Database.instance = this;

    this.db = createConnection(data);
    this.db.connect();
    this.query = promisify(this.db.query.bind(this.db));
  }

  async getScriptByName(name) {
    const result = await this.query(`SELECT * FROM scripts WHERE name = ?`, [name]);
    return result[0];
  }

  async getAllScripts() {
    return await this.query(`SELECT * FROM scripts`);
  }

  async getSubsByDiscordId(discord_id) {
    return await this.query(`SELECT script, ip FROM subs WHERE discord_id = ?`, [discord_id]);
  }

  async getSubsByDiscordIdAndScriptName(name, discord_id) {
    const result = await this.query(`SELECT script FROM subs WHERE discord_id = ? AND script = ?`, [discord_id, name]);
    return result[0];
  }

  async updateSubsIp(discord_id, script, ip) {
    return await this.query(`UPDATE subs SET ip = ? WHERE discord_id = ? AND script = ?`, [ip, discord_id, script]);
  }

  async updatePaymentStatus(payment_id, status) {
    return await this.query(`UPDATE payments SET status = ? WHERE payment_id = ?`, [status, payment_id]);
  }

  async updatePaymentStatusByExternalRef(external_ref, status) {
    return await this.query(`UPDATE payments SET status = ? WHERE external_ref = ?`, [status, external_ref]);
  }
  
  async getPaymentById(id) {
    return await this.query(`SELECT * FROM payments WHERE payment_id = ?`, [id]);
  }

  async getAllPaymentsPending() {
    return await this.query(`SELECT * FROM payments WHERE status = "pending"`);
  }

  async createSubscription(discord_id, script) {
    return await this.query(`INSERT INTO subs (discord_id, script) VALUES(?, ?)`, [discord_id, script])
  }
  
  async deleteSubscriptionByDiscordIdAndScript(discord_id, script) {
    return await this.query(`DELETE FROM subs WHERE discord_id = ? AND script = ?`, [discord_id, script])
  }
};
