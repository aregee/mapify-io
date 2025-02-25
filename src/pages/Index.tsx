
import DataMapper from "@/components/DataMapper";

const Index = () => {
  // Use the server URL, adjust if needed
  const baseUrl = "http://localhost:3031";
  
  return <DataMapper 
    apiUrl={`${baseUrl}/mappings/15`}
    baseUrl={baseUrl}
  />;
};

export default Index;
