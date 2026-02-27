import { z } from 'zod';

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugSchema = z.string().regex(slugRegex, 'Invalid slug format.');
export const idSchema = z.string().uuid('Invalid id.');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});

export const profileUpdateSchema = z
  .object({
    full_name: z.string().min(2).max(120),
    headline: z.string().max(240),
    bio: z.string().max(5000),
    location: z.string().max(180),
    email: z.string().email().max(320),
    phone: z.string().max(60).nullable(),
    avatar_url: z.string().url().max(2048).nullable(),
    cv_url: z.string().url().max(2048).nullable(),
    open_to_work: z.boolean(),
    social_links: z.record(z.string(), z.string().max(2048)),
    tech_stack: z.array(z.string().min(1).max(80)).max(100),
    highlights: z.array(z.string().min(1).max(300)).max(20),
    seo_title: z.string().max(120).nullable(),
    seo_description: z.string().max(300).nullable()
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field is required.'
  });

export const projectCreateSchema = z.object({
  title: z.string().min(2).max(160),
  slug: slugSchema,
  description: z.string().min(1).max(600),
  long_description: z.string().max(12000).nullable().optional(),
  thumbnail_url: z.string().url().max(2048).nullable().optional(),
  demo_url: z.string().url().max(2048).nullable().optional(),
  repo_url: z.string().url().max(2048).nullable().optional(),
  tech_stack: z.array(z.string().min(1).max(80)).max(40).default([]),
  categories: z.array(z.string().min(1).max(40)).max(20).default([]),
  is_pinned: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  display_order: z.number().int().min(0).default(0)
});

