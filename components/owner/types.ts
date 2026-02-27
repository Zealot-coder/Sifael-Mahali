export type OwnerSectionId =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'certifications'
  | 'testimonials'
  | 'blog'
  | 'messages'
  | 'analytics'
  | 'settings';

export interface OwnerSection {
  description: string;
  id: OwnerSectionId;
  label: string;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface OwnerToast {
  id: number;
  kind: ToastKind;
  message: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
  pagination?: PaginationMeta;
}
