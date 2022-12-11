const fetch = require("node-fetch");
const fs = require("fs");
const { formatEther } = require("ethers/lib/utils");
require("dotenv").config();

const fetchFloorPrice = async (address) => {
  console.log("Fetching floor...");

  const url = "http://api.spicyest.com/floor?address=" + address;

  const { price } = await fetch(url, {
    headers: {
      accept: "*/*",
      "X-API-Key": process.env.SPICYEST_API_KEY,
    },
  }).then((r) => r.json());

  return price;
};

const fetchSpicyestWeightings = async (
  address,
  floorPrice,
  totalSupply,
  name
) => {
  console.log("Fetching spicyest weightings...");

  let nextPage;
  let prices = [];
  do {
    const url =
      "http://api.spicyest.com/prices?address=" +
      address +
      "&limit=1000" +
      (nextPage ? "&next_page=" + nextPage : "");

    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        "X-API-Key": process.env.SPICYEST_API_KEY,
      },
    }).then((r) => r.json());

    nextPage = resp.next_page;
    prices = prices.concat(resp.prices);

    console.log(`Progress: ${prices.length} / ${totalSupply}...`);
  } while (nextPage);

  const weightings = Object.fromEntries(
    prices.map(({ tokenID, price }) => [tokenID, price / floorPrice])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/spicyest.json",
    JSON.stringify(weightings, null, 2)
  );

  return weightings;
};

const fetchNabuWeightings = async (address, floorPrice, totalSupply, name) => {
  console.log("Fetching nabu weightings...");

  let offset = 0;
  let prices = [];
  while (true) {
    const url = `https://api.nabu.xyz/token/ETH/${address}?limit=1000&offset=${offset}`;

    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        "X-API-Key": process.env.NABU_API_KEY,
      },
    }).then((r) => r.json());

    offset += resp.tokens.length;
    prices = prices.concat(resp.tokens);

    if (resp.tokens.length === 0) break;

    console.log(`Progress: ${prices.length} / ${totalSupply}...`);
  }

  const weightings = Object.fromEntries(
    prices.map(({ token_id, price_eth }) => [token_id, price_eth / floorPrice])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/nabu.json",
    JSON.stringify(weightings, null, 2)
  );

  return weightings;
};

const fetchUpshotWeightings = async (
  address,
  floorPrice,
  totalSupply,
  name
) => {
  console.log("Fetching upshot weightings...");

  let offset = 0;
  let prices = [];
  while (true) {
    const url = `https://api.upshot.xyz/v2/collections/${address}/assets?limit=1000&offset=${offset}&listed=false&include_stats=true&include_count=false`;

    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        "X-API-Key": process.env.UPSHOT_API_KEY,
      },
    }).then((r) => r.json());

    offset += resp.data.assets.length - 1;
    prices = prices.concat(resp.data.assets);

    if (resp.data.assets.length === 1) break;

    console.log(`Progress: ${prices.length} / ${totalSupply}...`);
  }

  const weightings = Object.fromEntries(
    prices.map(({ token_id, appraisal: { wei } }) => [
      token_id,
      Number(formatEther(wei)) / floorPrice,
    ])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/upshot.json",
    JSON.stringify(weightings, null, 2)
  );

  return weightings;
};

const main = async () => {
  const name = process.argv[2];
  const address = process.argv[3];
  const totalSupply = process.argv[4];

  console.log("Fetching weightings for " + name + " at " + address + "...");

  const floorPrice = await fetchFloorPrice(address);
  console.log("Floor price: " + floorPrice + " ETH");

  const spicyestWeightings = await fetchSpicyestWeightings(
    address,
    floorPrice,
    totalSupply,
    name
  );

  const nabuWeightings = await fetchNabuWeightings(
    address,
    floorPrice,
    totalSupply,
    name
  );

  const upshotWeightings = await fetchUpshotWeightings(
    address,
    floorPrice,
    totalSupply,
    name
  );
};

main();
