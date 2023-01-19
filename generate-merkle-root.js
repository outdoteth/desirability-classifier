const fs = require("fs");
const path = require("path");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

const generateMerkleRoot = (tokenIds) => {
  const tree = StandardMerkleTree.of(
    tokenIds.map((v) => [v]),
    ["uint256"]
  );

  return tree.root;
};

module.exports = { generateMerkleRoot };
