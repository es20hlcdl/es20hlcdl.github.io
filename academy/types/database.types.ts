export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          enrolled_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string | null;
          video_url: string | null;
          position: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content?: string | null;
          video_url?: string | null;
          position?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: string | null;
          video_url?: string | null;
          position?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "course_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_materials: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          material_url: string;
          material_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          material_url: string;
          material_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          material_url?: string;
          material_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrollment_id: string | null;
          code: string;
          student_name_snapshot: string | null;
          course_title_snapshot: string | null;
          issued_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrollment_id?: string | null;
          code: string;
          student_name_snapshot?: string | null;
          course_title_snapshot?: string | null;
          issued_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrollment_id?: string | null;
          code?: string;
          student_name_snapshot?: string | null;
          course_title_snapshot?: string | null;
          issued_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey";
            columns: ["enrollment_id"];
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      issue_certificate: {
        Args: {
          p_course_id: string;
        };
        Returns: {
          id: string;
          code: string;
          issued_at: string;
        }[];
      };
      verify_certificate: {
        Args: {
          certificate_code: string;
        };
        Returns: {
          code: string;
          course_title: string | null;
          issued_at: string;
        }[];
      };
    };
    Enums: {
      user_role: "admin" | "student";
      enrollment_status: "active" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
