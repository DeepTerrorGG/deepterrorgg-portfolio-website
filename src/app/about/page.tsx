
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Code, Palette } from 'lucide-react';

export default function AboutPage() {
  return (
    <SectionContainer>
      <PageTitle subtitle="A glimpse into my creative journey, skills, and passions.">
        About Me
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1 bg-card border-border">
          <CardHeader>
            <Image
              src="https://imgur.com/wcHgOHv.png"
              alt="Profile picture"
              width={800}
              height={800}
              className="rounded-lg shadow-lg aspect-square object-cover w-full"
              data-ai-hint="artist profile"
            />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl text-center text-primary">DeepTerrorGG</CardTitle>
            <p className="text-muted-foreground text-center mt-1">Digital Artist &amp; Creative Mind</p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Brain className="text-primary h-6 w-6" />
                My Story
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                Welcome to my digital canvas! I&apos;m DeepTerrorGG a developer and digital artist exploring the creative space where code meets imagination. My journey into art started with a huge appreciation for cool visual styles, especially @hinxycrybaby&apos;s aesthetic. Her vibe was what got me hooked on creating art and inspired me to start building my own.
              </p>
              <p>
                I believe art is a powerful medium for storytelling, evoking emotions, and challenging perceptions. Through my work, I aim to improve myself not just in skill, but in mindset and creativity constantly learning and growing with each piece I create.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Palette className="text-primary h-6 w-6" />
                Skills &amp; Techniques
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Digital Art &amp; Illustration</li>
                <li>Web Development (HTML, CSS, JavaScript)</li>
                <li>C# Programming</li>
                <li>Basic Proficiency in Java, Python &amp; C++</li>
                <li>Game Server Setup &amp; Management</li>
                <li>Bot Development &amp; Automation</li>
              </ul>
               <p className="mt-3">
                I enjoy blending technical skill with creative vision, constantly learning new tools and experimenting with different approaches to expand my capabilities and bring fresh ideas to life.
              </p>
            </CardContent>
          </Card>
           <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Code className="text-primary h-6 w-6" />
                Beyond the Canvas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                While development and art are my primary focus, I also have a strong interest in gaming in general and exploring cool, aesthetic-driven artworks. These passions fuel my inspiration and often shape the direction of my projects bringing a unique blend of style, playfulness, and atmosphere to everything I create.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}

