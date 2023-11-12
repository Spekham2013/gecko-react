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

  // Look in the local credentials cache yaml file
  // Read the credentials yaml
  let credentials = yaml.load(fs.readFileSync('.cache/credentials.yaml', 'utf8'));
  if (credentials.zotero_api_key) {
    return credentials.zotero_api_key;
  }

  throw new Error('No Zotero API key found.');
}
