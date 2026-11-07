-- Part 4/5 - prescriptions

insert into public.prescriptions (
  patient_id,
  doctor_id,
  medication,
  dosage,
  instructions,
  prescribed_at
)
select
  p.id,
  d.id,
  rx.medication,
  rx.dosage,
  rx.instructions,
  rx.prescribed_at
from (
  values
    (
      'thabo.molefe@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      'Amlodipine',
      '5 mg',
      'One tablet each morning with water.',
      now() - interval '30 days'
    ),
    (
      'michael.oconnor@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      'Metformin',
      '500 mg',
      'One tablet twice daily with meals.',
      now() - interval '60 days'
    ),
    (
      'aisha.patel@kindred.demo',
      'priya.naidoo@kindred.demo',
      'Salbutamol inhaler',
      '100 mcg',
      'Two puffs when wheezy; max 8 puffs per day.',
      now() - interval '14 days'
    ),
    (
      'pieter.deklerk@kindred.demo',
      'david.mokoena@kindred.demo',
      'Paracetamol',
      '500 mg',
      'Two tablets every 6 hours as needed for pain (max 8/day).',
      now() - interval '7 days'
    ),
    (
      'willem.venter@kindred.demo',
      'johan.vanwyk@kindred.demo',
      'Atorvastatin',
      '20 mg',
      'One tablet at night.',
      now() - interval '90 days'
    ),
    (
      'willem.venter@kindred.demo',
      'johan.vanwyk@kindred.demo',
      'Aspirin',
      '75 mg',
      'One tablet daily after food.',
      now() - interval '90 days'
    ),
    (
      'emma.brown@kindred.demo',
      'lerato.khumalo@kindred.demo',
      'Hydrocortisone cream 1%',
      'Apply thin layer',
      'Twice daily to affected areas for up to 7 days.',
      now() - interval '5 days'
    ),
    (
      'zanele.nkosi@kindred.demo',
      'sarah.williams@kindred.demo',
      'Folic acid',
      '5 mg',
      'One tablet daily until delivery.',
      now() - interval '20 days'
    ),
    (
      'lungile.zulu@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      'Ferrous sulphate',
      '200 mg',
      'One tablet daily; take with orange juice.',
      now() - interval '45 days'
    ),
    (
      'sipho.ngwenya@kindred.demo',
      'priya.naidoo@kindred.demo',
      'Paracetamol liquid',
      '120 mg/5 ml',
      'Weight-based dosing - see label on bottle.',
      now() - interval '3 days'
    )
) as rx(
  patient_email,
  doctor_email,
  medication,
  dosage,
  instructions,
  prescribed_at
)
join public.patients p on lower(p.email) = lower(rx.patient_email)
join public.doctors d on lower(d.email) = lower(rx.doctor_email);
