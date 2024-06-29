import { writeFileSync } from "node:fs";
import path from "node:path";

const updateElectronVendors = () => {
    const electronRelease = process.versions;

    const [node] = electronRelease.node.split('.');
    const chrome = electronRelease.v8.split('.').splice(0, 2).join('');
    const browserslistrcPath = path.resolve(process.cwd(), '.browserslistrc');

    writeFileSync(browserslistrcPath, `Chrome ${chrome}`, 'utf8');
    writeFileSync('config/electron/.vendors.cache.json', JSON.stringify({node, chrome}, null, 4));
}

updateElectronVendors();