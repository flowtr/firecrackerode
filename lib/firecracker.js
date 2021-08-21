const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const Modem = require("./modem"),
    Drive = require("./drive"),
    Interface = require("./interface"),
    MMDS = require("./mmds"),
    MachineConfig = require("./machineconfig");

/**
 * @typedef BootSource
 * @property {string} kernel_image_path
 * @property {string} boot_args
 */

class Firecracker {
    /**
     * @param {ModemOptions} opts
     */
    constructor(opts) {
        this.options = opts;
        this.modem = new Modem(opts);
    }

    info() {
        let optsf = {
            path: "/",
            method: "GET",
            statusCodes: {
                200: true
            }
        };

        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * @param {string} action
     */
    action(action) {
        let optsf = {
            path: "/actions",
            method: "PUT",
            data: { action_type: action },
            statusCodes: {
                204: true,
                400: "The action cannot be executed due to bad input"
            }
        };

        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * @param {BootSource} data
     */
    bootSource(data) {
        let optsf = {
            path: "/boot-source",
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Boot source cannot be created due to bad input"
            }
        };

        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    mmds() {
        return new MMDS(this.modem);
    }

    /**
     * @param {string} id
     */
    drive(id) {
        return new Drive(this.modem, id);
    }

    interface(id) {
        return new Interface(this.modem, id);
    }

    machineConfig() {
        return new MachineConfig(this.modem);
    }

    logger(data) {
        let optsf = {
            path: "/logger",
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Logger cannot be initialized due to bad input."
            }
        };

        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    metrics(data) {
        let optsf = {
            path: "/metrics",
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Metrics system cannot be initialized due to bad input."
            }
        };

        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    vsock(data) {
        let optsf = {
            path: "/vsock",
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Vsock cannot be created due to bad input"
            }
        };
        return new Promise((resolve, reject) => {
            this.modem.dial(optsf, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * @param {string} url
     * @param {string} dest
     */
    downloadImage(url, dest) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                response.pipe(fs.createWriteStream(dest));

                response.on("end", () => {
                    resolve();
                });

                response.on("error", (err) => {
                    reject(err);
                });
            });
        });
    }

    /**
     * @param {string} binPath
     */
    spawn(binPath) {
        let self = this;
        binPath = binPath || "/usr/bin/firecracker";

        return new Promise((resolve, reject) => {
            self.child = child_process.spawn(
                binPath,
                ["--api-sock", self.options.socketPath],
                { detached: true }
            );

            self.child.on("exit", (code, signal) => {
                fs.unlink(self.options.socketPath, () => {});
                self.child = undefined;
            });

            self.child.on("close", (code, signal) => {
                fs.unlink(self.options.socketPath, () => {});
                self.child = undefined;
            });

            self.child.on("error", (err) => {
                fs.unlink(self.options.socketPath, () => {});
            });

            resolve(self.child);
        });
    }

    kill() {
        let killed = this.child.kill();
        if (killed === true) {
            fs.unlink(this.options.socketPath, () => {});
            this.child = undefined;
        }
        return killed;
    }
}

module.exports = Firecracker;
