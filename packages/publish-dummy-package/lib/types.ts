export interface WorkspacePackage {
  name: string;
  version: string;
  path: string;
  private: boolean;
}

export interface PublishResult {
  name: string;
  status: 'published' | 'skipped' | 'failed';
  reason: string;
}

export interface PublishOptions {
  rootDir: string;
  access: 'public' | 'restricted';
  dryRun: boolean;
}
