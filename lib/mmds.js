class MMDS {
    /**
     */
    constructor(modem, opts) {
        this.modem = modem;
        this.opts = opts || {};
    }

    create(callback) {
        let optsf = {
            path: "/mmds",
            method: "PUT",
            data: {},
            statusCodes: {
                204: true,
                400: "MMDS data store cannot be created due to bad input."
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

    get() {
        let optsf = {
            path: "/mmds",
            method: "GET",
            statusCodes: {
                204: true,
                400: "Cannot get the MMDS data store due to bad input."
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
            path: "/mmds/",
            method: "PATCH",
            data: data,
            statusCodes: {
                204: true,
                400: "MMDS data store cannot be updated due to bad input."
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

module.exports = MMDS;
