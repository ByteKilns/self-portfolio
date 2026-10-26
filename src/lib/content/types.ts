export interface Project {
  id: string;
  name: string;
  summary: string;
  points: string[];
  stack: string[];
  url: string;
  year: string;
  role: string;
  client: string;
  image: string;
  hue: number;
  featured: boolean;
  draft: boolean;
}

export interface Site {
  email: string;
  github: string;
  linkedin: string;
  tagline: string;
  now: string[];
}

export interface Content {
  v: 1;
  site: Site;
  projects: Project[];
  savedAt: number | null;
}
