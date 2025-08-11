# Security Vulnerability Fix: Exposed API Token

This document outlines a critical security vulnerability that was identified and fixed in the frontend application. It also details the necessary backend changes required to restore full functionality securely.

## 1. The Vulnerability

A critical security vulnerability was discovered where the Strapi API token (`VITE_API_TOKEN`) was being exposed to the client-side (browser).

- **How it happened:** The token was loaded from an environment variable prefixed with `VITE_`, which makes it accessible in the browser. This token was then used in an `Authorization` header for all API requests to the Strapi content service.
- **The risk:** Exposing this token allowed any user of the web application to find it and use it to perform unauthorized actions on the Strapi API. Depending on the token's permissions, this could lead to data theft, content modification, or deletion.

## 2. The Immediate Fix (Frontend)

To immediately mitigate this risk, the following changes were made to the frontend codebase:

1.  **Removed the API Token from the Client:** The `Authorization` header containing the token was removed from the `api-client.ts` service.
2.  **Removed Token from Environment Config:** The `VITE_API_TOKEN` is no longer read in `env.config.ts`, ensuring it is not bundled in the client-side code.
3.  **Added Graceful Error Handling:** The UI has been updated to handle the resulting API failures gracefully, showing error messages instead of crashing.

**Result:** The security vulnerability is fixed. However, all features that rely on the Strapi API (e.g., articles, courses, podcasts) are currently non-functional.

## 3. Required Backend Changes (Action Needed)

To restore functionality, the API requests to Strapi must be proxied through a secure backend service. The existing `@webetter-user-service` (Next.js) is the ideal place for this.

The backend team needs to implement a new API route in the user service that will:
1.  Receive a request from the frontend application.
2.  Add the secret `STRAPI_API_TOKEN` on the server-side.
3.  Forward the request to the Strapi API.
4.  Return the response from the Strapi API to the frontend.

### Example Implementation (Next.js API Route)

Here is a conceptual example of what this proxy route might look like in the Next.js service (e.g., in a file like `pages/api/content/[...path].ts`):

```typescript
// pages/api/content/[...path].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // This MUST be a server-side env variable

if (!STRAPI_API_URL || !STRAPI_API_TOKEN) {
  throw new Error('Missing Strapi environment variables on the server');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const strapiPath = Array.isArray(path) ? path.join('/') : path;

  // Re-create the query string from the original request
  const queryString = new URL(req.url!, `http://${req.headers.host}`).search;

  try {
    const response = await axios({
      method: req.method,
      url: `${STRAPI_API_URL}/${strapiPath}${queryString}`,
      headers: {
        ...req.headers, // Forward most headers
        Authorization: `Bearer ${STRAPI_API_TOKEN}`, // Add the secret token
        host: new URL(STRAPI_API_URL).host, // Replace the host header
      },
      data: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Proxy error:', error);
      res.status(500).json({ message: 'An internal server error occurred.' });
    }
  }
}
```

## 4. Final Frontend Integration

Once the backend proxy is deployed, the frontend configuration needs one final update.

- **Update the API Base URL:** In `src/core/config/env.config.ts`, the `VITE_API_BASE_URL` environment variable should be pointed to the new backend proxy endpoint. For example: `https://your-user-service.com/api/content`.

This will route all content API calls through the secure backend proxy, fully restoring functionality without exposing any secret tokens.
