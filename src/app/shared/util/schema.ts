export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      bet: {
        Row: {
          bet_type: Database['public']['Enums']['bet_type'] | null;
          created_at: string;
          description: string;
          details: Json | null;
          id: number;
          opponent_player_id: number;
          opponent_wager: number;
          requester_player_id: number;
          requester_wager: number;
          session_id: number;
          status: Database['public']['Enums']['bet_status'];
          updated_at: string;
        };
        Insert: {
          bet_type?: Database['public']['Enums']['bet_type'] | null;
          created_at?: string;
          description: string;
          details?: Json | null;
          id?: number;
          opponent_player_id: number;
          opponent_wager: number;
          requester_player_id: number;
          requester_wager: number;
          session_id: number;
          status: Database['public']['Enums']['bet_status'];
          updated_at?: string;
        };
        Update: {
          bet_type?: Database['public']['Enums']['bet_type'] | null;
          created_at?: string;
          description?: string;
          details?: Json | null;
          id?: number;
          opponent_player_id?: number;
          opponent_wager?: number;
          requester_player_id?: number;
          requester_wager?: number;
          session_id?: number;
          status?: Database['public']['Enums']['bet_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bet_opponent_player_id_fkey';
            columns: ['opponent_player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bet_requester_player_id_fkey';
            columns: ['requester_player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bet_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      bracket: {
        Row: {
          created_at: string;
          data: string | null;
          event_id: number;
          id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data?: string | null;
          event_id: number;
          id?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: string | null;
          event_id?: number;
          id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bracket_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: true;
            referencedRelation: 'event';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bracket_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: true;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['event_id'];
          },
        ];
      };
      chaos_space_event: {
        Row: {
          chaos_space_id: number;
          created_at: string;
          id: number;
          player_id: number;
          results: Json | null;
          round_number: number;
          session_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id: number | null;
          updated_at: string;
        };
        Insert: {
          chaos_space_id: number;
          created_at?: string;
          id?: number;
          player_id: number;
          results?: Json | null;
          round_number: number;
          session_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Update: {
          chaos_space_id?: number;
          created_at?: string;
          id?: number;
          player_id?: number;
          results?: Json | null;
          round_number?: number;
          session_id?: number;
          status?: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chaos_space_event_chaos_space_id_fkey';
            columns: ['chaos_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chaos_space_event_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chaos_space_event_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chaos_space_event_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'chaos_space_event_template';
            referencedColumns: ['id'];
          },
        ];
      };
      chaos_space_event_template: {
        Row: {
          created_at: string;
          description: string;
          details: Json;
          id: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['chaos_space_event_type'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          details: Json;
          id?: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['chaos_space_event_type'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          details?: Json;
          id?: number;
          name?: string;
          session_id?: number;
          type?: Database['public']['Enums']['chaos_space_event_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chaos_space_event_template_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      duel: {
        Row: {
          challenger_player_id: number;
          created_at: string;
          duel_space_id: number;
          game_name: string | null;
          id: number;
          opponent_player_id: number | null;
          points_gained_by_winner: number | null;
          round_number: number;
          session_id: number;
          status: Database['public']['Enums']['duel_status'];
          updated_at: string;
          wager_percentage: number | null;
        };
        Insert: {
          challenger_player_id: number;
          created_at?: string;
          duel_space_id: number;
          game_name?: string | null;
          id?: number;
          opponent_player_id?: number | null;
          points_gained_by_winner?: number | null;
          round_number: number;
          session_id: number;
          status: Database['public']['Enums']['duel_status'];
          updated_at?: string;
          wager_percentage?: number | null;
        };
        Update: {
          challenger_player_id?: number;
          created_at?: string;
          duel_space_id?: number;
          game_name?: string | null;
          id?: number;
          opponent_player_id?: number | null;
          points_gained_by_winner?: number | null;
          round_number?: number;
          session_id?: number;
          status?: Database['public']['Enums']['duel_status'];
          updated_at?: string;
          wager_percentage?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'duel_challenger_player_id_fkey';
            columns: ['challenger_player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'duel_duel_space_id_fkey';
            columns: ['duel_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'duel_opponent_player_id_fkey';
            columns: ['opponent_player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'duel_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      event: {
        Row: {
          created_at: string;
          description: string | null;
          format: Database['public']['Enums']['event_format'];
          id: number;
          image_url: string | null;
          lower_scores_are_better: boolean;
          name: string;
          points_label: string | null;
          round_number: number;
          rules: string | null;
          scoring_map: number[];
          session_id: number;
          team_size: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          format?: Database['public']['Enums']['event_format'];
          id?: number;
          image_url?: string | null;
          lower_scores_are_better?: boolean;
          name: string;
          points_label?: string | null;
          round_number: number;
          rules?: string | null;
          scoring_map: number[];
          session_id: number;
          team_size: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          format?: Database['public']['Enums']['event_format'];
          id?: number;
          image_url?: string | null;
          lower_scores_are_better?: boolean;
          name?: string;
          points_label?: string | null;
          round_number?: number;
          rules?: string | null;
          scoring_map?: number[];
          session_id?: number;
          team_size?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      event_format_standard_scoring_formula: {
        Row: {
          created_at: string;
          formula: string;
          id: Database['public']['Enums']['event_format'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          formula: string;
          id: Database['public']['Enums']['event_format'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          formula?: string;
          id?: Database['public']['Enums']['event_format'];
          updated_at?: string;
        };
        Relationships: [];
      };
      event_participant: {
        Row: {
          created_at: string;
          id: number;
          player_id: number;
          team_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          team_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          team_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participant_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participant_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participant_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['team_id'];
          },
        ];
      };
      event_team: {
        Row: {
          created_at: string;
          event_id: number;
          id: number;
          name: string | null;
          seed: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: number;
          id?: number;
          name?: string | null;
          seed?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: number;
          id?: number;
          name?: string | null;
          seed?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_team_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_team_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['event_id'];
          },
        ];
      };
      event_team_round_score: {
        Row: {
          created_at: string;
          id: number;
          round_number: number;
          score: number;
          team_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          round_number: number;
          score?: number;
          team_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          round_number?: number;
          score?: number;
          team_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_team_round_score_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_team_round_score_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['team_id'];
          },
        ];
      };
      game_state: {
        Row: {
          created_at: string;
          game_master_user_id: string;
          id: number;
          round_number: number;
          round_phase: Database['public']['Enums']['round_phase'];
          session_id: number;
          session_status: Database['public']['Enums']['session_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          game_master_user_id: string;
          id?: number;
          round_number: number;
          round_phase?: Database['public']['Enums']['round_phase'];
          session_id: number;
          session_status?: Database['public']['Enums']['session_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          game_master_user_id?: string;
          id?: number;
          round_number?: number;
          round_phase?: Database['public']['Enums']['round_phase'];
          session_id?: number;
          session_status?: Database['public']['Enums']['session_status'];
          updated_at?: string;
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
      gameboard_move: {
        Row: {
          created_at: string;
          distance_traveled: number;
          gameboard_space_id: number;
          id: number;
          player_id: number;
          round_number: number;
          updated_at: string;
        };
        Insert: {
          created_at: string;
          distance_traveled: number;
          gameboard_space_id: number;
          id?: number;
          player_id: number;
          round_number: number;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          distance_traveled?: number;
          gameboard_space_id?: number;
          id?: number;
          player_id?: number;
          round_number?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_move_gameboard_space_id_fkey';
            columns: ['gameboard_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gameboard_move_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      gameboard_space: {
        Row: {
          color: string;
          created_at: string;
          effect: Database['public']['Enums']['gameboard_space_effect'];
          effect_data: Json | null;
          icon_class: string | null;
          id: number;
          name: string;
          session_id: number;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          effect?: Database['public']['Enums']['gameboard_space_effect'];
          effect_data?: Json | null;
          icon_class?: string | null;
          id?: number;
          name?: string;
          session_id: number;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          effect?: Database['public']['Enums']['gameboard_space_effect'];
          effect_data?: Json | null;
          icon_class?: string | null;
          id?: number;
          name?: string;
          session_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_space_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      player: {
        Row: {
          created_at: string;
          enabled: boolean;
          id: number;
          score: number;
          session_id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          id?: number;
          score?: number;
          session_id?: number;
          updated_at?: string;
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
          created_at: string;
          id: number;
          player_id: number;
          round_number: number;
          score: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          round_number: number;
          score: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          round_number?: number;
          score?: number;
          updated_at?: string;
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
          chaos_space_events: string | null;
          created_at: string;
          events: string | null;
          gameboard: string | null;
          id: number;
          intro: string | null;
          session_id: number;
          special_space_events: string | null;
          updated_at: string;
        };
        Insert: {
          chaos_space_events?: string | null;
          created_at?: string;
          events?: string | null;
          gameboard?: string | null;
          id?: number;
          intro?: string | null;
          session_id: number;
          special_space_events?: string | null;
          updated_at?: string;
        };
        Update: {
          chaos_space_events?: string | null;
          created_at?: string;
          events?: string | null;
          gameboard?: string | null;
          id?: number;
          intro?: string | null;
          session_id?: number;
          special_space_events?: string | null;
          updated_at?: string;
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
          bank_balance: number;
          created_at: string;
          end_date: string;
          id: number;
          name: string;
          num_rounds: number;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          bank_balance?: number;
          created_at?: string;
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds: number;
          start_date?: string;
          updated_at?: string;
        };
        Update: {
          bank_balance?: number;
          created_at?: string;
          end_date?: string;
          id?: number;
          name?: string;
          num_rounds?: number;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      special_space_event: {
        Row: {
          created_at: string;
          id: number;
          player_id: number;
          results: Json | null;
          round_number: number;
          session_id: number;
          special_space_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          player_id: number;
          results?: Json | null;
          round_number: number;
          session_id: number;
          special_space_id: number;
          status: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          player_id?: number;
          results?: Json | null;
          round_number?: number;
          session_id?: number;
          special_space_id?: number;
          status?: Database['public']['Enums']['space_event_status'];
          template_id?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_special_space_id_fkey';
            columns: ['special_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'special_space_event_template';
            referencedColumns: ['id'];
          },
        ];
      };
      special_space_event_template: {
        Row: {
          created_at: string;
          description: string;
          details: Json;
          id: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['special_space_event_type'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          details: Json;
          id?: number;
          name: string;
          session_id: number;
          type: Database['public']['Enums']['special_space_event_type'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          details?: Json;
          id?: number;
          name?: string;
          session_id?: number;
          type?: Database['public']['Enums']['special_space_event_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_template_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session';
            referencedColumns: ['id'];
          },
        ];
      };
      tournament_match: {
        Row: {
          created_at: string;
          event_id: number;
          id: number;
          predecessor_match1_id: number | null;
          predecessor_match2_id: number | null;
          team1_id: number | null;
          team2_id: number | null;
          updated_at: string;
          use_match1_winner: boolean;
          use_match2_winner: boolean;
          winning_team_id: number | null;
        };
        Insert: {
          created_at: string;
          event_id: number;
          id?: number;
          predecessor_match1_id?: number | null;
          predecessor_match2_id?: number | null;
          team1_id?: number | null;
          team2_id?: number | null;
          updated_at: string;
          use_match1_winner: boolean;
          use_match2_winner: boolean;
          winning_team_id?: number | null;
        };
        Update: {
          created_at?: string;
          event_id?: number;
          id?: number;
          predecessor_match1_id?: number | null;
          predecessor_match2_id?: number | null;
          team1_id?: number | null;
          team2_id?: number | null;
          updated_at?: string;
          use_match1_winner?: boolean;
          use_match2_winner?: boolean;
          winning_team_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tournament_match_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tournament_match_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['event_id'];
          },
          {
            foreignKeyName: 'tournament_match_predecessor_match1_id_fkey';
            columns: ['predecessor_match1_id'];
            isOneToOne: false;
            referencedRelation: 'tournament_match';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tournament_match_predecessor_match2_id_fkey';
            columns: ['predecessor_match2_id'];
            isOneToOne: false;
            referencedRelation: 'tournament_match';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tournament_match_team1_id_fkey';
            columns: ['team1_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tournament_match_team1_id_fkey';
            columns: ['team1_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['team_id'];
          },
          {
            foreignKeyName: 'tournament_match_team2_id_fkey';
            columns: ['team2_id'];
            isOneToOne: false;
            referencedRelation: 'event_team';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tournament_match_team2_id_fkey';
            columns: ['team2_id'];
            isOneToOne: false;
            referencedRelation: 'event_team_with_player_info';
            referencedColumns: ['team_id'];
          },
        ];
      };
      transaction: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          num_points: number;
          player_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          num_points: number;
          player_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          num_points?: number;
          player_id?: number;
          updated_at?: string;
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
          can_place_bets: boolean;
          can_toggle_squidward_mode: boolean;
          created_at: string;
          display_name: string;
          id: string;
          real_name: string;
          squidward_mode: boolean;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          can_place_bets?: boolean;
          can_toggle_squidward_mode?: boolean;
          created_at?: string;
          display_name?: string;
          id: string;
          real_name?: string;
          squidward_mode?: boolean;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string;
          can_edit_profile?: boolean;
          can_place_bets?: boolean;
          can_toggle_squidward_mode?: boolean;
          created_at?: string;
          display_name?: string;
          id?: string;
          real_name?: string;
          squidward_mode?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_notifications_subscription: {
        Row: {
          created_at: string;
          id: number;
          notifications_subscription: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          notifications_subscription: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          notifications_subscription?: Json;
          updated_at?: string;
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
      event_team_with_player_info: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          event_id: number | null;
          seed: number | null;
          team_id: number | null;
        };
        Relationships: [];
      };
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
      moves_for_current_round: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          gameboard_space_id: number | null;
          player_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'gameboard_move_gameboard_space_id_fkey';
            columns: ['gameboard_space_id'];
            isOneToOne: false;
            referencedRelation: 'gameboard_space';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gameboard_move_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
        ];
      };
      special_space_events_for_current_round: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          id: number | null;
          player_id: number | null;
          status: Database['public']['Enums']['space_event_status'] | null;
          template_id: number | null;
          template_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'special_space_event_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'player';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_space_event_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'special_space_event_template';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      bulk_cancel_bets: {
        Args: { includeactive: boolean; player_id: number };
        Returns: undefined;
      };
      create_session: {
        Args: {
          num_rounds: number;
          player_user_ids: string[];
          session_end_date: string;
          session_name: string;
          session_start_date: string;
        };
        Returns: undefined;
      };
      delete_event_team_and_update_seeds: {
        Args: { seed_updates: Json; team_id: number };
        Returns: undefined;
      };
      delete_gameboard_space: {
        Args: { v_gameboard_space_id: number };
        Returns: undefined;
      };
      end_round: {
        Args: { _round_number: number; team_score_changes: Json };
        Returns: undefined;
      };
      get_all_scores_from_session: {
        Args: { sessionid: number };
        Returns: Record<string, unknown>[];
      };
      get_duel_history_for_session: {
        Args: { sessionid: number };
        Returns: Json[];
      };
      get_player_duel_stats_for_session: {
        Args: { sessionid: number };
        Returns: Json[];
      };
      get_player_round_scores_from_session: {
        Args: { sessionid: number };
        Returns: {
          avatar_url: string;
          display_name: string;
          player_id: number;
          scores: number[];
        }[];
      };
      get_roll_history_for_session: {
        Args: { sessionid: number };
        Returns: Json[];
      };
      get_space_stats_for_session: {
        Args: { sessionid: number };
        Returns: Record<string, unknown>[];
      };
      hello_world: { Args: never; Returns: string };
      log_round_moves: {
        Args: { playermoves: Json; roundnumber: number };
        Returns: undefined;
      };
      override_bank_balance: { Args: { data: Json }; Returns: undefined };
      override_points: {
        Args: { add_lost_points_to_bank_balance: boolean; data: Json };
        Returns: undefined;
      };
      reorder_events: {
        Args: { events_with_new_round_number: Json };
        Returns: undefined;
      };
      start_session_early: { Args: { now: string }; Returns: undefined };
      submit_bet_accepted: { Args: { bet_id: number }; Returns: undefined };
      submit_bet_canceled_by_gm: {
        Args: { bet_id: number };
        Returns: undefined;
      };
      submit_bet_opponent_won: { Args: { bet_id: number }; Returns: undefined };
      submit_bet_push: { Args: { bet_id: number }; Returns: undefined };
      submit_bet_requester_won: {
        Args: { bet_id: number };
        Returns: undefined;
      };
      submit_duel_results: {
        Args: {
          challenger_won: boolean;
          duel_id: number;
          player_score_changes: Json;
        };
        Returns: undefined;
      };
      submit_event_scores: { Args: { team_scores: Json }; Returns: undefined };
      submit_space_event_player_score_changes: {
        Args: {
          add_lost_points_to_bank_balance?: boolean;
          event_description: string;
          is_chaos_space_event: boolean;
          player_score_changes: Json;
          space_event_id: number;
          space_event_template_id: number;
        };
        Returns: undefined;
      };
      submit_special_space_event_score: {
        Args: { score: number; special_space_event_id: number };
        Returns: undefined;
      };
      update_event_team_seeds: { Args: { updates: Json }; Returns: undefined };
      update_event_teams: {
        Args: { event_team_updates: Json };
        Returns: undefined;
      };
    };
    Enums: {
      bet_status:
        | 'pending_acceptance'
        | 'canceled_by_requester'
        | 'canceled_by_gm'
        | 'rejected'
        | 'active'
        | 'requester_won'
        | 'opponent_won'
        | 'push';
      bet_subtype:
        | 'player_loses'
        | 'number_of_losers'
        | 'team_position'
        | 'score';
      bet_type:
        | 'duel'
        | 'special_space_event'
        | 'chaos_space_event'
        | 'custom'
        | 'main_event'
        | 'gameboard_move';
      chaos_space_event_type:
        | 'everyone_gains_points_based_on_rank'
        | 'everyone_loses_percentage_of_their_points'
        | 'everyone_loses_percentage_of_their_points_based_on_task_failure'
        | 'point_swap';
      duel_status:
        | 'opponent_not_selected'
        | 'wager_not_selected'
        | 'game_not_selected'
        | 'waiting_to_begin'
        | 'in_progress'
        | 'challenger_won'
        | 'opponent_won'
        | 'canceled';
      event_format:
        | 'single_elimination_tournament'
        | 'double_elimination_tournament'
        | 'score_based_single_round';
      gameboard_space_effect:
        | 'gain_points'
        | 'gain_points_or_do_activity'
        | 'special'
        | 'duel'
        | 'chaos'
        | 'bank'
        | 'chance_points';
      round_phase:
        | 'gameboard_moves'
        | 'special_space_events'
        | 'duels'
        | 'chaos_space_events'
        | 'event'
        | 'waiting_for_next_round';
      session_status: 'not_started' | 'in_progress' | 'finished';
      space_event_status:
        | 'event_not_selected'
        | 'waiting_to_begin'
        | 'in_progress'
        | 'finished'
        | 'canceled';
      special_space_event_type:
        | 'player_gains_points_based_on_game_score'
        | 'everyone_gains_points_based_on_rank';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      bet_status: [
        'pending_acceptance',
        'canceled_by_requester',
        'canceled_by_gm',
        'rejected',
        'active',
        'requester_won',
        'opponent_won',
        'push',
      ],
      bet_subtype: [
        'player_loses',
        'number_of_losers',
        'team_position',
        'score',
      ],
      bet_type: [
        'duel',
        'special_space_event',
        'chaos_space_event',
        'custom',
        'main_event',
        'gameboard_move',
      ],
      chaos_space_event_type: [
        'everyone_gains_points_based_on_rank',
        'everyone_loses_percentage_of_their_points',
        'everyone_loses_percentage_of_their_points_based_on_task_failure',
        'point_swap',
      ],
      duel_status: [
        'opponent_not_selected',
        'wager_not_selected',
        'game_not_selected',
        'waiting_to_begin',
        'in_progress',
        'challenger_won',
        'opponent_won',
        'canceled',
      ],
      event_format: [
        'single_elimination_tournament',
        'double_elimination_tournament',
        'score_based_single_round',
      ],
      gameboard_space_effect: [
        'gain_points',
        'gain_points_or_do_activity',
        'special',
        'duel',
        'chaos',
        'bank',
        'chance_points',
      ],
      round_phase: [
        'gameboard_moves',
        'special_space_events',
        'duels',
        'chaos_space_events',
        'event',
        'waiting_for_next_round',
      ],
      session_status: ['not_started', 'in_progress', 'finished'],
      space_event_status: [
        'event_not_selected',
        'waiting_to_begin',
        'in_progress',
        'finished',
        'canceled',
      ],
      special_space_event_type: [
        'player_gains_points_based_on_game_score',
        'everyone_gains_points_based_on_rank',
      ],
    },
  },
} as const;
