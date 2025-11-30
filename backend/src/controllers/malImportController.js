const xml2js = require("xml2js");
const Anime = require("../models/Anime");

// POST /api/import/mal
// Body: { listCategoryId: string, xml: string }
async function importMal(req, res) {
  try {
    const { listCategoryId, xml } = req.body || {};

    if (!listCategoryId || !xml) {
      return res.status(400).json({
        message: "listCategoryId and xml are required"
      });
    }

    let parsed;
    try {
      parsed = await xml2js.parseStringPromise(xml, {
        explicitArray: false,
        mergeAttrs: true,
      });
    } catch (err) {
      console.error("MAL XML parse error:", err);
      return res.status(400).json({
        message: "Failed to parse MAL XML file"
      });
    }

    // MAL standard export: <myanimelist><anime>...</anime></myanimelist>
    const animeNode = parsed.myanimelist?.anime;
    if (!animeNode) {
      return res.status(400).json({
        message: "No <anime> entries found in MAL file"
      });
    }

    const animeArray = Array.isArray(animeNode) ? animeNode : [animeNode];

    if (animeArray.length === 0) {
      return res.status(400).json({
        message: "MAL file contains no anime entries"
      });
    }

    // Map MAL fields -> our Anime model
    const docsToInsert = [];
    for (const item of animeArray) {
      const title = (item.series_title || "").trim();
      if (!title) continue; // skip empty

      const imageUrl = (item.series_image || "").trim();
      const scoreRaw = item.my_score;
      const score = scoreRaw ? Number(scoreRaw) : null;
      const finalScore =
        typeof score === "number" && !Number.isNaN(score) && score > 0
          ? score
          : null;

      // Basic mapping; you can enhance later
      docsToInsert.push({
        name: title,
        description: "", // MAL XML doesn’t include synopsis in export
        listCategory: listCategoryId, // reference to ListCategory
        imageUrl: imageUrl || "",
        watchLink: "", // You can later add HiAnime links manually
        censorship: "Unrated",
        dubSub: "Sub",
        rating: finalScore,
        tags: [], // you can tag manually later
        prequel: null,
        sequel: null,
        sequenceIndex: 0
      });
    }

    if (docsToInsert.length === 0) {
      return res.status(400).json({
        message: "No valid anime entries found in MAL file"
      });
    }

    const inserted = await Anime.insertMany(docsToInsert);

    res.json({
      message: "MAL import completed",
      created: inserted.length
    });
  } catch (err) {
    console.error("importMal error:", err);
    res.status(500).json({ message: "Failed to import MAL data" });
  }
}

module.exports = {
  importMal
};
