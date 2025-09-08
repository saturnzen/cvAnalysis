export const PROMPTS = {
  swot: (resume) => `
Hãy phân tích CV sau thành SWOT và trả về JSON đúng định dạng:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "threats": ["..."]
}

CV:
${resume}
`,

  eisenhower: (resume) => `
Hãy liệt kê các nhiệm vụ chính từ CV này và xếp vào ma trận Eisenhower.
Trả về JSON array với mỗi item dạng:
{ task:"...", important: int (0-10), urgent: int (0-10) }

Ví dụ:
[
  {task:"Học Python",important:9,urgent:8},
  {task:"Lướt mạng",important:2,urgent:1}
]

CV:
${resume}
`,

  errc: (resume) => `
Phân tích CV theo ERRC (Eliminate, Reduce, Raise, Create).
Trả về JSON đúng định dạng:
{
  "eliminate": ["..."],
  "reduce": ["..."],
  "raise": ["..."],
  "create": ["..."]
}

CV:
${resume}
`,

  strengths12: (resume) => `
Đánh giá ứng viên theo 12 chỉ số (p_product, p_price, p_place, p_promotion, c_customer, c_cost, c_convenience, c_communication, s1, s2, s3, s4).
Trả về JSON với giá trị số (0-10) cho từng chỉ số.

Ví dụ:
{
  "p_product": 7,
  "p_price": 8,
  "p_place": 6,
  "p_promotion": 9,
  "c_customer": 7,
  "c_cost": 8,
  "c_convenience": 5,
  "c_communication": 7,
  "s1": 6,
  "s2": 8,
  "s3": 7,
  "s4": 9
}

CV:
${resume}
`
};

