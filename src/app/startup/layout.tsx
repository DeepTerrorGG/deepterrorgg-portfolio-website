import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Startup Sandbox & Dashboards | DeepTerrorGG',
    description: 'A mock Startup Operations Center demonstrating enterprise-grade dashboard design, realtime data visualization, and complex data grid implementations.',
    keywords: ["Startup Dashboard", "Enterprise UI", "Data Visualization", "Admin Dashboard", "DeepTerrorGG Startup"],
    openGraph: {
        title: 'Startup Sandbox & Dashboards | DeepTerrorGG',
        description: 'A mock Startup Operations Center demonstrating enterprise-grade dashboard design, realtime data visualization, and complex data grid implementations.',
        type: 'website',
    },
};

export default function StartupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
