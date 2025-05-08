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
              width={600}
              height={600}
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
                Welcome to my digital canvas! I'm DeepTerrorGG, a passionate artist exploring the boundless realms of creativity. 
                My journey into the art world began with a fascination for [mention early inspiration, e.g., surreal landscapes, character design, abstract forms]. 
                This initial spark has grown into a dedicated pursuit of crafting unique visual experiences.
              </p>
              <p>
                I believe art is a powerful medium for storytelling, evoking emotions, and challenging perceptions. 
                Through my work, I aim to [mention artistic goals, e.g., transport viewers to other worlds, explore complex themes, celebrate beauty in the unconventional].
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
                <li>Digital Painting (e.g., Photoshop, Procreate)</li>
                <li>Illustration & Character Design</li>
                <li>Concept Art & World Building</li>
                <li>[Add another skill, e.g., 3D Modeling, Graphic Design]</li>
                <li>[Add another skill, e.g., Abstract Art, Photo Manipulation]</li>
              </ul>
               <p className="mt-3">
                I'm constantly learning and experimenting with new tools and techniques to push the boundaries of my artistic expression.
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
                While art is my primary focus, I also have a keen interest in [mention other interests, e.g., game development, storytelling, technology, music]. 
                These diverse passions often find their way into my creative process, enriching my work and perspectives.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
