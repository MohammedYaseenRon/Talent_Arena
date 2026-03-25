import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

export const footerData = {
  brand: "Talent_Arena",
  about: {
    description:
      "HireMe Pro is an AI-powered hiring platform where recruiters create real-world coding challenges and evaluate candidates instantly with data-driven insights.",
  },
  links: [
    { name: "About", link: "#" },
    { name: "Contact Us", link: "#" },
    { name: "Pricing", link: "#" },
    { name: "Terms and Conditions", link: "#" },
    { name: "Cancellation & Refund Policy", link: "#" },
  ],

  social: [
    { icon: Instagram, label: "Instagram", link: "#" },
    { icon: Twitter, label: "Twitter", link: "#" },
    { icon: Linkedin, label: "LinkedIn", link: "#" },
    { icon: Facebook, label: "Facebook", link: "#" },
  ],
};
const Footer = () => {
  return (
    <div className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <h1 className="font-serif font-medium italic text-lg md:text-xl">
            {footerData.brand}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {footerData.links.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="hover:text-primary transition"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* RIGHT - SOCIAL */}
          <div className="flex items-center gap-3">
            <TooltipProvider>
              {footerData.social.map((item, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <item.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} HireMe Pro | All rights reserved
        </div>

      </div>
    </div>
  );
};

export default Footer;