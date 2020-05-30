import { isToken } from '../editor/jwt';

window.tabsToSubdomainsToHeadersToToken = {};

function saveTokensFromSentHeaders(details) {
  const subdomain = new URL(details.url).hostname;

  const headersToToken = details.requestHeaders
    .filter(header =>
      ["Authorization", "Permission"].includes(header.name)
      && isToken(stripBearer(header.value))
    )
    .reduce((headersToToken, header) => {
      return {
        ...headersToToken,
        [header.name]: stripBearer(header.value)
      };
    }, {});

  if (Object.keys(headersToToken).length) {
    window.tabsToSubdomainsToHeadersToToken[details.tabId] = window.tabsToSubdomainsToHeadersToToken[details.tabId] || {};
    window.tabsToSubdomainsToHeadersToToken[details.tabId][subdomain] = headersToToken;
  }
}

function stripBearer(str) {
  return str.replace(/^Bearer /, '')
}

chrome.webRequest.onSendHeaders.addListener(
  saveTokensFromSentHeaders,
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);
