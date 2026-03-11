'use client';

import { useState, useEffect } from 'react';

export function GithubStars({ repoUrl, fallbackStars }: { repoUrl: string, fallbackStars: number }) {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        if (!repoUrl || repoUrl === '#') return;
        
        const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
        if (!match) return;

        const repo = match[1];
        // Fetch real stars from GitHub API
        fetch(`https://api.github.com/repos/${repo}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch github data');
                return res.json();
            })
            .then(data => {
                if (typeof data.stargazers_count === 'number') {
                    setStars(data.stargazers_count);
                }
            })
            .catch(error => {
                console.error('Error fetching github stars:', error);
            });
    }, [repoUrl]);

    const displayStars = stars !== null ? stars : fallbackStars;

    return <span>{displayStars.toLocaleString()}</span>;
}
