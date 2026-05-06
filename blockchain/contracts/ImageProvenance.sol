// SPDX-License-Identifier: MIT
pragma solidity ^0.8.32;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title ProveNode Image Provenance Contract
 * @dev A smart contract for verifying digital image ownership and tracking provenance.
 * Implements a hybrid Web2/Web3 architecture using invisible watermark and keccak256 hash.
 */
contract ImageProvenance is Ownable2Step {
    using ECDSA for bytes32;

    //---Custom errors---

    error NotAuthorized();
    error UserNotRegistered();
    error UserAlreadyRegistered();
    error ImageAlreadyExists();
    error WatermarkAlreadyRegistered(bytes32 originalHash);
    error InvalidSignature();
    error InvalidAddress();
    error ImageNotExists();
    error CannotTransferToSelf();

    //---State Variables---

    /// @notice Counter for the total number of unique images registered globally
    uint256 public totalImages;

    /**
     * @dev Main struct to hold image asset data on-chain.
     * @param imageHash The unique identifier generated from the image file pixels.
     * @param watermarkID The invisible DNA ID embedded inside the image.
     * @param metadataCID The IPFS/Pinata CID storing off-chain metadata (name, description).
     * @param currentOwner The wallet address currently holding the rights to this image.
     * @param timestamp The block timestamp when the image was first registered.
     * @param isBurned Boolean flag indicating if the image has been logically deleted.
     */
    struct Image {
        bytes32 imageHash; 
        bytes32 watermarkID;
        string metadataCID; 
        address currentOwner; // Current wallet address of the image owner
        uint256 timestamp; // Block timestamp when the image was registered
        bool isBurned; // True if the owner decides to remove the image's validity
    }

    // --- Mappings ---

    /// @dev Maps an image hash to its full Image struct details
    mapping(bytes32 => Image) public images;

    /// @dev Quick lookup to check if an image hash exists in the system
    mapping(bytes32 => bool) public imageExists;

    // @dev Maps a watermark ID to its original image hash (Prevents Shadow Ownership)
    mapping(bytes32 => bytes32) public watermarkToOriginal;

    /// @dev Registry of authorized users who can interact with the contract
    mapping(address => bool) public isUserRegistered;

    /// @dev Stores an array of image hashes owned by a specific user address
    mapping (address => bytes32[]) private userImages;

    /// @dev Maps an image hash to its exact index inside the userImages array (Used for O(1) removal)
    mapping(bytes32 => uint256) private hashToIndex;

    // --- Events ---

    event UserRegistered(address indexed user);
    event ImageRegistered(address indexed creator, bytes32 indexed hash, bytes32 watermarkID, string metadataCID);
    event ImageTransferred(bytes32 indexed hash, address indexed from, address indexed to);
    event ImageBurned(bytes32 indexed hash, address indexed owner);
    event MetadataUpdated(bytes32 indexed hash, string newMetadataCID);

    constructor() Ownable(msg.sender) {}

   /**
     * @notice Registers a new user to the ProveNode platform.
     * @dev Only the contract owner (ProveNode Backend Admin) can call this.
     * @param _user The wallet address of the user to be registered.
     */
    function registerUser(address _user) external onlyOwner {
        if(isUserRegistered[_user]) revert UserAlreadyRegistered();
        if(_user == address(0)) revert InvalidAddress();

        isUserRegistered[_user] = true;
        emit UserRegistered(_user);
    }
    
    /**
     * @notice Registers a new image and Signature Verification.
     * @dev Uses ECDSA signatures to prevent frontrunning attacks in the mempool.
     * @param _imageHash Original file hash.
     * @param _watermarkID Invisible Watermark ID.
     * @param _metadataCID Pinata IPFS CID containing asset metadata.
     * @param _signature ECDSA signature generated off-chain by the creator's wallet.
     */
    function registerImage(
        bytes32 _imageHash,
        bytes32 _watermarkID,
        string calldata _metadataCID,
        bytes calldata _signature
    ) external {
        if(!isUserRegistered[msg.sender]) revert UserNotRegistered();
        if(imageExists[_imageHash]) revert ImageAlreadyExists();

        // Anti-Frontrunning: Verify that the caller is the actual signer of the data
        bytes32 messageHash = keccak256(abi.encodePacked(_imageHash, _watermarkID));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        if(ECDSA.recover(ethSignedMessageHash, _signature) != msg.sender) {
            revert InvalidSignature(); 
        }

        // Prevent registering a new image with an already existing invisible Watermark
        if(watermarkToOriginal[_watermarkID] != bytes32(0)) {
            revert WatermarkAlreadyRegistered(watermarkToOriginal[_watermarkID]);
        }

        // Store image data
        images[_imageHash] = Image({
            imageHash: _imageHash,
            watermarkID: _watermarkID,
            currentOwner: msg.sender,
            timestamp: uint64(block.timestamp),
            isBurned: false,
            metadataCID: _metadataCID
        });

        // Update state trackers
        imageExists[_imageHash] = true;
        watermarkToOriginal[_watermarkID] = _imageHash;

        _addToUserCollections(msg.sender, _imageHash);
        totalImages++;

        emit ImageRegistered(msg.sender, _imageHash, _watermarkID, _metadataCID);
    }

    /**
     * @dev Adds an image hash to a user's collection and records its index.
     */
    function _addToUserCollections(address _user, bytes32 _hash) internal {
        hashToIndex[_hash] = userImages[_user].length;
        userImages[_user].push(_hash);
    }

    /**
     * @notice Allows the CURRENT owner to update the IPFS metadata.
     * @param _hash The unique image hash.
     * @param _newMetadataCID The new Pinata IPFS CID.
     */
    function updateMetadata(bytes32 _hash, string calldata _newMetadataCID) external {
        if(!imageExists[_hash]) revert ImageNotExists();
        if(images[_hash].currentOwner != msg.sender) revert NotAuthorized();
        if(images[_hash].isBurned) revert ImageNotExists();

        images[_hash].metadataCID = _newMetadataCID;

        emit MetadataUpdated(_hash, _newMetadataCID);
    }

    /**
     * @notice Transfers ownership of an image to a new registered user.
     * @param _hash The image hash to transfer.
     * @param _to The wallet address of the new owner.
     */
    function transferImage(bytes32 _hash, address _to) external {
       if(!imageExists[_hash]) revert ImageNotExists();
       if(images[_hash].currentOwner != msg.sender) revert NotAuthorized();
       if(!isUserRegistered[_to]) revert UserNotRegistered();
       if(_to == msg.sender) revert CannotTransferToSelf(); // Prevents array bloat
       if(images[_hash].isBurned) revert ImageNotExists();

       _removeFromUserCollections(msg.sender, _hash);
       images[_hash].currentOwner = _to;
       _addToUserCollections(_to, _hash);

       emit ImageTransferred(_hash, msg.sender, _to);
    }

    /**
     * @notice Logically deletes the image from the system.
     * @dev Removes from active gallery but keeps the watermark DNA locked to prevent reuse.
     * @param _hash The image hash to burn.
     */
    function burnImage(bytes32 _hash) external {
        if(!imageExists[_hash]) revert ImageNotExists();
        if(images[_hash].currentOwner != msg.sender) revert NotAuthorized();
        if(images[_hash].isBurned) revert ImageNotExists();

        images[_hash].isBurned = true;
        images[_hash].currentOwner = address(0);

        _removeFromUserCollections(msg.sender, _hash);

        emit ImageBurned(_hash, msg.sender);
    }

    /**
     * @dev Removes an image from a user's collection using the O(1) 'Swap and Pop' algorithm.
     * This prevents expensive gas costs that occur when shifting arrays during deletion.
     */
    function _removeFromUserCollections(address _user, bytes32 _hash) internal {
        uint256 indexToRemove = hashToIndex[_hash];
        bytes32[] storage list = userImages[_user];

        bytes32 lastHash = list[list.length - 1]; // Get the last element
        list[indexToRemove] = lastHash; // Move the last element to the deleted spot
        hashToIndex[lastHash] = indexToRemove; // Update index for the moved element
        list.pop(); // Remove the now-duplicate last element
        delete hashToIndex[_hash]; // Clear the deleted item's index
    }

    /**
     * @notice Automates the Provenance Check.
     * @dev Called by the Web2 backend to verify image authenticity.
     * @param _newHash The kecchak256 hash of the image being checked.
     * @param _extractedWatermarkID The Invisible DNA ID extracted from the image.
     * @return status A string explaining the provenance state (Authentic, Tempered, or Unknown).
     * @return originalOwner The true owner of the asset (Address zero if unknown).
     */
    function verify(bytes32 _newHash, bytes32 _extractedWatermarkID) external view returns (string memory status, address originalOwner) {
        bytes32 originalHash = watermarkToOriginal[_extractedWatermarkID];

        if(originalHash == bytes32(0)) {
            return ("New or Unknown Asset", address(0));
        }
        if(originalHash == _newHash) {
            return ("Authentic & Original", images[originalHash].currentOwner);
        } else {
            return ("Tempered/Edited - DNA Matched to Original Owner", images[originalHash].currentOwner);
        }
    }

    /**
     * @notice Returns all image hashes currently owned by a specific user.
     * @dev O(1) array call, very cheap on gas for frontend dashboard rendering.
     * @param _user The address of the user.
     * @return An array of bytes32 image hashes.
     */
    function getUserImages(address _user) external view returns(bytes32[] memory) {
        return userImages[_user];
    }

    /**
     * @notice Fetches the complete metadata and details of a specific image.
     * @param _hash The specific image hash to query.
     * @return The complete Image struct data.
     */
    function getImageDetails(bytes32 _hash) external view returns (Image memory) {
        if(!imageExists[_hash]) revert ImageNotExists();
        return images[_hash];
    }
}