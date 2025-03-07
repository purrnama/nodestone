import express from "express";
import { Character } from "../profile/character";
import { Achievements } from "../profile/achievements";
import { ClassJob } from "../profile/classjob";
import { FreeCompany } from "../freecompany/freecompany";
import { FCMembers } from "../freecompany/members";
import { CharacterSearch } from "../search/character-search";
import { FreeCompanySearch } from "../search/freecompany-search";

const app = express();

const characterParser = new Character();
const achievementsParser = new Achievements();
const classJobParser = new ClassJob();
const freeCompanyParser = new FreeCompany();
const freeCompanyMemberParser = new FCMembers();
const characterSearch = new CharacterSearch();
const freecompanySearch = new FreeCompanySearch();

app.get("api/character/search", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.set;
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const parsed = await characterSearch.parse(req);
    return res.status(200).send(parsed);
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

app.get("api/freecompany/search", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const parsed = await freecompanySearch.parse(req);
    return res.status(200).send(parsed);
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

app.get("api/character/:characterId", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  if ((req.query["columns"] as string)?.indexOf("Bio") > -1) {
    res.set("Cache-Control", "max-age=3600");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const character = await characterParser.parse(req, "Character.");
    const parsed: any = {
      Character: {
        ID: +req.params.characterId,
        ...character,
      },
    };
    const additionalData = Array.isArray(req.query.data)
      ? req.query.data
      : [req.query.data].filter((d) => !!d);
    if (additionalData.includes("AC")) {
      parsed.Achievements = await achievementsParser.parse(
        req,
        "Achievements."
      );
    }
    if (additionalData.includes("CJ")) {
      parsed.ClassJobs = await classJobParser.parse(req, "ClassJobs.");
    }
    return res.status(200).send(parsed);
  } catch (err: any) {
    if (err.message === "404") {
      return res.sendStatus(404);
    }
    return res.status(500).send(err);
  }
});

app.get("api/freecompany/:fcId", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  try {
    const freeCompany = await freeCompanyParser.parse(req, "FreeCompany.");
    const parsed: any = {
      FreeCompany: {
        ID: +req.params.fcId,
        ...freeCompany,
      },
    };
    const additionalData = Array.isArray(req.query.data)
      ? req.query.data
      : [req.query.data].filter((d) => !!d);
    if (additionalData.includes("FCM")) {
      parsed.FreeCompanyMembers = await freeCompanyMemberParser.parse(
        req,
        "FreeCompanyMembers."
      );
    }
    return res.status(200).send(parsed);
  } catch (err: any) {
    if (err.message === "404") {
      return res.sendStatus(404);
    }
    return res.status(500).send(err);
  }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on("error", console.error);
