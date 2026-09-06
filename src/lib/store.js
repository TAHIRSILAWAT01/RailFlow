// RailFlow in-memory store with persistence via module singleton
// In production this would be a proper database

let store = null;

function getInitialStore() {
  return {
    stations: [
      { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
      { code: 'KJM', name: 'Krishnarajapuram', city: 'Krishnarajapuram', state: 'Karnataka' },
      { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka' },
      { code: 'TK', name: 'Tumakuru', city: 'Tumakuru', state: 'Karnataka' },
      { code: 'UBL', name: 'Hubballi Junction', city: 'Hubballi', state: 'Karnataka' },
      { code: 'BGM', name: 'Belagavi', city: 'Belagavi', state: 'Karnataka' },
      { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
      { code: 'LNL', name: 'Lonavala', city: 'Lonavala', state: 'Maharashtra' },
      { code: 'TNA', name: 'Thane', city: 'Thane', state: 'Maharashtra' },
      { code: 'DR', name: 'Dadar', city: 'Mumbai', state: 'Maharashtra' },
      { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
      { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
      { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
      { code: 'RJT', name: 'Rajkot Junction', city: 'Rajkot', state: 'Gujarat' },
      { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
      { code: 'SLM', name: 'Salem Junction', city: 'Salem', state: 'Tamil Nadu' },
      { code: 'ED', name: 'Erode Junction', city: 'Erode', state: 'Tamil Nadu' },
      { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu' },
      { code: 'PGT', name: 'Palakkad Junction', city: 'Palakkad', state: 'Kerala' },
      { code: 'TCR', name: 'Thrissur', city: 'Thrissur', state: 'Kerala' },
      { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala' },
      { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
      { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
      { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana' },
      { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
      { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi' },
      { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' }
    ],

    trains: [
      {
        id: 'T12952',
        number: '12952',
        name: 'Mumbai Rajdhani Express',
        route: ['SBC', 'KJM', 'TK', 'UBL', 'BGM', 'PUNE', 'LNL', 'TNA', 'DR', 'MMCT', 'ST', 'BRC', 'ADI', 'RJT'],
        schedule: {
          SBC:  { arrive: null,    depart: '06:00', day: 1 },
          KJM:  { arrive: '06:20', depart: '06:22', day: 1 },
          TK:   { arrive: '07:45', depart: '07:47', day: 1 },
          UBL:  { arrive: '11:30', depart: '11:40', day: 1 },
          BGM:  { arrive: '13:15', depart: '13:17', day: 1 },
          PUNE: { arrive: '17:30', depart: '17:40', day: 1 },
          LNL:  { arrive: '18:45', depart: '18:47', day: 1 },
          TNA:  { arrive: '20:15', depart: '20:17', day: 1 },
          DR:   { arrive: '20:45', depart: '20:47', day: 1 },
          MMCT: { arrive: '21:15', depart: '21:20', day: 1 },
          ST:   { arrive: '23:30', depart: '23:32', day: 1 },
          BRC:  { arrive: '01:15', depart: '01:20', day: 2 },
          ADI:  { arrive: '03:00', depart: '03:10', day: 2 },
          RJT:  { arrive: '06:30', depart: null,    day: 2 }
        },
        classes: ['SL', '3A', '2A', '1A'],
        coaches: {
          SL: ['S1', 'S2', 'S3', 'S4'],
          '3A': ['B1', 'B2', 'B3'],
          '2A': ['A1', 'A2'],
          '1A': ['H1']
        }
      },
      {
        id: 'T16535',
        number: '16535',
        name: 'Gol Gumbaz Express',
        route: ['SBC', 'YPR', 'TK', 'UBL', 'BGM', 'PUNE', 'DR', 'MMCT'],
        schedule: {
          SBC:  { arrive: null,    depart: '07:15', day: 1 },
          YPR:  { arrive: '07:45', depart: '07:50', day: 1 },
          TK:   { arrive: '09:10', depart: '09:12', day: 1 },
          UBL:  { arrive: '13:00', depart: '13:10', day: 1 },
          BGM:  { arrive: '14:45', depart: '14:47', day: 1 },
          PUNE: { arrive: '19:30', depart: '19:40', day: 1 },
          DR:   { arrive: '22:30', depart: '22:32', day: 1 },
          MMCT: { arrive: '23:00', depart: null,    day: 1 }
        },
        classes: ['SL', '3A', '2A'],
        coaches: {
          SL: ['S1', 'S2', 'S3'],
          '3A': ['B1', 'B2'],
          '2A': ['A1']
        }
      },
      {
        id: 'T22693',
        number: '22693',
        name: 'KSR Bengaluru Rajdhani',
        route: ['SBC', 'YPR', 'PUNE', 'TNA', 'MMCT', 'ST', 'BRC', 'ADI'],
        schedule: {
          SBC:  { arrive: null,    depart: '20:00', day: 1 },
          YPR:  { arrive: '20:20', depart: '20:25', day: 1 },
          PUNE: { arrive: '04:15', depart: '04:25', day: 2 },
          TNA:  { arrive: '07:30', depart: '07:32', day: 2 },
          MMCT: { arrive: '08:05', depart: '08:10', day: 2 },
          ST:   { arrive: '10:30', depart: '10:32', day: 2 },
          BRC:  { arrive: '12:15', depart: '12:20', day: 2 },
          ADI:  { arrive: '14:00', depart: null,    day: 2 }
        },
        classes: ['3A', '2A', '1A'],
        coaches: {
          '3A': ['B1', 'B2'],
          '2A': ['A1'],
          '1A': ['H1']
        }
      },
      {
        id: 'T12163',
        number: '12163',
        name: 'Chennai Dadar Express',
        route: ['MAS', 'SLM', 'ED', 'CBE', 'PGT', 'PUNE', 'DR', 'MMCT', 'ST', 'BRC', 'ADI'],
        schedule: {
          MAS:  { arrive: null,    depart: '10:00', day: 1 },
          SLM:  { arrive: '12:30', depart: '12:35', day: 1 },
          ED:   { arrive: '13:45', depart: '13:47', day: 1 },
          CBE:  { arrive: '15:30', depart: '15:40', day: 1 },
          PGT:  { arrive: '16:30', depart: '16:32', day: 1 },
          PUNE: { arrive: '04:30', depart: '04:40', day: 2 },
          DR:   { arrive: '07:45', depart: '07:47', day: 2 },
          MMCT: { arrive: '08:15', depart: '08:20', day: 2 },
          ST:   { arrive: '10:45', depart: '10:47', day: 2 },
          BRC:  { arrive: '12:30', depart: '12:35', day: 2 },
          ADI:  { arrive: '14:15', depart: null,    day: 2 }
        },
        classes: ['SL', '3A', '2A'],
        coaches: {
          SL: ['S1', 'S2', 'S3'],
          '3A': ['B1', 'B2'],
          '2A': ['A1']
        }
      },
      {
        id: 'T16381',
        number: '16381',
        name: 'Kanyakumari Express',
        route: ['MAS', 'SLM', 'CBE', 'PGT', 'TCR', 'ERS', 'TVC'],
        schedule: {
          MAS:  { arrive: null,    depart: '08:00', day: 1 },
          SLM:  { arrive: '10:30', depart: '10:35', day: 1 },
          CBE:  { arrive: '13:15', depart: '13:25', day: 1 },
          PGT:  { arrive: '14:15', depart: '14:17', day: 1 },
          TCR:  { arrive: '16:00', depart: '16:05', day: 1 },
          ERS:  { arrive: '17:30', depart: '17:40', day: 1 },
          TVC:  { arrive: '21:00', depart: null,    day: 1 }
        },
        classes: ['SL', '3A', '2A'],
        coaches: {
          SL: ['S1', 'S2', 'S3'],
          '3A': ['B1', 'B2'],
          '2A': ['A1']
        }
      },
      {
        id: 'T12721',
        number: '12721',
        name: 'Dakshin Express',
        route: ['HYB', 'SC', 'NGP', 'PUNE', 'DR', 'MMCT'],
        schedule: {
          HYB:  { arrive: null,    depart: '17:00', day: 1 },
          SC:   { arrive: '17:20', depart: '17:25', day: 1 },
          NGP:  { arrive: '23:30', depart: '23:40', day: 1 },
          PUNE: { arrive: '06:15', depart: '06:25', day: 2 },
          DR:   { arrive: '09:30', depart: '09:32', day: 2 },
          MMCT: { arrive: '10:00', depart: null,    day: 2 }
        },
        classes: ['SL', '3A', '2A'],
        coaches: {
          SL: ['S1', 'S2'],
          '3A': ['B1', 'B2'],
          '2A': ['A1']
        }
      },
      {
        id: 'T12957',
        number: '12957',
        name: 'Ahmedabad Shatabdi',
        route: ['MMCT', 'ST', 'BRC', 'ADI', 'RJT'],
        schedule: {
          MMCT: { arrive: null,    depart: '06:00', day: 1 },
          ST:   { arrive: '08:15', depart: '08:17', day: 1 },
          BRC:  { arrive: '10:00', depart: '10:05', day: 1 },
          ADI:  { arrive: '11:45', depart: '11:50', day: 1 },
          RJT:  { arrive: '15:30', depart: null,    day: 1 }
        },
        classes: ['SL', '3A', '2A'],
        coaches: {
          SL: ['S1', 'S2'],
          '3A': ['B1'],
          '2A': ['A1']
        }
      },
      {
        id: 'T22119',
        number: '22119',
        name: 'Chennai Rajdhani',
        route: ['MAS', 'SLM', 'ED', 'HYB', 'SC', 'NGP', 'NDLS'],
        schedule: {
          MAS:  { arrive: null,    depart: '06:00', day: 1 },
          SLM:  { arrive: '08:30', depart: '08:32', day: 1 },
          ED:   { arrive: '09:45', depart: '09:47', day: 1 },
          HYB:  { arrive: '14:30', depart: '14:40', day: 1 },
          SC:   { arrive: '15:00', depart: '15:10', day: 1 },
          NGP:  { arrive: '21:30', depart: '21:40', day: 1 },
          NDLS: { arrive: '10:00', depart: null,    day: 2 }
        },
        classes: ['3A', '2A', '1A'],
        coaches: {
          '3A': ['B1', 'B2'],
          '2A': ['A1'],
          '1A': ['H1']
        }
      }
    ],

    // Availability matrix: trainId_class_origin_dest -> {status, count}
    availability: {
      // Train T12952 SBC→MMCT 3A: WAITLIST (primary demo scenario)
      'T12952_3A_SBC_MMCT': { status: 'WL', count: 23, fare: 1850 },
      'T12952_3A_SBC_ST':   { status: 'CONFIRMED', count: 4, fare: 2100 },
      'T12952_3A_SBC_BRC':  { status: 'CONFIRMED', count: 6, fare: 2350 },
      'T12952_3A_SBC_ADI':  { status: 'CONFIRMED', count: 8, fare: 2600 },
      'T12952_3A_SBC_RJT':  { status: 'CONFIRMED', count: 10, fare: 2900 },
      'T12952_3A_MMCT_ST':  { status: 'CONFIRMED', count: 3, fare: 450 },
      'T12952_3A_MMCT_BRC': { status: 'CONFIRMED', count: 5, fare: 650 },
      'T12952_3A_MMCT_ADI': { status: 'CONFIRMED', count: 7, fare: 850 },
      'T12952_3A_ST_BRC':   { status: 'CONFIRMED', count: 4, fare: 250 },
      'T12952_3A_ST_ADI':   { status: 'CONFIRMED', count: 6, fare: 450 },
      'T12952_3A_BRC_ADI':  { status: 'CONFIRMED', count: 3, fare: 250 },
      'T12952_3A_BRC_RJT':  { status: 'CONFIRMED', count: 5, fare: 450 },
      'T12952_SL_SBC_MMCT': { status: 'WL', count: 45, fare: 650 },
      'T12952_SL_SBC_ST':   { status: 'CONFIRMED', count: 8, fare: 750 },
      'T12952_2A_SBC_MMCT': { status: 'RAC', count: 4, fare: 2800 },
      'T12952_2A_SBC_ST':   { status: 'CONFIRMED', count: 3, fare: 3200 },
      'T12952_1A_SBC_MMCT': { status: 'CONFIRMED', count: 2, fare: 4500 },

      // Train T16535 routes
      'T16535_3A_SBC_MMCT': { status: 'RAC', count: 6, fare: 1650 },
      'T16535_3A_SBC_PUNE': { status: 'CONFIRMED', count: 4, fare: 1350 },
      'T16535_3A_SBC_DR':   { status: 'CONFIRMED', count: 2, fare: 1580 },
      'T16535_SL_SBC_MMCT': { status: 'CONFIRMED', count: 12, fare: 580 },
      'T16535_2A_SBC_MMCT': { status: 'CONFIRMED', count: 3, fare: 2550 },

      // Train T22693
      'T22693_3A_SBC_MMCT': { status: 'WL', count: 12, fare: 2050 },
      'T22693_3A_SBC_ST':   { status: 'CONFIRMED', count: 5, fare: 2300 },
      'T22693_3A_SBC_ADI':  { status: 'CONFIRMED', count: 7, fare: 2700 },
      'T22693_2A_SBC_MMCT': { status: 'CONFIRMED', count: 2, fare: 3100 },

      // Train T12163 Chennai routes
      'T12163_3A_MAS_PUNE': { status: 'CONFIRMED', count: 6, fare: 1850 },
      'T12163_3A_MAS_MMCT': { status: 'WL', count: 8, fare: 2100 },
      'T12163_3A_MAS_ST':   { status: 'CONFIRMED', count: 4, fare: 2400 },
      'T12163_3A_MAS_ADI':  { status: 'CONFIRMED', count: 6, fare: 2700 },
      'T12163_3A_CBE_MMCT': { status: 'CONFIRMED', count: 3, fare: 1350 },
      'T12163_3A_CBE_ADI':  { status: 'CONFIRMED', count: 5, fare: 1900 },
      'T12163_SL_MAS_MMCT': { status: 'CONFIRMED', count: 15, fare: 750 },

      // Train T16381 Kerala routes
      'T16381_3A_MAS_TVC':  { status: 'CONFIRMED', count: 8, fare: 1450 },
      'T16381_3A_MAS_ERS':  { status: 'CONFIRMED', count: 6, fare: 1250 },
      'T16381_3A_CBE_TVC':  { status: 'CONFIRMED', count: 4, fare: 850 },
      'T16381_SL_MAS_TVC':  { status: 'CONFIRMED', count: 20, fare: 520 },

      // Train T12721 Hyderabad routes
      'T12721_3A_HYB_MMCT': { status: 'WL', count: 15, fare: 1550 },
      'T12721_3A_HYB_PUNE': { status: 'CONFIRMED', count: 4, fare: 1200 },
      'T12721_3A_SC_MMCT':  { status: 'CONFIRMED', count: 3, fare: 1480 },
      'T12721_SL_HYB_MMCT': { status: 'CONFIRMED', count: 10, fare: 550 },

      // Train T12957 Mumbai-Ahmedabad
      'T12957_3A_MMCT_ADI': { status: 'CONFIRMED', count: 8, fare: 950 },
      'T12957_3A_MMCT_RJT': { status: 'CONFIRMED', count: 5, fare: 1200 },
      'T12957_3A_ST_ADI':   { status: 'CONFIRMED', count: 4, fare: 650 },
      'T12957_SL_MMCT_ADI': { status: 'CONFIRMED', count: 12, fare: 380 },

      // Train T22119 Chennai-Delhi
      'T22119_3A_MAS_NDLS': { status: 'WL', count: 20, fare: 3200 },
      'T22119_3A_MAS_NGP':  { status: 'CONFIRMED', count: 4, fare: 1800 },
      'T22119_3A_HYB_NDLS': { status: 'CONFIRMED', count: 6, fare: 1950 },
      'T22119_2A_MAS_NDLS': { status: 'RAC', count: 3, fare: 4800 },

      // Scenario: Pune → Ahmedabad (no confirmed), alt → Rajkot
      'T12952_3A_PUNE_ADI': { status: 'WL', count: 5, fare: 980 },
      'T12952_3A_PUNE_RJT': { status: 'CONFIRMED', count: 3, fare: 1200 },

      // Scenario: Thane → Surat (no confirmed), alt → Ahmedabad
      'T12952_3A_TNA_ST':  { status: 'WL', count: 8, fare: 420 },
      'T12952_3A_TNA_ADI': { status: 'CONFIRMED', count: 4, fare: 720 }
    },

    // Pre-allocated berths (coach + berth number)
    berths: {
      'T12952_3A_B2': Array.from({length: 64}, (_, i) => ({
        number: i + 1,
        type: i % 8 < 2 ? 'LB' : i % 8 < 4 ? 'MB' : i % 8 < 6 ? 'UB' : i % 8 === 6 ? 'SL' : 'SU',
        status: 'AVAILABLE',
        bookingId: null
      })),
      'T12952_3A_B1': Array.from({length: 64}, (_, i) => ({
        number: i + 1,
        type: i % 8 < 2 ? 'LB' : i % 8 < 4 ? 'MB' : i % 8 < 6 ? 'UB' : i % 8 === 6 ? 'SL' : 'SU',
        status: 'AVAILABLE',
        bookingId: null
      }))
    },

    bookings: [],
    payments: [],
    deboardingIntents: [],
    vacancies: [],
    verifications: [],
    notifications: [],
    racCandidates: [],
    waitlistCandidates: [],
    allocations: [],
    trainProgress: {}
  };
}

function seedDemoData(st) {
  const today = new Date();
  const journeyDate = new Date(today);
  journeyDate.setDate(journeyDate.getDate() + 2);
  const jd = journeyDate.toISOString().split('T')[0];

  // Seed RAC/WL candidates for Mumbai → Surat (main demo)
  st.racCandidates = [
    {
      id: 'RAC001',
      type: 'RAC',
      pnr: 'RC4521098',
      name: 'Priya Sharma',
      trainId: 'T12952',
      trainNumber: '12952',
      fromStation: 'MMCT',
      toStation: 'ST',
      class: '3A',
      journeyDate: jd,
      currentBerth: 'B2-SL',
      status: 'ACTIVE'
    },
    {
      id: 'RAC002',
      type: 'RAC',
      pnr: 'RC4521099',
      name: 'Vikram Nair',
      trainId: 'T12952',
      trainNumber: '12952',
      fromStation: 'MMCT',
      toStation: 'ST',
      class: '3A',
      journeyDate: jd,
      currentBerth: 'B2-SU',
      status: 'ACTIVE'
    }
  ];

  st.waitlistCandidates = [
    {
      id: 'WL001',
      type: 'WL',
      pnr: 'WL8834521',
      name: 'Anjali Mehta',
      trainId: 'T12952',
      trainNumber: '12952',
      fromStation: 'MMCT',
      toStation: 'ST',
      class: '3A',
      journeyDate: jd,
      wlNumber: 5,
      status: 'ACTIVE'
    },
    {
      id: 'WL002',
      type: 'WL',
      pnr: 'WL8834522',
      name: 'Suresh Iyer',
      trainId: 'T12952',
      trainNumber: '12952',
      fromStation: 'MMCT',
      toStation: 'ST',
      class: '3A',
      journeyDate: jd,
      wlNumber: 6,
      status: 'ACTIVE'
    },
    // Scenario A candidates: Pune → Rajkot, intent at Vadodara
    {
      id: 'WL003',
      type: 'WL',
      pnr: 'WL8834530',
      name: 'Renu Patel',
      trainId: 'T12952',
      trainNumber: '12952',
      fromStation: 'BRC',
      toStation: 'RJT',
      class: '3A',
      journeyDate: jd,
      wlNumber: 3,
      status: 'ACTIVE'
    }
  ];

  // Initialize train progress for main demo train
  st.trainProgress['T12952'] = {
    trainId: 'T12952',
    currentStationIndex: 0,
    currentStation: 'SBC',
    nextStation: 'KJM',
    status: 'IN_TRANSIT',
    lastUpdated: new Date().toISOString()
  };

  // Seed sample notifications
  st.notifications = [
    {
      id: 'N0001',
      type: 'SYSTEM',
      bookingId: null,
      vacancyId: null,
      recipientRole: 'TTE',
      title: 'RailFlow System Ready',
      message: 'TTE device is connected. Monitoring active bookings.',
      status: 'READ',
      createdAt: new Date().toISOString()
    }
  ];
}

function getStore() {
  if (!store) {
    store = getInitialStore();
    seedDemoData(store);
  }
  return store;
}

function resetStore() {
  store = getInitialStore();
  seedDemoData(store);
  return store;
}

module.exports = { getStore, resetStore };
