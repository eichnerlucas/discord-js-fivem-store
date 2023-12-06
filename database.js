const { createConnection } = require('mysql');
const { promisify } = require('util');

const SELECT_SCRIPTS = `SELECT * FROM scripts`;
const SELECT_SCRIPTS_BY_NAME = `${SELECT_SCRIPTS} WHERE name = ?`;
const SELECT_SUBS = `SELECT script, ip FROM subs`;
const SELECT_SUBS_BY_DISCORD_ID = `${SELECT_SUBS} WHERE discord_id = ?`;
const SELECT_SUBS_BY_DISCORD_ID_AND_NAME = `${SELECT_SUBS} WHERE discord_id = ? AND script = ?`;
const UPDATE_SUBS = `UPDATE subs SET`;
const UPDATE_SUBS_IP = `${UPDATE_SUBS} ip = ? WHERE discord_id = ? AND script = ?`;
const SELECT_PAYMENTS = `SELECT * FROM payments`;
const SELECT_PAYMENTS_BY_ID = `${SELECT_PAYMENTS} WHERE payment_id = ?`;
const SELECT_PAYMENTS_PENDING_BY_PIX = `${SELECT_PAYMENTS} WHERE status = "pending" AND type = "pix"`;
const UPDATE_PAYMENTS_STATUS = `UPDATE payments SET status = ?`;
const UPDATE_PAYMENTS_STATUS_BY_PAY_ID = `${UPDATE_PAYMENTS_STATUS} WHERE payment_id = ?`;
const UPDATE_PAYMENTS_STATUS_BY_EXTERNAL_REF = `${UPDATE_PAYMENTS_STATUS} WHERE external_ref = ?`;
const INSERT_SUBS = `INSERT INTO subs (discord_id, script) VALUES (?, ?)`;
const DELETE_SUBS = `DELETE FROM subs WHERE discord_id = ? AND script = ?`;

module.exports = class Database {
    constructor(data) {
        Database.instance = this;
        this.db = createConnection(data);
        this.db.connect();
        this.query = promisify(this.db.query.bind(this.db));
    }

    async executeQueryWithSingleParam(query, param) {
      return await this.query(query, [param]);
    }

    async executeQueryWithMultipleParams(query, params) {
        return await this.query(query, params);
    }

    async getScriptByName(name) {
        return this.executeQueryWithSingleParam(SELECT_SCRIPTS_BY_NAME, name);
    }

    async getAllScripts() {
        return this.executeQueryWithSingleParam(SELECT_SCRIPTS);
    }

    async getSubsByDiscordId(discord_id) {
        return this.executeQueryWithSingleParam(SELECT_SUBS_BY_DISCORD_ID, discord_id);
    }

    async getSubsByDiscordIdAndScriptName(name, discord_id) {
        return this.executeQueryWithMultipleParams(SELECT_SUBS_BY_DISCORD_ID_AND_NAME, [discord_id, name]);
    }

    async updateSubsIp(discord_id, script, ip) {
        return this.executeQueryWithMultipleParams(UPDATE_SUBS_IP, [ip, discord_id, script]);
    }

    async updatePaymentStatus(payment_id, status) {
        return this.executeQueryWithMultipleParams(UPDATE_PAYMENTS_STATUS_BY_PAY_ID, [status, payment_id]);
    }

    async updatePaymentStatusByExternalRef(external_ref, status) {
        return this.executeQueryWithMultipleParams(UPDATE_PAYMENTS_STATUS_BY_EXTERNAL_REF, [status, external_ref]);
    }

    async getPaymentById(id) {
        return this.executeQueryWithSingleParam(SELECT_PAYMENTS_BY_ID, id);
    }

    async getAllPixPaymentsPending() {
        return this.executeQueryWithSingleParam(SELECT_PAYMENTS_PENDING_BY_PIX);
    }

    async createSubscription(discord_id, script) {
        return this.executeQueryWithMultipleParams(INSERT_SUBS, [discord_id, script]);
    }

    async deleteSubscriptionByDiscordIdAndScript(discord_id, script) {
        return this.executeQueryWithMultipleParams(DELETE_SUBS, [discord_id, script]);
    }
};
