"use client";

import { Bell, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ModeToggle } from "./Darkmode";
import { useState } from "react";

interface NavTypes {
  title: string;
  href: string;
}

const navItems: NavTypes[] = [
  { title: "Explore", href: "/explore" },
  { title: "Problems", href: "/problems" },
  { title: "Challenge", href: "/challenges" },
  { title: "Discuss", href: "/discuss" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 backdrop-blur-sm transform transition-transform duration-300 ease-out">
      <div className="flex w-full items-center justify-between px-10 py-6 md:px-12">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-semibold mb-1">BeatMe</h1>
          <ul className="hidden lg:flex items-start gap-4">
            {navItems.map((nav) => (
              <li key={nav.href}>
                <Link
                  className="py-4 inline-block text-gray-400 hover:text-white"
                  href={nav.href}
                >
                  {nav.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 relative">
            <Search className="w-4 h-4 inline-flex absolute ml-2" />
            <input
              type="text"
              placeholder="Search"
              className="pl-9 border rounded-xl border-black h-9"
            />
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <ModeToggle />
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Button className="text-base rounded-lg">Premium</Button>
          </div>
          <div>
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col p-6 md:hidden">
          <ul className="flex items-center gap-4">
            <li>
              <h1 className="text-2xl font-semibold mb-1">BeatMe</h1>
            </li>
            {navItems.map((nav) => (
              <li key={nav.href}>
                <Link
                  className="py-4 inline-block text-gray-400 hover:text-white"
                  href={nav.href}
                >
                  {nav.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
