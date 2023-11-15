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
    const result = await this.query(`SELECT * FROM scripts`);
    return result;
  }

  async getSubsByDiscordId(discord_id) {
    const result = await this.query(`SELECT script, ip FROM subs WHERE discord_id = ?`, [discord_id]);
    return result;
  }

  async getSubsByDiscordIdAndScriptName(name, discord_id) {
    const result = await this.query(`SELECT script FROM subs WHERE discord_id = ? AND script = ?`, [discord_id, name]);
    return result[0];
  }

  async updateSubsIp(discord_id, script, ip) {
    const result = await this.query(`UPDATE subs SET ip = ? WHERE discord_id = ? AND script = ?`, [ip, discord_id, script]);
    return result;
  }

  async updatePaymentStatus(payment_id, status) {
    const result = await this.query(`UPDATE payments SET status = ? WHERE payment_id = ?`, [status, payment_id]);
    return result;
  }
  
  async getPaymentById(id) {
    const result = await this.query(`SELECT * FROM payments WHERE payment_id = ?`, [id]);
    return result;
  }

  async createSubscription(discord_id, script) {
    return await this.query(`INSERT INTO subs (discord_id, script) VALUES("${discord_id}", "${script}")`)
  }
  
  async deleteSubscriptionByDiscordIdAndScript(discord_id, script) {
    return await this.query(`DELETE FROM subs WHERE discord_id = "${discord_id}" AND script = "${script}"`)
  }
};
