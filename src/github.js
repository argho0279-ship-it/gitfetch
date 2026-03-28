import https from 'https';
import fs from 'fs';
import path from 'path';

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'GitFetch-CLI/1.0.0',
        'Accept': 'application/vnd.github.v3+json',
        ...headers,
      },
    };

    const req = https.get(url, opts, (res) => {
      let data = '';
      console.error(`[DEBUG] GitHub API Response: ${res.statusCode} ${res.statusMessage}`);
      console.error(`[DEBUG] Request URL: ${url}`);
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          console.error(`[DEBUG] Redirect to: ${res.headers.location}`);
          return httpGet(res.headers.location, headers).then(resolve).catch(reject);
        }
        if (res.statusCode === 404) {
          console.error(`[DEBUG] Repository not found at: ${url}`);
          return reject(new Error(`Repository not found (404). Check the URL and try again.\nURL: ${url}`));
        }
        if (res.statusCode === 403) {
          console.error(`[DEBUG] Rate limited or forbidden. Headers: ${JSON.stringify(res.headers)}`);
          return reject(new Error('GitHub API rate limit exceeded. Try again later or add a GitHub token.'));
        }
        if (res.statusCode !== 200) {
          console.error(`[DEBUG] API Error: ${res.statusCode} - ${data.substring(0, 200)}`);
          return reject(new Error(`GitHub API error: HTTP ${res.statusCode}\n${data.substring(0, 100)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error(`[DEBUG] JSON parse error: ${e.message}, data: ${data.substring(0, 100)}`);
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out after 15s'));
    });
  });
}

function parseGitHubUrl(input) {
  // Strip protocol and trailing slashes
  let url = input.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');

  console.error(`[DEBUG] Parsed URL: "${url}"`);
  
  const parts = url.split('/').filter(Boolean);
  console.error(`[DEBUG] URL parts: ${JSON.stringify(parts)}`);
  
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub URL. Format: github.com/owner/repo\nGot: "${input}"`);
  }

  console.error(`[DEBUG] Extracted owner: "${parts[0]}", repo: "${parts[1]}"`);
  return { owner: parts[0], repo: parts[1] };
}

async function fetchRepoMetadata(owner, repo, token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  return httpGet(url, headers);
}

async function fetchFileTree(owner, repo, sha = 'HEAD', token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
  const data = await httpGet(url, headers);

  if (data.truncated) {
    // For very large repos, fall back to root-only tree
    const rootUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`;
    return httpGet(rootUrl, headers);
  }

  return data;
}

async function fetchTreeForPath(owner, repo, sha, token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`;
  return httpGet(url, headers);
}

async function fetchFileContent(owner, repo, path, branch = 'HEAD', token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  return httpGet(url, headers);
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const file = fs.createWriteStream(destPath);

    const doGet = (targetUrl) => {
      https.get(targetUrl, { headers: { 'User-Agent': 'GitFetch-CLI/1.0.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    doGet(url);
  });
}

export {
  parseGitHubUrl,
  fetchRepoMetadata,
  fetchFileTree,
  fetchTreeForPath,
  fetchFileContent,
  downloadFile,
  httpGet,
};
