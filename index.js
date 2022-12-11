const fetchSpicyestPrices = async (address) => {
  console.log("Fetching spicyest prices...");
};

const main = async () => {
  const name = process.argv[2];
  const address = process.argv[3];

  console.log(
    "Generating desirability bins for " + name + " at " + address + "..."
  );

  const spicyestPrices = await fetchSpicyestPrices(address);
  console.log(spicyestPrices);
};

main();
