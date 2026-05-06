import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("ImageProvenance Full Audit", function() {
  async function deployFixture() {
    const [owner, user1, user2, hacker] = await ethers.getSigners();
    const ImageProvenance = await ethers.getContractFactory("ImageProvenance");
    const contract = await ImageProvenance.deploy();
    contract.waitForDeployment();

    return {contract, owner, user1, user2, hacker};
  }

  const imageHash = ethers.id("thesis_image");
  const watermarkID = ethers.id("invisible_dna");
  const metadataCID = "ipfs://QmPinataCID";

  describe("1. user management", function() {
    it("Should register a user and emit event", async function() {
      const {contract, owner, user1} = await networkHelpers.loadFixture(deployFixture);

      expect(await contract.isUserRegistered(user1.address)).to.equal(false);

      await expect(contract.connect(owner).registerUser(user1.address))
      .to.emit(contract, "UserRegistered")
      .withArgs(user1.address);

      expect(await contract.isUserRegistered(user1.address)).to.equal(true);
    });

    it("Should fail if a hacker/normal user tries to register someone", async function() {
      const {contract, user1, user2} = await networkHelpers.loadFixture(deployFixture);

      await expect(contract.connect(user1).registerUser(user2.address))
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
     });
  });

  describe("2. Image Registration & Anti-Frontrunning", function() {
    async function registeredUserFixture() {
      const setup = await deployFixture();
      await setup.contract.connect(setup.owner).registerUser(setup.user1.address);

      return setup;
    }

    it("Should allow registered user to register image with valid signature", async function() {
      const {contract, user1} = await networkHelpers.loadFixture(registeredUserFixture);

      const messagehash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await user1.signMessage(ethers.getBytes(messagehash));

      await expect(contract.connect(user1).registerImage(imageHash, watermarkID, metadataCID, signature))
      .to.emit(contract, "ImageRegistered")
      .withArgs(user1.address, imageHash, watermarkID, metadataCID);

      expect(await contract.totalImages()).to.equal(1n);
      expect(await contract.imageExists(imageHash)).to.equal(true);
    });

    it("Should PREVENT hacker from stealing signature", async function() {
      const {contract, owner, user1, hacker} = await networkHelpers.loadFixture(registeredUserFixture);
      await contract.connect(owner).registerUser(hacker.address);

      const messageHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await user1.signMessage(ethers.getBytes(messageHash));

      await expect(contract.connect(hacker).registerImage(imageHash, watermarkID, metadataCID, signature))
      .to.be.revertedWithCustomError(contract, "InvalidSignature")
    });
  });

  describe("3. Ownership Transfer & O(1) arrays", function() {
    async function registeredImageFixture() {
      const setup = await deployFixture();
      await setup.contract.connect(setup.owner).registerUser(setup.user1.address);
      await setup.contract.connect(setup.owner).registerUser(setup.user2.address);

      const messageHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await setup.user1.signMessage(ethers.getBytes(messageHash));
      await setup.contract.connect(setup.user1).registerImage(imageHash, watermarkID, metadataCID, signature);

      return setup;
    }

    it("Should transfer image useing Swap and pop and update gallery", async function() {
      const { contract, user1, user2 } = await networkHelpers.loadFixture(registeredImageFixture);

      await expect(contract.connect(user1).transferImage(imageHash, user2.address))
      .to.emit(contract, "ImageTransferred")
      .withArgs(imageHash, user1.address, user2.address);

      const details = await contract.getImageDetails(imageHash);
      expect(details.currentOwner).to.equal(user2.address);

      const user1List = await contract.getUserImages(user1.address);
      expect(user1List.length).to.equal(0);

      const user2List = await contract.getUserImages(user2.address);
      expect(user2List[0]).to.equal(imageHash);
    });

    it("Should prevent array bloat (Cannot transfer to self)", async function() {
      const {contract, user1} = await networkHelpers.loadFixture(registeredImageFixture);

      await expect(contract.connect(user1).transferImage(imageHash, user1.address))
      .to.be.revertedWithCustomError(contract, "CannotTransferToSelf");
    });
  });

  describe("4. Metadata Updates", function() {
    async function registeredImageFixture() {
      const setup = await deployFixture();
      await setup.contract.connect(setup.owner).registerUser(setup.user1.address);
      const msgHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await setup.user1.signMessage(ethers.getBytes(msgHash));
      await setup.contract.connect(setup.user1).registerImage(imageHash, watermarkID, metadataCID, signature);
      return setup;
    }

    it("Should allow owner to update metadata CID", async function() {
      const {contract, user1} = await networkHelpers.loadFixture(registeredImageFixture);
      const newCID = "ipfs://NewUpdatedCID999";

      await expect(contract.connect(user1).updateMetadata(imageHash, newCID))
      .to.emit(contract, "MetadataUpdated")
      .withArgs(imageHash, newCID);

      const details = await contract.getImageDetails(imageHash);
      expect(details.metadataCID).to.equal(newCID);
    });

    it("Should not allow non-owners to update metadata", async function() {
      const {contract, hacker} = await networkHelpers.loadFixture(registeredImageFixture);

      await expect(contract.connect(hacker).updateMetadata(imageHash, "fake_cid"))
      .to.be.revertedWithCustomError(contract, "NotAuthorized");
    });
  });

  describe("5. Burn Asset", function() {
    async function registeredImageFixture() {
      const setup = await deployFixture();
      await setup.contract.connect(setup.owner).registerUser(setup.user1.address);
      const msgHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await setup.user1.signMessage(ethers.getBytes(msgHash));
      await setup.contract.connect(setup.user1).registerImage(imageHash, watermarkID, metadataCID, signature);
      return setup;
    }

    it("Should logical-delete image and zero out owner", async function() {
      const {contract, user1} = await networkHelpers.loadFixture(registeredImageFixture);

      await expect(contract.connect(user1).burnImage(imageHash))
      .to.emit(contract, "ImageBurned")
      .withArgs(imageHash, user1.address);

      const userImages = await contract.getUserImages(user1.address);
      expect(userImages).to.not.include(imageHash);
    });
  });

  describe("6. Provenance", function() {
    async function registeredImageFixture() {
      const setup = await deployFixture();
      await setup.contract.connect(setup.owner).registerUser(setup.user1.address);
      const msgHash = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [imageHash, watermarkID]);
      const signature = await setup.user1.signMessage(ethers.getBytes(msgHash));
      await setup.contract.connect(setup.user1).registerImage(imageHash, watermarkID, metadataCID, signature);
      return setup;
    }

    it("Should return 'Authentic & Original' for an unaltered image", async function() {
      const {contract, user1} = await networkHelpers.loadFixture(registeredImageFixture);

      const [status, originalOwner] = await contract.verify(imageHash, watermarkID);
      expect(status).to.equal("Authentic & Original");
      expect(originalOwner).to.equal(user1.address);
    });

    it("Should detect a Tempered/Edited image", async function () {
      const { contract, user1 } = await networkHelpers.loadFixture(registeredImageFixture);
      const hackerFakeHash = ethers.id("changed_one_pixel"); 
      
      const [status, originalOwner] = await contract.verify(hackerFakeHash, watermarkID);
      expect(status).to.equal("Tempered/Edited - DNA Matched to Original Owner");
      expect(originalOwner).to.equal(user1.address);
    });

    it("Should return 'New or Unknown Asset' for a completely unregistered image", async function () {
      const { contract } = await networkHelpers.loadFixture(registeredImageFixture);
      const completelyFakeHash = ethers.id("totally_random_hash_from_internet"); 
      const completelyFakeWatermarkID = ethers.id("fake_id_from_another_galaxy");
      const [status, originalOwner] = await contract.verify(completelyFakeHash, completelyFakeWatermarkID);
      
      expect(status).to.equal("New or Unknown Asset");
      expect(originalOwner).to.equal(ethers.ZeroAddress); 
    });
  });
});

