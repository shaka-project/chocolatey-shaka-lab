/**
 * Copyright 2026 Google LLC
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

// Vercel entrypoint, wrapping express-chocolatey-server.

const express = require('express');
const fs = require('node:fs');

const chocolateyServer = require('express-chocolatey-server');

const app = express();
const port = process.env['PORT'] || 8000;

// Express middleware that logs all requests.
function loggingMiddleware(req, res, next) {
  console.log(req.method, req.path, req.query);
  next();
}

// Log requests.
app.use(loggingMiddleware);

// Load metadata about Chocolatey packages.
const packagePaths = fs.globSync('*.nupkg');
if (!packagePaths.length) {
  console.log('Please specify paths to Chocolatey packages.');
  process.exit(1);
}
const packageMetadataList = packagePaths.map((path) => {
  return chocolateyServer.readPackageMetadata(path);
});

console.log('Loaded packages:', packageMetadataList);

// Configure Chocolatey server routes at the root.
chocolateyServer.configureRoutes(app, packageMetadataList, {
	// Configure an explicit URL root, without which the server can't guess the
	// correct Vercel origin to construct absolute download URLs.
  urlRoot: 'https://chocolatey.shakalab.rocks',
});

// Start the server.
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

// Export it to Vercel.
module.exports = app;
