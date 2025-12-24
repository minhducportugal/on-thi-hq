require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function clearDatabase() {
  console.log('🧹 Clearing questions and options only...\n');
  
  try {
    // Delete in correct order (foreign key constraints)
    console.log('Deleting user_answers...');
    await supabase.from('user_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Deleting options...');
    await supabase.from('options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Deleting questions...');
    await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('\n✅ Questions cleared! (Quizzes preserved)\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
}

clearDatabase();
