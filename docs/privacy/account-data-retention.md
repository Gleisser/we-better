# Account Data Retention and Deletion

## Product data

When an account deletion is confirmed, We Better permanently deletes the user's application records and owned avatar and Dream Board files in the same request. Accounts with an active paid subscription cannot be deleted until the subscription is cancelled.

## Authentication and sessions

All refresh sessions are revoked before the Auth user is removed. Existing access tokens remain valid only until their configured JWT expiry; this is a Supabase platform limitation. The production JWT expiry must remain at or below one hour.

## Operational records and backups

Payment processor, infrastructure audit logs, and provider backups are not included in the downloadable export. They are retained only for the period configured with the applicable provider and any legal, security, fraud-prevention, or accounting obligation. This policy must be reviewed by the product owner and legal counsel before public launch.

## Export scope

The JSON export contains user-owned product records and a manifest of owned storage files. Authentication/session tokens and Web Push encryption credentials are deliberately excluded.
