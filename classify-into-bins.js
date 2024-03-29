const fs = require("fs");
const { generateMerkleRoot } = require("./generate-merkle-root");

const main = async () => {
  // read weightings
  const name = process.argv[2];

  console.log("Generating desirability bins for " + name);

  const [
    spicyestWeightings,
    nabuWeightings,
    upshotWeightings,
    nftbankWeightings,
  ] = ["spicyest", "nabu", "upshot", "nftbank"].map((provider) =>
    JSON.parse(fs.readFileSync(`./weightings/${name}/${provider}.json`, "utf8"))
  );

  const FLOOR_SAFE_UPPER_BOUND = 1.05;
  const MID_LOWER_BOUND = FLOOR_SAFE_UPPER_BOUND;
  const MID_SAFE_UPPER_BOUND = 1.3;

  // generate bins
  const floorSafeTokenIds = [];
  const midSafeTokenIds = [];
  const midTokenIds = [];
  for (const [tokenId, spicyestWeighting] of Object.entries(
    spicyestWeightings
  )) {
    const nabuWeighting = nabuWeightings[tokenId];
    const upshotWeighting = upshotWeightings[tokenId];
    const nftbankWeighting = nftbankWeightings[tokenId];

    if (
      !Number.isFinite(nabuWeighting) ||
      !Number.isFinite(upshotWeighting) ||
      !Number.isFinite(nftbankWeighting) ||
      !Number.isFinite(spicyestWeighting)
    ) {
      continue;
    }

    const spicyestFloorSafe = spicyestWeighting <= FLOOR_SAFE_UPPER_BOUND;
    const nabuFloorSafe = nabuWeighting <= FLOOR_SAFE_UPPER_BOUND;
    const upshotFloorSafe = upshotWeighting <= FLOOR_SAFE_UPPER_BOUND;
    const nftbankFloorSafe = nftbankWeighting <= FLOOR_SAFE_UPPER_BOUND;

    if (
      spicyestFloorSafe + nabuFloorSafe + upshotFloorSafe + nftbankFloorSafe >=
      3
    ) {
      floorSafeTokenIds.push(tokenId);
    }

    const spicyestSafeMid =
      spicyestWeighting >= MID_LOWER_BOUND &&
      spicyestWeighting <= MID_SAFE_UPPER_BOUND;
    const upshotSafeMid =
      upshotWeighting >= MID_LOWER_BOUND &&
      upshotWeighting <= MID_SAFE_UPPER_BOUND;
    const nabuSafeMid =
      nabuWeighting >= MID_LOWER_BOUND && nabuWeighting <= MID_SAFE_UPPER_BOUND;
    const nftbankSafeMid =
      nftbankWeighting >= MID_LOWER_BOUND &&
      nftbankWeighting <= MID_SAFE_UPPER_BOUND;

    if (spicyestSafeMid + upshotSafeMid + nabuSafeMid + nftbankSafeMid >= 3) {
      midSafeTokenIds.push(tokenId);
    }

    const spicyestMid = spicyestWeighting >= MID_LOWER_BOUND;
    const upshotMid = upshotWeighting >= MID_LOWER_BOUND;
    const nabuMid = nabuWeighting >= MID_LOWER_BOUND;
    const nftMid = nftbankWeighting >= MID_LOWER_BOUND;

    if (spicyestMid + upshotMid + nabuMid + nftMid >= 3) {
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
    // safeTokenIds: floorSafeTokenIds,
  };

  fs.writeFileSync(`./bins/mid/${name}.json`, JSON.stringify(midBin, null, 2));
  fs.writeFileSync(
    `./bins/floor/${name}.json`,
    JSON.stringify(floorBin, null, 2)
  );

  console.log("Floor safe bin size: " + floorSafeTokenIds.length);
  console.log("Mid safe bin size: " + midSafeTokenIds.length);
  console.log("Mid bin size: " + midTokenIds.length);
};

main();
