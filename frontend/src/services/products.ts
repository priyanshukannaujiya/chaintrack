import api from './api';

export const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const createProduct = async (productData: { name: string; quantity: number; description?: string }) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const importProducts = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/products/import', formData);
  return data;
};
