'use client';
import { Agency } from '@prisma/client';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useToast } from '../ui/use-toast';

import * as z from 'zod';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotification,
  updateAgencyDetails,
  upsertAgency,
} from '@/lib/queries';
import { Button } from '../ui/button';
import FileUpload from '../global/file-upload';

type Props = {
  data?: Partial<Agency>;
};

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Agency name must be atleast 2 chars.' }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
});

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      agencyLogo: data?.agencyLogo,
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData;
      let custId;
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        };

        const customerResponse = await fetch('/api/stripe/create-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        });
        const customerData: { customerId: string } = await customerResponse.json();
        custId = customerData.customerId;
      }

      newUserData = await initUser({ role: 'AGENCY_OWNER' });
      if (!data?.customerId && !custId) return;

      const response = await upsertAgency({
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || '',
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: '',
        goal: 5,
      });
      toast({
        title: 'Created Agency',
      });
      if (data?.id) return router.refresh();
      if (response) {
        return router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'could not create your agency',
      });
    }
  };

  return (
    <AlertDialog>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for you business. You can edit agency settings later from the
            agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
              <FormField
                disabled={isLoading}
                control={form.control}
                name='agencyLogo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint='agencyLogo'
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
