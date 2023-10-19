/**
 * Shorthand function for document.querySelector().
 * @param {string} selector - The CSS selector to be used in document.querySelector().
 * @returns {Element|null} - The first Element within the document that matches the specified
 *                           selector, or null if no such element is found.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Return the URL parameter that corresponds to the provided name.
 * @param {string} name - Name of the paremter to be extracted from the URL.
 * @returns {string|undefined} - The URL parameter value extracted by name, or undefined if no such
 *                               such parameter is found.
 */
export function getURLParam(name) {
  return new URLSearchParams(location.search).get(name);
}

/**
 * Returns the URL parameters in an object { name: value } format.
 * @param {string} [url=window.location.href] - URL from which to extract parameters. Defaults to
 *                                              the current page's URL if not provided.
 * @returns {object} URL parameters in an object { name: value } format.
 */
export function getURLParams(url = window.location.href) {
  const params = {};
  const queryParams = new URL(url).searchParams;
  queryParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Encodes the provided parameters object in { name: value } format into a URL query string and
 * pushes it to the browser's history. This changes the URL without reloading the page.
 * @param {object} params - Object in { name: value } format to be encoded and pushed into the
 *                          browser's history.
 */
export function pushHistory(params) {
  const query = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  window.history.pushState('', document.title, `${window.location.pathname}?${query}`);
}

/**
 * Sends a POST request to the specified URL with the given data and processes the response.
 * @param {string} url - URL to send the REST to.
 * @param {object} restData - Data to be sent in the REST.
 * @param {function} callback - Function to process the response from the REST.
 */
export async function rest(url, restData, callback) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(restData),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Error: HTTP Status ${response.status}`);
    }
    const json = await response.json();
    callback(json);
  } catch (error) {
    callback({ 'error': error.toString() });
  }
}

/**
 * Convert provided dash-case string to camelCase string and return it.
 * @param {string} str - dash-case string.
 * @returns {string} - camelCase string.
 */
export function dashToCamel(str) {
  return str.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

/**
 * Convert provided camelCase string to dash-case string and return it.
 * @param {string} str - camelCase string.
 * @returns {string} - dash-case string.
 */
export function camelToDash(str) {
  let converted = str.replace(/([A-Z])/g, '-$1').toLowerCase();
  return converted.replace(/^-/, '');  // Corrected to remove a leading dash if present
}

/**
 * Convert provided snake_case string to dash-case string and return it.
 * @param {string} str - snake_case string.
 * @returns {string} - dash-case string.
 */
export function snakeToDash(str) {
  return str.replace(/_/g, '-');
}

/**
 * Take datetime string in '2023-12-24T00:00:00.000Z' format and return it in
 * '2023-12-24 00:00:00 +0000' format in the user's timezone.
 * @param {string} datetime - Datetime string in '2023-12-24T00:00:00.000Z' format.
 * @returns {string} - Datetime string in '2023-12-24 00:00:00 +0000' format.
 */
export function formatUTCDateTime(datetime) {
    const date = new Date(datetime);

    // Calculate local datetime
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Calculate timezone offset in hours and minutes
    const offset = -date.getTimezoneOffset();
    const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
    const offsetSign = offset >= 0 ? '+' : '-';

    // Format date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${offsetSign}${offsetHours}:${offsetMinutes}`;
}
