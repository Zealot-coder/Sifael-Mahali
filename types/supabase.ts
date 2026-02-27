export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Generated manually from current migrations.
// Run `npm run supabase:types` once local Supabase is available and replace this file.
export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          country_code: string | null;
          created_at: string;
          device_type: string | null;
          event_type: 'page_view' | 'project_view' | 'cv_download' | 'contact_open';
          id: string;
          metadata: Json;
          page_path: string;
          referrer: string | null;
          session_id: string | null;
          updated_at: string;
        };
        Insert: {
          country_code?: string | null;
          created_at?: string;
          device_type?: string | null;
          event_type: 'page_view' | 'project_view' | 'cv_download' | 'contact_open';
          id?: string;
          metadata?: Json;
          page_path?: string;
          referrer?: string | null;
          session_id?: string | null;
          updated_at?: string;
        };
        Update: {
          country_code?: string | null;
          created_at?: string;
          device_type?: string | null;
          event_type?: 'page_view' | 'project_view' | 'cv_download' | 'contact_open';
          id?: string;
          metadata?: Json;
          page_path?: string;
          referrer?: string | null;
          session_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          content: string;
          cover_image_url: string | null;
          created_at: string;
          deleted_at: string | null;
          excerpt: string;
          id: string;
          is_published: boolean;
          published_at: string | null;
          reading_time_minutes: number;
          slug: string;
          tags: string[];
          title: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          content?: string;
          cover_image_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          excerpt?: string;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          content?: string;
          cover_image_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          excerpt?: string;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [];
      };
      certifications: {
        Row: {
          created_at: string;
          credential_id: string | null;
          credential_url: string | null;
          description: string | null;
          display_order: number;
          expiry_date: string | null;
          id: string;
          issue_date: string | null;
          issuer: string;
          issuer_logo_url: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          credential_id?: string | null;
          credential_url?: string | null;
          description?: string | null;
          display_order?: number;
          expiry_date?: string | null;
          id?: string;
          issue_date?: string | null;
          issuer: string;
          issuer_logo_url?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          credential_id?: string | null;
          credential_url?: string | null;
          description?: string | null;
          display_order?: number;
          expiry_date?: string | null;
          id?: string;
          issue_date?: string | null;
          issuer?: string;
          issuer_logo_url?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          ip_address: string | null;
          message: string;
          name: string;
          notes: string | null;
          replied_at: string | null;
          status: 'unread' | 'read' | 'replied' | 'archived';
          subject: string | null;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          ip_address?: string | null;
          message: string;
          name: string;
          notes?: string | null;
          replied_at?: string | null;
          status?: 'unread' | 'read' | 'replied' | 'archived';
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          ip_address?: string | null;
          message?: string;
          name?: string;
          notes?: string | null;
          replied_at?: string | null;
          status?: 'unread' | 'read' | 'replied' | 'archived';
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      experiences: {
        Row: {
          bullets: string[];
          created_at: string;
          description: string | null;
          display_order: number;
          end_date: string | null;
          id: string;
          is_current: boolean;
          location: string | null;
          location_type: 'on-site' | 'remote' | 'hybrid' | null;
          org_logo_url: string | null;
          organization: string;
          skills: string[];
          start_date: string;
          title: string;
          type: 'work' | 'education';
          updated_at: string;
        };
        Insert: {
          bullets?: string[];
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          location?: string | null;
          location_type?: 'on-site' | 'remote' | 'hybrid' | null;
          org_logo_url?: string | null;
          organization: string;
          skills?: string[];
          start_date: string;
          title: string;
          type: 'work' | 'education';
          updated_at?: string;
        };
        Update: {
          bullets?: string[];
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          location?: string | null;
          location_type?: 'on-site' | 'remote' | 'hybrid' | null;
          org_logo_url?: string | null;
          organization?: string;
          skills?: string[];
          start_date?: string;
          title?: string;
          type?: 'work' | 'education';
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string;
          created_at: string;
          cv_url: string | null;
          cv_version: number;
          email: string;
          full_name: string;
          headline: string;
          highlights: string[];
          id: string;
          location: string;
          open_to_work: boolean;
          phone: string | null;
          seo_description: string | null;
          seo_title: string | null;
          social_links: Json;
          tech_stack: string[];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          cv_url?: string | null;
          cv_version?: number;
          email: string;
          full_name: string;
          headline?: string;
          highlights?: string[];
          id?: string;
          location?: string;
          open_to_work?: boolean;
          phone?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          social_links?: Json;
          tech_stack?: string[];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          cv_url?: string | null;
          cv_version?: number;
          email?: string;
          full_name?: string;
          headline?: string;
          highlights?: string[];
          id?: string;
          location?: string;
          open_to_work?: boolean;
          phone?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          social_links?: Json;
          tech_stack?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          categories: string[];
          created_at: string;
          deleted_at: string | null;
          demo_url: string | null;
          description: string;
          display_order: number;
          github_repo_name: string | null;
          id: string;
          is_github_synced: boolean;
          is_pinned: boolean;
          long_description: string | null;
          repo_url: string | null;
          slug: string;
          status: 'draft' | 'published' | 'archived';
          tech_stack: string[];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          categories?: string[];
          created_at?: string;
          deleted_at?: string | null;
          demo_url?: string | null;
          description?: string;
          display_order?: number;
          github_repo_name?: string | null;
          id?: string;
          is_github_synced?: boolean;
          is_pinned?: boolean;
          long_description?: string | null;
          repo_url?: string | null;
          slug: string;
          status?: 'draft' | 'published' | 'archived';
          tech_stack?: string[];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          categories?: string[];
          created_at?: string;
          deleted_at?: string | null;
          demo_url?: string | null;
          description?: string;
          display_order?: number;
          github_repo_name?: string | null;
          id?: string;
          is_github_synced?: boolean;
          is_pinned?: boolean;
          long_description?: string | null;
          repo_url?: string | null;
          slug?: string;
          status?: 'draft' | 'published' | 'archived';
          tech_stack?: string[];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          display_order: number;
          icon_name: string | null;
          id: string;
          is_featured: boolean;
          name: string;
          proficiency: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          display_order?: number;
          icon_name?: string | null;
          id?: string;
          is_featured?: boolean;
          name: string;
          proficiency?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          display_order?: number;
          icon_name?: string | null;
          id?: string;
          is_featured?: boolean;
          name?: string;
          proficiency?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          author_avatar_url: string | null;
          author_linkedin_url: string | null;
          author_name: string;
          author_title: string;
          content: string;
          created_at: string;
          display_order: number;
          id: string;
          is_featured: boolean;
          relationship: string;
          updated_at: string;
        };
        Insert: {
          author_avatar_url?: string | null;
          author_linkedin_url?: string | null;
          author_name: string;
          author_title?: string;
          content: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_featured?: boolean;
          relationship?: string;
          updated_at?: string;
        };
        Update: {
          author_avatar_url?: string | null;
          author_linkedin_url?: string | null;
          author_name?: string;
          author_title?: string;
          content?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_featured?: boolean;
          relationship?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
