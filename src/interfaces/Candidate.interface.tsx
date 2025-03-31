export interface Candidate {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    name?: string;
    bio?: string;
    location?: string;
    public_repos?: number;
    followers?: number;
    following?: number;
    created_at?: string;
    company?: string;
    email?: string;
    blog?: string;
  }         