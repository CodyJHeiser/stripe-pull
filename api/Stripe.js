import axios from 'axios';
import { stringifyNested, delay } from "../helpers.js";
import moment from 'moment-timezone';

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
     * Sets the `startDate` property to the specified date or to the current date and time.
     *
     * @param {string} [date=null] - The start date in "YYYY-MM-DD" format. 
     *                                If not provided, the function sets the `startDate` to the current date and time 
     *                                (1 hour and 15 minutes before the current hour in Central Standard Time (CST)).
     * @throws Will throw an error if the provided date is not in the correct "YYYY-MM-DD" format.
     * @returns {void}
     *
     * @example
     * // Set the start date to July 1, 2023 00:00:00.
     * stripe.setStartDate("2023-07-01");
     * @example
     * // Set the start date to the current date and time in CST, minus 1 hour and 15 minutes.
     * stripe.setStartDate();
     */
    setStartDate(date = null) {
        let startDate;
        if (date) {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(date)) {
                throw new Error("Invalid date format. Expected format: YYYY-MM-DD");
            }
            startDate = moment.tz(date, "America/Chicago");
        } else {
            // get current time in Chicago, considering DST
            startDate = moment().tz("America/Chicago").subtract(1, 'hours').subtract(15, 'minutes');
        }

        // Convert to UNIX time format
        const unixTime = startDate.unix();

        // Set the startDate prototype value
        this.startDate = unixTime;
        console.log(unixTime);
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