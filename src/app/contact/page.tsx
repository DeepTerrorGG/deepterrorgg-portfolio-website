// Ensure this component is a client component
'use client';

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React from 'react';
import { Mail, Send, MessageSquare, Loader2 } from 'lucide-react'; 
import Image from 'next/image';

import PageTitle from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { DirectMessageFormState, DirectMessageSchemaType } from './schema';
import { DirectMessageSchema } from './schema';


const socialLinks = [
  { name: 'Instagram', iconSrc: '/icons/instagram.svg', href: 'https://www.instagram.com/deep_terror_gg/?next=%2F', user: '@deep_terror_gg' },
  { name: 'Steam', iconSrc: '/icons/steam.svg', href: 'https://steamcommunity.com/id/DeepTerrorGG/', user: '@DeepTerrorGG' },
  { name: 'TikTok', iconSrc: '/icons/tiktok.svg', href: 'https://www.tiktok.com/@deep_terror_gg', user: '@deep_terror_gg' },
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
    form.clearErrors(); 

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let result: DirectMessageFormState;
      if (response.headers.get('content-type')?.includes('application/json')) {
        result = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("Server returned non-JSON response:", response.status, textResponse);
        let detail = "The server returned an unexpected response.";
        if (response.status === 404) {
          detail = "The email sending endpoint was not found (404).";
        } else if (response.status === 500) {
          detail = "The server encountered an internal error (500)."
        } else if (response.status >= 400) {
          detail = `The server returned an error (status: ${response.status}).`;
        }
        
        throw new Error(`Server communication error. ${detail} Expected JSON response.`);
      }


      if (response.ok && result.success) {
        toast({
          title: 'Message Sent!',
          description: result.message || 'Your message has been sent successfully!',
          variant: 'default',
        });
        form.reset({ email: '', message: '' }); 
      } else {
        const errorTitle = result.message || 'Error Sending Message';
        let errorDescription = 'An unknown error occurred. Please try again.';

        if (result.errors) {
          if (result.errors.email && result.errors.email.length > 0) {
            form.setError('email', { type: 'server', message: result.errors.email.join(', ') });
          }
          if (result.errors.message && result.errors.message.length > 0) {
            form.setError('message', { type: 'server', message: result.errors.message.join(', ') });
          }
          if (result.errors._form && result.errors._form.length > 0) {
            errorDescription = result.errors._form.join('; ');
             if (result.message && !result.errors._form.includes(result.message) && result.message !== errorDescription.split('; ')[0]) {
              errorDescription = `${result.message} Details: ${errorDescription}`;
            }
          } else if (result.message) {
             errorDescription = result.message;
          }
        } else if (result.message) {
          errorDescription = result.message;
        }
        
        console.error("Form submission failed. Server Response:", JSON.stringify(result, null, 2));
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'destructive',
          duration: 10000, 
        });
        form.setError('root.serverError', {
          type: String(response.status), 
          message: errorDescription,
        });
      }
    } catch (error: any) { 
      console.error("Form submission client-side error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected client-side error occurred.";
      
      toast({
        title: "Submission Error",
        description: `Failed to send message. ${errorMessage.includes("Server communication error") ? errorMessage : "Please check your network and try again. Details: " + errorMessage}`,
        variant: "destructive",
        duration: 10000,
      });
      form.setError("root.serverError", {
        type: "client",
        message: "Could not connect to the server or process the request: " + errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
      <PageTitle subtitle="Have a project in mind, a question, or just want to say hello? I'd love to hear from you.">
        Get In Touch
      </PageTitle>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-foreground">
              <Send className="mr-3 h-7 w-7 text-primary" aria-hidden="true" />
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
                
                 {form.formState.errors.root?.serverError && (
                  <FormMessage className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    {form.formState.errors.root.serverError.message}
                  </FormMessage>
                )}
                <Button type="submit" className="w-full transition-transform hover:scale-105" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" aria-hidden="true" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-foreground">
              <MessageSquare className="mr-3 h-7 w-7 text-primary" aria-hidden="true" />
              Connect Socially
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Follow my work and connect with me on social media:
            </p>
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="outline" className="w-full justify-start group transition-all hover:border-primary hover:text-primary" asChild>
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <div className="mr-3 h-5 w-5 relative">
                        <Image src={social.iconSrc} alt={`${social.name} icon`} fill className="filter-primary group-hover:filter-primary transition-colors" />
                    </div>
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
    </div>
  );
}
