// SPDX-License-Identifier: MIT
pragma solidity ^0.8.32;

/**
 * @title ImageProvenance
 * @dev A smart contract for verifying digital image ownership and tracking provenance.
 * Works as the on-chain component of a hybrid Web2/Web3 architecture.
 */
contract ImageProvenance {

  // --- State Variables ---

  /// @notice The super-admin who deployed the contract
  address public owner;
  
  /// @notice Counter for the total number of unique images registered
  uint256 public totalImages;

  /// @notice Array containing all registered image hashes for global tracking  
  bytes32[] public allImageHashes;

  /**
   * @dev Main struct to hold image data on-chain.
   * imageHash: Unique identifier generated from the image file.
   * metadataCID: IPFS CID storing off-chain metadata.
   */
  struct Image {
      bytes32 imageHash; 
      string metadataCID; 
      address owner; // Current wallet address of the image owner
      uint256 timestamp; // Block timestamp when the image was registered
      bool isTampered; // True if the image is flagged as fake/stolen
      bool isBurned; // True if the owner decides to remove the image's validity
  }

  // --- Mappings ---

  /// @dev Tracks which images belong to a specific user wallet
  mapping (address => bytes32[]) private userImages;

  /// @dev Tracks the ownership lifecycle (provenance chain) of a specific image
  mapping (bytes32 => address[]) private imageHistory;

  // Access control mappings
  mapping(address => bool) public isAdmin;
  mapping(address => bool) public isUserRegistered;
  mapping(address => bool) public isBlacklisted;

  // Core data mappings 
  mapping(bytes32 => Image) public images;
  mapping(bytes32 => bool) public imageExists;

  // --- Events ---

  // Events to notify the off-chain
  event UserRegistered(address indexed user);
  event UserRevoked(address indexed user);
  event ImageRegistered(address indexed creator, bytes32 hash, string metadataCID);
  event ImageTransferred(bytes32 indexed hash, address indexed from, address indexed to);
  event ImageFlagged(bytes32 indexed hash);
  event ImageUnflagged(bytes32 indexed hash);
  event ImageBurned(bytes32 indexed hash, address indexed owner);
  event AdminAdded(address indexed newAdmin);
  event AdminRemoved(address indexed admin);
  event MetadataUpdated(bytes32 indexed hash, string oldMetadataCID, string newMetadataCID);

  // --- Modifiers ---

  /**
   * @dev Restricts execution to the contract deployer only.
   */
  modifier onlyOwner() {
      require(msg.sender == owner, "Only owner can perform this action");
      _;
  }

  /**
   * @dev Restricts execution to either an admin or the contract owner.
   */
  modifier onlyAdminOrOwner() {
      require(isAdmin[msg.sender] || msg.sender == owner, "Only admin or owner can perform this");
      _;
  }

  constructor() {
      owner = msg.sender;
      isAdmin[msg.sender] = true; // Owner is granted admin rights by default
  }

  // --- Admin & User Management Functions ---

  /**
   * @notice Assigns admin roles to a trusted wallet.
   * @dev Only the contract owner can call this.
   * @param _newAdmin The address to be promoted to admin.
   */
  function addAdmin(address _newAdmin) external onlyOwner {
      // 1. Checks
      require(_newAdmin != address(0), "Invalid address for new admin");
      require(!isAdmin[_newAdmin], "Address is already an admin");
      
      // 2. Effects
      isAdmin[_newAdmin] = true;

      // 3. Interactions / Events
      emit AdminAdded(_newAdmin);
  }

  /**
   * @notice Revokes admin privileges from an existing admin.
   * @param _admin The address to be demoted.
   */
  function removeAdmin(address _admin) external onlyOwner {
    require(isAdmin[_admin], "Address is not admin");
    require(_admin != owner, "Cannot remove the owner from admin");

    isAdmin[_admin] = false;
    emit AdminRemoved(_admin);
  }

  /**
   * @notice Verifies if a user wallet is active in the system.
   * @param _user The wallet address to check.
   * @return bool Returns true if registered, false otherwise.
   */
  function checkUser(address _user) public view returns (bool) {
      return isUserRegistered[_user];
  }

  /**
   * @notice Approves a new user to interact with the system.
   * @dev Called by the Node.js backend after MongoDB registration.
   * @param _user The user's wallet address.
   */
  function registerUser(address _user) external onlyAdminOrOwner {
      require(!isUserRegistered[_user], "User already registered");
      require(!isBlacklisted[_user], "User is permanently blacklisted");
      require(_user != address(0), "Address invalid");
      
      isUserRegistered[_user] = true;
      emit UserRegistered(_user);
  }

  /**
   * @notice Permanently bans a malicious user from the platform.
   * @dev Sets registration to false and blacklist to true.
   */
  function revokeUser(address _user) external onlyAdminOrOwner {
    require(isUserRegistered[_user], "User is not registered");
    isUserRegistered[_user] = false;
    isBlacklisted[_user] = true; // Permanent ban
    emit UserRevoked(_user);
  }

  // --- Core Image Functions ---

  /**
   * @dev Registers a new image hash on the blockchain.
   * @param _hash The unique Keccak256 hash of the image file.
   * @param _metadataCID The IPFS CID containing additional image details.
   */
  function registerImage(bytes32 _hash, string memory _metadataCID) external {
      // 1. Security Checks
      require(isUserRegistered[msg.sender], "Please register as a user first");
      require(!imageExists[_hash], "Image already registered");
      require(_hash != bytes32(0), "Invalid image hash");
      
      // 2. Updating Storage
      images[_hash] = Image({
          imageHash: _hash,
          metadataCID: _metadataCID,
          owner: msg.sender,
          timestamp: block.timestamp,
          isTampered: false,
          isBurned: false
      });

      imageExists[_hash] = true;
      allImageHashes.push(_hash);
      userImages[msg.sender].push(_hash);

      // 3. Track initial ownership in history
      imageHistory[_hash].push(msg.sender);
      totalImages++;
      
      // 4. Event Emission
      emit ImageRegistered(msg.sender, _hash, _metadataCID);
  }

  /**
   * @dev Updates the IPFS CID if off-chain metadata changes.
   */
  function updateMetadata(bytes32 _hash, string memory _newMetadataCID) external {
      require(imageExists[_hash], "Image does not exist");
      require(images[_hash].owner == msg.sender, "You are not the owner of this image");
      require(!images[_hash].isTampered, "Cannot update metadata for a tempered/flagged image");
      require(!images[_hash].isBurned, "Cannot update metadata for a burned image");

      string memory oldMetadataCID = images[_hash].metadataCID;
      images[_hash].metadataCID = _newMetadataCID;

      emit MetadataUpdated(_hash, oldMetadataCID, _newMetadataCID);
  }

  /**
   * @notice Flags an image as counterfeit or malicious based on reports.
   * @dev Only accessible by admins after reviewing user reports from the backend.
   */
  function flagImage(bytes32 _hash) external onlyAdminOrOwner {
      require(imageExists[_hash], "Image does not exist");
      require(!images[_hash].isBurned, "Cannot flag a burned image");
      images[_hash].isTampered = true;
      emit ImageFlagged(_hash);
  }

  /**
   * @dev Removes the flag from an image if it was falsely flagged.
   */
  function unflagImage(bytes32 _hash) external onlyAdminOrOwner {
    require(imageExists[_hash], "Image does not exist");
    require(images[_hash].isTampered, "image is not flag");
    images[_hash].isTampered = false;
    emit ImageUnflagged(_hash);
  }

  /**
   * @notice Transfers ownership of an image to a new user.
   * @dev Updates the provenance history and user tracking arrays.
   * @param _hash The image hash to transfer.
   * @param _to The wallet address of the new owner.
   */
  function transferImage(bytes32 _hash, address _to) external {
      require(images[_hash].owner == msg.sender, "You are not the owner of this image");
      require(isUserRegistered[_to], "Recipient is not a registered user");
      require(_to != address(0), "Cannot transfer to zero address");
      require(!images[_hash].isTampered, "Cannot transfer a tempered/flagged image");
      require(!images[_hash].isBurned, "Cannot transfer a burned image");

      images[_hash].owner = _to;
      userImages[_to].push(_hash);
      imageHistory[_hash].push(_to);

      _removeFromUserImages(msg.sender, _hash);

      emit ImageTransferred(_hash, msg.sender, _to);
  }

  /**
   * @notice Logically deletes the image from the system (Burning).
   * @dev Transfers ownership to address(0) instead of deleting the struct to maintain history.
   */
  function burnImage(bytes32 _hash) external {
    require(imageExists[_hash], "Image does not exist");
    require(images[_hash].owner == msg.sender, "Only owner can burn this image");
    require(!images[_hash].isBurned, "Image is already burned");

    images[_hash].isBurned = true;
    images[_hash].owner = address(0);

    _removeFromUserImages(msg.sender, _hash);

    // Record the burn event in the provenance history
    imageHistory[_hash].push(address(0));

    emit ImageBurned(_hash, msg.sender);
  }

  // --- Getter Functions ---

  /// @notice Returns all image hashes registered in the platform
  function getAllImages() external view returns(bytes32[] memory) {
      return allImageHashes;
  }

  /// @notice Returns all image hashes owned by a specific user
  function getUserImages(address _user) external view returns(bytes32[] memory) {
      return userImages[_user];
  }
  
  /// @notice Returns the full ownership history of a specific image
  function getImageHistory(bytes32 _hash) external view returns(address[] memory) {
      return imageHistory[_hash];
  }

  /// @notice Fetches the complete Image struct data for verification
  function verifyImage(bytes32 _hash) public view returns (Image memory) {
      require(_hash != bytes32(0), "Empty hash provided!");
      require(imageExists[_hash], "This image is not verified or does not exist");
      return images[_hash];
  }

  // --- Internal Utilities ---

  /**
   * @dev Internal helper to remove an element from a user's array.
   * Employs the 'Swap and Pop' algorithm: O(1) time complexity to save gas.
   * @param _user The wallet address of the user.
   * @param _hash The image hash to remove from their tracking array.
   */
  function _removeFromUserImages(address _user, bytes32 _hash) internal {
      bytes32[] storage list = userImages[_user];
      uint256 length = list.length;

      for(uint256 i = 0; i < length; i++) {
          if(list[i] == _hash) {
              list[i] = list[length - 1]; // Swap with the last element
              list.pop(); // Remove the last element
              break;
          }
      }
  }
}