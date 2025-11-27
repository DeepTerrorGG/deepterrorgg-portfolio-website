
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GithubHistoryInputSchema, type GitHubCommit } from './github-history-flow-types';

async function getCommitDetails(owner: string, repo: string, commitSha: string): Promise<{ files: { path: string; changes: number }[] }> {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if (!response.ok) {
        console.error(`Failed to fetch commit details for ${commitSha}: ${response.statusText}`);
        return { files: [] }; // Return empty files array on error
    }
    const data = await response.json();
    return {
        files: data.files?.map((file: any) => ({
            path: file.filename,
            changes: file.changes,
        })) || [],
    };
}


export async function fetchRepoHistory(input: z.infer<typeof GithubHistoryInputSchema>): Promise<GitHubCommit[]> {
    const { repoUrl } = input;
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
        throw new Error('Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo');
    }

    const [, owner, repo] = match;
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Repository not found at ${owner}/${repo}. Please check the URL.`);
            }
            if (response.status === 403) {
                 const rateLimitData = await response.json();
                 const resetTime = rateLimitData.rate?.reset ? new Date(rateLimitData.rate.reset * 1000).toLocaleTimeString() : 'later';
                 throw new Error(`GitHub API rate limit exceeded. Please wait a moment and try again after ${resetTime}.`);
            }
            throw new Error(`Failed to fetch commits from GitHub API: ${response.statusText}`);
        }

        const commitsData = await response.json();
        
        const commitsWithDetails = await Promise.all(
            commitsData.map(async (commit: any) => {
                 const { files } = await getCommitDetails(owner, repo, commit.sha);
                return {
                    sha: commit.sha,
                    author: commit.commit.author.name,
                    message: commit.commit.message.split('\n')[0], // Only first line of message
                    files: files,
                };
            })
        );
        
        // The GitHub API returns newest first, so we reverse it for chronological playback
        return commitsWithDetails.reverse();
    } catch (error) {
        console.error("Error fetching repository history:", error);
        throw error;
    }
}
