let http = require("http"),
    debug = require("debug")("modem"),
    util = require("util");

/**
 * @typedef ModemOptions
 * @property socketPath {string}
 * @property timeout {number | undefined}
 * @property connectionTimeout {number | undefined}
 * @property headers {Record<string,string> | undefined}
 */

class Modem {
    /**
     * @param {ModemOptions} options
     */
    constructor(options) {
        /**
         * @type {string}
         * @private
         */
        this.socketPath = options.socketPath;
        /**
         * @type {number}
         * @private
         */
        this.timeout = options.timeout;
        /**
         * @type {number}
         * @private
         */
        this.connectionTimeout = options.connectionTimeout;
        /**
         * @type {Record<string,string>}
         * @private
         */
        this.headers = options.headers || {};
    }

    dial(options, callback) {
        let data;
        let self = this;

        let optionsf = {
            path: options.path,
            method: options.method,
            headers: options.headers || Object.assign({}, self.headers)
        };

        optionsf.headers["Content-Type"] = "application/json";

        if (options.data) {
            data = JSON.stringify(options.data);
            optionsf.headers["Content-Length"] = Buffer.byteLength(data);
        }

        optionsf.socketPath = this.socketPath;

        this.buildRequest(optionsf, options, data, callback);
    }

    buildRequest(options, context, data, callback) {
        let self = this;
        let connectionTimeoutTimer;

        let req = http.request(options, () => {});

        debug(
            "Sending: %s",
            util.inspect(options, {
                showHidden: true,
                depth: null
            })
        );

        if (self.connectionTimeout) {
            connectionTimeoutTimer = setTimeout(() => {
                debug(
                    "Connection Timeout of %s ms exceeded",
                    self.connectionTimeout
                );
                req.abort();
            }, self.connectionTimeout);
        }

        if (self.timeout) {
            req.on("socket", (socket) => {
                socket.setTimeout(self.timeout);
                socket.on("timeout", () => {
                    debug("Timeout of %s ms exceeded", self.timeout);
                    req.abort();
                });
            });
        }

        req.on("connect", () => {
            clearTimeout(connectionTimeoutTimer);
        });

        req.on("disconnect", () => {
            clearTimeout(connectionTimeoutTimer);
        });

        req.on("response", (res) => {
            clearTimeout(connectionTimeoutTimer);

            let chunks = [];
            res.on("data", (chunk) => {
                chunks.push(chunk);
            });

            res.on("end", () => {
                let buffer = Buffer.concat(chunks);
                let result = buffer.toString();

                debug("Received: %s", result);

                let json;
                try {
                    json = JSON.parse(result);
                } catch (e) {
                    json = null;
                }
                self.buildPayload(
                    null,
                    context.statusCodes,
                    res,
                    json,
                    callback
                );
            });
        });

        req.on("error", (error) => {
            clearTimeout(connectionTimeoutTimer);
            self.buildPayload(error, context.statusCodes, {}, null, callback);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    }

    buildPayload(err, statusCodes, res, json, cb) {
        if (err) return cb(err, null);

        if (statusCodes[res.statusCode] !== true) {
            let msg = new Error(
                "(HTTP code " +
                    res.statusCode +
                    ") " +
                    (statusCodes[res.statusCode] || "unexpected") +
                    " - " +
                    (json.fault_message || json) +
                    " "
            );
            msg.reason = statusCodes[res.statusCode];
            msg.statusCode = res.statusCode;
            msg.json = json;
            cb(msg, null);
        } else {
            cb(null, json);
        }
    }
}

module.exports = Modem;
