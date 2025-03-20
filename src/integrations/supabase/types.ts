export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          canvas_assignment_id: string
          course_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          points_possible: number | null
          requirements: Json | null
          status: string | null
          title: string
        }
        Insert: {
          canvas_assignment_id: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          requirements?: Json | null
          status?: string | null
          title: string
        }
        Update: {
          canvas_assignment_id?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          requirements?: Json | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_results: {
        Row: {
          created_at: string
          error: string | null
          id: string
          processed_link_id: string | null
          result: Json | null
          status: string
          task_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          processed_link_id?: string | null
          result?: Json | null
          status?: string
          task_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          processed_link_id?: string | null
          result?: Json | null
          status?: string
          task_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_results_processed_link_id_fkey"
            columns: ["processed_link_id"]
            isOneToOne: false
            referencedRelation: "processed_links"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_assignments: {
        Row: {
          canvas_assignment_id: string
          course_id: string
          created_at: string | null
          description: string | null
          due_at: string | null
          id: string
          name: string
          points_possible: number | null
          published: boolean | null
          updated_at: string | null
        }
        Insert: {
          canvas_assignment_id: string
          course_id: string
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          name: string
          points_possible?: number | null
          published?: boolean | null
          updated_at?: string | null
        }
        Update: {
          canvas_assignment_id?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          name?: string
          points_possible?: number | null
          published?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      canvas_configs: {
        Row: {
          api_key: string
          created_at: string | null
          domain: string
          id: string
          is_valid: boolean | null
          last_sync: string | null
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          domain: string
          id?: string
          is_valid?: boolean | null
          last_sync?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          domain?: string
          id?: string
          is_valid?: boolean | null
          last_sync?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          canvas_course_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          nickname: string | null
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          canvas_course_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          nickname?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          canvas_course_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          nickname?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_links: {
        Row: {
          assignment_id: string | null
          content: string | null
          created_at: string
          error: string | null
          id: string
          status: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_links_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string | null
          content: string | null
          created_at: string | null
          feedback: Json | null
          id: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
