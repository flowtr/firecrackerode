class Interface {
    /**
     * @param {import("./modem")} modem
     * @param {string} interface_id
     */
    constructor(modem, interface_id) {
        this.id = interface_id;
        this.modem = modem;
    }

    create(data) {
        data.iface_id = this.id;

        let optsf = {
            path: "/network-interfaces/" + this.id,
            method: "PUT",
            data: data,
            statusCodes: {
                204: true,
                400: "Network interface cannot be created due to bad input"
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
        data.iface_id = this.id;

        let optsf = {
            path: "/network-interfaces/" + this.id,
            method: "PATCH",
            data: data,
            statusCodes: {
                204: true,
                400: "Network interface cannot be updated due to bad input"
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

module.exports = Interface;
