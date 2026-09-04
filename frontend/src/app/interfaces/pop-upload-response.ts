export interface PopUploadResponse {
    success: boolean;
    popImageUrl: string;// URL of the uploaded proof of payment image
    uploadedAt: string; // Date when the proof of payment was uploaded
    message: string;
}
