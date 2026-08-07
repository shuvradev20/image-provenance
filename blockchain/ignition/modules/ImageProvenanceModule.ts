import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ImageProvenanceModule = buildModule("ImageProvenanceModule", (m) => {
  const imageProvenance = m.contract("ImageProvenance");
  return { imageProvenance }
});

export default ImageProvenanceModule;



// deployedAddress: 0xc9EBa5fB6D3c74B47568a1917dd31303E158a059
