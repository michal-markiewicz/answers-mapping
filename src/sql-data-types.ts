type Visits = Visit[];
interface Visit {
  answer_selections: AnswerSelections[];
  trigger_parameters: TriggerParameters;
  locale: string;
  count: string;
}

interface TriggerParameters {
  fully_matching: FullyMatchingProduct[];
}

interface FullyMatchingProduct {
  product_id: string;
  checksum: string;
  collection_id: number;
  name: string;
  sku: string;
  picture: string;
  offer_url: string;
  price: number;
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

type AnswerMappings = AnswerMapping[];
interface AnswerMapping {
  answer_origin: string;
  answer_text: string;
}

type AnswersOrigins = number[][];

export {
  Visits,
  Visit,
  AnswerSelections,
  SelectedAnswer,
  AnswerMappings,
  AnswerMapping,
  AnswersOrigins,
};
