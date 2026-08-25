import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q')?.trim() || '';

    if (!rawQuery) {
      return NextResponse.json({ results: [] });
    }

    const query = rawQuery.toLowerCase();
    const queryTokens = query.split(/\s+/).filter(Boolean);

    const staticCatalog = [
      {
        title: 'Student & Parent Portal (Report Cards & Attendance)',
        desc: 'Lookup monthly consolidated attendance, download PDF report cards, view activity photos, certificates, and academic marks.',
        category: 'Parent Portal',
        iconType: 'portal',
        actionLabel: 'Open Parent Portal',
        href: '/parent-portal',
        keywords: [
          'parent', 'portal', 'student', 'report', 'card', 'attendance', 'progress', 
          'lookup', 'marks', 'grade', 'certificate', 'pdf', 'evaluation', 'login', 
          'admission number', 'result', 'monthly report', 'activity'
        ]
      },
      {
        title: 'Online Admission Form & Fee Payment',
        desc: 'Apply online for Play-Group, Nursery, KG, and Class I-VI with direct UPI QR code or Card payment options.',
        category: 'Admissions',
        iconType: 'admission',
        actionLabel: 'Apply for Admission',
        href: '/admission',
        keywords: [
          'admission', 'apply', 'enroll', 'enrollment', 'fee', 'charge', 'cost', 'tuition', 
          'playgroup', 'nursery', 'lower kg', 'upper kg', 'class 1', 'class 2', 'class 3', 
          'class 4', 'class 5', 'class 6', 'payment', 'upi', 'qr', 'register', 'pricing', 'form'
        ]
      },
      {
        title: 'Academic Calendar & Holiday Schedule',
        desc: 'View session dates, term examination schedules, 2nd Periodic FA II timetable, summer/winter breaks, and holidays.',
        category: 'Academics',
        iconType: 'calendar',
        actionLabel: 'View Calendar',
        href: '/about#academic-calendar',
        keywords: [
          'calendar', 'exam', 'test', 'timetable', 'schedule', 'routine', 'periodic', 
          'fa ii', 'holiday', 'vacation', 'break', 'term', 'academic', 'dates', 'event', 'session'
        ]
      },
      {
        title: 'Class I - VI Periodic Test Schedule',
        desc: 'Detailed examination routine for FA II periodic assessments from Pre-School through Class VI.',
        category: 'Academics',
        iconType: 'exam',
        actionLabel: 'View Exam Routine',
        href: '/about#exam-schedule',
        keywords: [
          'exam', 'test', 'routine', 'schedule', 'timetable', 'periodic', 'fa ii', 'assessment', 'marks', 'class'
        ]
      },
      {
        title: 'Van Route & Transit Fare Chart',
        desc: 'Check monthly bus and van transit fares for Pangei, Sawombung, Khurai, Waiton, and surrounding regions.',
        category: 'Transport',
        iconType: 'transport',
        actionLabel: 'Check Transit Fares',
        href: '/admission',
        keywords: [
          'transport', 'van', 'bus', 'route', 'transit', 'fare', 'fee', 'charge', 'vehicle', 
          'pickup', 'drop', 'pangei', 'sawombung', 'khurai', 'waiton', 'travel', 'fare chart'
        ]
      },
      {
        title: 'Campus Satellite Map & Location Directions',
        desc: 'Find satellite GPS directions to LITTLE HOUSE at Waiton Lamkhai, Imphal East, Manipur - 795114.',
        category: 'Contact',
        iconType: 'map',
        actionLabel: 'View Map Location',
        href: '/contact#school-map',
        keywords: [
          'location', 'map', 'directions', 'address', 'where', 'imphal', 'waiton', 
          'lamkhai', 'manipur', 'satellite', 'gps', 'find', 'reach'
        ]
      },
      {
        title: 'School Photo & Campus Activity Gallery',
        desc: 'Explore high-resolution pictures of campus facilities, classrooms, sports meets, cultural celebrations, and student activities.',
        category: 'Gallery',
        iconType: 'gallery',
        actionLabel: 'Browse Gallery',
        href: '/gallery',
        keywords: [
          'gallery', 'photo', 'picture', 'image', 'album', 'campus', 'classroom', 
          'playground', 'sports', 'event', 'activity', 'cultural', 'pictures'
        ]
      },
      {
        title: 'Teacher & Staff Portal Console',
        desc: 'Authorized faculty portal to record monthly student attendance, upload evaluation report cards, and upload student activity photos.',
        category: 'Faculty',
        iconType: 'teacher',
        actionLabel: 'Teacher Login',
        href: '/portal/login',
        keywords: [
          'teacher', 'faculty', 'staff', 'portal', 'login', 'console', 'attendance register', 
          'monthly reports', 'upload', 'marks entry', 'homeroom'
        ]
      },
      {
        title: 'About LITTLE HOUSE & Educational Vision',
        desc: 'Read about our history, holistic curriculum, core pillars, and message from Principal Haobam Chanu Ranjana.',
        category: 'About Us',
        iconType: 'about',
        actionLabel: 'Read About Us',
        href: '/about',
        keywords: [
          'about', 'legacy', 'history', 'vision', 'mission', 'principal', 'haobam chanu ranjana', 'ranjana', 
          'leadership', 'philosophy', 'curriculum', 'pillars', 'values', 'little house'
        ]
      },
      {
        title: 'School Office Contact & Inquiry Desk',
        desc: 'Contact our office via phone at +91 98765 43210 or email at admin@littlehouse.edu.',
        category: 'Contact',
        iconType: 'contact',
        actionLabel: 'Get In Touch',
        href: '/contact',
        keywords: [
          'contact', 'phone', 'email', 'helpline', 'office', 'administrative', 'inquiry', 
          'support', 'call', 'telephone', 'mobile', 'address'
        ]
      }
    ];

    // Score and rank static matches
    const scoredResults: { item: typeof staticCatalog[0]; score: number }[] = [];

    for (const item of staticCatalog) {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const descLower = item.desc.toLowerCase();
      const catLower = item.category.toLowerCase();

      // Exact query match in title
      if (titleLower.includes(query)) score += 50;
      // Exact query match in desc
      if (descLower.includes(query)) score += 25;
      // Exact query match in category
      if (catLower.includes(query)) score += 30;

      // Token matching
      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 15;
        if (catLower.includes(token)) score += 10;
        if (descLower.includes(token)) score += 8;
        if (item.keywords.some(kw => kw.includes(token))) score += 12;
      }

      if (score > 0) {
        scoredResults.push({ item, score });
      }
    }

    // Sort by highest relevance score
    scoredResults.sort((a, b) => b.score - a.score);

    const finalResults = scoredResults.map(r => ({
      title: r.item.title,
      desc: r.item.desc,
      category: r.item.category,
      actionLabel: r.item.actionLabel,
      href: r.item.href,
      iconType: r.item.iconType,
    }));

    // Dynamic Database Announcements Search
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ],
          audience: 'ALL'
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });

      announcements.forEach(ann => {
        finalResults.push({
          title: ann.title,
          desc: ann.content.substring(0, 110) + (ann.content.length > 110 ? '...' : ''),
          category: 'Notice Board',
          actionLabel: 'Read Notice',
          href: '/#notices',
          iconType: 'notice'
        });
      });
    } catch (dbError) {
      console.error('Database query fail in search api:', dbError);
    }

    return NextResponse.json({ results: finalResults.slice(0, 8) });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal search error' }, { status: 500 });
  }
}
