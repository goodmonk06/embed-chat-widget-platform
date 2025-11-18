import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.site.deleteMany();

  // Create demo sites
  const site1 = await prisma.site.create({
    data: {
      name: 'TechBlog Pro',
      domain: 'techblog.example.com',
      ownerId: 'demo-owner-1',
    },
  });

  const site2 = await prisma.site.create({
    data: {
      name: 'E-Commerce Store',
      domain: 'shop.example.com',
      ownerId: 'demo-owner-1',
    },
  });

  const site3 = await prisma.site.create({
    data: {
      name: 'Support Portal',
      domain: 'support.example.com',
      ownerId: 'demo-owner-2',
    },
  });

  console.log(`✅ Created ${3} sites`);

  // Create demo sessions for site1
  const session1 = await prisma.chatSession.create({
    data: {
      siteId: site1.id,
    },
  });

  const session2 = await prisma.chatSession.create({
    data: {
      siteId: site1.id,
    },
  });

  const session3 = await prisma.chatSession.create({
    data: {
      siteId: site2.id,
    },
  });

  console.log(`✅ Created ${3} chat sessions`);

  // Create demo messages for session1
  await prisma.chatMessage.create({
    data: {
      sessionId: session1.id,
      role: 'user',
      content: 'Hello! Can you help me understand how to embed this widget?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session1.id,
      role: 'assistant',
      content: 'Of course! To embed the widget, you need to add a simple JavaScript snippet to your website. Would you like me to guide you through the process?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session1.id,
      role: 'user',
      content: 'Yes, please! That would be great.',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session1.id,
      role: 'assistant',
      content: 'Great! First, you\'ll need to copy your site\'s public key from the dashboard. Then, add the widget script tag to your HTML file, right before the closing </body> tag. The script will automatically initialize the chat widget.',
    },
  });

  // Create demo messages for session2
  await prisma.chatMessage.create({
    data: {
      sessionId: session2.id,
      role: 'user',
      content: 'What are your business hours?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session2.id,
      role: 'assistant',
      content: 'We\'re here to help 24/7! Our AI assistant is always available, and our human support team is available Monday-Friday, 9am-5pm EST.',
    },
  });

  // Create demo messages for session3
  await prisma.chatMessage.create({
    data: {
      sessionId: session3.id,
      role: 'user',
      content: 'Do you offer a free trial?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session3.id,
      role: 'assistant',
      content: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session3.id,
      role: 'user',
      content: 'Perfect! How do I sign up?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session3.id,
      role: 'assistant',
      content: 'Simply visit our dashboard, create an account, and you\'ll be able to create your first site immediately. You can start embedding the widget in minutes!',
    },
  });

  console.log(`✅ Created demo messages`);

  // Display created data
  console.log('\n📊 Demo Data Summary:');
  console.log('─────────────────────────────────');
  console.log(`Site 1: ${site1.name}`);
  console.log(`  Domain: ${site1.domain}`);
  console.log(`  Public Key: ${site1.publicKey}`);
  console.log(`  Sessions: 2`);
  console.log('');
  console.log(`Site 2: ${site2.name}`);
  console.log(`  Domain: ${site2.domain}`);
  console.log(`  Public Key: ${site2.publicKey}`);
  console.log(`  Sessions: 1`);
  console.log('');
  console.log(`Site 3: ${site3.name}`);
  console.log(`  Domain: ${site3.domain}`);
  console.log(`  Public Key: ${site3.publicKey}`);
  console.log(`  Sessions: 0`);
  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('💡 Quick Start:');
  console.log('  1. Visit http://localhost:3000/sites');
  console.log('  2. Use ownerId: "demo-owner-1" or "demo-owner-2"');
  console.log('  3. View analytics for pre-seeded data');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
