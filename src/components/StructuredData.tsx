import React from 'react';

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thelittlehouseschool.in';

  // 1. Schema.org/School & EducationalOrganization Knowledge Graph
  const schoolSchema = {
    '@context': 'https://schema.org',
    '@type': 'School',
    '@id': `${baseUrl}/#school`,
    name: 'LITTLE HOUSE • A Family of Learning',
    alternateName: ['Little House School', 'Little House Waiton', 'Little House School Manipur'],
    url: baseUrl,
    logo: `${baseUrl}/school-logo.png`,
    image: `${baseUrl}/school-banner.png`,
    description: 'Official portal for Little House School, located at Waiton Lamkhai, Imphal East, Manipur (795114). Comprehensive education from Play-Group to Class VI with modern facilities, monthly report card tracking, and dedicated transport routes.',
    telephone: '+919876543210',
    email: 'info@thelittlehouseschool.in',
    priceRange: '₹₹',
    hasCredential: 'Recognized by Directorate of Education, Government of Manipur',
    foundingDate: '1984',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Waiton Lamkhai',
      addressLocality: 'Imphal East',
      addressRegion: 'Manipur',
      postalCode: '795114',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '24.8467',
      longitude: '93.9782',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '14:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:30',
        closes: '12:30',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      category: 'Campus Admission',
      name: 'Admissions Open Academic Session 2026–2027',
      description: 'Admissions open for Play-Group, Nursery, Lower KG, Upper KG, and Class I through Class VI.',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/admission`,
    },
    sameAs: [
      'https://www.facebook.com/littlehouseschoolmanipur',
      'https://www.instagram.com/littlehouse_school',
      'https://maps.google.com/?cid=littlehouse_waiton',
    ],
  };

  // 2. Schema.org/WebSite with Sitelinks SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'LITTLE HOUSE School Portal',
    description: 'A Family of Learning - Official School Website & Academic Management Portal',
    publisher: {
      '@id': `${baseUrl}/#school`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/admission?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // 3. Schema.org/FAQPage for Google Search Rich FAQ Accordion
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What classes and age groups are offered at Little House School?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Little House School offers classes from Play-Group and Nursery (Ages 3+) up through Class VI (Ages 11-12) with holistic curricula combining academic excellence, character building, and creative arts.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can parents apply for Admission for session 2026-2027?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Parents can register online via the official Little House website at /admission or visit the school administrative office at Waiton Lamkhai from Monday to Friday, 8:30 AM to 2:30 PM.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Little House School provide daily school van transportation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, dedicated school van transport routes operate daily across Waiton, Pukhao, Pangei, Sawombung, Khurai, and adjacent areas with verified drivers and live route tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do parents access student report cards and exam results?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Parents can look up their child’s live academic records, monthly progress cards, and attendance percentages anytime on the Parent & Student Portal at /parent-portal using the student’s Admission Number.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
