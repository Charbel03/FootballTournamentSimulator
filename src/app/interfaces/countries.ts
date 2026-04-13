export class CountryName {
  common: string;
  official: string;

  constructor(data: CountryNameDTO) {
    this.common = data.common;
    this.official = data.official;
  }
}

export class Country {
  name: CountryName;
  flagSvg: string;

  constructor(data: CountryDTO) {
    this.name = new CountryName(data.name);
    this.flagSvg = data.flags.svg;
  }
}

export interface CountryNameDTO {
  common: string;
  official: string;
}

export interface CountryDTO {
  name: CountryNameDTO;
  flags: {
    svg: string;
  };
}