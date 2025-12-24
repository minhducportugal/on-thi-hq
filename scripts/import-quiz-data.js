require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Cấu hình Supabase - Đọc từ .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importQuiz(jsonFilePath, quizSlug) {
  console.log(`\n📦 Importing ${quizSlug} from ${jsonFilePath}...`);
  
  try {
    // Đọc file JSON - remove BOM if exists
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent.replace(/^\uFEFF/, ''));
    
    // Lấy quiz ID
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('slug', quizSlug)
      .single();
    
    if (quizError || !quiz) {
      console.error(`❌ Quiz "${quizSlug}" not found in database. Please create it first.`);
      return;
    }
    
    console.log(`✓ Found quiz: ${quizSlug}`);
    
    // Batch insert tất cả questions cùng lúc
    const questionsData = jsonData.questions.map(q => ({
      quiz_id: quiz.id,
      question_text: q.question,
      explanation: q.explanation || null,
      order_index: q.id
    }));
    
    console.log(`  Inserting ${questionsData.length} questions...`);
    const { data: insertedQuestions, error: qError } = await supabase
      .from('questions')
      .insert(questionsData)
      .select();
    
    if (qError) {
      console.error(`❌ Error batch inserting questions:`, qError.message);
      return;
    }
    
    console.log(`✓ Inserted ${insertedQuestions.length} questions`);
    
    // Batch insert tất cả options cùng lúc
    const allOptionsData = [];
    insertedQuestions.forEach((question, qIndex) => {
      const originalQ = jsonData.questions[qIndex];
      const optionsForQuestion = originalQ.options.map((optText, optIndex) => ({
        question_id: question.id,
        option_text: optText,
        is_correct: optIndex === originalQ.answer,
        order_index: optIndex
      }));
      allOptionsData.push(...optionsForQuestion);
    });
    
    console.log(`  Inserting ${allOptionsData.length} options...`);
    const { error: optError } = await supabase
      .from('options')
      .insert(allOptionsData);
    
    if (optError) {
      console.error(`❌ Error batch inserting options:`, optError.message);
      return;
    }
    
    console.log(`✅ Successfully imported ${insertedQuestions.length} questions with ${allOptionsData.length} options for ${quizSlug}`);
    
    // Update total_questions
    await supabase
      .from('quizzes')
      .update({ total_questions: insertedQuestions.length })
      .eq('id', quiz.id);
    
  } catch (error) {
    console.error(`❌ Error importing ${quizSlug}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting quiz data import...\n');
  
  // Import cả 2 quiz
  await importQuiz('data/luat_hai_quan_2014.json', 'luat_hq');
  await importQuiz('data/quyet_dinh_819.json', 'qd_819');
  
  console.log('\n✨ Import completed!');
}

// Chạy script
main().catch(console.error);
