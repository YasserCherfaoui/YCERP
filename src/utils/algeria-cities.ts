import algeriaCities from '@/assets/json/algeria-cities.json';

const example = {
    "id": 1498,
    "commune_name_ascii": "Hassi Fehal",
    "commune_name": "حاسي الفحل",
    "daira_name_ascii": "Mansourah",
    "daira_name": "المنصورة",
    "wilaya_code": "58",
    "wilaya_name_ascii": "El Menia",
    "wilaya_name": "المنيعة"
};

export type AlgerianCity = typeof example;

export const algeriaCitiesList: AlgerianCity[] = algeriaCities;
export const algeriaWilaya: string[] = [...(new Set(algeriaCities.map((city) => city.wilaya_name_ascii)))];

export interface City {
    key: string;
    label: string;
}

export const cities: City[] = Array.from(
  new Map(
    algeriaCities.map((city) => [
      city.wilaya_code,
      { key: city.wilaya_code, label: city.wilaya_name_ascii }
    ])
  ).values()
);
