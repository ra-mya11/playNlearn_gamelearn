import { supabase } from "@/integrations/supabase/client";

export const setupAssignmentsTable = async () => {
  try {
    // Create assignments table using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.assignments (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          title text NOT NULL,
          description text NOT NULL,
          subject text NOT NULL,
          due_date timestamp with time zone,
          teacher_id uuid NOT NULL,
          class_id uuid,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          is_active boolean DEFAULT true
        );
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return false;
    }

    console.log('Assignments table created successfully');
    return true;
  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
};