# App URL configuration

`VITE_APP_URL` is the frontend's canonical public origin. It controls browser-side authentication redirects and canonical/social metadata after the app starts.

`APP_URL` is the matching user-service origin. It controls server-side Supabase email redirects and is automatically accepted for CORS and Stripe return URLs. `APP_ALLOWED_ORIGINS` adds explicit secondary origins, such as a production URL while staging is under test.

Configure the values per environment:

| Environment     | Frontend (`VITE_APP_URL`)      | User service (`APP_URL`)        |
| --------------- | ------------------------------ | ------------------------------- |
| Local           | `http://localhost:5173`        | `http://localhost:5173`         |
| Preview/staging | preview deployment URL         | matching preview deployment URL |
| Production      | `https://we-better.vercel.app` | `https://we-better.vercel.app`  |

Before adding a custom domain, add it to Supabase Auth redirect URLs, Stripe Checkout/Portal return URL allowlists, and `APP_ALLOWED_ORIGINS` where it is used as a secondary origin. Deploy both projects after changing these variables.
