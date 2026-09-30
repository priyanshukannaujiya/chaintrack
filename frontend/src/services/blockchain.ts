import api from './api';

export interface BlockchainEvent {
  id: string;
  company_id: string;
  product_id: string;
  transaction_hash: string;
  event_type: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'SYNC_REQUIRED';
  created_at: string | null;
}

export const fetchBlockchainEvents = async (params?: {
  product_id?: string;
  page?: number;
  limit?: number;
}): Promise<BlockchainEvent[]> => {
  const { data } = await api.get('/blockchain/events', { params });
  return data;
};

export const createBlockchainEvent = async (payload: {
  product_id: string;
  transaction_hash: string;
  event_type: string;
}): Promise<BlockchainEvent> => {
  const { data } = await api.post('/blockchain/events', payload);
  return data;
};

export const getBlockchainEvent = async (transactionHash: string): Promise<BlockchainEvent> => {
  const { data } = await api.get(`/blockchain/events/${transactionHash}`);
  return data;
};
