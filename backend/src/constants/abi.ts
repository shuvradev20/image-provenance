export const PROVENANCE_ABI = [
    // User & Admin Events
    "event UserRegistered(address indexed user)",
    "event UserRevoked(address indexed user)",
    "event AdminAdded(address indexed newAdmin)",
    "event AdminRemoved(address indexed admin)",
    
    // Image Events
    "event ImageRegistered(address indexed creator, bytes32 hash, string metadataCID)",
    "event ImageTransferred(bytes32 indexed hash, address indexed from, address indexed to)",
    "event ImageFlagged(bytes32 indexed hash)",
    "event ImageUnflagged(bytes32 indexed hash)",
    "event ImageBurned(bytes32 indexed hash, address indexed owner)",
    "event MetadataUpdated(bytes32 indexed hash, string oldMetadataCID, string newMetadataCID)",

    "function images(bytes32) view returns (bytes32 imageHash, string metadataCID, address owner, uint256 timestamp, bool isTampered, bool isBurned)"
];