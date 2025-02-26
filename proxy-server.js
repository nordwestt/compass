const express = require("express");
const app = express();
const port = 3001;

app.use(express.json());

app.use((req, res, next) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    const requestedHeaders = req.headers["access-control-request-headers"];
    res.header({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        requestedHeaders ||
        "Authorization, Content-Type, X-Requested-With, Prefer, Accept, Origin, Cache-Control",
      "Access-Control-Max-Age": "86400",
    });
    return res.sendStatus(200);
  }
  next();
});

app.all("*", async (req, res) => {
  try {
    const targetURL = decodeURIComponent(req.path.slice(1));
    if (!targetURL) {
      return res.status(400).send("Please specify a URL to proxy");
    }

    // Convert localhost URLs to use IPv4 explicitly
    const modifiedURL = targetURL.replace('localhost', '127.0.0.1');

    // Clone headers and remove host to avoid conflicts
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];
    delete headers["transfer-encoding"];

    const response = await fetch(modifiedURL, {
      method: req.method,
      headers: headers,
      body: ["POST", "PUT", "PATCH"].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    });

    // Copy over the response headers, excluding CORS headers
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!key.toLowerCase().startsWith("access-control-")) {
        res.setHeader(key, value);
      }
    });

    // Add CORS headers
    res.header({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, Content-Type, X-Requested-With, Prefer, Accept, Origin, Cache-Control",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Proxy Error: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
