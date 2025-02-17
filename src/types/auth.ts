
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  updated_at: string | null;
  created_at: string;
}

export interface CanvasConfig {
  id: string;
  user_id: string;
  api_key: string;
  domain: string;
  is_valid: boolean;
  last_sync: string | null;
  created_at: string;
}

export interface AuthState {
  profile: UserProfile | null;
  canvasConfig: CanvasConfig | null;
  isLoading: boolean;
}
