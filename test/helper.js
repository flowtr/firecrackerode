let Firecracker = require("../lib/firecracker");
let firecracker = new Firecracker({ socketPath: "/tmp/firecracker.socket" });

module.exports = {
    firecracker: firecracker
};
