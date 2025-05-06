// Ensure this component is a client component
'use client';

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, Send, MessageSquare, Linkedin, Github, Twitter, Loader2 } from 'lucide-react';

import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sendDirectMessageAction } from './actions/sendDirectMessageAction';
import type { DirectMessageFormState, DirectMessageSchemaType } from './schema';
import { DirectMessageSchema } from './schema';


const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/DeepTerrorGG', user: 'DeepTerrorGG-GH' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yourprofile', user: 'DeepTerrorGG-LI' },
  { name: 'Twitter / X', icon: Twitter, href: 'https://twitter.com/YourTwitterHandle', user: '@DeepTerrorGG_X' },
];


export default function ContactPage() {
  const { toast } = useToast();

  const form = useForm<DirectMessageSchemaType>({
    resolver: zodResolver(DirectMessageSchema),
    defaultValues: {
      email: '',
      message: '',
    },
  });

  const onSubmit: SubmitHandler<DirectMessageSchemaType> = async (data) => {
    const result: DirectMessageFormState = await sendDirectMessageAction(data);

    if (result.success) {
      toast({
        title: 'Message Sent!',
        description: result.message,
      });
      form.reset();
    } else {
      let description = result.message || 'Failed to send message.';
      if (result.errors?._form && result.errors._form.length > 0) {
        // Prioritize form-level errors for the main toast message if available
        description = result.errors._form.join('; ');
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: description,
      });
      // Optionally set field-specific errors if your UI/UX requires it
      if (result.errors?.email) {
        form.setError('email', { type: 'server', message: result.errors.email.join(', ') });
      }
      if (result.errors?.message) {
        form.setError('message', { type: 'server', message: result.errors.message.join(', ') });
      }
    }
  };

  return (
    <SectionContainer>
      <PageTitle subtitle="Have a project in mind, a question, or just want to say hello? I'd love to hear from you.">
        Get In Touch
      </PageTitle>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <Card className="animate-slide-up bg-card border-border" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-foreground">
              <Send className="mr-3 h-7 w-7 text-primary" />
              Direct Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The quickest way to reach me. I typically respond within 24-48 hours.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email" className="text-foreground/80">Your Email</FormLabel>
                      <FormControl>
                        <Input id="email" type="email" placeholder="you@example.com" {...field} className="bg-input border-border focus:ring-primary focus:border-primary text-foreground" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="message" className="text-foreground/80">Message</FormLabel>
                      <FormControl>
                        <Textarea id="message" rows={4} placeholder="Your message..." {...field} className="bg-input border-border focus:ring-primary focus:border-primary text-foreground" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full transition-transform hover:scale-105" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="animate-slide-up bg-card border-border" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-foreground">
              <MessageSquare className="mr-3 h-7 w-7 text-primary" />
              Connect Socially
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Follow my work and connect with me on social media (links are placeholders):
            </p>
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="outline" className="w-full justify-start group transition-all hover:border-primary hover:text-primary" asChild>
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                    <span className="flex-1">{social.name}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">{social.user}</span>
                  </Link>
                </Button>
              ))}
            </div>
             <p className="text-sm text-muted-foreground mt-4">
              I&apos;m always open to collaborations and interesting discussions about art and technology.
            </p>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
