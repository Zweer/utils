export interface RetrieveFilenamesOptions {
  baseDir: string;
  ignoreList: string[];
  useGitIgnore: boolean;
  customIgnoreList?: string[];
}
