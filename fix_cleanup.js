const fs = require('fs');
const path = 'node_modules/react-player';
try {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true, force: true });
        console.log('SUCCESS: Deleted react-player directory');
    } else {
        console.log('INFO: Directory does not exist');
    }
} catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
}
