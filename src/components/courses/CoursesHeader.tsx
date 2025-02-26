
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export function CoursesHeader() {
  return (
    <div className="glass-morphism p-6 rounded-xl mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search courses..."
              className="pl-10 input-gradient w-full"
            />
          </div>
        </div>
        <Button className="interactive w-full md:w-auto" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>
    </div>
  </div>
