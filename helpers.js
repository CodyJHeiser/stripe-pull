import { Parser } from 'json2csv';
import jsonfile from "jsonfile";
import fs from "fs";

/**
 * Convert a nested object into a query string. 
 * Object properties are represented with square brackets. 
 * 
 * @param {Object} obj - The object to convert.
 * @param {string} [parentKey=''] - The key for the parent object in the current recursion (default is an empty string).
 * @returns {string} The query string representation of the object.
 */
export const stringifyNested = (obj, parentKey = '') => {
    let str = [];

    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            str.push(stringifyNested(obj[key], `${parentKey}${key}[`));
        } else {
            let adjustedKey = parentKey ? `${parentKey}${key}]` : key;
            str.push(`${adjustedKey}=${obj[key]}`);
        }
    }

    return str.join('&');
};

/**
 * Delay the execution of the next operation.
 * 
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} A Promise that resolves after the specified delay.
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Flattens a nested object into a single-level object. 
 * The resulting object keys are a concatenation of the original nested keys, separated by underscores.
 * Only up to a depth of 3 levels are flattened.
 *
 * @param {Object} obj - The object to flatten.
 * @param {string} [parentKey=''] - The key for the parent object in the current recursion (default is an empty string).
 * @param {number} [depth=1] - The current depth of recursion (default is 1).
 * @returns {Object} The flattened object.
 */
export const flattenObject = (obj, parentKey = '', depth = 1) => {
    let flatObject = {};

    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && depth <= 3) {
            let flatSubObject = flattenObject(obj[key], `${parentKey}${key}_`, depth + 1);
            flatObject = { ...flatObject, ...flatSubObject };
        } else {
            flatObject[`${parentKey}${key}`] = obj[key];
        }
    }

    return flatObject;
};

/**
 * Exports the given data to TSV and JSON files.
 * The objects in the data array are flattened before being exported.
 * The TSV and JSON files are saved with the given filename.
 * 
 * @param {Array} data - The data to export.
 * @param {string} filename - The filename to use for the exported files.
 * @returns {Promise} A Promise that resolves when the files have been written.
 */
export const exportData = async (data, filename) => {
    // Flatten the objects
    const flattenedData = data.map((item) => flattenObject(item));

    // Export to TSV
    const tsvParser = new Parser({ delimiter: '\t' });
    const tsv = tsvParser.parse(flattenedData);
    await fs.promises.writeFile(`${filename}.tsv`, tsv);

    // Export to JSON
    jsonfile.writeFileSync(`${filename}.json`, flattenedData, { spaces: 2 });
};