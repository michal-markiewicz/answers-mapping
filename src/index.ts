import * as XLSX from "xlsx";
import * as fs from "fs";
import {
  AnswerMappings,
  Visit,
  Visits,
  AnswersOrigins,
} from "./sql-data-types";

const { answerMappings, visits } = getInputData();
const parsedVisits = parseAllVisits(visits);
const parsedVisitsMappedText = mapAllAnswerOriginsToText(
  parsedVisits,
  answerMappings
);
const formattedData = formatDataForXLSX(parsedVisitsMappedText);
const countedPaths = countPaths(formattedData);
outputToXLSX(formattedData, countedPaths);

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

  const recommendations = [];
  visit.trigger_parameters.fully_matching.forEach((fullyMatchingProduct) => {
    recommendations.push(fullyMatchingProduct.name);
  });

  visit.trigger_parameters.partially_matching.forEach(
    (partiallyMatchingProduct) => {
      recommendations.push(partiallyMatchingProduct.name);
    }
  );

  parsedVisits.push({
    recommendations,
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
      recommendations: "",
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
          formattedVisit.recommendations = `${property.recommendations.map(
            (recommendation) => {
              return recommendation;
            }
          )}`;
        } else {
          formattedVisit.recommendations = "NO RECOMMENDATIONS";
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

function countPaths(formattedVisits) {
  const countedPaths = {};

  formattedVisits.forEach(
    (formattedVisit: { answers: string; recommendations: string }) => {
      const valueInCountedPaths = countedPaths[formattedVisit.answers];

      if (valueInCountedPaths) {
        countedPaths[formattedVisit.answers] =
          countedPaths[formattedVisit.answers] + 1;
      } else {
        countedPaths[formattedVisit.answers] = 1;
      }
    }
  );

  const countedPathsFormatted = Object.keys(countedPaths).map((key) => ({
    answers: key,
    count: countedPaths[key],
  }));

  return countedPathsFormatted;
}

function outputToXLSX(formattedVisits, countedVisits) {
  const workbook = XLSX.utils.book_new();
  const formattedVisitsSheet = XLSX.utils.json_to_sheet(formattedVisits);
  const countedVisitsSheet = XLSX.utils.json_to_sheet(countedVisits);

  XLSX.utils.book_append_sheet(workbook, formattedVisitsSheet, "Visits");
  XLSX.utils.book_append_sheet(workbook, countedVisitsSheet, "Count");
  XLSX.writeFile(workbook, "userVisits.xlsx", { compression: true });
}
