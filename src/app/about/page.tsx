
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
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
              src="https://i.imgur.com/wcHgOHv.png"
              alt="Profile picture"
              width={800} 
              height={800} 
              className="rounded-lg shadow-lg aspect-square object-cover w-full"
              data-ai-hint="artist profile"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <CardTitle className="text-2xl text-center text-primary">DeepTerrorGG</CardTitle>
            <p className="text-muted-foreground text-center mt-1">Programer &amp; Digital Artist</p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Brain aria-hidden="true" className="text-primary h-6 w-6" />
                My Story
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                I’m DeepTerrorGG a developer and digital artist exploring where code, emotion, and imagination meet. My journey into art didn’t start with a plan; it started with a feeling. A lot of it was sparked by @hinxycrybaby her style, her energy, and the way her presence felt honest and real. That inspiration is what pushed me to start creating on my own.
              </p>
              <p>
                For me, art isn’t just about visuals it’s about expression. It’s how I work through thoughts, how I grow, and how I try to turn feelings into something you can see. Every project is a step toward becoming better not just technically, but as a person. I’m learning, reflecting, and creating from a place that feels honest.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Palette aria-hidden="true" className="text-primary h-6 w-6" />
                Skills &amp; Techniques
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Digital Art & Illustration</li>
                <li>Web Development (Next.js, React, TypeScript, Tailwind, CSS)</li>
                <li>C# Programming</li>
                <li>Basic Proficiency in Java, Python & C++</li>
                <li>Game Server Setup & Management</li>
                <li>Bot Development & Automation</li>
              </ul>
               <p className="mt-3">
                I like mixing technical skills with creative ideas always learning, trying new things, and finding better ways to bring what I imagine to life. It’s less about perfection and more about growing through the process.
              </p>
            </CardContent>
          </Card>
           <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Code aria-hidden="true" className="text-primary h-6 w-6" />
                Beyond the Canvas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Besides coding and design, I’m drawn to games and anything with a strong aesthetic vibe. Those things shape how I see the world and they help me add emotion, atmosphere, and personality to the things I build.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
