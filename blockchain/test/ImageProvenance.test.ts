import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ImageProvenance Full Audit", function () {
  
  async function deployFixture() {
    const [owner, newAdmin, user1, user2] = await ethers.getSigners();
    const ImageProvenance = await ethers.getContractFactory("ImageProvenance");
    const contract = await ImageProvenance.deploy();
    return { contract, owner, newAdmin, user1, user2 };
  }

  const getHash = (text: string) => ethers.keccak256(ethers.toUtf8Bytes(text));

  describe("1. User Management", function () {
    it("Should register a user and update checkUser", async function () {
      const { contract, owner, user1 } = await deployFixture();
      
      expect(await contract.checkUser(user1.address)).to.equal(false);
      
      await expect(contract.connect(owner).registerUser(user1.address))
        .to.emit(contract, "UserRegistered")
        .withArgs(user1.address);
      
      expect(await contract.checkUser(user1.address)).to.equal(true);
    });

    it("Should fail if a normal user tries to register someone", async function () {
      const { contract, user1, user2 } = await deployFixture();
      await expect(contract.connect(user1).registerUser(user2.address))
        .to.be.revertedWith("Only admin or owner can perform this");
    });
  });

  describe("2. Admin & Moderation (Red Flag)", function () {
    const imgHash = getHash("fake_image");

    it("Should allow owner to add a new admin", async function () {
      const { contract, owner, newAdmin } = await deployFixture();
      
      await expect(contract.connect(owner).addAdmin(newAdmin.address))
        .to.emit(contract, "AdminAdded")
        .withArgs(newAdmin.address);

      expect(await contract.isAdmin(newAdmin.address)).to.equal(true);
    });

    it("Should allow owner to remove an admin", async function () {
      const { contract, owner, newAdmin } = await deployFixture();
      await contract.connect(owner).addAdmin(newAdmin.address);

      await expect(contract.connect(owner).removeAdmin(newAdmin.address))
      .to.emit(contract, "AdminRemoved")
      .withArgs(newAdmin.address);

      expect(await contract.isAdmin(newAdmin.address)).to.equal(false);
    })

    it("Should allow admin to flag a fake image and prevent its transfer", async function () {
      const { contract, owner, newAdmin, user1, user2 } = await deployFixture();
      
      await contract.connect(owner).addAdmin(newAdmin.address);
      await contract.connect(newAdmin).registerUser(user1.address);
      await contract.connect(user1).registerImage(imgHash, "cid_fake");

      await expect(contract.connect(newAdmin).flagImage(imgHash))
        .to.emit(contract, "ImageFlagged")
        .withArgs(imgHash);

      const imgDetails = await contract.verifyImage(imgHash);
      expect(imgDetails.isTampered).to.equal(true);

      await contract.connect(newAdmin).registerUser(user2.address);
      await expect(contract.connect(user1).transferImage(imgHash, user2.address))
        .to.be.revertedWith("Cannot transfer a tempered/flagged image");
    });
  });

  describe("3. Image Registration", function () {
    const imgHash = getHash("thesis_image_01");
    const cid = "QmThesis123456789";

    it("Should allow registered user to register image", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address); 

      await expect(contract.connect(user1).registerImage(imgHash, cid))
        .to.emit(contract, "ImageRegistered")
        .withArgs(user1.address, imgHash, cid);

      expect(await contract.totalImages()).to.equal(1n);
      expect(await contract.imageExists(imgHash)).to.equal(true);
    });

    it("Should fail if unregistered user tries to register image", async function () {
      const { contract, user1 } = await deployFixture();
      await expect(contract.connect(user1).registerImage(imgHash, cid))
        .to.be.revertedWith("Please register as a user first");
    });
  });

  describe("4. Data Retrieval & Dashboards", function () {
    it("Should return correct lists for dashboards", async function () {
      const { contract, owner, user1, user2 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(owner).registerUser(user2.address);

      const hash1 = getHash("img1");
      const hash2 = getHash("img2");

      await contract.connect(user1).registerImage(hash1, "cid1");
      await contract.connect(user2).registerImage(hash2, "cid2");

      const all = await contract.getAllImages();
      expect(all.length).to.equal(2);
      expect(all).to.include(hash1);

      const user1Images = await contract.getUserImages(user1.address);
      expect(user1Images.length).to.equal(1);
      expect(user1Images[0]).to.equal(hash1);
    });

    it("verifyImage: Should return full struct details", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      const hash = getHash("verify_me");
      await contract.connect(user1).registerImage(hash, "cid_verify");

      const data = await contract.verifyImage(hash);
      expect(data.imageHash).to.equal(hash);
      expect(data.owner).to.equal(user1.address);
      expect(data.isTampered).to.equal(false); 
    });
  });

  describe("5. Ownership Transfer & History", function () {
    const hash = getHash("transfer_asset");

    it("Should transfer image and update history correctly", async function () {
      const { contract, owner, user1, user2 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(owner).registerUser(user2.address);
      await contract.connect(user1).registerImage(hash, "cid_trans");

      await expect(contract.connect(user1).transferImage(hash, user2.address))
        .to.emit(contract, "ImageTransferred")
        .withArgs(hash, user1.address, user2.address);

      const details = await contract.verifyImage(hash);
      expect(details.owner).to.equal(user2.address);

      const history = await contract.getImageHistory(hash);
      expect(history.length).to.equal(2);
      expect(history[0]).to.equal(user1.address); 
      expect(history[1]).to.equal(user2.address); 

      const user1List = await contract.getUserImages(user1.address);
      expect(user1List.length).to.equal(0);
      const user2List = await contract.getUserImages(user2.address);
      expect(user2List[0]).to.equal(hash);
    });

    it("Security: Should prevent non-owner from transferring", async function () {
      const { contract, owner, user1, user2 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(owner).registerUser(user2.address);
      await contract.connect(user1).registerImage(hash, "cid_fail");

      await expect(contract.connect(user2).transferImage(hash, user1.address))
        .to.be.revertedWith("You are not the owner of this image");
    });
  });

  describe("6. Revoke & Blacklist (Scammer Prevention)", function () {
    it("Should revoke a user and prevent re-registration", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);

      await expect(contract.connect(owner).revokeUser(user1.address))
        .to.emit(contract, "UserRevoked")
        .withArgs(user1.address);

      expect(await contract.checkUser(user1.address)).to.equal(false);
      expect(await contract.isBlacklisted(user1.address)).to.equal(true);

      await expect(contract.connect(owner).registerUser(user1.address))
        .to.be.revertedWith("User is permanently blacklisted");
    });
  });

  describe("7. Metadata Updates", function () {
    const hash = getHash("update_meta");

    it("Should allow owner to update metadata", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(user1).registerImage(hash, "old_cid");

      await expect(contract.connect(user1).updateMetadata(hash, "new_cid"))
        .to.emit(contract, "MetadataUpdated")
        .withArgs(hash, "old_cid", "new_cid");

      const details = await contract.verifyImage(hash);
      expect(details.metadataCID).to.equal("new_cid");
    });

    it("Should not allow update if image is burned", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(user1).registerImage(hash, "cid");
      
      await contract.connect(user1).burnImage(hash);

      await expect(contract.connect(user1).updateMetadata(hash, "new_cid"))
        .to.be.revertedWith("You are not the owner of this image"); 
        // Burn korar por owner zero address hoye jay, tai ei error ta asbe
    });
  });

  describe("8. Unflag & Burn Asset (Hybrid Burn)", function () {
    const hash = getHash("burn_unflag");

    it("Should allow admin to unflag a tempered image", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      await contract.connect(user1).registerImage(hash, "meta_cid");

      await contract.connect(owner).flagImage(hash); 
      
      await expect(contract.connect(owner).unflagImage(hash))
        .to.emit(contract, "ImageUnflagged")
        .withArgs(hash);

      const details = await contract.verifyImage(hash);
      expect(details.isTampered).to.equal(false);
    });

    it("Should allow owner to burn image, sending ownership to zero address", async function () {
      const { contract, owner, user1 } = await deployFixture();
      await contract.connect(owner).registerUser(user1.address);
      
      const burnHash = getHash("burn_me");
      await contract.connect(user1).registerImage(burnHash, "meta_cid");

      await expect(contract.connect(user1).burnImage(burnHash))
        .to.emit(contract, "ImageBurned")
        .withArgs(burnHash, user1.address);

      const details = await contract.verifyImage(burnHash);
      expect(details.isBurned).to.equal(true);
      expect(details.owner).to.equal(ethers.ZeroAddress);

      const history = await contract.getImageHistory(burnHash);
      expect(history[history.length - 1]).to.equal(ethers.ZeroAddress);

      const userImages = await contract.getUserImages(user1.address);
      expect(userImages).to.not.include(burnHash);
    });
  });
});