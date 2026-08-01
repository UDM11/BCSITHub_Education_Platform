export interface College {
  id: string;
  name: string;
  address: string;
  website: string;
  logo: string;
  established?: string;
  students?: string;
  rating?: number;
  programs?: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
}

export const collegesData: College[] = [
  {
    id: '1',
    name: 'Ace Institute of Management',
    address: 'New Baneshwor, Kathmandu',
    website: 'https://ace.edu.np',
    logo: '/logos/ace.jpg',
    established: '1999',
    students: '2,500+',
    rating: 4.5,
    programs: ['BCSIT', 'BCA', 'MBA'],
    contact: {
      phone: '+977-1-4782814',
      email: 'info@ace.edu.np'
    }
  },
  {
    id: '2',
    name: 'SAIM College',
    address: 'Old Baneswor, Kathmandu',
    website: 'https://saim.edu.np',
    logo: '/logos/saim.jpg',
    established: '2001',
    students: '1,800+',
    rating: 4.3,
    programs: ['BCSIT', 'BIM', 'BCA'],
    contact: {
      phone: '+977-1-4782945',
      email: 'info@saim.edu.np'
    }
  },
  {
    id: '3',
    name: 'Apollo International College',
    address: 'Baneshwor, Kathmandu',
    website: 'https://www.apollointcollege.edu.np',
    logo: '/logos/apollo.jpg',
    established: '2003',
    students: '1,200+',
    rating: 4.2,
    programs: ['BCSIT', 'BCA', 'BBS'],
    contact: {
      phone: '+977-1-4782156',
      email: 'info@apollointcollege.edu.np'
    }
  },
  {
    id: '4',
    name: 'Quest International College',
    address: 'Gwarko, Lalitpur',
    website: 'https://quest.edu.np',
    logo: '/logos/quest.png',
    established: '2002',
    students: '2,000+',
    rating: 4.4,
    programs: ['BCSIT', 'BCA', 'MBA', 'BIM'],
    contact: {
      phone: '+977-1-5543322',
      email: 'info@quest.edu.np'
    }
  },
  {
    id: '5',
    name: 'Shubhashree College of Management',
    address: 'New Baneshwor, Kathmandu',
    website: 'https://shubhashreecollege.edu.np',
    logo: '/logos/shubhashree.jpg',
    established: '2000',
    students: '1,500+',
    rating: 4.1,
    programs: ['BCSIT', 'BBS', 'MBA'],
    contact: {
      phone: '+977-1-4782567',
      email: 'info@shubhashreecollege.edu.np'
    }
  },
  {
    id: '6',
    name: 'Liberty College',
    address: 'Anamnagar, Kathmandu',
    website: 'https://libertycollege.edu.np',
    logo: '/logos/liberty.png',
    established: '2004',
    students: '1,000+',
    rating: 4.1,
    programs: ['BCSIT', 'BCA'],
    contact: {
      phone: '+977-1-4782890',
      email: 'info@libertycollege.edu.np'
    }
  },
  {
    id: '7',
    name: 'Uniglobe College',
    address: 'New Baneshwor, Kathmandu',
    website: 'https://uniglobe.edu.np',
    logo: '/logos/uniglobe.jpg',
    established: '1998',
    students: '3,000+',
    rating: 4.6,
    programs: ['BCSIT', 'BCA', 'MBA', 'BIM'],
    contact: {
      phone: '+977-1-4782123',
      email: 'info@uniglobe.edu.np'
    }
  },
  {
    id: '8',
    name: 'Excel Business College',
    address: 'New Baneshwor, Kathmandu',
    website: 'https://excel.edu.np',
    logo: '/logos/excel.jpg',
    established: '2005',
    students: '800+',
    rating: 3.9,
    programs: ['BCSIT', 'BBS'],
    contact: {
      phone: '+977-1-4782456',
      email: 'info@excel.edu.np'
    }
  },
  {
    id: '9',
    name: 'Malpi International College',
    address: 'Basundhara, Kathmandu',
    website: 'https://mic.edu.np',
    logo: '/logos/malpi.png',
    established: '2006',
    students: '1,200+',
    rating: 4.2,
    programs: ['BCSIT', 'BCA', 'BIM'],
    contact: {
      phone: '+977-1-4782789',
      email: 'info@mic.edu.np'
    }
  },
  {
    id: '10',
    name: 'Nobel College',
    address: 'Sinamangal, Kathmandu',
    website: 'https://nobel.edu.np',
    logo: '/logos/nobel.jpg',
    established: '1997',
    students: '2,200+',
    rating: 4.3,
    programs: ['BCSIT', 'BCA', 'MBA', 'BBS'],
    contact: {
      phone: '+977-1-4782345',
      email: 'info@nobel.edu.np'
    }
  },
  {
    id: '11',
    name: 'Boston International College',
    address: 'Bharatpur, Chitwan',
    website: 'https://bostoncollege.edu.np',
    logo: '/logos/boston.jpg',
    established: '2007',
    students: '900+',
    rating: 4.1,
    programs: ['BCSIT', 'BCA'],
    contact: {
      phone: '+977-56-582123',
      email: 'info@bostoncollege.edu.np'
    }
  },
  {
    id: '12',
    name: 'Pokhara College of Management',
    address: 'Pokhara, Kaski',
    website: 'https://pcm.edu.np',
    logo: '/logos/pokhara.jpg',
    established: '2008',
    students: '1,100+',
    rating: 4.0,
    programs: ['BCSIT', 'BBS', 'MBA'],
    contact: {
      phone: '+977-61-582456',
      email: 'info@pcm.edu.np'
    }
  },
  {
    id: '13',
    name: 'Apex College',
    address: 'Mid Baneshwor, Kathmandu',
    website: 'https://apexcollege.edu.np',
    logo: '/logos/apex.jpg',
    established: '2009',
    students: '700+',
    rating: 3.8,
    programs: ['BCSIT', 'BCA'],
    contact: {
      phone: '+977-1-4782678',
      email: 'info@apexcollege.edu.np'
    }
  },
  {
    id: '14',
    name: 'Medhavi College',
    address: 'Shankhamul, Kathmandu',
    website: 'https://medhavicollege.edu.np',
    logo: '/logos/medhabi.jpg',
    established: '2010',
    students: '600+',
    rating: 3.9,
    programs: ['BCSIT', 'BIM'],
    contact: {
      phone: '+977-1-4782901',
      email: 'info@medhavicollege.edu.np'
    }
  },
  {
    id: '15',
    name: 'Crimson College of Technology',
    address: 'Butwal, Rupandehi',
    website: 'https://cct.edu.np',
    logo: '/logos/crimson.jpg',
    established: '2011',
    students: '500+',
    rating: 3.7,
    programs: ['BCSIT', 'BCA'],
    contact: {
      phone: '+977-71-582789',
      email: 'info@cct.edu.np'
    }
  },
  {
    id: '16',
    name: 'Rajdhani Model College',
    address: 'Old Baneshwor, Kathmandu',
    website: 'https://rmccollege.edu.np',
    logo: '/logos/rajdhani.jpg',
    established: '2012',
    students: '400+',
    rating: 3.6,
    programs: ['BCSIT', 'BBS'],
    contact: {
      phone: '+977-1-4782234',
      email: 'info@rmccollege.edu.np'
    }
  },
];