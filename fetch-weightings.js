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

const fetchSpicyestWeightings = async (
  address,
  totalSupply,
  name,
  floorPrice
) => {
  console.log("\nFetching spicyest weightings...");

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

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${prices.length} / ${totalSupply}...`);
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

const fetchNabuWeightings = async (address, totalSupply, name, floorPrice) => {
  console.log("\n\nFetching nabu weightings...");

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

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${prices.length} / ${totalSupply}...`);
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
  totalSupply,
  name,
  floorPrice
) => {
  console.log("\n\nFetching upshot weightings...");

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

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${prices.length} / ${totalSupply}...`);
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

const fetchNftbankWeightings = async (
  address,
  totalSupply,
  name,
  floorPrice
) => {
  console.log("\n\nFetching nftbank weightings...");

  let currentId = 0;
  let prices = [];
  while (true) {
    const params = Array.from({ length: 100 }, (_, i) =>
      Math.min(currentId + i, totalSupply)
    ).map((tokenId) => ({
      networkId: "ethereum",
      assetContract: address,
      tokenId,
    }));

    const url = `https://api.nftbank.run/v1/nft/estimate/bulk`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        "X-API-Key": process.env.NFTBANK_API_KEY,
      },
      body: JSON.stringify({ params }),
    }).then((r) => r.json());

    currentId += 100;
    prices = prices.concat(resp.data);

    if (prices.length >= totalSupply) break;

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${prices.length} / ${totalSupply}...`);
  }

  const weightings = Object.fromEntries(
    prices.map(({ item: { tokenId }, estimate: { eth } }) => [
      tokenId,
      Number(eth) / floorPrice,
    ])
  );

  fs.writeFileSync(
    "./weightings/" + name + "/nftbank.json",
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
    name,
    floorPrice
  );

  const nabuWeightings = await fetchNabuWeightings(
    address,
    totalSupply,
    name,
    floorPrice
  );

  const upshotWeightings = await fetchUpshotWeightings(
    address,
    totalSupply,
    name,
    floorPrice
  );

  // const nftbankWeightings = await fetchNftbankWeightings(
  //   address,
  //   totalSupply,
  //   name,
  //   floorPrice
  // );

  console.log(
    "\n\nspicyest count: " + Object.values(spicyestWeightings).length
  );
  console.log("nabu count: " + Object.values(nabuWeightings).length);
  console.log("upshot count: " + Object.values(upshotWeightings).length);
  // console.log("nftbank count: " + Object.values(nftbankWeightings).length);
};

main();
