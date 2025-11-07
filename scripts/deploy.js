import hre from "hardhat";

async function main() {
  const Factory = await hre.ethers.getContractFactory("Counter");
  const instance = await Factory.deploy();
  await instance.waitForDeployment();

  console.log("Deployed to:", await instance.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
