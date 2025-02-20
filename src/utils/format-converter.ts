
import { json as jsonFormat } from 'js-beautify';
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
import { Format } from '@/types/data-mapper';
import { toast } from "@/components/ui/use-toast";

export const convertFormat = (data: string, fromFormat: Format, toFormat: Format): string => {
  try {
    if (fromFormat === "yaml" && toFormat === "json") {
      const jsonData = yamlParse(data);
      return jsonFormat(JSON.stringify(jsonData));
    } else if (fromFormat === "json" && toFormat === "yaml") {
      const jsonData = JSON.parse(data);
      return yamlStringify(jsonData);
    }
    return data;
  } catch (error) {
    toast({
      title: "Format conversion failed",
      description: `Please ensure your input is valid ${fromFormat.toUpperCase()}`,
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
