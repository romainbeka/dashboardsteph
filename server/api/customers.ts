import type { User } from '~/types'

const customers: User[] = [{
  id: 1,
  name: 'Alex Smith',
  email: 'alex.smith@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=1'
  },
  status: 'Abonné',
  location: 'New York, USA'
}, {
  id: 2,
  name: 'Jordan Brown',
  email: 'jordan.brown@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=2'
  },
  status: 'Désabonner',
  location: 'London, UK'
}, {
  id: 3,
  name: 'Taylor Green',
  email: 'taylor.green@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=3'
  },
  status: 'Suspendu',
  location: 'Paris, France'
}, {
  id: 4,
  name: 'Morgan White',
  email: 'morgan.white@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=4'
  },
  status: 'Abonné',
  location: 'Berlin, Germany'
}, {
  id: 5,
  name: 'Casey Gray',
  email: 'casey.gray@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=5'
  },
  status: 'Abonné',
  location: 'Tokyo, Japan'
}, {
  id: 6,
  name: 'Jamie Johnson',
  email: 'jamie.johnson@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=6'
  },
  status: 'Abonné',
  location: 'Sydney, Australia'
}, {
  id: 7,
  name: 'Riley Davis',
  email: 'riley.davis@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=7'
  },
  status: 'Abonné',
  location: 'New York, USA'
}, {
  id: 8,
  name: 'Kelly Wilson',
  email: 'kelly.wilson@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=8'
  },
  status: 'Abonné',
  location: 'London, UK'
}, {
  id: 9,
  name: 'Drew Moore',
  email: 'drew.moore@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=9'
  },
  status: 'Suspendu',
  location: 'Paris, France'
}, {
  id: 10,
  name: 'Jordan Taylor',
  email: 'jordan.taylor@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=10'
  },
  status: 'Abonné',
  location: 'Berlin, Germany'
}, {
  id: 11,
  name: 'Morgan Anderson',
  email: 'morgan.anderson@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=11'
  },
  status: 'Abonné',
  location: 'Tokyo, Japan'
}, {
  id: 12,
  name: 'Casey Thomas',
  email: 'casey.thomas@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=12'
  },
  status: 'Désabonner',
  location: 'Sydney, Australia'
}, {
  id: 13,
  name: 'Jamie Jackson',
  email: 'jamie.jackson@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=13'
  },
  status: 'Désabonner',
  location: 'New York, USA'
}, {
  id: 14,
  name: 'Riley White',
  email: 'riley.white@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=14'
  },
  status: 'Désabonner',
  location: 'London, UK'
}, {
  id: 15,
  name: 'Kelly Harris',
  email: 'kelly.harris@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=15'
  },
  status: 'Abonné',
  location: 'Paris, France'
}, {
  id: 16,
  name: 'Drew Martin',
  email: 'drew.martin@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=16'
  },
  status: 'Abonné',
  location: 'Berlin, Germany'
}, {
  id: 17,
  name: 'Alex Thompson',
  email: 'alex.thompson@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=17'
  },
  status: 'Désabonner',
  location: 'Tokyo, Japan'
}, {
  id: 18,
  name: 'Jordan Garcia',
  email: 'jordan.garcia@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=18'
  },
  status: 'Abonné',
  location: 'Sydney, Australia'
}, {
  id: 19,
  name: 'Taylor Rodriguez',
  email: 'taylor.rodriguez@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=19'
  },
  status: 'Suspendu',
  location: 'New York, USA'
}, {
  id: 20,
  name: 'Morgan Lopez',
  email: 'morgan.lopez@example.com',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=20'
  },
  status: 'Abonné',
  location: 'London, UK'
}]

export default eventHandler(async () => {
  return customers
})
