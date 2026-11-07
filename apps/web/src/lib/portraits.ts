const BY_EMAIL: Record<string, string> = {
  'thabo.molefe@kindred.demo': '/avatars/thabo-molefe.jpg',
  'zanele.nkosi@kindred.demo': '/avatars/zanele-nkosi.jpg',
  'michael.oconnor@kindred.demo': '/avatars/michael-oconnor.jpg',
  'aisha.patel@kindred.demo': '/avatars/aisha-patel.jpg',
  'pieter.deklerk@kindred.demo': '/avatars/pieter-deklerk.jpg',
  'nadine.jacobs@kindred.demo': '/avatars/nadine-jacobs.jpg',
  'sipho.ngwenya@kindred.demo': '/avatars/sipho-ngwenya.jpg',
  'emma.brown@kindred.demo': '/avatars/emma-brown.jpg',
  'willem.venter@kindred.demo': '/avatars/willem-venter.jpg',
  'lungile.zulu@kindred.demo': '/avatars/lungile-zulu.jpg',
  'james.mitchell@kindred.demo': '/avatars/james-mitchell.jpg',
  'fatima.saidi@kindred.demo': '/avatars/fatima-saidi.jpg',
  'patient@kindred.demo': '/avatars/ayanda-petersen.jpg',
  'receptionist@kindred.demo': '/avatars/lindiwe-maseko.jpg',
  'doctor@kindred.demo': '/avatars/johan-van-wyk.jpg',
  'johan.vanwyk@kindred.demo': '/avatars/johan-van-wyk.jpg',
  'nomsa.dlamini@kindred.demo': '/avatars/nomsa-dlamini.jpg',
  'priya.naidoo@kindred.demo': '/avatars/priya-naidoo.jpg',
  'david.mokoena@kindred.demo': '/avatars/david-mokoena.jpg',
  'sarah.williams@kindred.demo': '/avatars/sarah-williams.jpg',
  'ahmed.hassan@kindred.demo': '/avatars/ahmed-hassan.jpg',
  'lerato.khumalo@kindred.demo': '/avatars/lerato-khumalo.jpg',
  'chris.botha@kindred.demo': '/avatars/chris-botha.jpg',
  'admin@kindred.demo': '/avatars/sam-khumalo.jpg',
  'it@kindred.demo': '/avatars/thandiwe-jacobs.jpg',
}

const BY_NAME: Record<string, string> = {
  'thabo molefe': '/avatars/thabo-molefe.jpg',
  'zanele nkosi': '/avatars/zanele-nkosi.jpg',
  "michael o'connor": '/avatars/michael-oconnor.jpg',
  'michael oconnor': '/avatars/michael-oconnor.jpg',
  'aisha patel': '/avatars/aisha-patel.jpg',
  'pieter de klerk': '/avatars/pieter-deklerk.jpg',
  'nadine jacobs': '/avatars/nadine-jacobs.jpg',
  'sipho ngwenya': '/avatars/sipho-ngwenya.jpg',
  'emma brown': '/avatars/emma-brown.jpg',
  'willem venter': '/avatars/willem-venter.jpg',
  'lungile zulu': '/avatars/lungile-zulu.jpg',
  'james mitchell': '/avatars/james-mitchell.jpg',
  'fatima saidi': '/avatars/fatima-saidi.jpg',
  'ayanda petersen': '/avatars/ayanda-petersen.jpg',
  'demo patient': '/avatars/ayanda-petersen.jpg',
  'lindiwe maseko': '/avatars/lindiwe-maseko.jpg',
  'johan van wyk': '/avatars/johan-van-wyk.jpg',
  'dr johan van wyk': '/avatars/johan-van-wyk.jpg',
  'nomsa dlamini': '/avatars/nomsa-dlamini.jpg',
  'priya naidoo': '/avatars/priya-naidoo.jpg',
  'david mokoena': '/avatars/david-mokoena.jpg',
  'sarah williams': '/avatars/sarah-williams.jpg',
  'ahmed hassan': '/avatars/ahmed-hassan.jpg',
  'lerato khumalo': '/avatars/lerato-khumalo.jpg',
  'chris botha': '/avatars/chris-botha.jpg',
  'sam khumalo': '/avatars/sam-khumalo.jpg',
  'sam admin': '/avatars/sam-khumalo.jpg',
  'thandiwe jacobs': '/avatars/thandiwe-jacobs.jpg',
  'it support': '/avatars/thandiwe-jacobs.jpg',
}

export function portraitUrl(opts: {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
}) {
  const email = opts.email?.trim().toLowerCase()
  if (email && BY_EMAIL[email]) return BY_EMAIL[email]
  const name = (opts.fullName ?? `${opts.firstName ?? ''} ${opts.lastName ?? ''}`)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
  if (name && BY_NAME[name]) return BY_NAME[name]
  return null
}
