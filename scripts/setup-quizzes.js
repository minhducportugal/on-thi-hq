require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupQuizzes() {
  console.log('🔧 Setting up quizzes...\n');
  
  // Insert quizzes
  const { data, error } = await supabase
    .from('quizzes')
    .upsert([
      {
        slug: 'luat_hq',
        title: 'Bộ câu hỏi Luật Hải quan 2014 (Cập nhật VBHN 2025)',
        description: 'Câu hỏi trắc nghiệm về Luật Hải quan 2014',
        total_questions: 53,
        is_active: true
      },
      {
        slug: 'qd_819',
        title: '105 Câu hỏi trắc nghiệm Chức năng, nhiệm vụ, quyền hạn và cơ cấu tổ chức Chi cục Hải quan khu vực',
        description: 'Câu hỏi về chức năng, nhiệm vụ Chi cục Hải quan',
        total_questions: 105,
        is_active: true
      }
    ], { onConflict: 'slug' });
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Quizzes created successfully!');
  }
}

setupQuizzes();
