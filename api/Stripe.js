import axios from 'axios';
import { stringifyNested, delay } from "../helpers.js";

/**
 * A class representing a Stripe client.
 * @class
 */
class Stripe {
    /**
     * Create a Stripe client.
     * @param {string} stripeToken - The Stripe API token.
     */
    constructor(stripeToken) {
        this.stripeToken = stripeToken;
        this.baseURL = "https://api.stripe.com/v1/events?";
        this.startDate = null;
        this.selectSQL = null;
        this.config = {
            method: 'get',
            maxBodyLength: Infinity,
            headers: {
                'Authorization': `Bearer ${this.stripeToken}`
            }
        };
    }

    /**
     * Set the start date for API requests.
     * @param {string} date - The start date in YYYY-MM-DD format.
     * @throws Will throw an error if the date format is not valid.
     */
    setStartDate(date) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) {
            throw new Error("Invalid date format. Expected format: YYYY-MM-DD");
        }
        const unixTime = new Date(date).getTime() / 1000;
        this.startDate = unixTime;
    }

    /**
     * Set the SQL select statement for API requests.
     * @param {string} select - The SQL select statement.
     */
    setSelectSQL(select) {
        this.selectSQL = select;
    }

    /**
     * Generate the URL for API requests.
     * @param {string} [nextPage] - The ID of the next page to fetch (if applicable).
     * @returns {string} The URL for the API request.
     * @throws Will throw an error if startDate or selectSQL are not set.
     */
    getUrl(nextPage = null) {
        if (!this.startDate) {
            throw new Error("Set startDate before calling getUrl()");
        }
        if (!this.selectSQL) {
            throw new Error("Set selectSQL before calling getUrl()");
        }
        const urlBody = {
            created: { gte: this.startDate },
            type: this.selectSQL,
        };
        if (nextPage) urlBody.starting_after = nextPage;
        return `${this.baseURL}${stringifyNested(urlBody)}`;
    }

    /**
     * Execute a request to the Stripe API.
     * @param {string} [previousId] - The ID of the previous request.
     * @param {number} [retries=1] - The number of retries allowed.
     * @returns {Promise<Object[]>} The data received from the API.
     * @throws Will throw an error if the request fails.
     */
    request = async (previousId = null, retries = 1) => {
        try {
            const { data, data: { has_more }, status } = await axios.request(this.getUrl(previousId), this.config);
            let results = data.data;
            if (status === 200 && has_more && retries) {
                const lastEventId = results.at(-1).id;
                await delay(1000);
                const nextPage = await this.request(lastEventId, retries - 1);
                if (nextPage) {
                    results = [...results, ...nextPage];
                } else {
                    throw new Error("Failed to fetch next page data.");
                }
            }
            return results;
        } catch (error) {
            throw new Error(error);
        }
    };
}


export default Stripe;