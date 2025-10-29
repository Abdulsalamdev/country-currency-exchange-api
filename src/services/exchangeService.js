import axios from "axios";

export async function getExchangeRates() {
  try {
    const { data } = await axios.get("https://open.er-api.com/v6/latest/USD");
    return data.rates;
  } catch (err) {
    throw new Error("Could not fetch data from exchange rate API");
  }
}
