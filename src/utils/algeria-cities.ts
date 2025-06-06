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
      { key: `${Number(city.wilaya_code)}`, label: city.wilaya_name_ascii }
    ])
  ).values()
);

export const algerCities: City[] = Array.from(
  new Map(
    algeriaCities.filter((city) => city.wilaya_code === "16").sort((a, b) => a.commune_name_ascii.localeCompare(b.commune_name_ascii)).map((city) => [
      city.commune_name_ascii,
      { key: city.commune_name_ascii, label: city.commune_name_ascii }
    ])
  ).values()
);
