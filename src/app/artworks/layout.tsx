import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Generative Artworks & Visuals | DeepTerrorGG',
    description: 'A collection of visual experiments, generative art, and creative coding showcasing expertise in advanced CSS, Canvas API, and WebGL.',
    keywords: ["Generative Art", "Creative Coding", "Canvas API", "WebGL", "CSS Art", "DeepTerrorGG Artworks"],
    openGraph: {
        title: 'Generative Artworks & Visuals | DeepTerrorGG',
        description: 'A collection of visual experiments, generative art, and creative coding showcasing expertise in advanced CSS, Canvas API, and WebGL.',
        type: 'website',
    },
};

export default function ArtworksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
