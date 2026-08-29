require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting CSV import...');
  const csvFilePath = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\28a43826-46e8-472f-89a0-85641ebf0361\\.user_uploaded\\media_1787620806960.csv';
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Parsed ${records.length} records. Inserting into database...`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: parseInt(record.staff_id) }
      });
      if (!user) {
        console.log(`Skipping record ID ${record.id} - User ${record.staff_id} not found.`);
        skipped++;
        continue;
      }
      
      let taskId = null;
      if (record.task_id) {
        taskId = parseInt(record.task_id);
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
           console.log(`Warning: Task ${taskId} not found for record ID ${record.id}. Setting taskId to null.`);
           taskId = null;
        }
      }
      
      const fileUrl = record.pdf_url ? record.pdf_url : null;
      let fileName = null;
      if (fileUrl) {
         // Try to extract a filename
         const parts = fileUrl.split('/');
         fileName = parts[parts.length - 1] || 'attachment';
      }
      
      await prisma.report.create({
        data: {
          submittedById: user.id,
          taskId: taskId,
          type: record.report_type || 'daily',
          content: record.content,
          fileUrl: fileUrl,
          fileName: fileName,
          submittedAt: new Date(record.submitted_at)
        }
      });
      inserted++;
    } catch (e) {
      console.error(`Error inserting record ID ${record.id}:`, e.message);
      skipped++;
    }
  }
  
  console.log(`Import complete! Inserted: ${inserted}, Skipped: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
