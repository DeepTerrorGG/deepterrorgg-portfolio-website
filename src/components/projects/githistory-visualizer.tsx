
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, GitCommit, Github, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import type { GitHubCommit } from '@/ai/flows/github-history-flow-types';
import { fetchRepoHistory } from '@/ai/flows/github-history-flow';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

interface GitNode extends d3.SimulationNodeDatum {
  id: string;
  size: number;
  type: 'file' | 'dir';
  x?: number;
  y?: number;
}

interface GitLink extends d3.SimulationLinkDatum<GitNode> {
  source: string;
  target: string;
}

const GitHistoryVisualizer: React.FC = () => {
    const { toast } = useToast();
    const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
    const [commits, setCommits] = useState<GitHubCommit[]>([]);
    const [commitIndex, setCommitIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const simulationRef = useRef<d3.Simulation<GitNode, GitLink> | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Memoize the data processing to avoid re-running it unnecessarily
    const processedCommits = useMemo(() => {
        if (commits.length === 0) return [];
        let allNodes = new Map<string, GitNode>();
        let allLinks = new Map<string, GitLink>();
        
        return commits.map(commit => {
            if (!commit.files) return { nodes: [], links: [] };
            commit.files.forEach(file => {
                const existingFile = allNodes.get(file.path);
                allNodes.set(file.path, {
                    ...existingFile,
                    id: file.path,
                    size: (existingFile?.size || 5) + (file.changes || 1),
                    type: 'file',
                });
                
                const pathParts = file.path.split('/');
                let currentPath = '';
                pathParts.slice(0, -1).forEach(part => {
                    const parentPath = currentPath;
                    currentPath += (currentPath ? '/' : '') + part;
                    if (!allNodes.has(currentPath)) {
                        allNodes.set(currentPath, { id: currentPath, size: 10, type: 'dir' });
                    }
                     if (parentPath && allNodes.has(parentPath)) {
                       const linkId = `${parentPath}->${currentPath}`;
                        if (!allLinks.has(linkId)) {
                            allLinks.set(linkId, { source: parentPath, target: currentPath });
                        }
                    }
                });
                const parentDir = pathParts.slice(0, -1).join('/');
                 if (parentDir && allNodes.has(parentDir)) {
                    const linkId = `${parentDir}->${file.path}`;
                    if(!allLinks.has(linkId)) {
                      allLinks.set(linkId, { source: parentDir, target: file.path });
                    }
                 }
            });
            return { nodes: Array.from(allNodes.values()), links: Array.from(allLinks.values())};
        });
    }, [commits]);

    const updateSimulation = useCallback((data: { nodes: GitNode[], links: GitLink[] }) => {
        if (!simulationRef.current || !svgRef.current) return;
    
        const svg = d3.select(svgRef.current);
    
        const link = svg.select<SVGGElement>('g.links').selectAll('line')
          .data(data.links, (d: any) => `${(d.source as GitNode).id}-${(d.target as GitNode).id}`);
        
        link.exit().transition().duration(300).attr('stroke-opacity', 0).remove();
        link.enter().append('line')
          .attr('stroke', '#4A5568')
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 0)
          .transition().duration(300)
          .attr('stroke-opacity', 1);
    
        const node = svg.select<SVGGElement>('g.nodes').selectAll('circle')
          .data(data.nodes, (d: any) => (d as GitNode).id);
          
        node.exit().transition().duration(300).attr('r', 0).remove();
        
        const nodeEnter = node.enter().append('circle')
          .attr('r', 0)
          .attr('class', d => d.type === 'dir' ? 'fill-blue-500/50 stroke-blue-400' : 'fill-primary/50 stroke-primary');

        nodeEnter.append('title').text((d: any) => d.id);
          
        nodeEnter.call(d3.drag<SVGCircleElement, GitNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x; d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulationRef.current?.alphaTarget(0);
                    d.fx = null; d.fy = null;
                })
            )
          .transition().duration(300)
          .attr('r', d => Math.max(3, Math.sqrt(d.size)));
          
        node.transition().duration(300)
          .attr('r', d => Math.max(3, Math.sqrt(d.size)));

        simulationRef.current.nodes(data.nodes);
        simulationRef.current.force<d3.ForceLink<GitNode, GitLink>>('link')?.links(data.links);
        simulationRef.current.alpha(1).restart();
    }, []);

    const initializeChart = useCallback((svgElement: SVGSVGElement) => {
        const svg = d3.select(svgElement);
        svg.selectAll('*').remove();
    
        const width = svgElement.getBoundingClientRect().width;
        const height = svgElement.getBoundingClientRect().height;
    
        svg.append('g').attr('class', 'links');
        svg.append('g').attr('class', 'nodes');
    
        const simulation = d3.forceSimulation<GitNode>()
          .force('link', d3.forceLink<GitNode, GitLink>().id((d: any) => d.id).distance(20).strength(0.8))
          .force('charge', d3.forceManyBody().strength(-40))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collide', d3.forceCollide(d => Math.sqrt(d.size) + 4));
    
        simulation.on('tick', () => {
          svg.select<SVGGElement>('g.nodes').selectAll('circle')
            .attr('cx', d => (d as GitNode).x ?? 0)
            .attr('cy', d => (d as GitNode).y ?? 0);
    
          svg.select<SVGGElement>('g.links').selectAll('line')
            .attr('x1', d => (d.source as GitNode).x ?? 0)
            .attr('y1', d => (d.source as GitNode).y ?? 0)
            .attr('x2', d => (d.target as GitNode).x ?? 0)
            .attr('y2', d => (d.target as GitNode).y ?? 0);
        });
    
        simulationRef.current = simulation;
        if(processedCommits.length > 0) {
            updateSimulation(processedCommits[commitIndex]);
        }
    
    }, [commitIndex, processedCommits, updateSimulation]);

    const measuredRef = useCallback((node: SVGSVGElement | null) => {
        if (node) {
            svgRef.current = node;
            initializeChart(node);
        }
    }, [initializeChart]);

    useEffect(() => {
        if (isPlaying && commitIndex < commits.length - 1) {
            const timer = setTimeout(() => {
                setCommitIndex(prev => prev + 1);
            }, 300);
            return () => clearTimeout(timer);
        } else if (commitIndex >= commits.length - 1 && isPlaying) {
            setIsPlaying(false);
        }
    }, [isPlaying, commitIndex, commits]);
    
    useEffect(() => {
        if (simulationRef.current && processedCommits.length > 0) {
            updateSimulation(processedCommits[commitIndex]);
        }
    }, [commitIndex, processedCommits, updateSimulation]);
    
    const handleFetchHistory = async () => {
        setIsLoading(true);
        setCommits([]);
        setCommitIndex(0);
        setIsPlaying(false);
        try {
            const history = await fetchRepoHistory({ repoUrl });
            if(history.length === 0) {
              toast({ title: "No commits found", description: "This repository might be empty or inaccessible.", variant: "destructive" });
            }
            setCommits(history);
        } catch (error) {
            console.error("Failed to fetch repo history:", error);
            toast({ title: "Error fetching history", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const reset = () => {
        setIsPlaying(false);
        setCommitIndex(0);
    };

    const handlePlayPause = () => {
        if (commits.length === 0) return;
        if (commitIndex >= commits.length - 1) {
            reset();
            setTimeout(() => setIsPlaying(true), 100);
        } else {
            setIsPlaying(!isPlaying);
        }
    };
    
    const currentCommit = commits[commitIndex];

    return (
        <div className="w-full h-full bg-[#0d1117] flex flex-col p-4 text-white font-mono gap-4">
            <Card className="bg-gray-800/50 border-gray-700 flex-shrink-0">
                <CardHeader>
                    <CardTitle className="text-primary">Git History Visualizer</CardTitle>
                    <CardDescription>Enter a public GitHub repo URL to visualize its commit history.</CardDescription>
                     <div className="flex w-full items-center space-x-2 pt-2">
                        <Input
                            type="text"
                            placeholder="https://github.com/owner/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchHistory()}
                            disabled={isLoading}
                            className="bg-[#0d1117] border-border"
                        />
                        <Button onClick={handleFetchHistory} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Github className="mr-2 h-4 w-4"/>}
                            Fetch History
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            
            <div className="flex-grow relative border border-gray-700 rounded-lg bg-black/30 overflow-hidden min-h-[400px]">
                <svg ref={measuredRef} className="w-full h-full" />
                {commits.length === 0 && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <p>Enter a repository URL to begin.</p>
                    </div>
                )}
            </div>

            <Card className="bg-gray-800/50 border-gray-700 flex-shrink-0 min-h-[120px]">
                <CardHeader className="flex flex-row justify-between items-center">
                     <div className="flex-grow">
                        {currentCommit ? (
                            <>
                                <div className="flex items-center gap-2">
                                <GitCommit className="h-4 w-4 text-primary flex-shrink-0"/>
                                <p className="font-semibold">{currentCommit.message}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">by {currentCommit.author} ({commitIndex + 1}/{commits.length})</p>
                                <Progress value={((commitIndex + 1) / commits.length) * 100} className="w-full mt-2 h-2"/>
                            </>
                        ) : (
                            <p className="text-gray-500">Waiting for data...</p>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                        <Button onClick={handlePlayPause} className="w-28" disabled={commits.length === 0 || isLoading}>
                            {isPlaying ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                            {commitIndex >= commits.length - 1 && commits.length > 0 ? "Replay" : isPlaying ? "Pause" : "Play"}
                        </Button>
                        <Button onClick={reset} variant="outline" disabled={commits.length === 0 || isLoading}><RefreshCw className="h-4 w-4"/></Button>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};

export default GitHistoryVisualizer;
