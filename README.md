# Rasagi
![GitHub](https://img.shields.io/github/license/Firstbober/rasagi)

Simple server-powered RSS feed reader and aggregator with mobile-ready user interface powered by Material UI and Next.js.

![Screenshot](https://cdn.discordapp.com/attachments/939096222646566942/942557916739797012/unknown.png)

## For users

If you want to start using Rasagi first you must find working instance.
Maybe in future I will host one, but for now you could try to get up and running one yourself.

## For wannabe-selfhosters

Completing these steps will bring you a working instance of Rasagi on most devices,
hosting it on Windows is technically possible but not tested.
I recommend getting a Raspberry Pi or some old computer to use it as a server.

Get `node` and `npm` from your repository and you will be good to go.

```sh
git clone https://github.com/Firstbober/rasagi
cd rasagi
export DATABASE_URL="file:./database.db"
npm install
npx prisma db push
npm run build
npm run start
```

These should work, but for the long run you want to put `DATABASE_URL` variable into .env file.
It should look something like this:

```env
DATABASE_URL="file:./database.db"
```

Changing server port is as easy as adding `PORT=<number>` variable into `.env` or before `npm run start` command.

Also, thanks to Ezioleq and IAlex for helping me to debug this.

## Feature requests
These should be placed in [issues tab](https://github.com/Firstbober/rasagi/issues).

## Contribute
- Issue Tracker: https://github.com/Firstbober/rasagi/issues
- Source Code: https://github.com/Firstbober/rasagi

## License
The project is licensed under the GNU AGPL-3.0 license.
