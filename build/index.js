"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const fsPromises = fs.promises;
const { answerMappings, visits } = getInputData();
const parsedVisits = parseAllVisits(visits);
mapAllAnswerOriginsToText(parsedVisits, answerMappings);
function getInputData() {
    const dataFromAnswerMappingsQuery = fs.readFileSync("input/dataFromAnswerMappingsQuery.txt", "utf8");
    const dataFromVisitsQuery = fs.readFileSync("input/dataFromVisitsQuery.txt", "utf8");
    return {
        answerMappings: JSON.parse(dataFromAnswerMappingsQuery),
        visits: JSON.parse(dataFromVisitsQuery),
    };
}
function parseAllVisits(visits) {
    const parsedVisits = [];
    visits.forEach((visit) => {
        const parsedVisit = parseSingleVisit(visit);
        parsedVisits.push(parsedVisit);
    });
    return parsedVisits;
}
function parseSingleVisit(visit) {
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
function mapAllAnswerOriginsToText(answersOrigins, answerMappings) {
    answersOrigins.forEach((answersContainer) => {
        answersContainer.forEach((answer) => {
            if (typeof answer === "number" || typeof answer === "string") {
                const thisAnswerIndex = answersContainer.indexOf(answer);
                answersContainer[thisAnswerIndex] = mapSingleAnswerOriginToText(answer, answerMappings);
            }
        });
    });
    writeDataToFile("output/data.txt", JSON.stringify(answersOrigins));
}
function mapSingleAnswerOriginToText(answerOrigin, answerMappings) {
    for (let i = 0; i < answerMappings.length; i++) {
        if (answerMappings[i].answer_origin == answerOrigin) {
            return answerMappings[i].answer_text;
        }
    }
}
function writeDataToFile(filename, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fsPromises.writeFile(filename, content);
            console.log("Data written to file");
        }
        catch (err) {
            console.error("An error occurred:", err);
        }
    });
}
