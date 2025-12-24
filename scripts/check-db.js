require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkDatabase() {
  console.log('\n📊 Kiểm tra database...\n');
  
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, slug, title, total_questions');
  
  console.log('Quizzes:');
  for (const quiz of quizzes) {
    console.log(`\n- ${quiz.slug}: ${quiz.title}`);
    console.log(`  total_questions field: ${quiz.total_questions}`);
    
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quiz.id);
    
    console.log(`  Thực tế trong DB: ${count} câu`);
  }
}

checkDatabase();
