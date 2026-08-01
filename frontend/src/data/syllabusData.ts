export interface Course {
  code?: string;
  name: string;
  credits: number;
}

export interface SemesterData {
  title: string;
  courses: Course[];
}

export interface SpecializationData {
  title: string;
  courses: Course[];
}

export const semesterData: Record<string, SemesterData> = {
  '1': {
    title: 'Semester I',
    courses: [
      { code: 'ENG 111', name: 'English', credits: 3 },
      { code: 'MTH 113', name: 'Mathematics I', credits: 3 },
      { code: 'CMP 173', name: 'Internet Technology I', credits: 3 },
      { code: 'CMP 171', name: 'Fundamentals of Computer Systems', credits: 3 },
      { code: 'CMP 172', name: 'Programming Language', credits: 3 },
    ]
  },
  '2': {
    title: 'Semester II',
    courses: [
      { code: 'ENG 112', name: 'Business Communication', credits: 3 },
      { code: 'MTH 114', name: 'Mathematics II', credits: 3 },
      { code: 'CMP 174', name: 'Digital Systems', credits: 3 },
      { code: 'CMP 175', name: 'Object-Oriented Language (Java)', credits: 3 },
      { code: 'CMP 176', name: 'Data Structure and Algorithm', credits: 3 },
      { code: 'PRJ 181', name: 'Project I', credits: 2 },
    ]
  },
  '3': {
    title: 'Semester III',
    courses: [
      { code: 'STT 220', name: 'Linear Algebra and Probability', credits: 3 },
      { code: 'CMP 271', name: 'Database Management System', credits: 3 },
      { code: 'CMP 272', name: 'Object-Oriented Analysis and Design', credits: 3 },
      { code: 'CMP 273', name: 'Internet Technology II (Programming)', credits: 3 },
      { code: 'MGT 222', name: 'Principles of Management', credits: 3 },
    ]
  },
  '4': {
    title: 'Semester IV',
    courses: [
      { code: 'CMP 275', name: 'Computer Architecture and Microprocessor', credits: 3 },
      { code: 'CMP 274', name: 'Numerical Methods', credits: 3 },
      { code: 'CMP 276', name: 'Software Engineering and Project Management', credits: 3 },
      { code: 'CMP 277', name: 'Data Communication and Networks', credits: 3 },
      { code: 'FIN 222', name: 'Fundamentals of Financial Management', credits: 3 },
      { code: 'PRI 281', name: 'Project II', credits: 2 },
    ]
  },
  '5': {
    title: 'Semester V',
    courses: [
      { code: 'MKT 351', name: 'Digital Marketing', credits: 3 },
      { code: 'CMP 381', name: 'Operating Systems', credits: 3 },
      { code: 'MGT 322', name: 'Organizational Behavior', credits: 3 },
      { code: 'CMP 471', name: 'Artificial Intelligence', credits: 3 },
      { code: 'SPEC', name: 'Specialization Course', credits: 3 },
    ]
  },
  '6': {
    title: 'Semester VI',
    courses: [
      { code: 'CMP 384', name: 'Computer Graphics', credits: 3 },
      { code: 'RCH 322', name: 'Research Methods', credits: 3 },
      { code: 'CMP 382', name: 'Cloud Computing', credits: 3 },
      { code: 'ECO 322', name: 'Applied Economics', credits: 3 },
      { code: 'CONC', name: 'Concentration II', credits: 3 },
    ]
  },
  '7': {
    title: 'Semester VII',
    courses: [
      { code: 'MGT 422', name: 'Strategic Management', credits: 3 },
      { code: 'MGT 423', name: 'Management of Human Resources', credits: 3 },
      { code: 'CMP 383', name: 'Digital Economy', credits: 3 },
      { code: 'CMP 472', name: 'Information System Security', credits: 3 },
      { code: 'PRI 481', name: 'Major Project', credits: 4 },
      { code: 'CONC', name: 'Concentration III', credits: 3 },
    ]
  },
  '8': {
    title: 'Semester VIII',
    courses: [
      { code: 'LAW 422', name: 'Legal Aspects of Business and Technology', credits: 3 },
      { code: 'MGT 424', name: 'Innovation and Entrepreneurship', credits: 3 },
      { code: 'INT 494', name: 'Internship', credits: 5 },
      { code: 'CONC', name: 'Concentration IV', credits: 3 },
    ]
  }
};

export const specializationData: Record<string, SpecializationData> = {
  'computing': {
    title: 'Specialization Computing',
    courses: [
      { name: 'Python Programming', credits: 3 },
      { name: 'Advance Java', credits: 3 },
      { name: 'Compiler Design and Construction', credits: 3 },
      { name: 'Mobile Computing', credits: 3 },
      { name: 'Dot Net', credits: 3 },
      { name: 'Software Project Management', credits: 3 },
      { name: 'Open-source Technology', credits: 3 },
    ]
  },
  'data-science': {
    title: 'Specialization Data Science',
    courses: [
      { name: 'Advance Database', credits: 3 },
      { name: 'Data Analysis and Modeling', credits: 3 },
      { name: 'Data Warehousing and Data Mining', credits: 3 },
      { name: 'Database Administration', credits: 3 },
      { name: 'AI and Machine Learning', credits: 3 },
      { name: 'Distributed DBMS', credits: 3 },
      { name: 'OOP Database Management', credits: 3 },
    ]
  },
  'networking': {
    title: 'Specialization Networking and Cyber Security',
    courses: [
      { name: 'Advance Networking with IPV6', credits: 3 },
      { name: 'Wireless Communication', credits: 3 },
      { name: 'Network Security', credits: 3 },
      { name: 'Embedded System', credits: 3 },
      { name: 'Routing and Switching', credits: 3 },
      { name: 'System Admin', credits: 3 },
      { name: 'Distributed System', credits: 3 },
      { name: 'Ethical Hacking', credits: 3 },
    ]
  },
  'management': {
    title: 'Specialization Management Science and Systems',
    courses: [
      { name: 'MIS and e-business', credits: 3 },
      { name: 'E-governance', credits: 3 },
      { name: 'Social Entrepreneurship', credits: 3 },
      { name: 'Financial Accounting', credits: 3 },
      { name: 'International Business', credits: 3 },
      { name: 'Knowledge Management', credits: 3 },
      { name: 'Managerial Accounting', credits: 3 },
    ]
  },
  'multimedia': {
    title: 'Specialization Multimedia Technology',
    courses: [
      { name: 'Fundamentals of Animations', credits: 3 },
      { name: '3D Modeling', credits: 3 },
      { name: 'VFX & Motion', credits: 3 },
      { name: 'Multimedia Tools', credits: 3 },
      { name: 'Sound & Music Production', credits: 3 },
      { name: 'Advanced Animation', credits: 3 },
    ]
  }
};