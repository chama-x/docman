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
}

export interface Document {
  id: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: number;
  fileName: string;
}

export interface UserRole {
  isAdmin: boolean;
  isTeacher: boolean;
}

export interface User extends UserRole {
  uid: string;
  email: string;
  createdAt?: number;
} 