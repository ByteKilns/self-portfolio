// src/data/projects-data.ts
import type { Project } from "../types/types";

export const projects: Project[] = [
  {
    title: "Aastha Saving and Cooperative Limited",
    position: "left",
    deployed: false,
    isLinkAvailable: false,

    githublink: "https://github.com/user/aastha-cooperative",
    websitelink: "https://aastha.example.com",
    photoUrl: "./placeholder.png",
    description: [
      "Portfolio site for a savings and credit cooperative",
      "Features notices, news, and a gallery",
      "Provides updates on interest rates",
      "Built with Next.js, Tailwind CSS, ShadCN, and Payload CMS",
    ],
    TechStack: ["Next.js", "Tailwind CSS", "ShadCN", "Payload CMS"],
  },
  {
    title: "Niva Craftworks",
    position: "right",
    deployed: false,
    isLinkAvailable: false,

    githublink: "https://github.com/user/niva-craftworks",
    websitelink: "https://niva.example.com",
    photoUrl: "./placeholder.png",
    description: [
      "E-commerce and portfolio website for a handicrafts business",
      "Allows users to explore the brand and place orders via messages",
      "Designed with Figma and developed using Next.js, Tailwind CSS, ShadCN, and Payload CMS",
    ],
    TechStack: ["Next.js", "Tailwind CSS", "ShadCN", "Payload CMS", "Figma"],
  },
  {
    title: "Deshna IT",
    position: "left",
    deployed: true,
    isLinkAvailable: true,
    githublink: "https://github.com/user/deshna-it",
    websitelink: "https://deshna.example.com",
    photoUrl: "./placeholder.png",
    description: [
      "Website for an IT teaching company",
      "Features courses, a blog, career page, and contact page",
      "Enables course inquiries",
      "Developed with Next.js, Tailwind CSS, ShadCN, Payload CMS, and designed in Figma",
    ],
    TechStack: ["Next.js", "Tailwind CSS", "ShadCN", "Payload CMS", "Figma"],
  },
  {
    title: "Everest Ledger",
    position: "right",
    deployed: false,
    isLinkAvailable: false,

    githublink: "https://github.com/user/everest-ledger",
    websitelink: "https://everestledger.example.com",
    photoUrl: "./placeholder.pngg",
    description: [
      "Ledger-keeping web app for inventory tracking",
      "Generates financial reports like profit/loss and sales reports",
      "Built with Next.js, NestJS, and Material UI",
    ],
    TechStack: ["Next.js", "NestJS", "Material UI"],
  },
  {
    title: "IBM Nepal",
    position: "left",
    deployed: false,
    isLinkAvailable: false,

    githublink: "https://github.com/user/ibm-nepal",
    websitelink: "https://ibmnepal.example.com",
    photoUrl: "./placeholder.png ",
    description: [
      "Portfolio app for child dairy products",
      "Currently in the design phase",
      "Planned to be built with Next.js and designed in Figma",
    ],
    TechStack: ["Next.js", "Figma"],
  },
  {
    title: "Husky App",
    position: "right",
    deployed: false,
    isLinkAvailable: false,

    githublink: "https://github.com/user/husky-app",
    websitelink: "https://husky.example.com",
    photoUrl: "./placeholder.png",
    description: [
      "Language-learning app focusing on Nepali and Newari",
      "Similar to Duolingo, currently in beta testing",
      "Contributed to Flutter frontend and developed chat feature's frontend and backend",
      "Tech stack includes Flutter, Node.js, Express, and Socket.io",
    ],
    TechStack: ["Flutter", "Node.js", "Express", "Socket.io"],
  },
  {
    title: "Nepal Police Digital Diary",
    position: "left",
    deployed: true,
    isLinkAvailable: false,
    githublink: "https://github.com/user/nepal-police",
    websitelink: "https://police.example.com",
    photoUrl: "./placeholder.png",
    description: [
      "Internal intranet application for Nepal Police",
      "Tracks projects, objectives, tasks, and KPIs",
      "Developed the frontend using React.js",
    ],
    TechStack: ["React.js"],
  },
];
