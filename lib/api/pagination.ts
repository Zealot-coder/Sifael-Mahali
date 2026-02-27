import { z } from 'zod';
import { paginationSchema } from '@/lib/validations';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function parsePagination(searchParams: URLSearchParams) {
  const raw = {
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined
  };
  return paginationSchema.parse(raw);
}

export function rangeFromPagination(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number | null
): PaginationMeta {
  const safeTotal = total ?? 0;
  return {
    page,
    pageSize,
    total: safeTotal,
    totalPages: Math.max(1, Math.ceil(safeTotal / pageSize))
  };
}

export const positiveIntQuerySchema = z.coerce.number().int().min(1);
