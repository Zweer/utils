export interface Page {
  title: string;
  link: string;
  description: string;
  content: string;
}

export interface Section {
  name: string;
  pages: Page[];
}

export interface LlmsTxtOptions {
  projectName: string;
  projectDescription: string;
  siteUrl: string;
  sections: Section[];
}
