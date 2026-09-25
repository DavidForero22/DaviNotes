export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievement_translations: {
        Row: {
          achievement_slug: string
          description: string
          locale: Database["public"]["Enums"]["locale"]
          name: string
        }
        Insert: {
          achievement_slug: string
          description: string
          locale: Database["public"]["Enums"]["locale"]
          name: string
        }
        Update: {
          achievement_slug?: string
          description?: string
          locale?: Database["public"]["Enums"]["locale"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_translations_achievement_slug_fkey"
            columns: ["achievement_slug"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["slug"]
          },
        ]
      }
      achievements: {
        Row: {
          icon: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      attempts: {
        Row: {
          coins_awarded: number
          correct: boolean
          created_at: string
          exercise_id: string
          first_completion: boolean
          id: number
          user_id: string
          xp_awarded: number
        }
        Insert: {
          coins_awarded?: number
          correct: boolean
          created_at?: string
          exercise_id: string
          first_completion?: boolean
          id?: never
          user_id: string
          xp_awarded?: number
        }
        Update: {
          coins_awarded?: number
          correct?: boolean
          created_at?: string
          exercise_id?: string
          first_completion?: boolean
          id?: never
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_answers: {
        Row: {
          accepted_answers: string[] | null
          correct_option: number | null
          exercise_id: string
        }
        Insert: {
          accepted_answers?: string[] | null
          correct_option?: number | null
          exercise_id: string
        }
        Update: {
          accepted_answers?: string[] | null
          correct_option?: number | null
          exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_answers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: true
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_categories: {
        Row: {
          slug: string
          sort_order: number
        }
        Insert: {
          slug: string
          sort_order?: number
        }
        Update: {
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      exercise_category_translations: {
        Row: {
          category_slug: string
          locale: Database["public"]["Enums"]["locale"]
          name: string
        }
        Insert: {
          category_slug: string
          locale: Database["public"]["Enums"]["locale"]
          name: string
        }
        Update: {
          category_slug?: string
          locale?: Database["public"]["Enums"]["locale"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_category_translations_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      exercise_translations: {
        Row: {
          code: string | null
          context: string | null
          exercise_id: string
          locale: Database["public"]["Enums"]["locale"]
          objective: string
          options: string[] | null
          prompt: string
          title: string
        }
        Insert: {
          code?: string | null
          context?: string | null
          exercise_id: string
          locale: Database["public"]["Enums"]["locale"]
          objective: string
          options?: string[] | null
          prompt: string
          title: string
        }
        Update: {
          code?: string | null
          context?: string | null
          exercise_id?: string
          locale?: Database["public"]["Enums"]["locale"]
          objective?: string
          options?: string[] | null
          prompt?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_translations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          concept_slug: string | null
          created_at: string
          difficulty: number
          framework_slug: string | null
          id: string
          language_slug: string
          slug: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Insert: {
          category: string
          concept_slug?: string | null
          created_at?: string
          difficulty: number
          framework_slug?: string | null
          id?: string
          language_slug: string
          slug: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Update: {
          category?: string
          concept_slug?: string | null
          created_at?: string
          difficulty?: number
          framework_slug?: string | null
          id?: string
          language_slug?: string
          slug?: string
          type?: Database["public"]["Enums"]["exercise_type"]
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      hint_translations: {
        Row: {
          hint_id: string
          locale: Database["public"]["Enums"]["locale"]
          text: string
        }
        Insert: {
          hint_id: string
          locale: Database["public"]["Enums"]["locale"]
          text: string
        }
        Update: {
          hint_id?: string
          locale?: Database["public"]["Enums"]["locale"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "hint_translations_hint_id_fkey"
            columns: ["hint_id"]
            isOneToOne: false
            referencedRelation: "hints"
            referencedColumns: ["id"]
          },
        ]
      }
      hint_unlocks: {
        Row: {
          created_at: string
          hint_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hint_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hint_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hint_unlocks_hint_id_fkey"
            columns: ["hint_id"]
            isOneToOne: false
            referencedRelation: "hints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hint_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hints: {
        Row: {
          exercise_id: string
          id: string
          position: number
        }
        Insert: {
          exercise_id: string
          id?: string
          position: number
        }
        Update: {
          exercise_id?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "hints_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          coins: number
          created_at: string
          display_name: string | null
          id: string
          level: number
          xp: number
        }
        Insert: {
          coins?: number
          created_at?: string
          display_name?: string | null
          id: string
          level?: number
          xp?: number
        }
        Update: {
          coins?: number
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          xp?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_slug: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_slug: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_slug?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_slug_fkey"
            columns: ["achievement_slug"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_languages: {
        Row: {
          created_at: string
          language_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          language_slug?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_user_languages: { Args: { p_languages: string[] }; Returns: string[] }
      submit_result: {
        Args: { p_correct: boolean; p_exercise_id: string }
        Returns: {
          coins: number
          coins_awarded: number
          correct: boolean
          first_completion: boolean
          level: number
          new_achievements: string[]
          xp: number
          xp_awarded: number
          xp_to_next_level: number
        }[]
      }
      unlock_hint: {
        Args: { p_hint_id: string }
        Returns: {
          coins: number
          coins_spent: number
          exercise_id: string
          hint_id: string
        }[]
      }
    }
    Enums: {
      exercise_type: "multiple_choice" | "fill_blank" | "code_output"
      locale: "en" | "es" | "fr"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      exercise_type: ["multiple_choice", "fill_blank", "code_output"],
      locale: ["en", "es", "fr"],
    },
  },
} as const

