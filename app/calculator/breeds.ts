export type DogSize = "small" | "medium" | "large" | "giant";

export interface Breed {
  nameEn: string;
  nameZh: string;
  weightMin: number;
  weightMax: number;
}

export function breedToSize(breed: Breed): DogSize {
  const avg = (breed.weightMin + breed.weightMax) / 2;
  if (avg >= 100) return "giant";
  if (avg >= 50) return "large";
  if (avg >= 20) return "medium";
  return "small";
}

export function breedAvgWeight(breed: Breed): number {
  return Math.round((breed.weightMin + breed.weightMax) / 2);
}

export const BREEDS: Breed[] = [
  { nameEn: "Labrador Retriever", nameZh: "拉布拉多寻回犬", weightMin: 55, weightMax: 80 },
  { nameEn: "Golden Retriever", nameZh: "金毛寻回犬", weightMin: 55, weightMax: 75 },
  { nameEn: "German Shepherd", nameZh: "德国牧羊犬", weightMin: 50, weightMax: 90 },
  { nameEn: "French Bulldog", nameZh: "法国斗牛犬", weightMin: 16, weightMax: 28 },
  { nameEn: "English Bulldog", nameZh: "英国斗牛犬", weightMin: 40, weightMax: 55 },
  { nameEn: "Poodle (Standard)", nameZh: "标准贵宾犬", weightMin: 45, weightMax: 70 },
  { nameEn: "Poodle (Miniature)", nameZh: "迷你贵宾犬", weightMin: 10, weightMax: 20 },
  { nameEn: "Beagle", nameZh: "比格犬", weightMin: 20, weightMax: 30 },
  { nameEn: "Rottweiler", nameZh: "罗威纳犬", weightMin: 80, weightMax: 135 },
  { nameEn: "Yorkshire Terrier", nameZh: "约克夏梗", weightMin: 4, weightMax: 7 },
  { nameEn: "Boxer", nameZh: "拳师犬", weightMin: 55, weightMax: 80 },
  { nameEn: "Dachshund", nameZh: "腊肠犬", weightMin: 11, weightMax: 32 },
  { nameEn: "Siberian Husky", nameZh: "西伯利亚哈士奇", weightMin: 35, weightMax: 60 },
  { nameEn: "Great Dane", nameZh: "大丹犬", weightMin: 110, weightMax: 175 },
  { nameEn: "Doberman Pinscher", nameZh: "杜宾犬", weightMin: 60, weightMax: 100 },
  { nameEn: "Shih Tzu", nameZh: "西施犬", weightMin: 9, weightMax: 16 },
  { nameEn: "Chihuahua", nameZh: "吉娃娃", weightMin: 3, weightMax: 6 },
  { nameEn: "Australian Shepherd", nameZh: "澳大利亚牧羊犬", weightMin: 40, weightMax: 65 },
  { nameEn: "Border Collie", nameZh: "边境牧羊犬", weightMin: 30, weightMax: 55 },
  { nameEn: "Cocker Spaniel", nameZh: "可卡犬", weightMin: 20, weightMax: 30 },
  { nameEn: "Alaskan Malamute", nameZh: "阿拉斯加雪橇犬", weightMin: 75, weightMax: 100 },
  { nameEn: "Bernese Mountain Dog", nameZh: "伯恩山犬", weightMin: 70, weightMax: 115 },
  { nameEn: "Bichon Frise", nameZh: "比熊犬", weightMin: 12, weightMax: 18 },
  { nameEn: "Pug", nameZh: "巴哥犬", weightMin: 14, weightMax: 18 },
  { nameEn: "Pembroke Welsh Corgi", nameZh: "潘布鲁克威尔士柯基犬", weightMin: 24, weightMax: 30 },
  { nameEn: "Shiba Inu", nameZh: "柴犬", weightMin: 17, weightMax: 23 },
  { nameEn: "Samoyed", nameZh: "萨摩耶犬", weightMin: 35, weightMax: 65 },
  { nameEn: "Shetland Sheepdog", nameZh: "喜乐蒂牧羊犬", weightMin: 15, weightMax: 25 },
  { nameEn: "Border Terrier", nameZh: "边境梗", weightMin: 11, weightMax: 16 },
  { nameEn: "Maltese", nameZh: "马尔济斯犬", weightMin: 4, weightMax: 7 },
  { nameEn: "Pomeranian", nameZh: "博美犬", weightMin: 3, weightMax: 7 },
  { nameEn: "Akita", nameZh: "秋田犬", weightMin: 70, weightMax: 130 },
  { nameEn: "Chow Chow", nameZh: "松狮犬", weightMin: 45, weightMax: 70 },
  { nameEn: "Greyhound", nameZh: "灵缇犬/格力犬", weightMin: 60, weightMax: 70 },
  { nameEn: "Great Pyrenees", nameZh: "大白熊犬", weightMin: 85, weightMax: 115 },
  { nameEn: "Old English Sheepdog", nameZh: "古代英国牧羊犬", weightMin: 60, weightMax: 100 },
  { nameEn: "Cavalier King Charles Spaniel", nameZh: "查理王小猎犬", weightMin: 13, weightMax: 18 },
  { nameEn: "Papillon", nameZh: "蝴蝶犬", weightMin: 5, weightMax: 10 },
];
