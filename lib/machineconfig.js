/**
 * @typedef MachineConfigInfo
 * @property {number} vcpu_count
 * @property {number} mem_size_mb
 * @property {boolean} ht_enabled
 * @property {boolean} track_dirty_pages
 */

/*
{
     *  vcpu_count: number,
        mem_size_mb: number,
        ht_enabled: boolean,
        track_dirty_pages: boolean,
     * }
*/

class MachineConfig {
    /**
     * @param {import("./modem"} modem Modem.
     */
    constructor(modem) {
        this.modem = modem;
    }

    /* @returns {Promise<MachineConfigInfo>}
     */
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
