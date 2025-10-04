# Discord Bot Framework
It has the bare minimum items required, clone the repo and edit to your hearts content.

# Pre-Requisites
- A Functional Brain
- An IQ at least around average
- Common Sense
- An internet connection
- NodeJS


# Setup
## Step 1
Run `npm i --include-dev`


## Step 2
Create a .env file like so:

```yaml
prefix=-
ownerID={your discord id}
token={your bot's token}
timezone=Etc/UTC
FORCE_COLOR=1
```

- **prefix**: The symbols(s) required to be prefixed to a command in order for it to be seen as a command (eg: -help)
- **ownerID**: Your discord ID, you can find this by turning on developer options in discord, if left blank, it sets it to Clyde
- **token**: The token to log your bot in
- **timezone**: This is simply for logging purposes. I recommend just leaving at UTC time.
- **FORCE_COLOR**: Required for colors to work in a docker container (iunno)

## Step 3
Run `npm run start`. The bot should start up, enjoy.