// src/lib/contract.ts

export const CONTRACT_ADDRESS = "0xe8dE3089dCFf50b247C5e801D43830460C98f17B";

export const CONTRACT_ABI = [
    // --- Custom Errors ---
    "error NotAuthorized()",
    "error UserNotRegistered()",
    "error UserAlreadyRegistered()",
    "error ImageAlreadyExists()",
    "error WatermarkAlreadyRegistered(bytes32 originalHash)",
    "error InvalidSignature()",
    "error InvalidAddress()",
    "error ImageNotExists()",
    "error CannotTransferToSelf()",

    // --- Events ---
    "event UserRegistered(address indexed user)",
    "event ImageRegistered(address indexed creator, bytes32 indexed hash, bytes32 watermarkID, string metadataCID)",
    "event ImageTransferred(bytes32 indexed hash, address indexed from, address indexed to)",
    "event ImageBurned(bytes32 indexed hash, address indexed owner)",
    "event MetadataUpdated(bytes32 indexed hash, string newMetadataCID)",

    // --- Core Functions ---
    "function registerUser(address _user) external",
    "function registerImage(bytes32 _imageHash, bytes32 _watermarkID, string calldata _metadataCID, bytes calldata _signature) external",
    "function updateMetadata(bytes32 _hash, string calldata _newMetadataCID) external",
    "function transferImage(bytes32 _hash, address _to) external",
    "function burnImage(bytes32 _hash) external",
    
    // --- View/Read Functions ---
    "function verify(bytes32 _newHash, bytes32 _extractedWatermarkID) external view returns (string status, address originalOwner)",
    "function getUserImages(address _user) external view returns (bytes32[])",
    "function getImageDetails(bytes32 _hash) external view returns (tuple(bytes32 imageHash, bytes32 watermarkID, string metadataCID, address currentOwner, uint256 timestamp, bool isBurned))",
    
    // --- Public State Variables (Getters) ---
    "function totalImages() external view returns (uint256)",
    "function images(bytes32) external view returns (bytes32 imageHash, bytes32 watermarkID, string metadataCID, address currentOwner, uint256 timestamp, bool isBurned)",
    "function imageExists(bytes32) external view returns (bool)",
    "function watermarkToOriginal(bytes32) external view returns (bytes32)",
    "function isUserRegistered(address) external view returns (bool)",
    "function owner() external view returns (address)"
];