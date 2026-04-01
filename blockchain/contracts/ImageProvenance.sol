// SPDX-License-Identifier: MIT
pragma solidity ^0.8.32;

contract ImageProvenance {
  
  address public owner;
  
  uint256 public totalImages;
  bytes32[] public allImageHashes;

  struct Image {
      bytes32 imageHash;
      string metadataCID;
      address owner;
      uint256 timestamp;
      bool isTampered;
      bool isBurned;
  }

  mapping (address => bytes32[]) private userImages;
  mapping (bytes32 => address[]) private imageHistory;
  mapping(address => bool) public isAdmin;
  mapping(address => bool) public isUserRegistered;
  mapping(address => bool) public isBlacklisted;
  mapping(bytes32 => Image) public images;
  mapping(bytes32 => bool) public imageExists;

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

  // Sudhu owner eita call korte parbe
  modifier onlyOwner() {
      require(msg.sender == owner, "Only owner can perform this action");
      _;
  }

  // Owner ba assigned admin duijonei eita call korte parbe
  modifier onlyAdminOrOwner() {
      require(isAdmin[msg.sender] || msg.sender == owner, "Only admin or owner can perform this");
      _;
  }

  constructor() {
      owner = msg.sender;
      isAdmin[msg.sender] = true;
  }

  // notun admin add korar function
  function addAdmin(address _newAdmin) external onlyOwner {
      require(_newAdmin != address(0), "Invalid address for new admin");
      require(!isAdmin[_newAdmin], "Address is already an admin");
      
      isAdmin[_newAdmin] = true;
      emit AdminAdded(_newAdmin);
  }

  // Admin remove korar function
  function removeAdmin(address _admin) external onlyOwner {
    require(isAdmin[_admin], "Address is not admin");
    require(_admin != owner, "Cannot remove the owner from admin");

    isAdmin[_admin] = false;
    emit AdminRemoved(_admin);
  }

  function checkUser(address _user) public view returns (bool) {
      return isUserRegistered[_user];
  }

  // hired admin ba owner jkeu user approve korte parbe
  function registerUser(address _user) external onlyAdminOrOwner {
      require(!isUserRegistered[_user], "User already registered");
      require(!isBlacklisted[_user], "User is permanently blacklisted");
      require(_user != address(0), "Address invalid");
      
      isUserRegistered[_user] = true;
      emit UserRegistered(_user);
  }

  // Scammer k ban korar function
  function revokeUser(address _user) external onlyAdminOrOwner {
    require(isUserRegistered[_user], "User is not registered");
    isUserRegistered[_user] = false;
    isBlacklisted[_user] = true;
    emit UserRevoked(_user);
  }

  // image register korar function
  function registerImage(bytes32 _hash, string memory _metadataCID) external {
      require(isUserRegistered[msg.sender], "Please register as a user first");
      require(!imageExists[_hash], "Image already registered");
      require(_hash != bytes32(0), "Invalid image hash");

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
      imageHistory[_hash].push(msg.sender);
      totalImages++;
      
      emit ImageRegistered(msg.sender, _hash, _metadataCID);
  }

  // Metadata update korar function
  function updateMetadata(bytes32 _hash, string memory _newMetadataCID) external {
      require(imageExists[_hash], "Image does not exist");
      require(images[_hash].owner == msg.sender, "You are not the owner of this image");
      require(!images[_hash].isTampered, "Cannot update metadata for a tempered/flagged image");
      require(!images[_hash].isBurned, "Cannot update metadata for a burned image");

      string memory oldMetadataCID = images[_hash].metadataCID;
      images[_hash].metadataCID = _newMetadataCID;

      emit MetadataUpdated(_hash, oldMetadataCID, _newMetadataCID);
  }

  // admin ba owner fake chobi red flag korte parbe
  function flagImage(bytes32 _hash) external onlyAdminOrOwner {
      require(imageExists[_hash], "Image does not exist");
      require(!images[_hash].isBurned, "Cannot flag a burned image");
      images[_hash].isTampered = true;
      emit ImageFlagged(_hash);
  }

  // admin bhul kore kono image flag korle seta thik korar jonno
  function unflagImage(bytes32 _hash) external onlyAdminOrOwner {
    require(imageExists[_hash], "Image does not exist");
    require(images[_hash].isTampered, "image is not flag");
    images[_hash].isTampered = false;
    emit ImageUnflagged(_hash);
  }

  // Hybrid burn function
  function burnImage(bytes32 _hash) external {
    require(imageExists[_hash], "Image does not exist");
    require(images[_hash].owner == msg.sender, "Only owner can burn this image");
    require(!images[_hash].isBurned, "Image is already burned");

    images[_hash].isBurned = true;
    images[_hash].owner = address(0);

    _removeFromUserImages(msg.sender, _hash);

    imageHistory[_hash].push(address(0));

    emit ImageBurned(_hash, msg.sender);
  }

  function getAllImages() external view returns(bytes32[] memory) {
      return allImageHashes;
  }

  function getUserImages(address _user) external view returns(bytes32[] memory) {
      return userImages[_user];
  }

  function getImageHistory(bytes32 _hash) external view returns(address[] memory) {
      return imageHistory[_hash];
  }

  function verifyImage(bytes32 _hash) public view returns (Image memory) {
      require(_hash != bytes32(0), "Empty hash provided!");
      require(imageExists[_hash], "This image is not verified or does not exist");
      return images[_hash];
  }

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

  function _removeFromUserImages(address _user, bytes32 _hash) internal {
      bytes32[] storage list = userImages[_user];
      uint256 length = list.length;

      for(uint256 i = 0; i < length; i++) {
          if(list[i] == _hash) {
              list[i] = list[length - 1];
              list.pop();
              break;
          }
      }
  }
}