Download media files from telegram, by just forwarding it to a user,from a dedicated user.

## Complete Setup and start
1. Clone this repo
2. Run `npm Install`
3. Set up environment variables(.env file will also work)
```
#Replace API ID and Hash with your values from https://my.telegram.org/auth
TELEGRAM_API_ID=0000
TELEGRAM_API_HASH=123456789

#Download files only if forwarded from below user
ADMIN_USERNAME=@username

#Remember to keep \ or/ at the end as per platform
MOVIES_DOWNLOADPATH=/Shared/Jellyfin/Movies
SERIES_DOWNLOADPATH=/Shared/Jellyfin/Series

#Keep DELETE if you want to delete message(file) from chat post download. Case Sensitive. Any other file will avoid file from getting deleted from chat
DELETE_FILES_POST_DOWNLOAD=DELETE

```
4. Run `npm run listen`
5. Authenticate with Phone number and 2F Auth code. 

Note: 
1. Create a service file in linux, to execute the program as a service!
2. Created with [Gram JS](https://gram.js.org/) 
