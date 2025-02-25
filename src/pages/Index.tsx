
import { useParams, Navigate } from "react-router-dom";
import DataMapper from "@/components/DataMapper";
import { API_CONFIG, ROUTES } from "@/config/constants";

const Index = () => {
  const { id } = useParams<{ id: string }>();
  
  // If no ID is provided, redirect to mappings list
  if (!id) {
    return <Navigate to={ROUTES.MAPPINGS} replace />;
  }
  
  return <DataMapper 
    apiUrl={`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}/${id}`}
    baseUrl={API_CONFIG.BASE_URL}
  />;
};

export default Index;
