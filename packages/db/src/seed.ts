// import "dotenv/config";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import { question } from "./schema";

// const databaseUrl = process.env.DATABASE_URL;
// if (!databaseUrl) {
//   throw new Error("DATABASE_URL is required");
// }

// const sql = neon(databaseUrl);
// const db = drizzle(sql);

// const questions = [
//   {
//     id: "q1",
//     text: "What is the core reason Harry survives the Killing Curse as a baby?",
//     options: [
//       "His wand backfired",
//       "Lily's sacrificial protection",
//       "Voldemort's spell was weak",
//       "Dumbledore intervened",
//     ],
//     correctIndex: 1,
//     order: 1,
//   },
//   {
//     id: "q2",
//     text: "Which object was NOT a Horcrux?",
//     options: [
//       "Tom Riddle's diary",
//       "Ravenclaw's diadem",
//       "Gryffindor's sword",
//       "Nagini",
//     ],
//     correctIndex: 2,
//     order: 2,
//   },
//   {
//     id: "q3",
//     text: "What does the Mirror of Erised actually represent?",
//     options: [
//       "Alternate futures",
//       "Hidden memories",
//       "Deepest desires",
//       "Lost loved ones",
//     ],
//     correctIndex: 2,
//     order: 3,
//   },
//   {
//     id: "q4",
//     text: "Why can Harry speak Parseltongue?",
//     options: [
//       "He learned it accidentally",
//       "It runs in his family",
//       "A spell was cast on him",
//       "Part of Voldemort's soul lived in him",
//     ],
//     correctIndex: 3,
//     order: 4,
//   },
//   {
//     id: "q5",
//     text: "Which spell is used to summon objects?",
//     options: [
//       "Expelliarmus",
//       "Accio",
//       "Wingardium Leviosa",
//       "Alohomora",
//     ],
//     correctIndex: 1,
//     order: 5,
//   },
//   {
//     id: "q6",
//     text: "What allows Barty Crouch Jr. to fool everyone in Goblet of Fire?",
//     options: [
//       "He fakes his magical signature",
//       "He impersonates Mad-Eye Moody",
//       "He uses Polyjuice Potion",
//       "Both B and C",
//     ],
//     correctIndex: 3,
//     order: 6,
//   },
//   {
//     id: "q7",
//     text: "Why can Thestrals only be seen by certain people?",
//     options: [
//       "They are cursed creatures",
//       "Only dark wizards can see them",
//       "You must witness death and understand it",
//       "They appear only at night",
//     ],
//     correctIndex: 2,
//     order: 7,
//   },
//   {
//     id: "q8",
//     text: "What is the true loyalty rule of the Elder Wand?",
//     options: [
//       "It answers to the strongest wizard",
//       "It obeys its creator",
//       "Ownership transfers through defeat",
//       "It chooses the most skilled duelist",
//     ],
//     correctIndex: 2,
//     order: 8,
//   },
//   {
//     id: "q9",
//     text: "Who destroys Helga Hufflepuff's cup?",
//     options: [
//       "Harry",
//       "Hermione",
//       "Ron",
//       "Neville",
//     ],
//     correctIndex: 2,
//     order: 9,
//   },
//   {
//     id: "q10",
//     text: "Why does Voldemort fail to kill Harry in the Forbidden Forest?",
//     options: [
//       "Harry dodges the spell",
//       "The Elder Wand won't kill its master",
//       "Narcissa lies about Harry's death",
//       "Harry uses a protection charm",
//     ],
//     correctIndex: 1,
//     order: 10,
//   },
// ];

// async function seed() {
//   console.log("Seeding questions...");

//   for (const q of questions) {
//     await db
//       .insert(question)
//       .values(q)
//       .onConflictDoUpdate({
//         target: question.id,
//         set: {
//           text: q.text,
//           options: q.options,
//           correctIndex: q.correctIndex,
//           order: q.order,
//           updatedAt: new Date(),
//         },
//       });
//   }

//   console.log("Seeded 10 questions successfully!");
// }

// seed().catch(console.error);
