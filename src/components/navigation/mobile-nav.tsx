
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavigationSidebar } from "./sidebar";

export function MobileNavigation() {
  return (
    <div className="flex h-[60px] items-center border-b px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <NavigationSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex-1 text-center">
        <span className="text-xl font-bold">Your App</span>
      </div>
    </div>
  );
}
