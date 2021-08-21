const os = require('os');

var Firecracker = require('../lib/firecracker');
var firecracker = new Firecracker({ socketPath: '/tmp/firecracker.socket' });

firecracker.bootSource({
  'kernel_image_path': os.tmpdir() + '/hello-vmlinux.bin',
  'boot_args': 'console=ttyS0 reboot=k panic=1 pci=off'
}).then(function () {
  var drive = firecracker.drive('rootfs');
  return drive.updatePreboot({
    'path_on_host': os.tmpdir() + '/hello-rootfs.ext4',
    'is_root_device': true,
    'is_read_only': false
  });
}).then(function () {
  return firecracker.action('InstanceStart');
}).then(function () {
  console.log('MicroVM booted!');
}).catch(function (err) {
  console.log(err);
});
