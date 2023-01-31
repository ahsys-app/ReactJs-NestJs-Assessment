const url = process.env.REACT_APP_BASE_URL;
const currency = `${url}/currency/`

module.exports = {
    currency: currency,
    getExchangeRates: `${currency}getExchangeRates`,
    getExchangeHistory: `${currency}getExchangeHistory`,
    addExchangeByUser: `${currency}addExchangeByUser`,
}