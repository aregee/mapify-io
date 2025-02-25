
import { json as jsonFormat } from 'js-beautify';
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Format } from '@/types/data-mapper';
import { toast } from "@/components/ui/use-toast";

export const convertFormat = (data: string, fromFormat: Format, toFormat: Format): string => {
  // If formats are the same, no conversion needed
  if (fromFormat === toFormat) {
    return data;
  }
  
  try {
    if (fromFormat === "yaml" && toFormat === "json") {
      // Safer YAML parsing with error handling
      try {
        const jsonData = yamlParse(data);
        return JSON.stringify(jsonData, null, 2);
      } catch (yamlError) {
        console.error("YAML parsing error:", yamlError);
        toast({
          title: "Format conversion failed",
          description: "Invalid YAML format. Please check your syntax.",
          variant: "destructive",
        });
        return data;
      }
    } else if (fromFormat === "json" && toFormat === "yaml") {
      // Safer JSON parsing with error handling
      try {
        const jsonData = JSON.parse(data);
        return yamlStringify(jsonData);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        toast({
          title: "Format conversion failed",
          description: "Invalid JSON format. Please check your syntax.",
          variant: "destructive",
        });
        return data;
      }
    }
    return data;
  } catch (error) {
    console.error("General conversion error:", error);
    toast({
      title: "Format conversion failed",
      description: `Could not convert from ${fromFormat} to ${toFormat}`,
      variant: "destructive",
    });
    return data;
  }
};

export const transformData = (data: string, format: Format): string => {
  try {
    const formattedOutput = format === "json" 
      ? jsonFormat(data)
      : yamlStringify(JSON.parse(data));
    
    toast({
      title: "Transformation successful",
      description: "Your data has been transformed according to the mapping rules.",
    });
    
    return formattedOutput;
  } catch (error) {
    toast({
      title: "Transformation failed",
      description: "Please check your mapping rules and sample data.",
      variant: "destructive",
    });
    return "";
  }
};
