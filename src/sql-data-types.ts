type QuestionArray = Question[];
interface Question {
  answer_selections: AnswerSelections[];
  locale: string;
  count: string;
}

interface AnswerSelections {
  question_id: number;
  question_origin: number;
  question_type: string;
  selected_answers: SelectedAnswer[];
}

interface SelectedAnswer {
  answer_id: number;
  answer_origin: number;
}

type AnswerArray = Answer[];
interface Answer {
  answer_origin: string;
  answer_text: string;
}

type answersOriginArray = number[][];

export {
  QuestionArray,
  Question,
  AnswerSelections,
  SelectedAnswer,
  AnswerArray,
  Answer,
  answersOriginArray,
};
