const fetch = require("node-fetch");
const fs = require("fs");
const { formatEther } = require("ethers/lib/utils");
require("dotenv").config();

const fetchFloorPrice = async (address) => {
  console.log("Fetching floor...");

  const url = "http://api.spicyest.com/listing_floor?address=" + address;

  const { floor } = await fetch(url, {
    headers: {
      accept: "*/*",
      "X-API-Key": process.env.SPICYEST_API_KEY,
    },
  }).then((r) => r.json());

  return floor;
};

const fetchSpicyestWeightings = async (address, totalSupply, name) => {
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

  const floorPrice = prices.sort((a, b) => a.price - b.price)[0].price;

  const weightings = Object.fromEntries(
    prices.map(({ tokenID, price }) => [tokenID, price / floorPrice])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/spicyest.json",
    JSON.stringify(weightings, null, 2)
  );

  return weightings;
};

const fetchNabuWeightings = async (address, totalSupply, name) => {
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

  const floorPrice = prices.sort((a, b) => a.price_eth - b.price_eth)[0]
    .price_eth;

  const weightings = Object.fromEntries(
    prices.map(({ token_id, price_eth }) => [token_id, price_eth / floorPrice])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/nabu.json",
    JSON.stringify(weightings, null, 2)
  );

  return weightings;
};

const fetchUpshotWeightings = async (address, totalSupply, name) => {
  console.log("Fetching upshot weightings...");

  let offset = 0;
  let prices = [];
  while (true) {
    const url = `https://api.upshot.xyz/v2/collections/${address}/assets?limit=500&offset=${offset}&include_stats=true&include_count=false&sort_order=last_sale_wei`;

    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        "X-API-Key": process.env.UPSHOT_API_KEY,
      },
    }).then((r) => r.json());

    offset += resp.data.assets.length;
    prices = prices.concat(resp.data.assets);

    if (resp.data.assets.length === 0) break;

    console.log(`Progress: ${prices.length} / ${totalSupply}...`);
  }

  const floorPrice = Number(
    formatEther(
      prices
        .slice()
        .sort(
          (a, b) => formatEther(a.appraisal.wei) - formatEther(b.appraisal.wei)
        )[0].appraisal.wei
    )
  );

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
    totalSupply,
    name
  );

  const nabuWeightings = await fetchNabuWeightings(address, totalSupply, name);

  const upshotWeightings = await fetchUpshotWeightings(
    address,
    totalSupply,
    name
  );

  console.log("\nspicyest count: " + Object.values(spicyestWeightings).length);
  console.log("nabu count: " + Object.values(nabuWeightings).length);
  console.log("upshot count: " + Object.values(upshotWeightings).length);
};

main();
