
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, PenLine, Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SampleDataItem } from "@/types/data-mapper";

interface SampleDataDropdownProps {
  sampleDataList: SampleDataItem[];
  onAddSample: () => void;
  onEdit: (item: SampleDataItem) => void;
  onTransform: (data: string, isYaml?: boolean) => void;
  onDelete: (id: string) => void;
}

export const SampleDataDropdown = ({
  sampleDataList,
  onAddSample,
  onEdit,
  onTransform,
  onDelete,
}: SampleDataDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Samples ({sampleDataList.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Sample Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sampleDataList.map(item => (
          <DropdownMenuItem key={item.id} className="flex justify-between">
            <span className="flex-1 truncate mr-1" title={item.name}>
              {item.name} {item.isYaml && <span className="text-xs text-muted-foreground">(YAML)</span>}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <PenLine className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTransform(item.data, item.isYaml);
                }}
              >
                <Play className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
          onAddSample();
        }}>
          <Plus className="h-4 w-4 mr-1" />
          Add New Sample
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
