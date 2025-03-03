export interface Project {
  title: string;
  deployed: boolean;
  isLinkAvailable: boolean;
  position: "left" | "right";
  githublink: string;
  websitelink: string;
  photoUrl: string;
  description: string[];
  TechStack: string[];
}

export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
  content: {
    title: string;
    description: string;
    titleColor: string;
  };
  zIndex: number;
}

export interface Chat {
  type: "query" | "answer";
  message: string;
}
