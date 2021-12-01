# The Tailwind Traders Node/Mongo DB Starter Site (Preview)

This is a work in progress and I'll be filling this README out a bit more, but if you want to play around right now here's what you'll need to do...

 - Clone this repo and install Node modules
 - Optionally have Mongo DB up and running locally. You can also use the brilliant MongoDB Explorer add-in for VS Code, which offers an in-memory Mongo DB for development.
 - Setup your ENV stuff

## ENV Variables

You'll need a few if you want everything to work right, and those are:

```
DATABASE_URL="mongodb://127.0.0.1:27017/tailwind"
GOOGLE_ID="GET ONE FROM GOOGLE"
GOOGLE_SECRET="GET FROM GOOGLE"

GITHUB_ID="GET FROM GITHUB"
GITHUB_SECRET="GET FROM GITHUB"

SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=465
SMTP_USER="postmaster@YOURDOMAIN"
SMTP_PASSWORD="SMTPPASS-aa4b0867-4fa1f484"
```

Pop these into a `.env` file in the project root so they can be read by the app on boot.

## Azure Deployment

If you want to push this to Azure you'll need to:

 - Make sure you have an account and the CLI installed on your local machine
 - Do a `printenv` and make sure you ENV variables are set

The simplest thing to do is to use my fun project, [azx](https://github.com/robconery/azx). When you create your app, make sure to set the runtime to `node`. When you create your database, make sure it's `mongo`:

```sh
azx init
azx app create node
azx db create mongo
```

Once all of this is done (it takes about 10 minutes to provision everything), you'll see a new directory in your project: `./azure`. This is where all of your Azure settings live. Inside that directory you'll see a `.env` file - you'll need to add your settings from your project file here for production. **Be sure you don't overwrite the DATABASE_URL** - this is how your app will talk to Cosmos DB.

Just add these - be sure to add them **above** the `DATABASE_URL` setting - there's a weirdness with the way these things are read from the file:

```
GOOGLE_ID="GET ONE FROM GOOGLE"
GOOGLE_SECRET="GET FROM GOOGLE"

GITHUB_ID="GET FROM GITHUB"
GITHUB_SECRET="GET FROM GITHUB"

SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=465
SMTP_USER="postmaster@YOURDOMAIN"
SMTP_PASSWORD="SMTPPASS-aa4b0867-4fa1f484"
```

Once that's done, we can push the settings to Azure:

```sh
azx app write_settings
```

That's it! You're ready to deploy:

```sh
git push azure main
```

This will take a few minutes on first run as there's a lot to do, but when deployment is complete you can open your app using:

```
azx app open
```

Once again, this will take a few minutes to spin up for the very first time. Be patient... it'll happen! If there are problems, you can troubleshoot using:

```
azx app logs
```

You should be up and live. It's a good idea to read up on how AZX works so you can scale up your service and work with your backend data.