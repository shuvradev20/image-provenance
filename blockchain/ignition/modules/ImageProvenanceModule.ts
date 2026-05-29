import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ImageProvenanceModule = buildModule("ImageProvenanceModule", (m) => {
  const imageProvenance = m.contract("ImageProvenance");
  return { imageProvenance }
});

export default ImageProvenanceModule;


// deployedAddress: 0xe8dE3089dCFf50b247C5e801D43830460C98f17B
