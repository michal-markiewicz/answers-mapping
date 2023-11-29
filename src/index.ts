import * as fs from "fs";
import {
  AnswerArray,
  Question,
  QuestionArray,
  answersOriginArray,
} from "./sql-data-types";

const fsPromises = fs.promises;

const { answerTexts, questions } = getInputData();
const answerOrigins = extractAnswerOrigins(questions);
transformAnswerOriginsToAnswerTexts(answerOrigins, answerTexts);

function getInputData() {
  const dataFromAnswerTextsQuery = fs.readFileSync(
    "input/dataFromAnswerTextsQuery.txt",
    "utf8"
  );

  const dataFromQuestionsQuery = fs.readFileSync(
    "input/dataFromQuestionsQuery.txt",
    "utf8"
  );

  return {
    answerTexts: JSON.parse(dataFromAnswerTextsQuery),
    questions: JSON.parse(dataFromQuestionsQuery),
  };
}

function extractAnswerOrigins(questions: QuestionArray) {
  const allAnswerOrigins = [];

  questions.forEach((question: Question) => {
    const extractedAnswerOrigins = getAnswerOriginsFromSingleQuestion(question);
    allAnswerOrigins.push(extractedAnswerOrigins);
  });

  return allAnswerOrigins;
}

function getAnswerOriginsFromSingleQuestion(question: Question) {
  const answerOrigins = [];
  question.answer_selections.forEach((answer_selections) => {
    answer_selections.selected_answers.forEach((selected_answer) => {
      answerOrigins.push(selected_answer.answer_origin);
    });
  });

  const fullyMatchingProducts = [];
  question.trigger_parameters.fully_matching.forEach((fullyMatchingProduct) => {
    fullyMatchingProducts.push(fullyMatchingProduct.name);
  });

  answerOrigins.push({
    recommendations: fullyMatchingProducts,
  });

  return answerOrigins;
}

function transformAnswerOriginsToAnswerTexts(
  answers: answersOriginArray | any,
  texts: AnswerArray
) {
  answers.forEach((answersContainer) => {
    answersContainer.forEach((answer) => {
      if (typeof answer === "number" || typeof answer === "string") {
        const thisAnswerIndex = answersContainer.indexOf(answer);
        answersContainer[thisAnswerIndex] = mapAnswerOriginToText(
          answer,
          texts
        );
      }
    });
  });

  writeDataToFile("output/data.txt", JSON.stringify(answers));
}

function mapAnswerOriginToText(answerOrigin, answerTexts: AnswerArray) {
  for (let i = 0; i < answerTexts.length; i++) {
    if (answerTexts[i].answer_origin == answerOrigin) {
      return answerTexts[i].answer_text;
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
