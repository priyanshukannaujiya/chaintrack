import api from './api';

export const fetchShipments = async () => {
  const { data } = await api.get('/shipments');
  return data;
};

export const createShipment = async (shipmentData: { product_id: string; to_company_id: string; quantity: number }) => {
  const { data } = await api.post('/shipments', shipmentData);
  return data;
};

export const fetchTracking = async (shipmentId: string) => {
  const { data } = await api.get(`/shipments/${shipmentId}/tracking`);
  return data;
};

export const fetchCompanies = async () => {
  const { data } = await api.get('/companies');
  return data;
};
