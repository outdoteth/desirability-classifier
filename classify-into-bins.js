const fs = require("fs");
const { generateMerkleRoot } = require("./generate-merkle-root");

const main = async () => {
  // read weightings
  const name = process.argv[2];

  console.log("Generating desirability bins for " + name);

  const [spicyestWeightings, nabuWeightings, upshotWeightings] = [
    "spicyest",
    "nabu",
    "upshot",
  ].map((provider) =>
    JSON.parse(fs.readFileSync(`./weightings/${name}/${provider}.json`, "utf8"))
  );

  // generate bins
  const floorSafeTokenIds = [];
  const midSafeTokenIds = [];
  const midTokenIds = [];
  for (const [tokenId, spicyestWeighting] of Object.entries(
    spicyestWeightings
  )) {
    const nabuWeighting = nabuWeightings[tokenId];
    const upshotWeighting = upshotWeightings[tokenId];

    if (
      spicyestWeighting <= 1.2 &&
      nabuWeighting <= 1.2 &&
      upshotWeighting <= 1.2
    ) {
      floorSafeTokenIds.push(tokenId);
    }

    if (
      spicyestWeighting >= 1.2 &&
      spicyestWeighting <= 1.5 &&
      upshotWeighting >= 1.2 &&
      upshotWeighting <= 1.5 &&
      nabuWeighting >= 1.2 &&
      nabuWeighting <= 1.5
    ) {
      midSafeTokenIds.push(tokenId);
    }

    if (
      spicyestWeighting >= 1.2 &&
      upshotWeighting >= 1.2 &&
      nabuWeighting >= 1.2
    ) {
      midTokenIds.push(tokenId);
    }
  }

  const midBin = {
    merkleRoot: generateMerkleRoot(midTokenIds),
    tokenIds: midTokenIds,
    safeTokenIds: midSafeTokenIds,
  };

  const floorBin = {
    safeTokenIds: floorSafeTokenIds,
  };

  fs.writeFileSync(`./bins/${name}-mids.json`, JSON.stringify(midBin, null, 2));
  fs.writeFileSync(
    `./bins/${name}-floors.json`,
    JSON.stringify(floorBin, null, 2)
  );
};

main();
