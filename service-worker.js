/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["README.md","8b8803dcd7e37304b19b3359a2ea1bf9"],["css/main.css","4b6c461b17deff395833dc46b054f296"],["img/app_icon.png","68885546bf8e71d018c9ee6021f7a002"],["img/bus.svg","5d04abf29d24d3d12662705a36af47f6"],["img/map.svg","b7c418afe767e00d56c7792db604c25b"],["img/route.svg","13ad24b7a0cf78f1b508c0a7c1272699"],["img/tram.svg","58d8fa768b0f9cda0a3683ea772dda89"],["img/trolleybus.svg","498b9a015a513fde3f852b4c36e73dad"],["index.html","7159016aab8c7895878f8e5f55880789"],["js/SmoothWheelZoom.js","a877cd43668a84b17288fcfaef54d3c8"],["js/appscript.js","ba9bc69b098f4f2fdf27e9afe79d1481"],["js/event-listener-lines.js","6c0b245d385ec568f237552cb9dcc7e3"],["js/hide-layer-by-name.js","735bc81ab506371b764f39af24d82df6"],["js/init-map.js","f5e008fc97347d50899dc539c5dcaf1b"],["js/load-lines-and-stops.js","915ac75740e5023fa50b64fe078ef11b"],["js/opacity-control.js","c5f3a09e02e410abfe8987185c665a0d"],["js/show-all-layers.js","eb9ec9ab98de255be7f57e5312eca164"],["manifest.json","58b23fae58f2126ac37a041b96f1608b"],["plugins/leaflet-sidebar-v2-master/CHANGELOG.md","4df7bc677574f9d25a27d3e20061c7f8"],["plugins/leaflet-sidebar-v2-master/README.md","00ed3176b0c4a469ee70578690057a66"],["plugins/leaflet-sidebar-v2-master/bower.json","71992d2064a4100fae11915133f51464"],["plugins/leaflet-sidebar-v2-master/css/leaflet-sidebar.css","6d3e17e62b2396d9d550d41d01bc0318"],["plugins/leaflet-sidebar-v2-master/css/leaflet-sidebar.min.css","0d7ab150ca000f1acea4a86d7f9506c2"],["plugins/leaflet-sidebar-v2-master/examples/halfheight.html","409d26b1c8b5f8f955b585a8fe830b5b"],["plugins/leaflet-sidebar-v2-master/examples/index.html","24b00bc8634c822936c434f4bf783c77"],["plugins/leaflet-sidebar-v2-master/examples/leaflet-0.7.html","ae9ebc57ad645b078f3c39d45031232c"],["plugins/leaflet-sidebar-v2-master/examples/leaflet-latest.html","9b8db3210eb54321a5fdab6fa41e24df"],["plugins/leaflet-sidebar-v2-master/examples/position-right.html","d286f0e5172c97d3b805d7243f065957"],["plugins/leaflet-sidebar-v2-master/gulpfile.js","c8a7b58511cf958288b2d7a4fe8394b5"],["plugins/leaflet-sidebar-v2-master/index.d.ts","c32a704981aad5b609bf9b3a25418415"],["plugins/leaflet-sidebar-v2-master/js/leaflet-sidebar.js","b7d1e73f7ebeaa9d0aa5c6e96d4e5644"],["plugins/leaflet-sidebar-v2-master/js/leaflet-sidebar.min.js","9d58d358d39f23d8ac93b90fa2e067c1"],["plugins/leaflet-sidebar-v2-master/package.json","2e9787d883eed57baa5bb4dc89068361"],["plugins/leaflet-sidebar-v2-master/scss/_base.scss","8efc943233b72ed7df54f1ec252f85cc"],["plugins/leaflet-sidebar-v2-master/scss/leaflet-sidebar.scss","c93ac61a0ed3f974b921d95d69a0bea3"],["plugins/leaflet-sidebar-v2-master/yarn.lock","98c6555ab8ee8d284dcf2c8f78da4e20"]];
var cacheName = 'sw-precache-v3-sw-precache-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







