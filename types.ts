
export enum Rank {
  None = 'Branco',
  Kyu5 = '5º Kyu',
  Kyu4 = '4º Kyu',
  Kyu3 = '3º Kyu',
  Kyu2 = '2º Kyu',
  Kyu1 = '1º Kyu',
  Shodan = 'Shodan',
  Nidan = 'Nidan',
  Sandan = 'Sandan',
  Yondan = 'Yondan',
  Godan = 'Godan',
  Rokudan = 'Rokudan',
}

export interface Exam {
  id: string;
  date: string; // YYYY-MM-DD
  rank: Rank;
}

export interface Payment {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  address: {
    street: string;
    number: string;
    complement: string;
  };
  phone: string;
  startDate: string; // YYYY-MM-DD
  photos: string[]; // base64 strings
  exams: Exam[];
  payments: Payment[];
  status: 'Active' | 'Inactive' | 'Professor';
}

export type View = 'list' | 'detail' | 'dashboard';
