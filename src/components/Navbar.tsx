import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, MailIcon } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="bg-slate-300 dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Hyseco
          </Link>
          <div className="space-x-4">
            <Link href="/#services">
              <Button variant="ghost">
                <HomeIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-600 " />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-600">
                  Nos Services
                </p>
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="ghost">
                <MailIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-600" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-600">
                  Contact
                </p>
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
