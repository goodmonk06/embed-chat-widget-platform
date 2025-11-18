import { PrismaClient, UserRole, ConversationStatus, TemplateCategory, WidgetPosition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phase 3 database seeding...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.conversationRating.deleteMany();
  await prisma.sessionTag.deleteMany();
  await prisma.conversationTag.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.widgetConfiguration.deleteMany();
  await prisma.siteUser.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Create Users
  console.log('👥 Creating users...');
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@techblog.com',
      name: 'Sarah Johnson',
      role: UserRole.OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner@ecommerce.com',
      name: 'Mike Chen',
      role: UserRole.OWNER,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@techblog.com',
      name: 'Alex Thompson',
      role: UserRole.ADMIN,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'support@techblog.com',
      name: 'Emma Davis',
      role: UserRole.MEMBER,
    },
  });

  console.log(`✅ Created ${4} users\n`);

  // Create Sites
  console.log('🏢 Creating sites...');
  const site1 = await prisma.site.create({
    data: {
      name: 'TechBlog Pro',
      domain: 'techblog.example.com',
      ownerId: owner1.id,
      isActive: true,
      metadata: {
        industry: 'Technology',
        plan: 'Pro',
        maxSessions: 10000,
      },
    },
  });

  const site2 = await prisma.site.create({
    data: {
      name: 'E-Commerce Store',
      domain: 'shop.example.com',
      ownerId: owner2.id,
      isActive: true,
      metadata: {
        industry: 'Retail',
        plan: 'Enterprise',
        maxSessions: 50000,
      },
    },
  });

  const site3 = await prisma.site.create({
    data: {
      name: 'Support Portal',
      domain: 'support.example.com',
      ownerId: owner1.id,
      isActive: true,
      metadata: {
        industry: 'SaaS',
        plan: 'Basic',
        maxSessions: 1000,
      },
    },
  });

  const site4 = await prisma.site.create({
    data: {
      name: 'Demo Site (Inactive)',
      domain: 'demo.example.com',
      ownerId: owner1.id,
      isActive: false,
    },
  });

  console.log(`✅ Created ${4} sites\n`);

  // Assign users to sites
  console.log('🔗 Assigning users to sites...');
  await prisma.siteUser.createMany({
    data: [
      { siteId: site1.id, userId: owner1.id, role: UserRole.OWNER },
      { siteId: site1.id, userId: admin1.id, role: UserRole.ADMIN },
      { siteId: site1.id, userId: member1.id, role: UserRole.MEMBER },
      { siteId: site2.id, userId: owner2.id, role: UserRole.OWNER },
      { siteId: site3.id, userId: owner1.id, role: UserRole.OWNER },
      { siteId: site3.id, userId: admin1.id, role: UserRole.ADMIN },
    ],
  });
  console.log('✅ Assigned users to sites\n');

  // Create Widget Configurations
  console.log('🎨 Creating widget configurations...');
  await prisma.widgetConfiguration.create({
    data: {
      siteId: site1.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      position: WidgetPosition.BOTTOM_RIGHT,
      greetingMessage: 'Hi! Welcome to TechBlog Pro. How can I help you today?',
      placeholderText: 'Ask me anything about technology...',
      headerText: 'Tech Support',
      borderRadius: 16,
      showBranding: true,
    },
  });

  await prisma.widgetConfiguration.create({
    data: {
      siteId: site2.id,
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      position: WidgetPosition.BOTTOM_LEFT,
      greetingMessage: 'Welcome! Need help finding the perfect product?',
      placeholderText: 'Type your question...',
      headerText: 'Shopping Assistant',
      borderRadius: 8,
      showBranding: false,
      customCSS: '.cocoon-chat-bubble:hover { transform: scale(1.1); }',
    },
  });

  console.log('✅ Created widget configurations\n');

  // Create Tags
  console.log('🏷️  Creating conversation tags...');
  const tagSupport = await prisma.conversationTag.create({
    data: { name: 'Support', color: '#3B82F6', description: 'Customer support inquiries' },
  });

  const tagSales = await prisma.conversationTag.create({
    data: { name: 'Sales', color: '#10B981', description: 'Sales and product questions' },
  });

  const tagBug = await prisma.conversationTag.create({
    data: { name: 'Bug Report', color: '#EF4444', description: 'Technical issues and bugs' },
  });

  const tagFeedback = await prisma.conversationTag.create({
    data: { name: 'Feedback', color: '#F59E0B', description: 'User feedback and suggestions' },
  });

  const tagUrgent = await prisma.conversationTag.create({
    data: { name: 'Urgent', color: '#DC2626', description: 'Requires immediate attention' },
  });

  console.log(`✅ Created ${5} tags\n`);

  // Create Message Templates
  console.log('📝 Creating message templates...');
  await prisma.messageTemplate.createMany({
    data: [
      // Site 1 templates
      {
        siteId: site1.id,
        category: TemplateCategory.GREETING,
        title: 'Welcome Message',
        content: 'Hello! Welcome to TechBlog Pro. I\'m here to help you with any questions about our articles, tutorials, or technology topics.',
        isActive: true,
        sortOrder: 1,
      },
      {
        siteId: site1.id,
        category: TemplateCategory.FAQ,
        title: 'How to Subscribe',
        content: 'You can subscribe to our newsletter by clicking the "Subscribe" button in the footer. You\'ll receive weekly updates on the latest tech trends!',
        isActive: true,
        sortOrder: 2,
      },
      {
        siteId: site1.id,
        category: TemplateCategory.SUPPORT,
        title: 'Technical Issue',
        content: 'I\'m sorry you\'re experiencing technical difficulties. Could you please describe the issue in more detail? Screenshots would be very helpful.',
        isActive: true,
        sortOrder: 3,
      },
      {
        siteId: site1.id,
        category: TemplateCategory.ESCALATION,
        title: 'Escalate to Human',
        content: 'I understand this requires special attention. Let me connect you with a human team member who can better assist you. Please hold on for a moment.',
        isActive: true,
        sortOrder: 4,
      },
      // Site 2 templates
      {
        siteId: site2.id,
        category: TemplateCategory.GREETING,
        title: 'Shopping Welcome',
        content: 'Welcome to our store! I\'m your shopping assistant. How can I help you find the perfect product today?',
        isActive: true,
        sortOrder: 1,
      },
      {
        siteId: site2.id,
        category: TemplateCategory.SALES,
        title: 'Product Recommendations',
        content: 'Based on your interests, I can recommend some of our bestselling products. What category are you interested in?',
        isActive: true,
        sortOrder: 2,
      },
      {
        siteId: site2.id,
        category: TemplateCategory.FAQ,
        title: 'Shipping Information',
        content: 'We offer free shipping on orders over $50. Standard shipping takes 5-7 business days, and express shipping is 2-3 business days.',
        isActive: true,
        sortOrder: 3,
      },
      {
        siteId: site2.id,
        category: TemplateCategory.CLOSING,
        title: 'Thank You Message',
        content: 'Thank you for shopping with us! If you have any other questions, feel free to ask. Have a great day!',
        isActive: true,
        sortOrder: 4,
      },
    ],
  });
  console.log(`✅ Created ${8} message templates\n`);

  // Create Chat Sessions and Messages
  console.log('💬 Creating chat sessions and messages...');

  // Session 1: Active support conversation
  const session1 = await prisma.chatSession.create({
    data: {
      siteId: site1.id,
      status: ConversationStatus.ACTIVE,
      userEmail: 'user1@example.com',
      userName: 'John Doe',
      metadata: { source: 'homepage', device: 'desktop', ip: '192.168.1.1' },
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session1.id,
        role: 'user',
        content: 'Hi, I\'m having trouble accessing my account dashboard.',
      },
      {
        sessionId: session1.id,
        role: 'assistant',
        content: 'Hello! I\'m sorry to hear you\'re having trouble accessing your dashboard. Let me help you with that. Are you getting any error messages?',
      },
      {
        sessionId: session1.id,
        role: 'user',
        content: 'Yes, it says "Session expired" but I just logged in 5 minutes ago.',
      },
      {
        sessionId: session1.id,
        role: 'assistant',
        content: 'I see. This might be a session timeout issue. Could you try clearing your browser cache and cookies, then logging in again? If that doesn\'t work, we can reset your session from our end.',
      },
    ],
  });

  // Session 2: Resolved sales inquiry
  const session2 = await prisma.chatSession.create({
    data: {
      siteId: site2.id,
      status: ConversationStatus.RESOLVED,
      userEmail: 'customer@example.com',
      userName: 'Jane Smith',
      metadata: { source: 'product-page', device: 'mobile', referrer: 'google' },
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session2.id,
        role: 'user',
        content: 'Do you have this product in blue color?',
      },
      {
        sessionId: session2.id,
        role: 'assistant',
        content: 'Yes! We have that product available in blue. Would you like me to add it to your cart?',
      },
      {
        sessionId: session2.id,
        role: 'user',
        content: 'Yes please! Also, what\'s the return policy?',
      },
      {
        sessionId: session2.id,
        role: 'assistant',
        content: 'Great! I\'ve added the blue version to your cart. We offer a 30-day return policy for all items. Returns are free and easy - just use the prepaid shipping label we include with your order.',
      },
      {
        sessionId: session2.id,
        role: 'user',
        content: 'Perfect, thank you!',
      },
      {
        sessionId: session2.id,
        role: 'assistant',
        content: 'You\'re welcome! Enjoy your purchase and don\'t hesitate to reach out if you need anything else. Have a wonderful day!',
      },
    ],
  });

  // Session 3: Escalated issue
  const session3 = await prisma.chatSession.create({
    data: {
      siteId: site1.id,
      status: ConversationStatus.ESCALATED,
      userEmail: 'vip@example.com',
      userName: 'Robert Johnson',
      metadata: { source: 'contact-page', device: 'tablet', priority: 'high' },
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session3.id,
        role: 'user',
        content: 'I\'ve been charged twice for my subscription and need this resolved immediately.',
      },
      {
        sessionId: session3.id,
        role: 'assistant',
        content: 'I sincerely apologize for this billing error. This is definitely a priority issue that requires immediate attention from our billing team. Let me escalate this to a specialist right away.',
      },
      {
        sessionId: session3.id,
        role: 'user',
        content: 'Thank you. I need this resolved today as it\'s a significant amount.',
      },
    ],
  });

  // Session 4: Archived feedback
  const session4 = await prisma.chatSession.create({
    data: {
      siteId: site1.id,
      status: ConversationStatus.ARCHIVED,
      userName: 'Anonymous User',
      metadata: { source: 'blog-post', device: 'desktop' },
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session4.id,
        role: 'user',
        content: 'I love your new article series on cloud computing! Very informative.',
      },
      {
        sessionId: session4.id,
        role: 'assistant',
        content: 'Thank you so much for the positive feedback! We\'re glad you\'re finding our cloud computing series valuable. Is there any specific topic you\'d like us to cover next?',
      },
      {
        sessionId: session4.id,
        role: 'user',
        content: 'Maybe something on Kubernetes security best practices?',
      },
      {
        sessionId: session4.id,
        role: 'assistant',
        content: 'That\'s an excellent suggestion! I\'ll pass this along to our editorial team. Kubernetes security is a hot topic right now.',
      },
    ],
  });

  // Session 5: Recent product inquiry
  const session5 = await prisma.chatSession.create({
    data: {
      siteId: site2.id,
      status: ConversationStatus.ACTIVE,
      userEmail: 'shopper@example.com',
      userName: 'Lisa Anderson',
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session5.id,
        role: 'user',
        content: 'What\'s your best laptop for under $1000?',
      },
      {
        sessionId: session5.id,
        role: 'assistant',
        content: 'Great question! For under $1000, I\'d recommend our XPS 13 model. It has excellent performance, 16GB RAM, and a beautiful display. It\'s currently on sale for $899!',
      },
    ],
  });

  console.log(`✅ Created ${5} chat sessions with messages\n`);

  // Tag conversations
  console.log('🔗 Tagging conversations...');
  await prisma.sessionTag.createMany({
    data: [
      { sessionId: session1.id, tagId: tagSupport.id },
      { sessionId: session1.id, tagId: tagBug.id },
      { sessionId: session2.id, tagId: tagSales.id },
      { sessionId: session3.id, tagId: tagSupport.id },
      { sessionId: session3.id, tagId: tagUrgent.id },
      { sessionId: session4.id, tagId: tagFeedback.id },
      { sessionId: session5.id, tagId: tagSales.id },
    ],
  });
  console.log('✅ Tagged conversations\n');

  // Rate conversations
  console.log('⭐ Adding conversation ratings...');
  await prisma.conversationRating.createMany({
    data: [
      {
        sessionId: session2.id,
        rating: 5,
        feedback: 'Super helpful! Quick and accurate responses.',
      },
      {
        sessionId: session3.id,
        rating: 2,
        feedback: 'Issue was escalated but took too long to resolve.',
      },
      {
        sessionId: session4.id,
        rating: 5,
        feedback: 'Great service, very professional.',
      },
    ],
  });
  console.log('✅ Added ratings\n');

  // Create Analytics Snapshots
  console.log('📊 Creating analytics snapshots...');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.analyticsSnapshot.createMany({
    data: [
      {
        siteId: site1.id,
        date: twoDaysAgo,
        totalSessions: 45,
        totalMessages: 180,
        avgMessagesPerSession: 4.0,
        avgRating: 4.2,
        uniqueVisitors: 38,
      },
      {
        siteId: site1.id,
        date: yesterday,
        totalSessions: 52,
        totalMessages: 210,
        avgMessagesPerSession: 4.04,
        avgRating: 4.5,
        uniqueVisitors: 44,
      },
      {
        siteId: site2.id,
        date: twoDaysAgo,
        totalSessions: 120,
        totalMessages: 360,
        avgMessagesPerSession: 3.0,
        avgRating: 4.7,
        uniqueVisitors: 95,
      },
      {
        siteId: site2.id,
        date: yesterday,
        totalSessions: 135,
        totalMessages: 405,
        avgMessagesPerSession: 3.0,
        avgRating: 4.8,
        uniqueVisitors: 108,
      },
    ],
  });
  console.log('✅ Created analytics snapshots\n');

  // Create Webhook Endpoints
  console.log('🔗 Creating webhook endpoints...');
  await prisma.webhookEndpoint.createMany({
    data: [
      {
        siteId: site1.id,
        url: 'https://hooks.slack.com/services/example/techblog',
        events: ['conversation.started', 'conversation.rated'],
        secret: 'webhook_secret_techblog_123',
        isActive: true,
      },
      {
        siteId: site2.id,
        url: 'https://api.example.com/webhooks/ecommerce',
        events: ['conversation.started', 'message.received', 'conversation.rated'],
        secret: 'webhook_secret_ecommerce_456',
        isActive: true,
      },
    ],
  });
  console.log('✅ Created webhook endpoints\n');

  // Create Audit Logs
  console.log('📋 Creating audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: owner1.id,
        action: 'site.created',
        entityType: 'Site',
        entityId: site1.id,
        metadata: { name: site1.name },
        ipAddress: '192.168.1.100',
      },
      {
        userId: owner1.id,
        action: 'widget.configured',
        entityType: 'WidgetConfiguration',
        entityId: site1.id,
        metadata: { changes: ['primaryColor', 'greetingMessage'] },
        ipAddress: '192.168.1.100',
      },
      {
        userId: admin1.id,
        action: 'conversation.tagged',
        entityType: 'ChatSession',
        entityId: session1.id,
        metadata: { tags: ['Support', 'Bug Report'] },
        ipAddress: '192.168.1.101',
      },
    ],
  });
  console.log('✅ Created audit logs\n');

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('📊 Summary:');
  console.log(`  👥 Users:        ${4} created (1 owner1, 1 owner2, 1 admin, 1 member)`);
  console.log(`  🏢 Sites:        ${4} created (3 active, 1 inactive)`);
  console.log(`  🎨 Configs:      ${2} widget configurations`);
  console.log(`  🏷️  Tags:         ${5} conversation tags`);
  console.log(`  📝 Templates:    ${8} message templates`);
  console.log(`  💬 Sessions:     ${5} chat sessions`);
  console.log(`  💭 Messages:     ${19} chat messages`);
  console.log(`  ⭐ Ratings:      ${3} conversation ratings`);
  console.log(`  📊 Analytics:    ${4} snapshots`);
  console.log(`  🔗 Webhooks:     ${2} webhook endpoints`);
  console.log(`  📋 Audit Logs:   ${3} entries\n`);

  console.log('🔑 Demo Credentials:');
  console.log(`  Owner 1:  ${owner1.email} (ID: ${owner1.id})`);
  console.log(`  Owner 2:  ${owner2.email} (ID: ${owner2.id})`);
  console.log(`  Admin:    ${admin1.email} (ID: ${admin1.id})`);
  console.log(`  Member:   ${member1.email} (ID: ${member1.id})\n`);

  console.log('🏢 Demo Sites:');
  console.log(`  Site 1: ${site1.name}`);
  console.log(`    Domain:     ${site1.domain}`);
  console.log(`    Public Key: ${site1.publicKey}`);
  console.log(`    Sessions:   3 (1 active, 1 escalated, 1 archived)\n`);

  console.log(`  Site 2: ${site2.name}`);
  console.log(`    Domain:     ${site2.domain}`);
  console.log(`    Public Key: ${site2.publicKey}`);
  console.log(`    Sessions:   2 (1 active, 1 resolved)\n`);

  console.log('💡 Quick Start:');
  console.log('  1. Admin Dashboard: http://localhost:3000');
  console.log(`  2. View Site 1 analytics: http://localhost:3000/sites/${site1.id}/analytics`);
  console.log('  3. API Health: http://localhost:3001/health');
  console.log(`  4. List conversations: GET /api/admin/conversations?siteId=${site1.id}`);
  console.log(`  5. Widget config: GET /api/admin/sites/${site1.id}/widget-config\n`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
