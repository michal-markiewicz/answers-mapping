import * as fs from "fs";
import {
  AnswerMappings,
  Visit,
  Visits,
  AnswersOrigins,
} from "./sql-data-types";

const fsPromises = fs.promises;

const { answerMappings, visits } = getInputData();
const parsedVisits = parseAllVisits(visits);
mapAllAnswerOriginsToText(parsedVisits, answerMappings);

function getInputData(): {
  answerMappings: AnswerMappings;
  visits: Visits;
} {
  const dataFromAnswerMappingsQuery = fs.readFileSync(
    "input/dataFromAnswerMappingsQuery.txt",
    "utf8"
  );

  const dataFromVisitsQuery = fs.readFileSync(
    "input/dataFromVisitsQuery.txt",
    "utf8"
  );

  return {
    answerMappings: JSON.parse(dataFromAnswerMappingsQuery),
    visits: JSON.parse(dataFromVisitsQuery),
  };
}

function parseAllVisits(visits: Visits) {
  const parsedVisits = [];

  visits.forEach((visit: Visit) => {
    const parsedVisit = parseSingleVisit(visit);
    parsedVisits.push(parsedVisit);
  });

  return parsedVisits;
}

function parseSingleVisit(visit: Visit) {
  const parsedVisits = [];
  visit.answer_selections.forEach((answer_selections) => {
    answer_selections.selected_answers.forEach((selected_answer) => {
      parsedVisits.push(selected_answer.answer_origin);
    });
  });

  const fullyMatchingProducts = [];
  visit.trigger_parameters.fully_matching.forEach((fullyMatchingProduct) => {
    fullyMatchingProducts.push(fullyMatchingProduct.name);
  });

  parsedVisits.push({
    recommendations: fullyMatchingProducts,
  });

  return parsedVisits;
}

function mapAllAnswerOriginsToText(
  answersOrigins: AnswersOrigins | any,
  answerMappings: AnswerMappings
) {
  answersOrigins.forEach((answersContainer) => {
    answersContainer.forEach((answer) => {
      if (typeof answer === "number" || typeof answer === "string") {
        const thisAnswerIndex = answersContainer.indexOf(answer);
        answersContainer[thisAnswerIndex] = mapSingleAnswerOriginToText(
          answer,
          answerMappings
        );
      }
    });
  });

  writeDataToFile("output/data.txt", JSON.stringify(answersOrigins));
}

function mapSingleAnswerOriginToText(
  answerOrigin: number | string,
  answerMappings: AnswerMappings
) {
  for (let i = 0; i < answerMappings.length; i++) {
    if (answerMappings[i].answer_origin == answerOrigin) {
      return answerMappings[i].answer_text;
    }
  }
}

async function writeDataToFile(filename, content) {
  try {
    await fsPromises.writeFile(filename, content);
    console.log("Data written to file");
  } catch (err) {
    console.error("An error occurred:", err);
  }
}
