export interface DocumentType {
  id: string;
  name: string;
}

export interface DocumentCategory {
  [key: string]: string;
}

export interface DocumentCategories {
  common: DocumentCategory;
  teacher: DocumentCategory;
  nonAcademic?: DocumentCategory;
}

export interface Document {
  id: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: number;
  fileName: string;
  name?: string;
  originalFileName?: string;
  fileSize?: number;
  publicId?: string;
  lastModified?: number;
  verifiedBy?: string;
  verifiedAt?: number;
  rejectionReason?: string;
}

export interface UserRole {
  isAdmin: boolean;
  isTeacher: boolean;
  isNonAcademic?: boolean;
}

export interface User extends UserRole {
  uid: string;
  email: string;
  name?: string;
  createdAt?: number;
} 