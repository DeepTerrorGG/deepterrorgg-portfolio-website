import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Playground & Experiments | DeepTerrorGG',
    description: 'Explore my interactive AI playground featuring generative AI models, intelligent agents, and machine learning experiments integrated directly into the browser.',
    keywords: ["AI", "Playground", "Generative AI", "Machine Learning", "Google Gemini", "AI Agents", "DeepTerrorGG AI"],
    openGraph: {
        title: 'AI Playground & Experiments | DeepTerrorGG',
        description: 'Explore my interactive AI playground featuring generative AI models, intelligent agents, and machine learning experiments integrated directly into the browser.',
        type: 'website',
    },
};

export default function AILayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
