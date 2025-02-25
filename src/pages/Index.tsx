
import { useParams, Navigate } from "react-router-dom";
import DataMapper from "@/components/DataMapper";

const Index = () => {
  const { id } = useParams<{ id: string }>();
  
  // If no ID is provided, redirect to mappings list
  if (!id) {
    return <Navigate to="/mappings" replace />;
  }

  // Use the server URL, adjust if needed
  const baseUrl = "http://localhost:3031";
  
  return <DataMapper 
    apiUrl={`${baseUrl}/mappings/${id}`}
    baseUrl={baseUrl}
  />;
};

export default Index;
