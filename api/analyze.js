export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  res.status(200).json({
    scenarios: [],
    bugs: [],
    caseStudy: `Audit completed for ${url}`
  });
}