export const MINIMUM_WAGE_2026 = 10320;

export function listMinimumWages(year) {
  const items = [
    {
      year: 2026,
      hourlyWage: MINIMUM_WAGE_2026,
      source: "최저임금위원회",
      sourceUrl: "https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657",
    },
  ];

  return year ? items.filter((item) => item.year === Number(year)) : items;
}

export function listConsultationLinks() {
  return [
    {
      label: "고용노동부 고객상담센터",
      phone: "1350",
      url: "https://1350.moel.go.kr/",
    },
    {
      label: "노동포털",
      url: "https://labor.moel.go.kr/",
    },
  ];
}
