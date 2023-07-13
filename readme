# Stripe to BigQuery Data Transfer

This script enables you to fetch data from Stripe, format it, and upload to Google's BigQuery. 

The script uses Stripe's API to fetch data, formats it into JSON and TSV, and then uploads it into BigQuery.

## Setup

1. Clone the repository.
2. Install the necessary packages by running `npm install`.
3. Create a `.env` file at the root of the project and add your Stripe token as `STRIPE_TOKEN=your_stripe_token`.
4. Make sure to have your Google Cloud service account key file at the root directory of the project.

## How to Use

The script is setup to be used with minimal changes required. 

The main script is contained within an async function at the bottom of the `index.js` file. It includes the following steps:

1. Initialize the Stripe API caller.
2. Set the start date for the Stripe API caller.
3. Set the select SQL for the Stripe API caller.
4. Initialize the BigQuery API caller.
5. Fetch the data from the Stripe API.
6. Drill down into the data to retrieve the desired object.
7. Format and export the data to TSV and JSON files.
8. Upload the TSV data to BigQuery.

## Stripe API

The Stripe API is initialized with a token:

```javascript
const stripe = new Stripe(process.env.STRIPE_TOKEN);
```

The start date and select SQL for the Stripe API call are set using the following methods:

```javascript
stripe.setStartDate("2023-07-12");
stripe.setSelectSQL("customer.subscription.*");
```

The `request` method is then used to fetch data from the Stripe API:

```javascript
const data = await stripe.request();
```

## BigQuery Uploader

The BigQuery uploader is initialized with a service account key:

```javascript
const bigQuery = new BigQueryUploader("service_account_key.json");
```

Data is uploaded to BigQuery using the `loadToBigQuery` method:

```javascript
bigQuery.loadToBigQuery('stripe', 'initial_load', 'gcp-upload-bucket', `${exportFileNames}.tsv`);
```

## Running the Script

You can run the script using the following command:

```bash
node index.js
```

## Dependencies

The script has the following dependencies:

- `dotenv`: Used to load environment variables from a .env file.
- `axios`: Used to make HTTP requests.
- `upload-google-storage-to-bigquery`: Used to upload data from Google Cloud Storage to BigQuery.

For more detailed documentation, please refer to the individual JSDoc comments within each function and class.
