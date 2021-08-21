class MachineConfig {
    /**
     * @param {import("./modem"} modem Modem.
     */
    constructor(modem) {
        this.modem = modem;
    }

    get() {
        let optsf = {
            path: "/machine-config",
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

    update(data) {
        let optsf = {
            path: "/machine-config",
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Machine Configuration cannot be updated due to bad input"
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

    partialUpdate(data) {
        let optsf = {
            path: "/machine-config",
            method: "PATCH",
            data: data,
            statusCodes: {
                204: true,
                400: "Machine Configuration cannot be updated due to bad input"
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
}

module.exports = MachineConfig;
