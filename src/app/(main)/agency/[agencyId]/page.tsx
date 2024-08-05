import CircleProgress from '@/components/global/circle-progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/db';
import { AreaChart } from '@tremor/react';
import { ClipboardIcon, Contact2, DollarSign, Goal, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Page = ({ params }: { params: { agencyId: string }; searchParams: { code: string } }) => {
  return <div className='h-screen overflow-hidden'>{params.agencyId}</div>;
};

export default Page;
