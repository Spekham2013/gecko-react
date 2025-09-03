import cookies from 'browser-cookies';
import * as fs from 'fs';
import yaml from 'js-yaml';

export function populateCredentialCookies

export function getZoteroApiKey() {
  // First, look in the credential cookie
  let cookie = cookies.get('gecko_zotero_key');
  // If cookie is defined, return it
  if (cookie) {
    return cookie;
  }
  else {
    // TODO let user add credentials on website
    throw new Error('No Zotero API key found.');
  }

  // Read the api key from the enviroment
  let credentials = {};
  credentials.zotero_api_key = process.env.API_KEY_ZOTERO;

  if (credentials.zotero_api_key) {
    return credentials.zotero_api_key;
  }

  throw new Error('No Zotero API key found.');
}
