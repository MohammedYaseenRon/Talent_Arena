"use client";

import React from 'react'
import { cn } from '@/lib/utils';
import { GradientButton } from './ui/GradientButton';
import Image from 'next/image';
import { ModeToggle } from './Darkmode';
import Link from 'next/link';

const Navbar = () => {
    return (
        <div className='fixed top-0 left-0 w-full z-50'>
            <div className={cn("py-2 flex md:mt-4 items-center justify-between max-w-6xl mx-auto px-3 md:px-5 rounded-xl bg-white/40 md:rounded-2xl backdrop-blur-md dark:bg-black/40 border shadow-lg transition-all duration-300")}>
                <div className='flex items-center gap-2 py-2 md:py-4 px-1 md:px-2 rounded-md'>
                  <Image
                      width={40}
                      height={40}
                      alt='Logo'
                      src="/cross.png"
                      className='w-10 md:w-10 object-contain mix-blend-screen dark:mix-blend-screen invert-0'
                  />
                  <h2 className='text-2xl font-bold font-mono'>Talent_Arena</h2>
                </div>

                <div className='flex items-center gap-4'>
                    <ModeToggle />
                    <Link href="/auth/signup"><GradientButton text='Signup' size='md' variant='white' /></Link>
                    <Link href="/auth/login"><GradientButton text='Login' size='md' variant='orange' /></Link>
                </div>
            </div>
        </div>
    )
}

export default Navbar