import api from "@/lib/axiosInstance";

export const uploadAndGenerateProvenanceApi = async (formData: FormData) => {
    const response = await api.post('/images/drafts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const confirmAndRegisterImageApi = async (payload: {
    title: string;
    description: string;
    assetCategory: string;
    tags: string[];
    fileDetails: {
        fileType: string;
        fileSize: number;
        width: number;
        height: number;
    };
    imageHash: string;
    watermarkID: string;
    imageCID: string;
    metadataCID: string;
    thumbnailUrl: string;
    transactionHash: string;
    originalAssetHash: string;
}) => {
    const response = await api.post('/images/', payload);
    return response.data;
};

export const getAllImagesApi = async (page: number = 1, limit: number = 24) => {
    const response = await api.get(`/images/?page=${page}&limit=${limit}`);
    return response.data;
};

export const getImageByHashApi = async (hash: string, viewerWallet?: string) => {
    const queryParams = viewerWallet ? `?viewerWallet=${viewerWallet}` : '';
    const response = await api.get(`/images/${hash}${queryParams}`);
    return response.data;
};

export const prepareMetadataUpdateApi = async (hash: string, payload: {
    title?: string;
    description?: string;
    assetCategory?: string;
    tags?: string;
}) => {
    const response = await api.post(`/images/${hash}/metadata/draft`, payload);
    return response.data;
};

export const confirmMetadataUpdateApi = async (hash: string, payload: {
    newMetadataCID: string;
    transactionHash: string;
}) => {
    const response = await api.patch(`/images/${hash}/metadata/confirm`, payload);
    return response.data;
};

export const confirmImageTransferApi = async (hash: string, payload: {
    newOwnerWallet: string;
    transactionHash: string;
}) => {
    const response = await api.patch(`/images/${hash}/transfer`, payload);
    return response.data;
};

export const confirmImageBurnApi = async (hash: string, payload: {
    transactionHash: string;
}) => {
    const response = await api.patch(`/images/${hash}/burn`, payload);
    return response.data;
};