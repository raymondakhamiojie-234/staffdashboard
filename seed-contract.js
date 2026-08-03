require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const contractContent = `
<h2>EMPLOYMENT AGREEMENT</h2>
<p>This Employment Agreement is entered into between Falcus Media Ltd (hereinafter referred to as "the Company"), a company registered under the laws of the Federal Republic of Nigeria, and the Employee whose details are provided below.</p>

<h3>1. Position & Duties</h3>
<p>The Employee shall serve in the position assigned by the Company and shall faithfully perform all assigned duties, including but not limited to:</p>
<ul>
  <li>Content creation</li>
  <li>Media production</li>
  <li>Client servicing</li>
  <li>Administrative responsibilities</li>
  <li>Any additional duties assigned by management</li>
</ul>
<p>The Employee agrees to perform these duties diligently, professionally, and in the best interest of the Company.</p>

<h3>2. Commencement</h3>
<p>Employment shall commence on the date agreed upon by both the Company and the Employee.</p>
<p>The employment may be classified as:</p>
<ul>
  <li>Permanent Employment</li>
  <li>Fixed-Term Employment</li>
  <li>Probationary Employment (up to six (6) months in accordance with Nigerian labour practice)</li>
</ul>

<h3>3. Working Hours</h3>
<p>The Employee shall work during the standard working hours agreed upon with the Company, in compliance with the provisions of the Nigerian Labour Act.</p>
<p>Where necessary, the Employee may be required to work overtime to meet production schedules, project deadlines, or business requirements.</p>

<h3>4. Salary & Payment</h3>
<p>The Employee shall receive a monthly salary as agreed in writing.</p>
<p>Salary shall be paid monthly into the Employee's designated bank account.</p>
<p>Where applicable, statutory deductions including PAYE tax and pension contributions shall be deducted in accordance with Nigerian law.</p>

<h3>5. Confidentiality</h3>
<p>The Employee agrees not to disclose any confidential information belonging to the Company during or after employment.</p>
<p>Confidential information includes, but is not limited to:</p>
<ul>
  <li>Client information</li>
  <li>Financial records</li>
  <li>Creative assets</li>
  <li>Trade secrets</li>
  <li>Internal business strategies</li>
  <li>Company documents</li>
  <li>Business processes</li>
</ul>
<p>Any unauthorized disclosure may result in disciplinary action or termination of employment.</p>

<h3>6. Intellectual Property</h3>
<p>All creative works, including but not limited to:</p>
<ul>
  <li>Designs</li>
  <li>Videos</li>
  <li>Content</li>
  <li>Graphics</li>
  <li>Marketing materials</li>
  <li>Strategies</li>
  <li>Digital assets</li>
  <li>Any work produced during employment</li>
</ul>
<p>shall remain the exclusive intellectual property of Falcus Media Ltd.</p>
<p>The Employee shall not claim ownership of materials created during the course of employment.</p>

<h3>7. Leave Entitlement</h3>
<p>The Employee shall be entitled to annual leave in accordance with the Nigerian Labour Act.</p>
<p>The minimum annual leave entitlement shall be six (6) working days after twelve (12) months of continuous service.</p>
<p>Sick leave may be granted upon presentation of appropriate medical confirmation where required.</p>

<h3>8. Termination</h3>
<p>Either the Company or the Employee may terminate this employment by giving one (1) month's written notice or payment in lieu of notice unless otherwise agreed in writing.</p>
<p>The Company reserves the right to terminate employment immediately in cases including but not limited to:</p>
<ul>
  <li>Gross misconduct</li>
  <li>Fraud</li>
  <li>Breach of confidentiality</li>
  <li>Serious negligence</li>
  <li>Other serious violations of Company policies</li>
</ul>

<h3>9. Non-Compete & Non-Solicitation</h3>
<p>The Employee agrees that for a period of six (6) months following termination of employment, the Employee shall not:</p>
<ul>
  <li>Directly compete with Falcus Media Ltd within Nigeria.</li>
  <li>Solicit or attempt to solicit clients of the Company.</li>
</ul>

<h3>10. Governing Law</h3>
<p>This Employment Agreement shall be governed and interpreted in accordance with the laws of the Federal Republic of Nigeria.</p>
`;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding Contract Template...');
  
  const template = await prisma.contractTemplate.create({
    data: {
      title: 'Falcus Media Ltd Employment Agreement',
      content: contractContent
    }
  });

  // Assign this template to any users who have 'pending' contract status but no assigned contract yet.
  // First get all users
  const users = await prisma.user.findMany({ where: { contractStatus: 'pending', role: { isAdmin: false } } });
  
  for (const user of users) {
    const existing = await prisma.userContract.findFirst({ where: { userId: user.id, status: 'pending' } });
    if (!existing) {
      await prisma.userContract.create({
        data: {
          userId: user.id,
          contractTemplateId: template.id,
          status: 'pending'
        }
      });
      console.log(`Assigned contract template to user ${user.email}`);
    }
  }

  console.log('Seed completed successfully!');
  await prisma.$disconnect();
  await pool.end();
}
main().catch(console.error);
