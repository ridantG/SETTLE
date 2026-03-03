# Admin Login Issue

The investigation has revealed that the inability to log in to the admin dashboard is not a bug in the code, but a permissions issue.

When a user authenticates, the application checks if the user has the `is_admin` flag set to `true` in their profile. If this flag is not set, the middleware redirects the user to the regular user dashboard.

## Solution

To fix this, you need to manually set the `is_admin` flag to `true` for your user in the `profiles` table in your Supabase database.

You can do this by running a SQL query in the Supabase SQL editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE id = '<your-user-id>';
```

Replace `<your-user-id>` with the actual ID of your user account.