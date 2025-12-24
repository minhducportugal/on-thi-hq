import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSPolicies() {
  console.log('Setting up RLS policies...');

  try {
    // Enable RLS on tables if not already enabled
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
      `
    }).catch(() => console.log('RLS might already be enabled or need manual setup'));

    // Drop existing policies if they exist
    const dropPolicies = `
      DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
      DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON quiz_attempts;
      DROP POLICY IF EXISTS "Users can delete their own quiz attempts" ON quiz_attempts;
      DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
      DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
      DROP POLICY IF EXISTS "Users can delete their own answers" ON user_answers;
    `;

    // Create new policies
    const createPolicies = `
      -- Quiz attempts policies
      CREATE POLICY "Users can view their own quiz attempts"
        ON quiz_attempts FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own quiz attempts"
        ON quiz_attempts FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can delete their own quiz attempts"
        ON quiz_attempts FOR DELETE
        USING (auth.uid() = user_id);

      -- User answers policies
      CREATE POLICY "Users can view their own answers"
        ON user_answers FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = user_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can insert their own answers"
        ON user_answers FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = user_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can delete their own answers"
        ON user_answers FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = user_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
          )
        );
    `;

    console.log('Executing SQL policies...');
    console.log('\nPlease run these SQL commands in Supabase SQL Editor:\n');
    console.log(dropPolicies);
    console.log(createPolicies);
    
    console.log('\n✅ Copy and paste the SQL above into Supabase SQL Editor and run it.');

  } catch (error) {
    console.error('Error:', error);
  }
}

setupRLSPolicies();
