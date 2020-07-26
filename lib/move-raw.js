'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const util = require('util');

const globAsync = util.promisify(glob);

const OUT_DIR = '_delete';

async function moveRaw(rawExt) {
    const jpgFiles = await globAsync('*.jpg', {nocase: true});
    const jpgHash = jpgFiles.reduce((hash, jpgFile) => {
        hash[jpgFile.replace(/\.jpg$/i, '').toLowerCase()] = true;
        return hash;
    }, {});

    const rawFiles = await globAsync(`*.${rawExt}`, {nocase: true});
    const rawFilesToBeMoved = rawFiles.filter(rawFile =>
        !jpgHash[rawFile.replace(RegExp(`\.${rawExt}$`, 'i'), '').toLowerCase()]);

    try {
        const stat = fs.statSync(OUT_DIR);
        if (!stat.isDirectory()) {
            console.error(`Could not create output directory: ${OUT_DIR}`);
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.mkdirSync(OUT_DIR);
        } else {
            console.error(`Could not stat: ${OUT_DIR}`);
            process.exit(-1);
        }
    }

    rawFilesToBeMoved.forEach(rawFile => {
        fs.renameSync(rawFile, path.join(OUT_DIR, rawFile));
        console.log(`Moved: ${rawFile}`);
    });
}

module.exports = {
    moveRaw
};
