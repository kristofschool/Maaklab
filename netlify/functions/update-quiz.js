const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Alleen POST verzoeken toestaan
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { newContent, fileName } = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN; // Geheime sleutel uit de instellingen
  const repo = "jouw-gebruikersnaam/jouw-repo";
  
  try {
    // 1. Haal de huidige SHA op van het bestand
    const getFile = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}`, {
      headers: { "Authorization": `token ${token}` }
    });
    const fileData = await getFile.json();

    // 2. Update het bestand op GitHub
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Quiz bijgewerkt via Admin Panel",
        content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
        sha: fileData.sha
      })
    });

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ msg: "GitHub bijgewerkt!" }) };
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
