const fs = require("fs");
const path = require("path");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { defaultAbiCoder } = require("ethers/lib/utils");

const generateMerkleRoot = (tokenIds) => {
  const leaves = tokenIds.map((v) =>
    keccak256(defaultAbiCoder.encode(["uint256"], [v]))
  );

  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();

  return root;
};

module.exports = { generateMerkleRoot };
