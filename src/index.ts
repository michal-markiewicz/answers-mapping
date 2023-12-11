import * as XLSX from "xlsx";
import * as fs from "fs";
import {
  AnswerMappings,
  Visit,
  Visits,
  AnswersOrigins,
  AnswerMapping,
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
  answerMappings: { [key: string]: AnswerMapping[] };
  visits: { [key: string]: Visit[] };
} {
  const dataFromAnswerMappingsQuery = fs.readFileSync(
    "input/dataFromAnswerMappingsQuery.json",
    "utf8"
  );

  const dataFromVisitsQuery = fs.readFileSync(
    "input/dataFromVisitsQuery.json",
    "utf8"
  );

  const visitsDataFixed = fixVisitsInputDataFormatting(dataFromVisitsQuery);

  return {
    answerMappings: JSON.parse(dataFromAnswerMappingsQuery),
    visits: JSON.parse(visitsDataFixed),
  };
}

function fixVisitsInputDataFormatting(visitsInputData: string) {
  const visitsFixedInputData = visitsInputData
    .replace(/"\{/g, `{`) // replace "{ with {
    .replace(/\}"/g, `}`) // replace }" with }
    .replace(/"\[/g, `[`) // replace "[ with [
    .replace(/\]"/g, `]`) // replace ]" with ]
    .replace(/\\"/g, `"`); // replace \" with "

  return visitsFixedInputData;
}

function parseAllVisits(visits: { [key: string]: Visit[] }) {
  const parsedVisits = [];
  const visitsKey = Object.keys(visits)[0];
  const visitsArr = visits[visitsKey] as Visit[];

  visitsArr.forEach((visit: Visit) => {
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
  answerMappings: { [key: string]: AnswerMapping[] }
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
  answerMappings: { [key: string]: AnswerMapping[] }
) {
  const mappingsKey = Object.keys(answerMappings)[0];
  const mappingsArr = answerMappings[mappingsKey] as AnswerMapping[];

  for (let i = 0; i < mappingsArr.length; i++) {
    if (mappingsArr[i].answer_origin == answerOrigin) {
      return mappingsArr[i].answer_text;
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
  console.log("Data written to a file!");
}
