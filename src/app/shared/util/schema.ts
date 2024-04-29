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
      game_state: {
        Row: {
          game_master_user_id: string;
          id: number;
          round_number: number | null;
          session_id: number | null;
          session_status: Database['public']['Enums']['session_status'];
        };
        Insert: {
          game_master_user_id: string;
          id?: number;
          round_number?: number | null;
          session_id?: number | null;
          session_status?: Database['public']['Enums']['session_status'];
        };
        Update: {
          game_master_user_id?: string;
          id?: number;
          round_number?: number | null;
          session_id?: number | null;
          session_status?: Database['public']['Enums']['session_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'active_session_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_state_game_master_user_id_fkey';
            columns: ['game_master_user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      player: {
        Row: {
          enabled: boolean;
          id: number;
          score: number;
          session_id: number;
          user_id: string;
        };
        Insert: {
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id: number;
          user_id: string;
        };
        Update: {
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_player_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      player_round_score: {
        Row: {
          id: number;
          player_id: number;
          round_number: number;
          score: number;
        };
        Insert: {
          id?: number;
          player_id: number;
          round_number: number;
          score: number;
        };
        Update: {
          id?: number;
          player_id?: number;
          round_number?: number;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'public_player_round_score_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      rules: {
        Row: {
          id: number;
          rules: string | null;
          session_id: number;
        };
        Insert: {
          id?: number;
          rules?: string | null;
          session_id: number;
        };
        Update: {
          id?: number;
          rules?: string | null;
          session_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'public_rules_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      session: {
        Row: {
          end_date: string;
          id: number;
          name: string;
          num_rounds: number;
          start_date: string;
        };
        Insert: {
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds: number;
          start_date?: string;
        };
        Update: {
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds?: number;
          start_date?: string;
        };
        Relationships: [];
      };
      transaction: {
        Row: {
          description: string | null;
          id: number;
          num_points: number;
          player_id: number;
          timestamp: string;
        };
        Insert: {
          description?: string | null;
          id?: number;
          num_points: number;
          player_id: number;
          timestamp?: string;
        };
        Update: {
          description?: string | null;
          id?: number;
          num_points?: number;
          player_id?: number;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      user: {
        Row: {
          avatar_url: string;
          can_edit_profile: boolean;
          display_name: string;
          id: string;
        };
        Insert: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          display_name?: string;
          id: string;
        };
        Update: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          display_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      user_notifications_subscription: {
        Row: {
          id: number;
          notifications_subscription: Json;
          user_id: string;
        };
        Insert: {
          id?: number;
          notifications_subscription: Json;
          user_id: string;
        };
        Update: {
          id?: number;
          notifications_subscription?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_notifications_subscription_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      lifetime_user_stats: {
        Row: {
          avatar_url: string | null;
          average_score: number | null;
          display_name: string | null;
          lifetime_score: number | null;
          num_sessions: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'player_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      create_session: {
        Args: {
          session_name: string;
          session_start_date: string;
          session_end_date: string;
          num_rounds: number;
          player_user_ids: number[];
        };
        Returns: undefined;
      };
      end_round: {
        Args: {
          _round_number: number;
          player_score_changes: Json;
        };
        Returns: undefined;
      };
      get_all_scores_from_session: {
        Args: {
          sessionid: number;
        };
        Returns: Record<string, unknown>[];
      };
      get_player_round_scores_from_session: {
        Args: {
          sessionid: number;
        };
        Returns: {
          player_id: number;
          display_name: string;
          avatar_url: string;
          scores: number[];
        }[];
      };
      override_points: {
        Args: {
          data: Json;
        };
        Returns: undefined;
      };
      start_session_early: {
        Args: {
          now: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      session_status: 'not_started' | 'in_progress' | 'finished';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;
