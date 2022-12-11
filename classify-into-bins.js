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

  const FLOOR_SAFE_UPPER_BOUND = 1.25;
  const MID_LOWER_BOUND = FLOOR_SAFE_UPPER_BOUND;
  const MID_SAFE_UPPER_BOUND = 3;

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
      spicyestWeighting <= FLOOR_SAFE_UPPER_BOUND &&
      nabuWeighting <= FLOOR_SAFE_UPPER_BOUND &&
      upshotWeighting <= FLOOR_SAFE_UPPER_BOUND
    ) {
      floorSafeTokenIds.push(tokenId);
    }

    if (
      spicyestWeighting >= MID_LOWER_BOUND &&
      spicyestWeighting <= MID_SAFE_UPPER_BOUND &&
      upshotWeighting >= MID_LOWER_BOUND &&
      upshotWeighting <= MID_SAFE_UPPER_BOUND &&
      nabuWeighting >= MID_LOWER_BOUND &&
      nabuWeighting <= MID_SAFE_UPPER_BOUND
    ) {
      midSafeTokenIds.push(tokenId);
    }

    if (
      spicyestWeighting >= MID_LOWER_BOUND &&
      upshotWeighting >= MID_LOWER_BOUND &&
      nabuWeighting >= MID_LOWER_BOUND
    ) {
      midTokenIds.push(tokenId);
    }
  }

  const midBin = {
    safeUpperBound: MID_SAFE_UPPER_BOUND,
    lowerBound: MID_LOWER_BOUND,
    merkleRoot: generateMerkleRoot(midTokenIds),
    safeTokenIds: midSafeTokenIds,
    tokenIds: midTokenIds,
  };

  const floorBin = {
    safeUpperBound: FLOOR_SAFE_UPPER_BOUND,
    lowerBound: 1.0,
    safeTokenIds: floorSafeTokenIds,
  };

  fs.writeFileSync(`./bins/mid/${name}.json`, JSON.stringify(midBin, null, 2));
  fs.writeFileSync(
    `./bins/floor/${name}.json`,
    JSON.stringify(floorBin, null, 2)
  );

  console.log("Floor bin size: " + floorSafeTokenIds.length);
  console.log("Mid bin size: " + midSafeTokenIds.length);
};

main();
