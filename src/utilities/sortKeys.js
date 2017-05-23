/* @flow */

export default function sortKeys(object: {[key: string]: any}): Array<string> {
  return Object.keys(object).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}
