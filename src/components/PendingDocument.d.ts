export interface PendingDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  name?: string; // Document type name
  fileName: string;
  originalFileName?: string;
  url: string;
  publicId?: string;
  uploadedAt: number;
  status: "pending" | "approved" | "rejected";
  fileSize?: number;
  comment?: string; // For rejection comments
  verifiedBy?: string; // Email of admin who verified
  verifiedAt?: number; // Timestamp of verification
  showRejectionForm?: boolean; // Flag to show rejection form in preview
} 