
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CreateMappingRequest } from "@/types/mapping";
import { API_CONFIG } from "@/config/constants";

interface CreateMappingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  baseUrl?: string;
}

const CreateMapping: React.FC<CreateMappingProps> = ({ 
  open, 
  onOpenChange,
  onSuccess,
  baseUrl = API_CONFIG.BASE_URL
}) => {
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for the mapping",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const mappingData: CreateMappingRequest = {
      title: title.trim(),
      content: {
        tags: tags,
        yaml: "", // Start with empty yaml
        test_data: []
      }
    };

    try {
      const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.MAPPINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create mapping: ${errorText}`);
      }

      const result = await response.json();
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error creating mapping:", error);
      toast({
        title: "Error",
        description: "Failed to create mapping. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTagInput("");
    setTags([]);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Mapping</DialogTitle>
          <DialogDescription>
            Create a new data mapping configuration. You can add details and mapping rules after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter mapping title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to add a tag
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Mapping"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMapping;
