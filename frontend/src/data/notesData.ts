export interface Subject {
  courseCode: string;
  courseName: string;
  credits: number;
}

export interface Semester {
  id: number;
  name: string;
  subjects: Subject[];
}

export const semestersData: Semester[] = [
  {
    id: 1,
    name: "Semester I",
    subjects: [
      { courseCode: "ENG 111", courseName: "English", credits: 3 },
      { courseCode: "MTH 113", courseName: "Mathematics I", credits: 3 },
      { courseCode: "CMP 173", courseName: "Internet Technology I", credits: 3 },
      { courseCode: "CMP 171", courseName: "Fundamentals of Computer Systems", credits: 3 },
      { courseCode: "CMP 172", courseName: "Programming Language", credits: 3 }
    ]
  },
  {
    id: 2,
    name: "Semester II",
    subjects: [
      { courseCode: "ENG 112", courseName: "Business Communication", credits: 3 },
      { courseCode: "MTH 114", courseName: "Mathematics II", credits: 3 },
      { courseCode: "CMP 174", courseName: "Digital Systems", credits: 3 },
      { courseCode: "CMP 175", courseName: "Object-Oriented Language (Java)", credits: 3 },
      { courseCode: "CMP 176", courseName: "Data Structure and Algorithm", credits: 3 },
      { courseCode: "PRJ 181", courseName: "Project I", credits: 2 }
    ]
  },
  {
    id: 3,
    name: "Semester III",
    subjects: [
      { courseCode: "STT 220", courseName: "Linear Algebra and Probability", credits: 3 },
      { courseCode: "CMP 271", courseName: "Database Management System", credits: 3 },
      { courseCode: "CMP 272", courseName: "Object-Oriented Analysis and Design", credits: 3 },
      { courseCode: "CMP 273", courseName: "Internet Technology II (Programming)", credits: 3 },
      { courseCode: "MGT 222", courseName: "Principles of Management", credits: 3 }
    ]
  },
  {
    id: 4,
    name: "Semester IV",
    subjects: [
      { courseCode: "CMP 275", courseName: "Computer Architecture and Microprocessor", credits: 3 },
      { courseCode: "CMP 274", courseName: "Numerical Methods", credits: 3 },
      { courseCode: "CMP 276", courseName: "Software Engineering and Project Management", credits: 3 },
      { courseCode: "CMP 277", courseName: "Data Communication and Networks", credits: 3 },
      { courseCode: "FIN 222", courseName: "Fundamentals of Financial Management", credits: 3 },
      { courseCode: "PRI 281", courseName: "Project II", credits: 2 }
    ]
  },
  {
    id: 5,
    name: "Semester V",
    subjects: [
      { courseCode: "MKT 351", courseName: "Digital Marketing", credits: 3 },
      { courseCode: "CMP 381", courseName: "Operating Systems", credits: 3 },
      { courseCode: "MGT 322", courseName: "Organizational Behavior", credits: 3 },
      { courseCode: "CMP 471", courseName: "Artificial Intelligence", credits: 3 },
      { courseCode: "", courseName: "Specialization", credits: 3 }
    ]
  },
  {
    id: 6,
    name: "Semester VI",
    subjects: [
      { courseCode: "CMP 384", courseName: "Computer Graphics", credits: 3 },
      { courseCode: "RCH 322", courseName: "Research Methods", credits: 3 },
      { courseCode: "CMP 382", courseName: "Cloud Computing", credits: 3 },
      { courseCode: "ECO 322", courseName: "Applied Economics", credits: 3 },
      { courseCode: "", courseName: "Concentration II", credits: 3 }
    ]
  },
  {
    id: 7,
    name: "Semester VII",
    subjects: [
      { courseCode: "MGT 422", courseName: "Strategic Management", credits: 3 },
      { courseCode: "MGT 423", courseName: "Management of Human Resources", credits: 3 },
      { courseCode: "CMP 383", courseName: "Digital Economy", credits: 3 },
      { courseCode: "CMP 472", courseName: "Information System Security", credits: 3 },
      { courseCode: "PRI 481", courseName: "Major Project", credits: 4 },
      { courseCode: "", courseName: "Concentration III", credits: 3 }
    ]
  },
  {
    id: 8,
    name: "Semester VIII",
    subjects: [
      { courseCode: "LAW 422", courseName: "Legal Aspects of Business and Technology", credits: 3 },
      { courseCode: "MGT 424", courseName: "Innovation and Entrepreneurship", credits: 3 },
      { courseCode: "INT 494", courseName: "Internship", credits: 5 },
      { courseCode: "", courseName: "Concentration IV", credits: 3 }
    ]
  }
];