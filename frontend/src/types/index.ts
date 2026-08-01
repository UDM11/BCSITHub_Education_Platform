export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  semester?: number;
  college?: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  semester: number;
  content: string;
  file_url?: string;
  created_by: string;
  created_at: string;
  approved: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  subject: string;
  semester: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_by: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  questions: Question[];
  time_limit: number;
  created_by: string;
  created_at: string;
}

export interface PastPaper {
  id: string;
  title: string;
  college: string;
  semester: number;
  subject: string;
  exam_type: 'midterm' | 'pre-board' | 'final';
  file_url: string;
  uploaded_by: string;
  approved: boolean;
  created_at: string;
}

export interface College {
  id: string;
  name: string;
  location: string;
  description: string;
  contact: string;
  website?: string;
  image_url?: string;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  image_url?: string;
  college_id: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  college_id?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface NoteFile {
  title: string;
  url: string;
}

export interface Subject {
  code: string;
  name: string;
  notes: NoteFile[];
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}
