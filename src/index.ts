import * as XLSX from "xlsx";
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
const parsedVisitsMappedText = mapAllAnswerOriginsToText(
  parsedVisits,
  answerMappings
);
const formattedData = formatDataForXLSX(parsedVisitsMappedText);
outputToXLSX(formattedData);

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

  return answersOrigins;
}

function formatDataForXLSX(parsedVisits: any) {
  const formattedVisits = [];

  parsedVisits.forEach((parsedVisit) => {
    const formattedVisit = {
      answers: "",
      fully_matching_recommendations: "",
    };

    parsedVisit.forEach((property) => {
      if (typeof property == "string") {
        if (formattedVisit.answers.length > 0) {
          formattedVisit.answers = `${formattedVisit.answers}, ${property}`;
        } else {
          formattedVisit.answers = `${property}`;
        }
      } else {
        if (property.recommendations.length > 0) {
          formattedVisit.fully_matching_recommendations = `${property.recommendations.map(
            (recommendation) => {
              return recommendation;
            }
          )}`;
        } else {
          formattedVisit.fully_matching_recommendations =
            "NO FULLY MATCHING RECOMMENDATIONS";
        }
      }
    });

    formattedVisits.push(formattedVisit);
  });

  return formattedVisits;
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

function outputToXLSX(formattedVisits) {
  const worksheet = XLSX.utils.json_to_sheet(formattedVisits);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet");
  XLSX.writeFile(workbook, "userVisits.xlsx", { compression: true });
}

async function writeDataToFile(filename, content) {
  try {
    await fsPromises.writeFile(filename, content);
    console.log("Data written to file");
  } catch (err) {
    console.error("An error occurred:", err);
  }
}
