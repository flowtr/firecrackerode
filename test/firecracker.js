const os = require("os");
const expect = require("chai").expect;
let firecracker = require("./helper").firecracker;
const path = require("path");

before(async () => {
    try {
        let process = await firecracker.spawn();
    } catch (err) {
        expect(err).to.be.null;
    }
});

after(() => {
    let killed = firecracker.kill();
    expect(killed).to.be.true;
});

describe("#firecracker", () => {
    describe("#images", () => {
        it("should download kernel & filesystem images", async () => {
            let kernelImg =
                "https://s3.amazonaws.com/spec.ccfc.min/img/hello/kernel/hello-vmlinux.bin";
            let rootImg =
                "https://s3.amazonaws.com/spec.ccfc.min/img/hello/fsfiles/hello-rootfs.ext4";

            try {
                await firecracker.downloadImage(
                    kernelImg,
                    path.resolve(os.tmpdir(), "hello-vmlinux.bin")
                );
                await firecracker.downloadImage(
                    rootImg,
                    path.resolve(os.tmpdir(), "hello-rootfs.ext4")
                );
            } catch (err) {
                expect(err).satisfy((value) => {
                    if (value === null || value == "File already exists") {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        });

        it("should use load the kernel image", async () => {
            try {
                await firecracker.bootSource({
                    kernel_image_path: path.resolve(
                        os.tmpdir(),
                        "hello-vmlinux.bin"
                    ),
                    boot_args: "console=ttyS0 reboot=k panic=1 pci=off"
                });
            } catch (err) {
                expect(err).to.be.null;
            }
        });

        it("should use load the filesystem image", async () => {
            let drive = firecracker.drive("rootfs");
            try {
                await drive.updatePreboot({
                    path_on_host: path.resolve(
                        os.tmpdir(),
                        "hello-rootfs.ext4"
                    ),
                    is_root_device: true,
                    is_read_only: false
                });
            } catch (err) {
                expect(err).to.be.null;
            }
        });
    });

    describe("#firecracker", () => {
        it("should get info", async () => {
            try {
                const data = await firecracker.info();
                expect(data).to.be.ok;
                expect(data.state).to.equal("Not started");
            } catch (err) {
                console.error(err);
                expect(err).to.be.null;
            }
        });

        it("should start microvm", async () => {
            try {
                await firecracker.action("InstanceStart");
                const data = await firecracker.info();
                expect(data).to.be.ok;
                expect(data.state).to.equal("Running");
            } catch (err) {
                expect(err).to.be.null;
            }
        });
    });

    describe("#machine-config", () => {
        it("should get machine-config", async () => {
            try {
                let machineConfig = firecracker.machineConfig();
                const data = await machineConfig.get();
                expect(data).to.be.ok;
                expect(data.vcpu_count).to.equal(1);
                expect(data.mem_size_mib).to.equal(128);
            } catch (err) {
                expect(err).to.be.null;
            }
        });

        it("should partially update machine-config", async () => {
            try {
                firecracker.kill();
                await firecracker.spawn();
                let machineConfig = firecracker.machineConfig();
                await machineConfig.partialUpdate({ mem_size_mib: 256 });
                machineConfig = firecracker.machineConfig();
                let data = await machineConfig.get();
                expect(data).to.be.ok;
                expect(data.vcpu_count).to.equal(1);
                expect(data.mem_size_mib).to.equal(256);
            } catch (err) {
                expect(err).to.be.null;
            }
        });
    });
});
