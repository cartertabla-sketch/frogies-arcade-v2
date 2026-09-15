const express = require('express');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable cookie handling support
app.use(cookieParser());

// The actual target where your arcade games/content live
const TARGET_URL = 'https://web.app';

// Configure the proxy middleware layer
const proxySetting = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // If the browser sends cookies, securely forward them to the target server
    if (req.cookies) {
      const cookieString = Object.entries(req.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      proxyReq.setHeader('Cookie', cookieString);
    }
  }
});

// Protect internal routing paths from entering infinite loops
app.use((req, res, next) => {
  if (req.path !== '/404.html' && req.path !== '/redirect2' && req.path !== '/redirect10') {
    return proxySetting(req, res, next);
  }
  next();
});

// CRUCIAL FOR VERCEL: Export the app instead of using app.listen()
module.exports = app;

// fa-v2 portable deployable, run npm i express && npm i cookie-parser && npm i proxy-middleware && npm i path
