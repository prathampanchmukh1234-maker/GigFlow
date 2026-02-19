
/**
 * API SERVICE LAYER (Supabase Powered)
 * Connects the React Frontend directly to Supabase BaaS
 */
import { supabase } from './supabaseClient';

// Helper to check if Supabase is actually configured
const isConfigured = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
};

export const api = {
  // PROFILE & USER
  async getProfile(userId: string) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profileData: any) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  // GIGS
  async getGigs() {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createGig(gigData: any) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('gigs')
      .insert([gigData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateGig(id: string, gigData: any) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('gigs')
      .update(gigData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteGig(id: string) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { error } = await supabase
      .from('gigs')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ORDERS
  async getOrders(userId: string) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`client_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createOrder(orderData: any) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateOrderStatus(orderId: string, status: string) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return data[0];
  },

  // MESSAGES
  async getMessages(userId: string) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('timestamp', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendMessage(messageData: any) {
    if (!isConfigured()) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();
    if (error) throw error;
    return data[0];
  }
};
