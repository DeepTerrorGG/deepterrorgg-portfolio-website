
'use client';

import { z } from 'zod';

export const GithubHistoryInputSchema = z.object({
  repoUrl: z.string().url(),
});

export const GitHubCommitFileSchema = z.object({
  path: z.string(),
  changes: z.number(),
});

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  author: z.string(),
  message: z.string(),
  files: z.array(GitHubCommitFileSchema),
});

export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
