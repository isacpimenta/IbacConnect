// hooks/useAdmin.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('perfis')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      }
      setLoading(false);
    }
    checkAdmin();
  }, []);

  return { isAdmin, loading };
}