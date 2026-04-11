import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ImageProvenanceModule = buildModule("ImageProvenanceModule", (m) => {
  const imageProvenance = m.contract("ImageProvenance");
  return { imageProvenance }
});

export default ImageProvenanceModule;


// npx hardhat ignition deploy ignition/modules/ImageProvenanceModule.ts --network localhost