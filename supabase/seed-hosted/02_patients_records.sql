-- Part 2/5 - demo patients + clinical summaries (no login; receptionist-visible)
-- Your real /signup patients are untouched.

insert into public.patients (
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  gender,
  blood_group,
  address
)
values
  (
    'Thabo',
    'Molefe',
    'thabo.molefe@kindred.demo',
    '+27 82 100 2001',
    '1988-03-14',
    'Male',
    'O+',
    '12 Durban Road, Bellville'
  ),
  (
    'Zanele',
    'Nkosi',
    'zanele.nkosi@kindred.demo',
    '+27 82 100 2002',
    '1995-07-22',
    'Female',
    'A+',
    '44 Voortrekker Way, Parow'
  ),
  (
    'Michael',
    'O''Connor',
    'michael.oconnor@kindred.demo',
    '+27 83 100 2003',
    '1972-11-05',
    'Male',
    'B+',
    '7 Oak Avenue, Durbanville'
  ),
  (
    'Aisha',
    'Patel',
    'aisha.patel@kindred.demo',
    '+27 84 100 2004',
    '2001-01-18',
    'Female',
    'AB+',
    '90 Klipfontein Road, Goodwood'
  ),
  (
    'Pieter',
    'De Klerk',
    'pieter.deklerk@kindred.demo',
    '+27 82 100 2005',
    '1965-09-30',
    'Male',
    'O-',
    '3 Wilhelm Street, Stellenbosch'
  ),
  (
    'Nadine',
    'Jacobs',
    'nadine.jacobs@kindred.demo',
    '+27 83 100 2006',
    '1990-12-08',
    'Female',
    'A-',
    '22 Main Road, Somerset West'
  ),
  (
    'Sipho',
    'Ngwenya',
    'sipho.ngwenya@kindred.demo',
    '+27 82 100 2007',
    '2016-04-02',
    'Male',
    'O+',
    '15 Ravensmead Crescent, Cape Town'
  ),
  (
    'Emma',
    'Brown',
    'emma.brown@kindred.demo',
    '+27 84 100 2008',
    '1998-06-25',
    'Female',
    'B-',
    '6 Beach Road, Blouberg'
  ),
  (
    'Willem',
    'Venter',
    'willem.venter@kindred.demo',
    '+27 83 100 2009',
    '1958-02-11',
    'Male',
    'A+',
    '99 N1 City, Goodwood'
  ),
  (
    'Lungile',
    'Zulu',
    'lungile.zulu@kindred.demo',
    '+27 82 100 2010',
    '1993-08-19',
    'Female',
    'O+',
    '31 Modderdam Road, Bellville'
  ),
  (
    'James',
    'Mitchell',
    'james.mitchell@kindred.demo',
    '+27 84 100 2011',
    '1985-10-03',
    'Male',
    'AB-',
    '18 Mill Street, Wellington'
  ),
  (
    'Fatima',
    'Saidi',
    'fatima.saidi@kindred.demo',
    '+27 82 100 2012',
    '2004-05-17',
    'Female',
    'A+',
    '2 Hospital Street, Bellville'
  );

insert into public.patient_records (patient_id, summary, history)
select
  p.id,
  r.summary,
  r.history
from public.patients p
join (
  values
    (
      'thabo.molefe@kindred.demo',
      'Hypertension on amlodipine; annual cardiac review.',
      '2024-06: BP elevated at workplace screening. Started lifestyle plan. No hospital admissions.'
    ),
    (
      'zanele.nkosi@kindred.demo',
      'Gestational follow-up; routine antenatal bloods normal.',
      'Second pregnancy; first delivery 2022, uncomplicated. Allergic to penicillin (rash).'
    ),
    (
      'michael.oconnor@kindred.demo',
      'Type 2 diabetes; HbA1c monitoring quarterly.',
      '2019 diagnosis. Metformin. 2023: ophthalmology clear. Smoker, counselled on cessation.'
    ),
    (
      'aisha.patel@kindred.demo',
      'Student health; mild asthma, uses salbutamol PRN.',
      'Childhood asthma. Last exacerbation 2025-01. Spirometry within normal limits 2025-08.'
    ),
    (
      'pieter.deklerk@kindred.demo',
      'Post hip-replacement rehab; physiotherapy twice weekly.',
      '2025-09 elective THR. Staples removed; wound healing well.'
    ),
    (
      'nadine.jacobs@kindred.demo',
      'Anxiety and insomnia; CBT referral active.',
      '2025-07 psychiatry intake. No inpatient history. SSRI discussed, declined.'
    ),
    (
      'sipho.ngwenya@kindred.demo',
      'Paediatric growth tracking; immunisations up to date.',
      'Born term. 2026 measles booster given. No chronic conditions.'
    ),
    (
      'emma.brown@kindred.demo',
      'Dermatology: eczema flares in winter.',
      'Topical steroids as needed. Patch test negative 2025.'
    ),
    (
      'willem.venter@kindred.demo',
      'Ischemic heart disease; on dual antiplatelet therapy.',
      '2023 NSTEMI, stent placed. Cardiology follow-up 6-monthly.'
    ),
    (
      'lungile.zulu@kindred.demo',
      'General wellness; mild iron deficiency treated.',
      '2025-10 ferritin low; oral iron course completed.'
    ),
    (
      'james.mitchell@kindred.demo',
      'Sports injury - ACL reconstruction planning.',
      'MRI 2026-01 confirms partial tear. Awaiting surgical slot.'
    ),
    (
      'fatima.saidi@kindred.demo',
      'Adolescent mental health check-in.',
      'School counselling referral. No self-harm risk documented at last visit.'
    )
) as r(email, summary, history)
  on lower(p.email) = lower(r.email);