export const projectUpdateSchema = z
  .object({
    id: idSchema,
    title: z.string().min(2).max(160).optional(),
    slug: slugSchema.optional(),
    description: z.string().min(1).max(600).optional(),
    long_description: z.string().max(12000).nullable().optional(),
    thumbnail_url: z.string().url().max(2048).nullable().optional(),
    demo_url: z.string().url().max(2048).nullable().optional(),
    repo_url: z.string().url().max(2048).nullable().optional(),
    tech_stack: z.array(z.string().min(1).max(80)).max(40).optional(),
    categories: z.array(z.string().min(1).max(40)).max(20).optional(),
    is_pinned: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    display_order: z.number().int().min(0).optional(),
    deleted: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const experienceCreateSchema = z.object({
  type: z.enum(['work', 'education']),
  title: z.string().min(2).max(180),
  organization: z.string().min(2).max(180),
  org_logo_url: z.string().url().max(2048).nullable().optional(),
  location: z.string().max(180).nullable().optional(),
  location_type: z.enum(['on-site', 'remote', 'hybrid']).nullable().optional(),
  start_date: z.string().date(),
  end_date: z.string().date().nullable().optional(),
  is_current: z.boolean().default(false),
  description: z.string().max(2000).nullable().optional(),
  bullets: z.array(z.string().min(1).max(500)).max(50).default([]),
  skills: z.array(z.string().min(1).max(80)).max(50).default([]),
  display_order: z.number().int().min(0).default(0)
});

export const experienceUpdateSchema = z
  .object({
    id: idSchema,
    type: z.enum(['work', 'education']).optional(),
    title: z.string().min(2).max(180).optional(),
    organization: z.string().min(2).max(180).optional(),
    org_logo_url: z.string().url().max(2048).nullable().optional(),
    location: z.string().max(180).nullable().optional(),
    location_type: z.enum(['on-site', 'remote', 'hybrid']).nullable().optional(),
    start_date: z.string().date().optional(),
    end_date: z.string().date().nullable().optional(),
    is_current: z.boolean().optional(),
    description: z.string().max(2000).nullable().optional(),
    bullets: z.array(z.string().min(1).max(500)).max(50).optional(),
    skills: z.array(z.string().min(1).max(80)).max(50).optional(),
    display_order: z.number().int().min(0).optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const skillCreateSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  proficiency: z.number().int().min(0).max(100).default(70),
  icon_name: z.string().max(80).nullable().optional(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0)
});

export const skillUpdateSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1).max(120).optional(),
    category: z.string().min(1).max(80).optional(),
    proficiency: z.number().int().min(0).max(100).optional(),
    icon_name: z.string().max(80).nullable().optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().int().min(0).optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const certificationCreateSchema = z.object({
  name: z.string().min(2).max(220),
  issuer: z.string().min(2).max(180),
  issuer_logo_url: z.string().url().max(2048).nullable().optional(),
  issue_date: z.string().date().nullable().optional(),
  expiry_date: z.string().date().nullable().optional(),
  credential_id: z.string().max(120).nullable().optional(),
  credential_url: z.string().url().max(2048).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  display_order: z.number().int().min(0).default(0)
});

export const certificationUpdateSchema = z
  .object({
    id: idSchema,
    name: z.string().min(2).max(220).optional(),
    issuer: z.string().min(2).max(180).optional(),
    issuer_logo_url: z.string().url().max(2048).nullable().optional(),
    issue_date: z.string().date().nullable().optional(),
    expiry_date: z.string().date().nullable().optional(),
    credential_id: z.string().max(120).nullable().optional(),
    credential_url: z.string().url().max(2048).nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    display_order: z.number().int().min(0).optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const testimonialCreateSchema = z.object({
  author_name: z.string().min(2).max(140),
  author_title: z.string().max(180).default(''),
  author_avatar_url: z.string().url().max(2048).nullable().optional(),
  author_linkedin_url: z.string().url().max(2048).nullable().optional(),
  content: z.string().min(5).max(3000),
  relationship: z.string().max(120).default(''),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0)
});

export const testimonialUpdateSchema = z
  .object({
    id: idSchema,
    author_name: z.string().min(2).max(140).optional(),
    author_title: z.string().max(180).optional(),
    author_avatar_url: z.string().url().max(2048).nullable().optional(),
    author_linkedin_url: z.string().url().max(2048).nullable().optional(),
    content: z.string().min(5).max(3000).optional(),
    relationship: z.string().max(120).optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().int().min(0).optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const blogCreateSchema = z.object({
  title: z.string().min(2).max(180),
  slug: slugSchema,
  excerpt: z.string().max(500).default(''),
  content: z.string().max(50000).default(''),
  cover_image_url: z.string().url().max(2048).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  reading_time_minutes: z.number().int().min(1).max(180).default(5),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().nullable().optional()
});

export const blogUpdateSchema = z
  .object({
    id: idSchema,
    title: z.string().min(2).max(180).optional(),
    slug: slugSchema.optional(),
    excerpt: z.string().max(500).optional(),
    content: z.string().max(50000).optional(),
    cover_image_url: z.string().url().max(2048).nullable().optional(),
    tags: z.array(z.string().min(1).max(40)).max(20).optional(),
    reading_time_minutes: z.number().int().min(1).max(180).optional(),
    is_published: z.boolean().optional(),
    published_at: z.string().datetime().nullable().optional(),
    deleted: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const settingUpsertSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.any(),
  description: z.string().max(300).nullable().optional()
});

export const contactSubmitSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(320),
  subject: z.string().max(240).nullable().optional(),
  message: z.string().min(10).max(8000)
});

export const analyticsEventSchema = z.object({
  event_type: z.enum(['page_view', 'project_view', 'cv_download', 'contact_open']),
  page_path: z.string().min(1).max(500).default('/'),
  referrer: z.string().max(2048).nullable().optional(),
  country_code: z
    .string()
    .length(2)
    .transform((value) => value.toUpperCase())
    .nullable()
    .optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).nullable().optional(),
  session_id: z.string().min(4).max(120).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export const idPayloadSchema = z.object({
  id: idSchema
});

export const contactMessageUpdateSchema = z
  .object({
    id: idSchema,
    status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
    notes: z.string().max(4000).nullable().optional(),
    replied_at: z.string().datetime().nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: 'At least one field to update is required.'
  });

export const deleteByIdSchema = z.object({
  id: idSchema
});

export const deleteByKeySchema = z.object({
  key: z.string().min(1).max(120)
});
