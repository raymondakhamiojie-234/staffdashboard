require('dotenv').config();
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const csvData = `"id","user_id","full_name","email","role","admin_level","department","position","salary","hire_date","status","profile_image","work_background","education","skills","hobbies","certifications","profile_completed","contract_signed","policy_accepted","account_active","created_at","updated_at","visible_in_dropdown"
"1","1","Daniel Simon","support@falcusmedia.com","admin",,"Engineering","Software Developer","100000.00","2026-05-01T00:00:00.000Z","active",,"Worked at Webnix Hub for 5 years","Bs.C Holder in Computer Sci","Node.js,Php,NIX","Reading,SInging","","true","true","true","true","2026-05-01T11:07:51.326Z","2026-05-14T08:52:12.663Z","false"
"2","2","Praise Uzu","account@falcusmedia.com","founder","founder","HR","CEO","0.00","2026-05-01T00:00:00.000Z","active",,"Worked at UX Design","grauduate","FIgma","Music","UX Design","true","true","true","true","2026-05-01T12:47:43.784Z","2026-05-14T08:52:14.633Z","false"
"3","3","James Paul","raymondakhamiojie@gmail.com","founder",,"Media Production","Talent Manger","60000.00","2026-05-01T00:00:00.000Z","active",,"Cansellor","Graduate","Good communication skills","Reading","","true","false","true","true","2026-05-01T18:38:28.654Z","2026-05-19T08:22:39.419Z","false"
"4","4","Ogunmade Idowu ibukun","ogunmadeidowuibukun@falcusmedia.com","staff",,"HR","Talent Manager","60000.00","2026-05-04T00:00:00.000Z","active",,"My role involves reviewing creators’ pages to identify performance gaps, documenting key issues, and holding meetings to provide feedback and improvement strategies. I focus on enhancing content quality, audience engagement, and overall page growth through effective communication and structured support.”","BSC(Ed)","Communication","Music","","true","true","true","true","2026-05-04T08:55:46.546Z","2026-05-04T09:22:45.609Z","true"
"5","5","Praise Ebube Uzu","praiseebubeuzu@falcusmedia.com","founder",,"Operations","CEO ","500000.00","2026-05-04T00:00:00.000Z","active",,"Worked as a social media manager for 7 years and grew several celebrity accounts and resolved over a thousand violations across social media accounts, work as branch manager in CKA. ","M.sc Uniport","Management,conflict resolutions,people management,social media management,video editing,graphics designer,AI prompt engineer.","Play chess","meta certified tech solution provider","true","false","true","true","2026-05-04T09:00:29.546Z","2026-05-14T08:52:24.648Z","true"
"6","6","Olawoye Gideon Ayomide ","olawoyegideonayomide@falcusmedia.com","staff",,"Finance","Data Analyst ","50000.00","2026-05-04T00:00:00.000Z","active",,"Computer Operator ","Bachelor of Arts in English","data analyst,video editor,communication skill","Music","","true","true","true","true","2026-05-04T09:14:53.049Z","2026-05-04T09:51:08.251Z","true"
"7","7","Rahamon Akhamiojie Osazele","raymondosazele@falcusmedia.com","staff",,"Engineering","Technical Official","70000.00","2026-05-04T00:00:00.000Z","active",,"Worked at Printxt 2020 - 2022\n","Bachelor of Science in Physics  ","HTML5,CSS3,JavaScript,PHP,Node.js,React,AI Prompting  Graphic Design,Photo Editing,Video Editing","Reading,Studying,Thinking,Making Research","","true","true","true","true","2026-05-04T09:38:01.973Z","2026-05-04T09:49:40.088Z","true"
"8","9","Igbosusibowei Tamaramiensine Praise ","igbosusiboweitamaramiensinepraise@falcusmedia.com","staff",,"Media Production","Creative Director, Content Strategist","20000.00","2026-05-07T00:00:00.000Z","active",,"Content creation, video production, and social media growth. Experience in scripting, editing, and managing content for TikTok, Instagram, and Facebook. Helping brands and creators grow and stay consistent online.","200 Level Student of History and International Studies.\nSelf-taught in digital media, content creation, and social media strategy through hands-on experience and continuous learning.","Content Creation,Video Editing,Social Media,Storytelling,Branding,Scriptwriting,Creative Direction","Content Creation,Music,Films,Learning,Social Media","","true","false","true","true","2026-05-07T09:55:40.085Z","2026-05-14T08:52:07.598Z","true"`;

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  
  // Roles mapping
  const roleMap = {
    'admin': 3, // CEO/Admin equivalent
    'founder': 2,
    'staff': 1
  };
  
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  
  console.log(`Parsed ${records.length} user records. Inserting/Updating...`);

  let processed = 0;
  for (const record of records) {
    let roleId = roleMap[record.role.toLowerCase()];
    if (!roleId) {
      roleId = 1; // Default to Staff
    }
    
    // Ensure email doesn't conflict with another ID
    const existingEmail = await prisma.user.findUnique({ where: { email: record.email } });
    if (existingEmail && existingEmail.id !== parseInt(record.id)) {
       console.log(`Updating email for existing user ID ${existingEmail.id} to avoid conflict with ID ${record.id}`);
       await prisma.user.update({
         where: { id: existingEmail.id },
         data: { email: existingEmail.email + '_conflict_' + Date.now() }
       });
    }

    try {
      await prisma.user.upsert({
        where: { id: parseInt(record.id) },
        update: {
          fullName: record.full_name,
          email: record.email,
          roleId: roleId,
          profileImageUrl: record.profile_image || null,
          skills: record.skills || null,
          hobbies: record.hobbies || null,
          education: record.education || null,
          workBackground: record.work_background || null,
          isActive: record.account_active === 'true',
          profileStatus: record.profile_completed === 'true' ? 'completed' : 'pending',
          contractStatus: record.contract_signed === 'true' ? 'signed' : 'pending',
          policyStatus: record.policy_accepted === 'true' ? 'acknowledged' : 'pending',
          createdAt: record.created_at ? new Date(record.created_at) : undefined,
          updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
        },
        create: {
          id: parseInt(record.id),
          fullName: record.full_name,
          email: record.email,
          passwordHash: defaultPasswordHash,
          roleId: roleId,
          profileImageUrl: record.profile_image || null,
          skills: record.skills || null,
          hobbies: record.hobbies || null,
          education: record.education || null,
          workBackground: record.work_background || null,
          isActive: record.account_active === 'true',
          profileStatus: record.profile_completed === 'true' ? 'completed' : 'pending',
          contractStatus: record.contract_signed === 'true' ? 'signed' : 'pending',
          policyStatus: record.policy_accepted === 'true' ? 'acknowledged' : 'pending',
          createdAt: record.created_at ? new Date(record.created_at) : undefined,
          updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
        }
      });
      console.log(`Upserted user ID ${record.id} (${record.full_name})`);
      processed++;
    } catch (e) {
      console.error(`Failed to upsert user ID ${record.id}:`, e.message);
    }
  }
  
  // Fix sequence
  try {
     await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));`);
     console.log('Postgres sequence updated successfully.');
  } catch (e) {
     console.log('Sequence update skipped:', e.message);
  }
  
  console.log(`Finished processing ${processed} records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
