
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Code } from 'lucide-react';
import { TechBadge, type TechBadgeProps } from '@/components/ui/tech-badge';

const technologies: TechBadgeProps[] = [
  { name: 'C#', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>C#</title><path d="M13.23 2.165 9.42 12l3.81 9.835h3.305l-3.81-9.835 3.81-9.835zm5.558 0L15 6.835l3.788 4.67h3.307l-3.788-4.67L22.1 2.165zm-1.895 15h3.304L18.9 21.835l-1.896-4.67zM.88 2.165h3.304l3.81 9.835-3.81 9.835H.88l3.81-9.835z"/></svg>, href: 'https://docs.microsoft.com/en-us/dotnet/csharp/' },
  { name: 'Java', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Java</title><path d="M17.345 2.528c-.456.02-1.04.108-1.57.397-.738.332-1.353.99-1.569 2.062-.217 1.072.036 2.22.613 3.062.25.37.587.69.96.96.53.408.868.657.868.657s-.34-.25-.87-.66c-.528-.407-.867-.656-.867-.656s.278.43.587.89c.31.46.527.81.527.81s-.31-.26-.708-.59c-.398-.33-.677-.55-.677-.55s.338.45.677.92c.34.47.557.77.557.77s-.31-.22-.708-.52c-.398-.3-.647-.48-.647-.48s.368.5.737.98c.37.48.618.8.618.8s-.34-.19-.767-.46c-.428-.27-.677-.42-.677-.42s.398.53.797.98c.4.45.647.74.647.74s-.37-.16-.827-.39c-.458-.23-.708-.36-.708-.36s.887.89 1.815 1.54c.93.65 1.558.98 1.558.98.5 0 .91-.07 1.228-.23.32-.16.558-.39.708-.71.15-.32.22-.69.22-1.12 0-.5-.13-.98-.4-1.42-.26-.44-.64-.81-1.13-1.1l-1.01-1.13s.48-.42.848-.71c.37-.29.628-.53.767-.71.31-.41.56-.89.73-1.44.17-.55.25-1.16.25-1.83 0-.8-.15-1.5-.44-2.11-.29-.61-.7-1.1-1.22-1.47-.52-.37-1.1-.59-1.74-.67zm-2.88 5.17c-.01-.02 0-.09-.13-.23-.13-.14-.3-.25-.51-.34-.21-.09-.42-.14-.64-.14-.49 0-.89.17-1.2.51-.31.34-.47.79-.47 1.35 0 .44.13.82.39 1.14.26.32.6.56.99.71l.87.52c.23.14.42.27.56.4l.21.2s.19-.13.31-.25.18-.25.18-.39a.53.53 0 0 0-.06-.29c-.04-.09-.1-.17-.18-.25l-.26-.26c-.19-.16-.36-.3-.51-.4l-.56-.37c-.19-.12-.33-.25-.43-.39-.1-.14-.15-.29-.15-.46 0-.25.07-.46.22-.61.15-.15.34-.23.58-.23.14 0 .28.02.4.07.13.05.24.1.34.17.1.07.19.14.28.22zm-5.72 2.6c0 .5-.13.94-.4 1.34s-.63.7-1.09.9c-.46.2-1 .28-1.58.25l-2.39-.25c-.49-.05-1.01-.13-1.58-.25-.57-.12-1.04-.3-1.4-.52-.37-.22-.64-.5-.81-.83-.17-.33-.25-.7-.25-1.11 0-.42.08-.82.25-1.19.17-.37.42-.68.76-.92.34-.24.76-.42 1.25-.52.5-.1 1.05-.14 1.66-.12.61.02 1.15.08 1.61.17.46.09.84.22 1.13.39.29.17.5.38.64.64.13.26.2.56.2.9zm-1.89-1.06c-.16-.23-.4-.42-.71-.56-.31-.14-.68-.21-1.11-.21-.43 0-.82.07-1.16.21-.34.14-.6.33-.79.56-.18.23-.28.5-.28.81s.1.58.28.81c.19.23.45.42.79.56.34.14.73.21 1.16.21.43 0 .8-.07 1.11-.21.31-.14.55-.33.71-.56.16-.23.25-.5.25-.81s-.08-.58-.25-.81z"/></svg>, href: 'https://www.java.com/' },
  { name: 'Python', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Python</title><path d="M11.23 21.053c-2.455 0-4.445-1.99-4.445-4.445V12h4.445v4.608c0 .922.743 1.667 1.667 1.667h2.778v-2.778H12V8.889h7.111c.922 0 1.667.743 1.667 1.667v.556H16.333c-2.455 0-4.445 1.99-4.445 4.445v5.496H5.333c-2.455 0-4.444-1.99-4.444-4.445V5.333c0-2.455 1.99-4.444 4.444-4.444h4.053v4.444H4.889v3.111h8.89v-2.778H12c-.922 0-1.667-.743-1.667-1.667V4.444h4.608c.922 0 1.667.743 1.667 1.667v2.778h2.778v-4.053c0-2.455-1.99-4.444-4.445-4.444H8.889c-2.455 0-4.445 1.99-4.445 4.444v7.111H0v4.608c0 2.455 1.99 4.445 4.445 4.445h6.786z"/></svg>, href: 'https://www.python.org/' },
  { name: 'C++', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>C++</title><path d="M14.996 0s-.598.002-.598.598v4.836h-4.836c-.596 0-.598.598-.598.598v2.392c0 .596.002.598.598.598h4.836v4.836c0 .596.598.598.598.598h2.392c.596 0 .598-.598.598-.598V8.992h4.836c.596 0 .598-.598.598-.598V6.002c0-.596-.002-.598-.598-.598H18V.598c0-.596-.598-.598-.598-.598zm-14.4 6.002s-.598.002-.598.598v4.836H0c-.596 0-.598.598-.598.598v2.392c0 .596.002.598.598.598h4.836v4.836c0 .596.598.598.598.598h2.392c.596 0 .598-.598.598-.598V15.02h4.836c.596 0 .598-.598.598-.598v-2.392c0-.596-.002-.598-.598-.598H8.388V6.598c0-.596-.598-.598-.598-.598z"/></svg>, href: 'https://isocpp.org/' },
  { name: 'Next.js', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Next.js</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.983 18.264c-.38.38-.901.57-1.423.57a1.917 1.917 0 0 1-1.334-.543L8.29 11.23v6.526c0 1.033-.84 1.872-1.873 1.872s-1.873-.84-1.873-1.872V6.244c0-1.033.84-1.873 1.873-1.873s1.873.84 1.873 1.873v5.923l6.574-6.853c.65-.678 1.635-.78 2.404-.26.77.52 1.052 1.503.67 2.39L13.26 12l5.723 6.264c.38.416.325 1.055-.125 1.417z"/></svg>, href: 'https://nextjs.org/' },
  { name: 'React', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>React</title><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.3-8.03c.12-.38.48-.64.88-.64.44 0 .8.29.95.71l-1.83.93zm4.3 2.12c-2.39 0-4.33-1.94-4.33-4.33s1.94-4.33 4.33-4.33 4.33 1.94 4.33 4.33-1.94 4.33-4.33 4.33zm0-7.33c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-5.06 6.09c.35-.18.73-.29 1.13-.34l.28-1.07c-1.59.3-2.9 1.59-3.21 3.21l1.07-.28c.11-.47.38-.88.73-1.24zm5.06 1.91c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3.93-7.96l-.28 1.07c.36.18.67.43.91.75l.93-1.07c-.45-.45-1-.79-1.56-1.75zm-7.86 0c-.55.96-1.11 1.3-1.56 1.75l.93 1.07c.24-.32.55-.57.91-.75l-.28-1.07zM12 20.5c-1.56 0-2.96-.54-4.08-1.42l.83-2.02c.85.64 1.88 1.01 2.97 1.01s2.13-.37 2.97-1.01l.83 2.02C14.96 19.96 13.56 20.5 12 20.5zm-5.26-4.52l-2.02-.83C4.54 13.04 4 11.44 4 9.5c0-1.56.54-2.96 1.42-4.08l2.02.83c-.64.85-1.01 1.88-1.01 2.97s.37 2.13 1.01 2.97zM17.26 16c.64-.85 1.01-1.88 1.01-2.97s-.37-2.13-1.01-2.97l2.02-.83C19.46 10.04 20 11.44 20 13.5c0 1.94-.54 3.54-1.42 4.66l-2.02-.83z"/></svg>, href: 'https://reactjs.org/' },
  { name: 'TypeScript', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>TypeScript</title><path d="M1.5 0 h21 v21 h-21z M19.508 19.508 V4.492 H4.492 v15.016z M12 11.666 l-2.223 2.222 h4.445z M12.87 14.223 l-2.89 2.89a.434.434 0 0 1-.613 0l-2.89-2.89a.434.434 0 0 1 0-.613l2.89-2.89a.434.434 0 0 1 .613 0l2.89 2.89c.17.17.17.443 0 .613z"/></svg>, href: 'https://www.typescriptlang.org/' },
  { name: 'Tailwind CSS', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Tailwind CSS</title><path d="M12 12c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5zM12 0C8.686 0 6 2.686 6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 1.5 12 1.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/></svg>, href: 'https://tailwindcss.com/' },
  { name: 'Git', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Git</title><path d="M23.55 10.05c-.17-.15-.38-.24-.6-.24h-4.4V6.52c0-.22-.09-.43-.24-.59-.16-.16-.37-.24-.59-.24H15.6c-.22 0-.43.08-.59.24-.16.16-.24.37-.24.59v3.29h-2.5V3.88c0-.22-.09-.43-.24-.59-.16-.16-.37-.24-.59-.24H9.32c-.22 0-.43.09-.59.24-.16.16-.24.37-.24.59v5.93H4.07c-.22 0-.43.08-.59.24-.16.16-.24.37-.24.59v2.16c0 .22.09.43.24.59.16.16.37.24.59.24h4.42v3.13c0 .22.09.43.24.59.16.16.37.24.59.24h2.12c.22 0 .43-.08.59-.24.16-.16.24-.37.24-.59v-3.13h2.5v3.13c0 .22.09.43.24.59.16.16.37.24.59.24h2.12c.22 0 .43-.08.59-.24.16-.16.24-.37.24-.59V13.4h4.4c.22 0 .43-.09.59-.24.16-.16.24-.37.24-.59v-2.16c.01-.22-.08-.43-.24-.59zM15.02 11.23H9.91v-1.1h5.11v1.1z"/></svg>, href: 'https://git-scm.com/' },
  { name: 'Docker', icon: <svg role="img" viewBox="0.06 0.06 24.03 19.09" xmlns="http://www.w3.org/2000/svg"><title>Docker</title><path d="M24.09 9.21s-1.89-1.57-4.14-1.57h-3.41v-3.4s0-2.3-3.4-2.3H3.41S.01 4.24.01 8.3v5.52s.06 4.09 3.75 4.09h10.05s2.91-.06 2.91-2.91v-3.75h2.24s2.24-.06 2.24-2.24l2.88-3.35zM6.82 8.35h3.35v3.35H6.82zm3.35-3.35H13.5v3.35H10.17zm-3.35 6.7h3.35v3.35H6.82zm3.35 0h3.35v3.35H10.17zm3.35-3.35h3.35v3.35H13.52zm3.35 0h3.35v3.35h-3.35zm-3.35-3.35h3.35v3.35H13.52z"/></svg>, href: 'https://www.docker.com/' },
  { name: 'Node.js', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3org/2000/svg"><title>Node.js</title><path d="M12.37.24L.85 6.64v12.72l11.52 6.4 11.52-6.4V6.64L12.37.24zM12 11.31l-4.32-2.5v-2.3l4.32 2.5v2.3zm.72 9.05l-4.32-2.5v-4.5l4.32 2.5v4.5zm.02-11.45l4.3-2.5v2.3l-4.3 2.5v-2.3zm4.3-2.48L12.7 4.13v4.5l4.32-2.5v-2.2z"/></svg>, href: 'https://nodejs.org/' },
  { name: 'Firebase', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Firebase</title><path d="M3.633 19.967l7.234-15.025a.833.833 0 0 1 1.533.001l7.233 15.024a.834.834 0 0 1-.766 1.2h-14.47a.833.833 0 0 1-.764-1.2zM12 17.65a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25zm-2.083-2.917a.625.625 0 0 0 .625.625h2.917a.625.625 0 0 0 0-1.25H11.167a.625.625 0 0 0-.625.625zm1.042-5.625L10.334 12.5h3.333l-.625-3.417-1.042-2.083z"/></svg>, href: 'https://firebase.google.com/' },
];

export default function AboutPage() {
  return (
    <SectionContainer>
      <PageTitle subtitle="A glimpse into my creative journey, skills, and passions.">
        About Me
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1 bg-card border-border">
          <CardHeader className="p-0">
            <Image
              src="https://i.imgur.com/wcHgOHv.png"
              alt="Profile picture"
              width={600}
              height={600}
              className="rounded-t-lg w-full h-auto"
              data-ai-hint="artist profile"
              priority
            />
          </CardHeader>
          <CardContent className="pt-4 flex-shrink-0">
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
      
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Technologies I use.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technologies.map((tech) => (
            <TechBadge key={tech.name} name={tech.name} icon={tech.icon} href={tech.href} />
            ))}
        </div>
        <p className="text-sm text-center text-muted-foreground mt-8">
            I like mixing technical skills with creative ideas always learning, trying new things, and finding better ways to bring what I imagine to life. It’s less about perfection and more about growing through the process.
        </p>
      </div>

    </SectionContainer>
  );
}
