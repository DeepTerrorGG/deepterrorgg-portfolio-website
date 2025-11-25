
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RefreshCw, Github, GitCommit, File, Wind } from 'lucide-react';
import { mockCommits } from '@/lib/githistory-mock-data';
import { cn } from '@/lib/utils';
import { DoomIcon } from '../icons/doom';

interface GitNode extends d3.SimulationNodeDatum {
  id: string; // file path
  size: number;
  type: 'file' | 'dir';
  lastModified: number;
}

interface GitLink extends d3.SimulationLinkDatum<GitNode> {
    source: string;
    target: string;
}

const GitHistoryVisualizer: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<GitNode[]>([]);
    const [links, setLinks] = useState<GitLink[]>([]);
    const [currentCommitIndex, setCurrentCommitIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
    const simulationRef = useRef<d3.Simulation<GitNode, GitLink>>();

    const processCommit = useCallback((commitIndex: number) => {
        if (commitIndex >= mockCommits.length) {
            setIsPlaying(false);
            return;
        }

        const commit = mockCommits[commitIndex];
        
        setNodes(prevNodes => {
            const newNodesMap = new Map(prevNodes.map(n => [n.id, n]));
            const newDirs = new Set<string>();

            commit.files.forEach(file => {
                const existingFile = newNodesMap.get(file.path);
                newNodesMap.set(file.path, {
                    id: file.path,
                    size: (existingFile?.size || 0) + file.changes,
                    type: 'file',
                    lastModified: commitIndex,
                    x: existingFile?.x || Math.random() * 800,
                    y: existingFile?.y || Math.random() * 600,
                });

                const pathParts = file.path.split('/');
                let currentPath = '';
                for (let i = 0; i < pathParts.length - 1; i++) {
                    currentPath += (currentPath ? '/' : '') + pathParts[i];
                    if (!newNodesMap.has(currentPath)) {
                        newDirs.add(currentPath);
                    }
                }
            });

            newDirs.forEach(dirPath => {
                const parentDir = dirPath.split('/').slice(0, -1).join('/');
                const existingDir = newNodesMap.get(dirPath);
                newNodesMap.set(dirPath, {
                    id: dirPath,
                    size: 10,
                    type: 'dir',
                    lastModified: commitIndex,
                    x: existingDir?.x || newNodesMap.get(parentDir)?.x || Math.random() * 800,
                    y: existingDir?.y || newNodesMap.get(parentDir)?.y || Math.random() * 600,
                });
            });
            
            const updatedNodes = Array.from(newNodesMap.values()).filter(n => n.size > 0);
            
            // Also update links based on the new nodes structure
            const newLinksMap = new Map<string, GitLink>();
            updatedNodes.forEach(node => {
                if (node.type === 'file') {
                    const parts = node.id.split('/');
                    if (parts.length > 1) {
                        const parentPath = parts.slice(0, -1).join('/');
                        if (newNodesMap.has(parentPath)) { // Ensure parent directory exists
                           newLinksMap.set(`${parentPath}->${node.id}`, { source: parentPath, target: node.id });
                        }
                    }
                }
            });
            setLinks(Array.from(newLinksMap.values()));

            return updatedNodes;
        });

    }, []);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.parentElement!.clientWidth;
        const height = svgRef.current.parentElement!.clientHeight;

        const nodeElements = d3.select(svgRef.current).selectAll<SVGCircleElement, GitNode>('.node');
        const linkElements = d3.select(svgRef.current).selectAll<SVGLineElement, GitLink>('.link');

        if (!simulationRef.current) {
            simulationRef.current = d3.forceSimulation<GitNode, GitLink>()
                .force('link', d3.forceLink<GitNode, GitLink>().id(d => d.id).distance(40).strength(0.6))
                .force('charge', d3.forceManyBody().strength(-100))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide().radius(d => Math.sqrt(d.size) + 12).strength(1));
        }

        simulationRef.current.nodes(nodes);
        simulationRef.current.force<d3.ForceLink<GitNode, GitLink>>('link')?.links(links);

        simulationRef.current.on('tick', () => {
            nodeElements
              .attr('cx', d => d.x = Math.max(10, Math.min(width - 10, d.x!)))
              .attr('cy', d => d.y = Math.max(10, Math.min(height - 10, d.y!)));
              
            linkElements
                .attr('x1', d => (d.source as GitNode).x!)
                .attr('y1', d => (d.source as GitNode).y!)
                .attr('x2', d => (d.target as GitNode).x!)
                .attr('y2', d => (d.target as GitNode).y!);
        });

        simulationRef.current.alpha(1).restart();
    }, [nodes, links]);


    useEffect(() => {
        if (isPlaying) {
            const timer = setInterval(() => {
                setCurrentCommitIndex(prev => {
                    const nextIndex = prev + 1;
                    if (nextIndex < mockCommits.length) {
                        processCommit(nextIndex);
                        return nextIndex;
                    }
                    setIsPlaying(false);
                    return prev;
                });
            }, 500);
            return () => clearInterval(timer);
        }
    }, [isPlaying, processCommit]);

    const handlePlayPause = () => {
        if(currentCommitIndex >= mockCommits.length - 1) {
            handleReset();
            setTimeout(() => setIsPlaying(true), 100);
        } else {
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleReset = useCallback(() => {
        setIsPlaying(false);
        setCurrentCommitIndex(0);
        setNodes([]);
        setLinks([]);
        processCommit(0);
    }, [processCommit]);

    useEffect(() => {
        handleReset();
    }, [handleReset]);

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col p-4 text-white font-mono">
        <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
                <CardTitle className="text-primary">Git History Visualizer</CardTitle>
                <CardDescription>Watch a repository's history unfold like a galaxy.</CardDescription>
            </CardHeader>
             <CardContent className="flex flex-col sm:flex-row gap-4">
                <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="Enter GitHub repo URL (e.g., https://github.com/user/repo)" className="bg-gray-900 border-gray-700"/>
                <div className="flex gap-2">
                    <Button onClick={handlePlayPause} className="w-24">
                        {isPlaying ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                        {currentCommitIndex >= mockCommits.length-1 ? "Replay" : isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                </div>
            </CardContent>
        </Card>
        
        <div className="flex-grow relative mt-4">
            <svg ref={svgRef} className="w-full h-full">
                <g className="links">
                    {links.map((link, i) => (
                        <line key={i} className="link stroke-gray-600" strokeWidth="0.5"/>
                    ))}
                </g>
                <g className="nodes">
                    <AnimatePresence>
                        {nodes.map(node => (
                            <motion.circle
                                key={node.id}
                                className={cn("node stroke-primary", node.type === 'dir' ? 'fill-blue-500/20' : 'fill-primary/20')}
                                r={Math.sqrt(node.size) + 3}
                                initial={{ r: 0 }}
                                animate={{ r: Math.sqrt(node.size) + 3 }}
                                exit={{ r: 0 }}
                            />
                        ))}
                    </AnimatePresence>
                </g>
            </svg>
            <AnimatePresence>
                {isPlaying && mockCommits[currentCommitIndex] && (
                     <motion.div initial={{ opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg text-sm backdrop-blur-sm">
                        <p className="flex items-center gap-2"><GitCommit className="h-4 w-4 text-primary"/>{mockCommits[currentCommitIndex].message}</p>
                        <p className="text-xs text-gray-400 mt-1">by {mockCommits[currentCommitIndex].author}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default GitHistoryVisualizer;
