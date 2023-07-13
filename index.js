import 'dotenv/config';
import Stripe from './api/Stripe.js';
import { exportData, flattenObject } from './helpers.js';
import BigQueryUploader from 'upload-google-storage-to-bigquery';

// Setup the Strip api caller
const stripe = new Stripe(process.env.STRIPE_TOKEN);
stripe.setStartDate();
stripe.setSelectSQL("customer.subscription.*");

// Setup the BigQuery/GCS api caller
const bigQuery = new BigQueryUploader("service_account_key.json");

(async () => {
    const data = await stripe.request();
    const dataDrilled = data.map(row => row.data.object);

    // Format and export the data
    const exportFileNames = "exports/output";
    await exportData(dataDrilled, exportFileNames);

    // Upload data to BigQuery
    bigQuery.loadToBigQuery('stripe', 'initial_load', 'gcp-upload-bucket', `${exportFileNames}.tsv`);
})();