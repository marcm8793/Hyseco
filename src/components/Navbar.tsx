import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CleanPro
          </Link>
          <div className="space-x-4">
            <Link href="/#services">
              <Button variant="ghost">Nos Services</Button>
            </Link>
            <Link href="/#contact">
              <Button variant="ghost">Contact</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
