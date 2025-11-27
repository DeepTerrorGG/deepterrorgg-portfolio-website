
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, GitCommit } from 'lucide-react';
import { mockCommits } from '@/lib/githistory-mock-data';
import { cn } from '@/lib/utils';

interface GitNode extends d3.SimulationNodeDatum {
  id: string;
  size: number;
  type: 'file' | 'dir';
}

interface GitLink extends d3.SimulationLinkDatum<GitNode> {
  source: string;
  target: string;
}

const GitHistoryVisualizer: React.FC = () => {
    const [commitIndex, setCommitIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const simulationRef = useRef<d3.Simulation<GitNode, GitLink> | null>(null);

    // D3 elements are stored in refs to be managed outside of React's render cycle
    const linkGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
    const nodeGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

    const [nodes, setNodes] = useState<GitNode[]>([]);
    const [links, setLinks] = useState<GitLink[]>([]);
    
    // Memoize the data processing to avoid re-running it unnecessarily
    const processedCommits = useMemo(() => {
        let allNodes = new Map<string, GitNode>();
        let allLinks = new Map<string, GitLink>();
        
        return mockCommits.map(commit => {
            commit.files.forEach(file => {
                const existingFile = allNodes.get(file.path);
                allNodes.set(file.path, {
                    ...existingFile,
                    id: file.path,
                    size: (existingFile?.size || 10) + file.changes,
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
    }, []);

    // Effect for initializing and updating D3 simulation
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const width = svgElement.node()?.getBoundingClientRect().width || 600;
        const height = svgElement.node()?.getBoundingClientRect().height || 400;

        if (!simulationRef.current) {
            simulationRef.current = d3.forceSimulation<GitNode>()
                .force('link', d3.forceLink<GitNode, GitLink>().id(d => d.id).distance(20).strength(0.5))
                .force('charge', d3.forceManyBody().strength(-30))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide(d => Math.sqrt(d.size) + 3));

            linkGroupRef.current = svgElement.append('g').attr('class', 'links');
            nodeGroupRef.current = svgElement.append('g').attr('class', 'nodes');

            simulationRef.current.on('tick', () => {
                nodeGroupRef.current?.selectAll<SVGCircleElement, GitNode>('circle')
                    .attr('cx', d => d.x!)
                    .attr('cy', d => d.y!);

                linkGroupRef.current?.selectAll<SVGLineElement, GitLink>('line')
                    .attr('x1', d => (d.source as GitNode).x!)
                    .attr('y1', d => (d.source as GitNode).y!)
                    .attr('x2', d => (d.target as GitNode).x!)
                    .attr('y2', d => (d.target as GitNode).y!);
            });
        }
        
        const data = processedCommits[commitIndex];
        setNodes(data.nodes);
        setLinks(data.links);

    }, [commitIndex, processedCommits]);

    // This effect updates the D3 elements when React state changes
    useEffect(() => {
        if (!simulationRef.current || !nodeGroupRef.current || !linkGroupRef.current) return;
        
        simulationRef.current.nodes(nodes);
        simulationRef.current.force<d3.ForceLink<GitNode, GitLink>>('link')?.links(links);
        
        // Update nodes
        const nodeSelection = nodeGroupRef.current.selectAll<SVGCircleElement, GitNode>('circle')
            .data(nodes, d => d.id);
            
        nodeSelection.enter()
            .append('circle')
            .attr('r', 0)
            .attr('class', d => d.type === 'dir' ? 'fill-blue-500/50 stroke-blue-400' : 'fill-primary/50 stroke-primary')
            .transition().duration(500)
            .attr('r', d => Math.sqrt(d.size) + 3);

        nodeSelection.transition().duration(500)
            .attr('r', d => Math.sqrt(d.size) + 3);
            
        nodeSelection.exit()
            .transition().duration(500)
            .attr('r', 0)
            .remove();

        // Update links
        const linkSelection = linkGroupRef.current.selectAll<SVGLineElement, GitLink>('line')
            .data(links, d => `${(d.source as GitNode).id}-${(d.target as GitNode).id}`);
            
        linkSelection.enter()
            .append('line')
            .attr('class', 'stroke-gray-600')
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0);
            
        linkSelection.transition().duration(500).attr('stroke-opacity', 1);

        linkSelection.exit().remove();
        
        simulationRef.current.alpha(0.8).restart();

    }, [nodes, links]);


    const reset = useCallback(() => {
        setIsPlaying(false);
        setCommitIndex(0);
    }, []);

    // Auto-play interval
    useEffect(() => {
        if (isPlaying && commitIndex < mockCommits.length - 1) {
            const timer = setTimeout(() => {
                setCommitIndex(prev => prev + 1);
            }, 500);
            return () => clearTimeout(timer);
        } else if (commitIndex >= mockCommits.length - 1) {
            setIsPlaying(false);
        }
    }, [isPlaying, commitIndex]);

    const handlePlayPause = () => {
        if (commitIndex >= mockCommits.length - 1) {
            reset();
            setTimeout(() => setIsPlaying(true), 100);
        } else {
            setIsPlaying(!isPlaying);
        }
    };
    
    const currentCommit = mockCommits[commitIndex];

    return (
        <div className="w-full h-full bg-gray-900 flex flex-col p-4 text-white font-mono gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="text-primary">Git History Visualizer</CardTitle>
                        <CardDescription>Watch a repository's history unfold like a galaxy.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handlePlayPause} className="w-28">
                            {isPlaying ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                            {commitIndex >= mockCommits.length - 1 ? "Replay" : isPlaying ? "Pause" : "Play"}
                        </Button>
                        <Button onClick={reset} variant="outline"><RefreshCw className="h-4 w-4"/></Button>
                    </div>
                </CardHeader>
            </Card>
            
            <div className="flex-grow relative border border-gray-700 rounded-lg bg-black/30 overflow-hidden">
                <svg ref={svgRef} className="w-full h-full" />
                <div className="absolute bottom-4 left-4 right-4 bg-gray-800/80 p-3 rounded-lg text-sm backdrop-blur-sm shadow-lg">
                    <p className="flex items-center gap-2"><GitCommit className="h-4 w-4 text-primary"/>{currentCommit.message}</p>
                    <p className="text-xs text-gray-400 mt-1">by {currentCommit.author} ({commitIndex + 1}/{mockCommits.length})</p>
                    <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                         <div className="bg-primary h-1.5 rounded-full" style={{ width: `${((commitIndex + 1) / mockCommits.length) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitHistoryVisualizer;
