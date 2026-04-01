import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ImageProvenanceModule = buildModule("ImageProvenanceModule", (m) => {
  const imageProvenance = m.contract("ImageProvenance");
  return { imageProvenance }
});

export default ImageProvenanceModule;


// ImageProvenanceModule#ImageProvenance - 0x5FbDB2315678afecb367f032d93F642f64180aa3