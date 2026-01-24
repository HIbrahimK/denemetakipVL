export const EXAM_SCHEMAS = {
    TYT: {
        lessons: ['Türkçe', 'Sosyal Bilimler', 'Temel Matematik', 'Fen Bilimleri'],
        columns: ['Öğrenci No', 'Ad', 'Soyad', 'Türkçe D', 'Türkçe Y', 'Türkçe N', 'Matematik D', 'Matematik Y', 'Matematik N'],
    },
    AYT: {
        lessons: ['Edebiyat', 'Tarih-1', 'Coğrafya-1', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji'],
        columns: ['Öğrenci No', 'Ad', 'Soyad', 'Matematik D', 'Matematik Y', 'Matematik N', 'Edebiyat D', 'Edebiyat Y', 'Edebiyat N'],
    },
    LGS: {
        lessons: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'İnkılap', 'Din Kültürü', 'İngilizce'],
        columns: ['Öğrenci No', 'Ad', 'Soyad', 'Türkçe D', 'Türkçe Y', 'Matematik D', 'Matematik Y'],
    }
};

export type ExamTypeKey = keyof typeof EXAM_SCHEMAS;
