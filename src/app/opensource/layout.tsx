import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Open Source Projects | DeepTerrorGG',
    description: 'A showcase of my open-source projects including the Autonomous AI Pentesting Platform (Kali Ops Center) and the Enterprise LLM fine-tuning platform (AutoQuant Pipeline).',
    keywords: ["Open Source", "Kali Ops Center", "AutoQuant Pipeline", "AI Pentesting", "LLM Fine-tuning", "DeepTerrorGG GitHub"],
    openGraph: {
        title: 'Open Source Projects | DeepTerrorGG',
        description: 'A showcase of my open-source projects including the Autonomous AI Pentesting Platform (Kali Ops Center) and the Enterprise LLM fine-tuning platform (AutoQuant Pipeline).',
        type: 'website',
    },
};

export default function OpenSourceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
