import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Broker {
  id: string;
  name: string;
  code?: string;
  status: 'active' | 'inactive';
  contact_email?: string;
  logo_url?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export function useBrokerActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBrokers = async (): Promise<Broker[]> => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []) as Broker[];
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brokers. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createBroker = async (broker: Omit<Broker, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brokers')
        .insert(broker)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Broker created successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating broker:', error);
      toast({
        title: "Error",
        description: "Failed to create broker",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateBroker = async (id: string, updates: Partial<Broker>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brokers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Broker updated successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating broker:', error);
      toast({
        title: "Error",
        description: "Failed to update broker",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBrokers = async (): Promise<Broker[]> => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []) as Broker[];
    } catch (error) {
      console.error('Error fetching active brokers:', error);
      return [];
    }
  };

  return {
    fetchBrokers,
    fetchActiveBrokers,
    createBroker,
    updateBroker,
    loading
  };
}