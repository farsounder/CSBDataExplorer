# CSB Data Explorer

## Visualize public CSB data on a map

![image](https://github.com/user-attachments/assets/1cfea6b9-5cef-4204-9467-79838d7a273e)

The OG bathy viewer is available here and managed by NOAA: https://www.ncei.noaa.gov/maps/bathymetry/

This project is a simple web app intended for individuals contributing to the
CSB database to be able to visualize their own data on the map, and see some
simple stats.

## Getting Started

Define the variables in the `.env.template` file and move to an actual `.env`
file in the root of the project. The app uses a postgres database but only to
map between app specific unique ids and the NOAA external platform ids, so that
there's a bit of obscurity between the two if a user shares their stats and
doesn't want to share their associated NOAA external platform id.

You can spin up a postgres database with docker-compose to run locally:

```
docker-compose up
```

Then run `npx prisma db push` to create the tables in the database, and `npx prisma generate` to generate the prisma client - only needed for the first time
or if the schema changes.

Install dependencies:

```bash
npm install
```

and then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
