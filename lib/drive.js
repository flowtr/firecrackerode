/**
 * @typedef Preboot
 * @property {string} path_on_host
 * @property {boolean} is_root_device
 * @property {boolean} is_read_only
 */

class Drive {
    /**
     * @param {import("./modem")} modem
     */
    constructor(modem, drive_id) {
        this.id = drive_id;
        this.modem = modem;
    }

    /**
     * @param {Preboot} data
     */
    updatePreboot(data) {
        data.drive_id = this.id;

        let optsf = {
            path: "/drives/" + this.id,
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Drive cannot be created/updated due to bad input"
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

    updatePostboot(data) {
        data.drive_id = this.id;

        let optsf = {
            path: "/drives/" + this.id,
            method: "PATCH",
            data: data,
            statusCodes: {
                204: true,
                400: "Drive cannot be updated due to bad input"
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

module.exports = Drive;
